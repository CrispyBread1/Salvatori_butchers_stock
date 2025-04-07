import { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
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

  const submitStockTake = async (formData: Record<string, string>, timestamp: string) => {
    console.log('Submitting stock take:', formData, timestamp);

    // TODO: Replace with actual logic for submitting the stock take
  };





  return (
    <View style={styles.container}>
      {!category && (
        <View style={styles.buttonWrapper}>
          <Button title="Fresh" onPress={handleFreshCategory} />
          <Button title="Frozen" onPress={handleFrozenCategory} />
          <Button title="Dry" onPress={handleDryCategory} />
        </View>
      )}

      {category && <StockTakeForm products={products} resetUI={resetUI} submitStockTake={submitStockTake} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '70%', // All buttons will have the same width
    gap: 20,
  },
});
