import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface StockItem {  // ✅ Define expected item structure
  id: number;
  name: string;
  quantity: number;
}

export default function StockScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<StockItem[]>([]); // ✅ Explicitly define type

  useEffect(() => {
    const fetchStock = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (!error) setItems(data as StockItem[]); // ✅ Ensure correct type
    };

    fetchStock();
  }, []);

  if (!user) return <Text>Please log in</Text>;

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.name}: {item.quantity}</Text>}
      />
      <Button title="Refresh Stock" onPress={() => {}} />
    </View>
  );
}
