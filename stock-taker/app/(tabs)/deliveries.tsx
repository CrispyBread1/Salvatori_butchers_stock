import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import BarcodeScanner from '@/components/reusable/BarcodeScanner';
import { getProductsByCategory } from '@/utils/products';
import { Product } from '@/models/Product'; 
import { getAllDeliveries } from '@/utils/delivery';
import { Delivery } from '@/models/Delivery';
import PreviousDeliveries from '@/components/deliveries/PreviousDeliveries';
import NewDelivery from '@/components/deliveries/NewDelivery';

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [newDelivery, setNewDelivery] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [fetching, setFetching] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // This runs every time the screen comes into focus (tab is pressed)
      handleUIReset();
    }, [])
  );

  useEffect(() => {
    handleUIReset()
    fetchStock('fresh')
    fetchDeliveries()
  }, [user]);

  const fetchStock = useCallback(async (category: string) => {
    if (!user) {
      console.log("no user")
      return
    };

    setFetching(true);
    let fetchedProducts = await getProductsByCategory('fresh')
    if (fetchedProducts) {
      setProducts(fetchedProducts)
    }
    else {
      Alert.alert('Error', 'fetching stock');
    }

    setFetching(false);
  }, [user]);

  const fetchDeliveries = async () => {
    if (!user) {
      console.log("no user")
      return
    };

    setFetching(true);
    let fetchedDeliveries = await getAllDeliveries()
    if (fetchedDeliveries) {
      setDeliveries(fetchedDeliveries)
    }
    else {
      Alert.alert('Error', 'fetching deliveries');
    }

    setFetching(false);
  };

  const handleNewDelivery = () => {
    setNewDelivery(true);
  }


  const handleUIReset = () => {
    setNewDelivery(false)
    fetchStock('fresh')
    fetchDeliveries()
  }

  const handleDeliverySubmit = () => {
    handleUIReset();
  };

  const handleDeliveryCancel = () => {
    handleUIReset();
  };

  return (
    <View style={styles.container}>
      {(!newDelivery) && (
        <View style={styles.buttonWrapper}>
          <Button title="New" onPress={handleNewDelivery} />
        </View>
      )}

      {(!newDelivery) && (
        <PreviousDeliveries
        deliveries={deliveries}
        products={products}
        />
      )}

      {newDelivery && user && (
        <NewDelivery
          visible={newDelivery}
          products={products}
          user={user}
          onSubmit={handleDeliverySubmit}
          onCancel={handleDeliveryCancel}
        />
      )}
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
  top: {
    alignItems: 'center',
    marginTop: 60,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
  },
  spacer: {
    flex: 1, // pushes bottom content down
  },
  bottom: {
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonWrapper: {
    width: '70%', // All buttons will have the same width
    gap: 20,
  },
  scannerWrapper: {
    height: '60%', // 60% of the screen height
    width: '90%',
    alignSelf: 'center',
  },
});
