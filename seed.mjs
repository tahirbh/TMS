import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding default user...');

  // 1. Create Admin User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@fleetcore.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Fleet Admin' },
  });

  if (authError && authError.message !== 'User already registered') {
    console.error('Error creating user:', authError);
  } else {
    console.log('✅ Admin user created: admin@fleetcore.com / password123');
  }

  const adminId = authData?.user?.id;
  if (!adminId) {
    console.log('User already exists, skipping dummy data to prevent duplicates.');
    return;
  }

  // Update profile role
  await supabase.from('profiles').update({ role: 'admin' }).eq('id', adminId);

  // 2. Create Dummy Vehicles
  console.log('Seeding dummy vehicles...');
  const vehicles = [
    { registration_number: 'TRK-9012', make: 'Volvo', model: 'FH16', type: 'truck', capacity_tons: 40, status: 'available' },
    { registration_number: 'TRK-3456', make: 'Scania', model: 'R500', type: 'truck', capacity_tons: 35, status: 'in_use' },
    { registration_number: 'TRL-1122', make: 'Schmitz', model: 'Cargobull', type: 'trailer', capacity_tons: 25, status: 'maintenance' },
    { registration_number: 'VAN-5544', make: 'Mercedes', model: 'Sprinter', type: 'van', capacity_tons: 3, status: 'available' },
    { registration_number: 'TNK-8899', make: 'MAN', model: 'TGX', type: 'tanker', capacity_tons: 30, status: 'in_use' },
  ];
  
  const { data: vData } = await supabase.from('vehicles').insert(vehicles).select();
  
  // 3. Create Dummy Drivers
  console.log('Seeding dummy drivers...');
  const driversToInsert = [
    { name: 'John Smith', email: 'john@fleetcore.com', status: 'available' },
    { name: 'Sarah Connor', email: 'sarah@fleetcore.com', status: 'on_trip' },
    { name: 'Mike Johnson', email: 'mike@fleetcore.com', status: 'available' },
  ];

  for (const d of driversToInsert) {
    const { data: u } = await supabase.auth.admin.createUser({
      email: d.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: d.name },
    });
    if (u?.user?.id) {
      await supabase.from('profiles').update({ role: 'driver' }).eq('id', u.user.id);
      await supabase.from('drivers').insert({
        profile_id: u.user.id,
        license_number: 'LIC-' + Math.floor(Math.random() * 10000),
        status: d.status,
      });
    }
  }

  console.log('✅ Dummy vehicles and drivers created.');
}

seed().catch(console.error);
