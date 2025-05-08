import { supabase } from '@/utils/supabaseClient';

export async function insertUser(id: string, name: string, email: string) {
  const userData = {
    id,
    name,
    email,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('users').insert(userData);

  if (error) {
    console.error('Error inserting user:', error);
    throw error;
  }

  console.log(`User ${name} added successfully!`);
}
