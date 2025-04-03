import { useState, useCallback, useEffect } from 'react';
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
  const { user, loading } = useAuth();  

  // Ensure hooks are always called in the same order
  const fetchStock = useCallback(async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setItems(data as StockItem[]);
  }, []);

  // Ensure hooks are always called in the same order
  useFocusEffect(
    useCallback(() => {
      if (user) {
        // fetchStock();
      }
    }, [user, fetchStock])
  );

  useFocusEffect(
    useCallback(() => {
      if (!loading && !user) {
        router.replace('/');
      }
    }, [user, loading])
  );

  // Return loading state AFTER hooks are defined
  if (loading) return <Text>Loading...</Text>;
 

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
