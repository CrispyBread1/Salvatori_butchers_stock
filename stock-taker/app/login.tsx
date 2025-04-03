import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });


    if (error) Alert.alert('Error', error.message);
    else 
      Alert.alert('Success', 'Logged in successfully');
      router.push('/(tabs)/dashboard');
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
