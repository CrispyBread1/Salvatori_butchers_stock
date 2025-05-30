import { User } from '@/models/User';
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

export async function getUserById(name: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .limit(1)
      .single(); // Fetch just one record

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Exception in getProductById:', error);
    return null;
  }
}
