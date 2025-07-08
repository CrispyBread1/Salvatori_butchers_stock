import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { router } from 'expo-router';
import { insertUser } from '@/utils/users';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSignUp = async () => {
    // Form validation
    if (!fullName.trim()) {
      return Alert.alert('Error', 'Please enter your name');
    }
    
    if (email !== emailConfirm) {
      return Alert.alert('Error', 'Your emails do not match');
    }
    
    if (password !== passwordConfirm) {
      return Alert.alert('Error', 'Your passwords do not match');
    }
    
    try {
      // Call Supabase signUp with name included in the data object
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // Store name in the user metadata
          },
          // You can add email redirect options here if needed
          // emailRedirectTo: 'yourapp://auth-callback',
        },
      });
  
      if (error) {
        Alert.alert('Error', error.message);
      } else if (data.user) {
        if (data.session) {
          try {
            await insertUser(data.user.id, fullName, email);
            Alert.alert('Success', 'Signed up successfully');
            router.push('/');
          } catch (insertError) {
            Alert.alert('Error', 'Failed to create user profile');
          }
          Alert.alert('Success', 'Signed up successfully, an admin is verifying your account');
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View>
      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Confirm your Email" value={emailConfirm} onChangeText={setEmailConfirm} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Confirm your Password" secureTextEntry value={passwordConfirm} onChangeText={setPasswordConfirm} style={styles.input} />
      <Button color={ Colors.buttons.primary } title="Sign Up" onPress={handleSignUp} />
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
