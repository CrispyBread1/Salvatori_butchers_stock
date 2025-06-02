import { useEffect, useState } from "react";
import { useRouter } from "expo-router"; // Expo Router Navigation
import { supabase } from "../../utils/supabaseClient";
import { View, ActivityIndicator } from "react-native";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter(); // Expo Router navigation

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        router.replace("/"); // Redirect to homepage if not logged in
      } else {
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthGuard;
