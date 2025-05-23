import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductPicker from '@/components/ProductPicker';

interface Product {
  id: number;
  name: string;
  product_category: string;
}

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [barcodeScan, setBarcodeScan] = useState(false);
  const [enterManually, setEnterManually] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  useEffect(() => {
    handleUIReset()
    fetchStock('fresh')
  }, [user]);

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
        setProducts(data);

      }
    } catch (error) {
      Alert.alert('Error', 'fetching stock:' + error);
    }

    setFetching(false);
  }, [user]);

  const handleScanBarcode = () => {
    return
    setBarcodeScan(true)
    
  }

  const handleEnterManually = () => {
    setEnterManually(true);
    setShowPicker(true);
  }

  const handleUIReset = () => {
    setBarcodeScan(false)
    setEnterManually(false)
  }

  const handleBarcodeScanned = (data: string) => {
    console.log('Barcode scanned:', data);
    setScannedData(data);
  };

  return (
    <View style={styles.container}>
      {(!barcodeScan && !enterManually) && (
        <View style={styles.buttonWrapper}>
          <Button title="Scan Barcode" onPress={handleScanBarcode} />
          <Button title="Enter Manually" onPress={handleEnterManually} />
        </View>
      )}
      {(barcodeScan || enterManually) && (
        <View style={styles.buttonWrapper}>
          <ProductPicker
            visible={showPicker}
            products={products}
            onSelect={(selected_product) => {
              setSelectedProduct(selected_product);
              setShowPicker(false);
            }}
            onCancel={() => setShowPicker(false)}
          />

          <Button title="Back" onPress={handleUIReset} />
        </View>
      )}

      {selectedProduct && (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18 }}>
            Selected Product: {selectedProduct.name}
          </Text>
        </View>
      )}


      {(barcodeScan || scannedData) && (
        <View style={styles.scannerWrapper}>
          <BarcodeScanner onScanned={handleBarcodeScanned} />
        </View>
      )}

      {scannedData && (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18 }}>Scanned Data: {scannedData}</Text>
        </View>
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

