import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../utils/supabaseClient";

export const useAuthRedirect = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        router.replace("/"); // Redirect to homepage
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  return { loading };
};
