import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { router } from 'expo-router';
import { getUserById } from '@/utils/users';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const user = await getUserById(userName)
    console.log(user)
    if (user) {
      const email = user.email
      console.log(email)
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      console.log(error)
      if (error) Alert.alert('Error', error.message);
      else 
        Alert.alert('Success', 'Logged in successfully');
        router.push('/');
    }   
  };

  return (
    <View>
      <TextInput placeholder="Name" value={userName} onChangeText={setUserName} style={styles.input} />
      <TextInput placeholder="Passcode" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button color={ Colors.buttons.primary } title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    fontSize: 14,
    width: '90%',
    textAlign: 'left',
    alignSelf: 'center',
    backgroundColor: '#fff',
    margin: 15,
  }
});
