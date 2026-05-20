import { createClient } from '@supabase/supabase-js';

const url = 'https://gflzxjqahkkxzxdwswnv.supabase.co';
const anonKey = 'sb_publishable_Bhz_9oN0sxBOJQ2780wCLA_bVm6VeVL';

const supabase = createClient(url, anonKey);

async function run() {
  const queries = {
    profiles: supabase.from('profiles').select('*', { count: 'exact', head: true }),
    vehicles: supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    sponsors: supabase.from('sponsors').select('*', { count: 'exact', head: true }),
    sites: supabase.from('sites').select('*', { count: 'exact', head: true }),
    trailers: supabase.from('trailers').select('*', { count: 'exact', head: true }),
    expiredDocs: supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
    nearDocs: supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'near_expiry'),
    totalDocs: supabase.from('documents').select('*', { count: 'exact', head: true }),
    drivers: supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    sponsorDetails: supabase.from('sponsors').select('name, employees:employees(count)')
  };

  for (const [key, promise] of Object.entries(queries)) {
    try {
      const res = await promise;
      if (res.error) {
        console.error(`❌ Query [${key}] returned error:`, res.error);
      } else {
        console.log(`✅ Query [${key}] successful: count = ${res.count ?? 'N/A'}, data =`, res.data);
      }
    } catch (err) {
      console.error(`❌ Query [${key}] threw error:`, err);
    }
  }
}

run();
