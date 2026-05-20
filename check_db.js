import { createClient } from '@supabase/supabase-js';

const url = 'https://gflzxjqahkkxzxdwswnv.supabase.co';
const anonKey = 'sb_publishable_Bhz_9oN0sxBOJQ2780wCLA_bVm6VeVL';

const supabase = createClient(url, anonKey);

async function run() {
  const { data, error } = await supabase.from('documents').select('type, status');
  console.log('Error:', error);
  console.log('Data:', data);
  
  const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true });
  console.log('Total documents count:', count);
}

run();
