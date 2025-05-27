import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductPicker from '@/components/ProductPicker';
import { getProductsByCategory } from '@/utils/products';
import { Product } from '@/models/Product'; 

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
  const [quantity, setQuantity] = useState('');
  const [driverName, setDriverName] = useState('');
  const [license_plate, setLicensePlate] = useState('');
  const [temperature, setTemperature] = useState('');

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
    let fetchedProducts = await getProductsByCategory('fresh')
    if (fetchedProducts) {
      setProducts(fetchedProducts)
    }
    else {
      Alert.alert('Error', 'fetching stock');
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
    setSelectedProduct(null)
    setQuantity('')
    setDriverName('')
    setLicensePlate('')
    setTemperature('')
  }

  const handleBarcodeScanned = (data: string) => {
    console.log('Barcode scanned:', data);
    setScannedData(data);
  };

  const handleDeliverySubmit = () => {

  }

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

          {selectedProduct && (
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 18 }}>
                Selected Product: {selectedProduct.name}
              </Text>
              <TextInput placeholder="Quantity" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} style={styles.input} />
              <TextInput placeholder="Driver Name" value={driverName} onChangeText={setDriverName} style={styles.input} />
              <TextInput placeholder="License Plate"  value={license_plate} onChangeText={setLicensePlate} style={styles.input} />
              <TextInput placeholder="Temperature"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
              <Button title="Submit" onPress={handleDeliverySubmit} />
            </View>
          )}

         {!selectedProduct && <Button title="Back" onPress={handleUIReset} />}
         {selectedProduct && <Button title="Cancel" onPress={handleUIReset} />}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  }
});
