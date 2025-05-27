import { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native'; 
import { router } from 'expo-router';
import StockTakeForm from '@/components/StockTakeForm';
import { submitStockTakeEntry } from '@/utils/stockTakes';
import { updateProductStocks } from '@/utils/products';

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
  // const [isReady, setIsReady] = useState(false);

  const fetchStock = useCallback(async (category: string) => {

    if (!user) {
      console.log("no user")
      return
    };

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
      Alert.alert('Error', 'fetching stock:' + error);
    }

    setFetching(false);
  }, [user]);

  if (!user) return <Text>Please log in</Text>;

  const handleFreshCategory = () => {
    fetchStock('fresh')
    setCategory('fresh')
  }
  const handleFrozenCategory = () => {
    fetchStock('frozen')
    setCategory('frozen')
  }
  const handleDryCategory = () => {
    fetchStock('dry')
    setCategory('dry')
  }
  const resetUI = () => {
    setCategory('')
    setProducts({})
  }

  const submitStockTake = async (formData: Record<string, string>, timestamp: string) => {
    console.log('Submitting stock take:', formData, timestamp);
    try {
      await submitStockTakeEntry(formData, category, timestamp, user.id);
  
      const todayISO = new Date().toISOString();
      const submittedDay = timestamp;
  
      // Removed until further notice - 23/05/2025
      // if (submittedDay === todayISO) {
      //   await updateProductStocks(formData);
      // }
  
      Alert.alert('Success', 'Stock take submitted successfully.');
      resetUI();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit stock take.');
    }
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
    width: '100%',
  },
  buttonWrapper: {
    width: '70%', // All buttons will have the same width
    gap: 20,
  },
});
