import { useState, useCallback } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native'; 
import { router } from 'expo-router';

interface StockItem {
  id: number;
  name: string;
  quantity: number;
}

export default function StockScreen() {
  const [items, setItems] = useState<StockItem[]>([]);
  const { user } = useAuth();
  
  const authRedirect = useCallback(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);
  
  useFocusEffect(authRedirect);

  const fetchStock = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setItems(data as StockItem[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchStock(); 
      }
    }, [user, fetchStock])
  );

  if (!user) return <Text>Please log in</Text>;

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.name}: {item.quantity}</Text>}
      />
      <Button title="Refresh Stock" onPress={fetchStock} />
    </View>
  );
}
