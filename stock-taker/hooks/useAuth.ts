import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js'; 


export function useAuth() {
  interface UserObj {
    id: string;
    name: string;
    email: string;
    department: string;
  }
  
  const [userAuth, setUserAuth] = useState<User | null>(null);
  const [user, setUser] = useState<UserObj | null>(null);
  const [loading, setLoading] = useState(true); // 🔹 Add loading state

  useEffect(()=> {
    if (!userAuth) {
      setUser(null)
    }

  }, [userAuth])

  useEffect(() => {
    const authUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        fetchUser(data.user.id)
      }
      setUserAuth(data.user || null);
       // Set loading to false once user is fetched
    };

    authUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserAuth(session?.user || null);
      setLoading(false); // ✅ Ensure loading stops when auth state updates
    });

    return () => {
      authListener.subscription?.unsubscribe(); // ✅ Prevent memory leaks
    };
  }, []);



  const fetchUser = useCallback(async (user_id: string) => {
    const { data, error } = await supabase
      .from('users') // Query 'users' table
      .select('id, name, email, department') // Correct fields to select
      .eq('id', user_id) // Fetch the user by ID
      .single(); // Ensure only one user is fetched
  
    if (error) {
      console.error('Error fetching user:', error); // Handle errors
      return;
    }
  
    if (data) {
      // Ensure fetched data matches UserObject
      setUser(data as UserObj); // Set the fetched user data into state
      setLoading(false);
    }
  }, []);

  return { user, loading }; // 🔹 Return `loading` state
}



