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
          <View style={styles.top}>
            <Text style={styles.welcome}>Welcome, {user.name}!</Text>
            <View style={styles.buttonWrapper}>
              <Button title="Stock Taking" onPress={() => router.push('/stock')} />
              <Button title="Deliveries" onPress={() => router.push('/deliveries')} />
              <Button title="Conversions" onPress={() => router.push('/conversions')} />
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.bottom}>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.welcome}>Welcome, Please log in to continue</Text>
          <Button title="Login" onPress={() => router.push('/login')} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  top: {
    alignItems: 'center',
    marginTop: 60,
  },
  buttonWrapper: {
    width: '70%', // All buttons will have the same width
    gap: 20,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
  },
  spacer: {
    flex: 1, // pushes bottom content down
  },
  bottom: {
    alignItems: 'center',
    marginBottom: 40,
  },
});

