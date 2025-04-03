import { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native'; 
import { router } from 'expo-router';
import StockTakeForm from '@/components/StockTakeForm';

interface Product {
  id: number;
  name: string;
  product_category: string;
}

export default function StockScreen() {
  const { user, loading } = useAuth();  
  const [products, setProducts] = useState<{ [category: string]: Product[] }>({});
  const [fetching, setFetching] = useState(true);
  const [category, setCategory] = useState('');

  const fetchStock = useCallback(async (category: string) => {
    if (!user) return;

    setFetching(true);

    try {
      // Fetch the user's department (pseudo-code)
      // const { data: profile } = await supabase.from('profiles').select('department').eq('id', user.id).single();
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('stock_category', category) 
        .order('product_category', { ascending: true });

      if (!error && data) {
        const groupedProducts = data.reduce((acc, product) => {
          acc[product.product_category] = acc[product.product_category] || [];
          acc[product.product_category].push(product);
          return acc;
        }, {} as { [category: string]: Product[] });

        setProducts(groupedProducts);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    }

    setFetching(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && !user) {
        router.replace('/');
      }
    }, [user, loading])
  );

  if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (!user) return <Text>Please log in</Text>;

  const handleFreshCategory = () => {
    fetchStock('fresh')
    setCategory('fresh')
  }
  const handleFrozenCategory = () => {
    fetchStock('frozen')
    setCategory('fresh')
  }
  const handleDryCategory = () => {
    fetchStock('dry')
    setCategory('fresh')
  }
  const resetUI = () => {
    setCategory('')
    setProducts({})
  }



  return (
    <View style={{ flex: 1, padding: 10 }}>
      {!category && <Button title="Fresh" onPress={handleFreshCategory} />}
      {!category && <Button title="Frozen" onPress={handleFrozenCategory} />}
      {!category && <Button title="Dry" onPress={handleDryCategory} />}

      {category && <StockTakeForm products={products} resetUI={resetUI} />}
    </View>
  );
}
