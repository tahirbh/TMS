import { createClient } from '@supabase/supabase-js';

const url = 'https://gflzxjqahkkxzxdwswnv.supabase.co';
const anonKey = 'sb_publishable_Bhz_9oN0sxBOJQ2780wCLA_bVm6VeVL';

const supabase = createClient(url, anonKey);

async function run() {
  // Sign in as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@fleetcore.com',
    password: 'password123'
  });

  if (authError) {
    console.error('Login error:', authError);
    return;
  }

  console.log('Logged in successfully. User ID:', authData.user.id);

  // Set the authenticated session headers
  const authSupabase = createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`
      }
    }
  });

  const { data: docData, error: docError } = await authSupabase
    .from('documents')
    .select('type, status');

  console.log('Documents fetch error:', docError);
  console.log('Documents fetch data count:', docData?.length);

  const { data: profiles, error: pError } = await authSupabase.from('profiles').select('*');
  console.log('Profiles:', profiles?.length, pError);

  const { data: vehicles, error: vError } = await authSupabase.from('vehicles').select('*');
  console.log('Vehicles:', vehicles?.length, vError);

  const { data: sponsors, error: sError } = await authSupabase.from('sponsors').select('*');
  console.log('Sponsors:', sponsors?.length, sError);

  const { data: sites, error: stError } = await authSupabase.from('sites').select('*');
  console.log('Sites:', sites?.length, stError);
}

run();
