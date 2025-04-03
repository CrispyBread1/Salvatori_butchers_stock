import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>Welcome, {user.email}!</Text>
          <Button title="Go to Stock Taking" onPress={() => router.push('/stock')} />
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Text>Welcome, Please log in to continue</Text>
          <Button title="Go to Login" onPress={() => router.push('/login')} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
