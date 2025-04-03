import { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native'; 
import { router } from 'expo-router';


export default function StockScreen() {
  const { user } = useAuth();

  




  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>Welcome to the dashboard, {user.email}!</Text>
        </>
      ) : (
        <>
          <Text>Please log in</Text>
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
},});
