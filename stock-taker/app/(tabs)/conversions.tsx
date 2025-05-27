import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductPicker from '@/components/ProductPicker';
import { getProductById, getProductsByCategory } from '@/utils/products';
import { Product } from '@/models/Product'; 
import { getActiveConversionByUserId, submitStartConversion } from '@/utils/conversions';
import { getActiveConversionItemsByConversionId, submitInputConversion } from '@/utils/conversion_items';
import { Conversion } from '@/models/Conversion';
import ActiveConversions from '@/components/ActiveConversions';
import { ConversionItem } from '@/models/ConversionItem';

export default function Conversions() {
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

  const [activeConversions, setActiveConversions] = useState<Conversion[]>([])
  const [activeConversionItems, setActiveConversionItems] = useState<ConversionItem[]>([])
  const [activeConversionProducts, setActiveConversionProducts] = useState<Product[]>([])


  useFocusEffect(
    useCallback(() => {

      fetchActiveConversions();
      fetchActiveConversionItems();
      fetchConversionProduct();

      handleUIReset();
    }, [])
  );

  useEffect(() => {
    handleUIReset()
    fetchStock('fresh')
  }, [user]);

  const fetchActiveConversions = async () => {
    const conversions = await getActiveConversionByUserId(user?.id || ''); // Add await here
    if (conversions && conversions.length > 0) {
      setActiveConversions(conversions); // It's already an array
    } 
    else {
      setActiveConversions([]);
    }
  };

  const fetchActiveConversionItems = async () => {
    if (activeConversions && activeConversions.length > 0) {
      const fetchedActiveConversionItems = [];
      
      for (const conversion of activeConversions) { // Use 'of' instead of 'in'
        const conversionItems = await getActiveConversionItemsByConversionId(conversion.id);
        if (conversionItems && conversionItems.length > 0) {
          fetchedActiveConversionItems.push(...conversionItems); // Add items to array
        }
      }
      
      setActiveConversionItems(fetchedActiveConversionItems); // Set the collected items
    } else {
      setActiveConversionItems([]); // Clear if no active conversions
    }
  };

  const fetchConversionProduct = async () => {
    if (activeConversions && activeConversions.length > 0) {
      const fetchedActiveConversionProducts = [];
      
      for (const conversionItem of activeConversionItems) { // Use 'of' instead of 'in'
        const conversionProduct = await getProductById(conversionItem.product_id);
        if (conversionProduct) {
          fetchedActiveConversionProducts.push(conversionProduct); // Add items to array
        }
      }
      
      setActiveConversionProducts(fetchedActiveConversionProducts); // Set the collected items
    } else {
      setActiveConversionItems([]); // Clear if no active conversions
    }
  }

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

  }

  const handleBarcodeScanned = (data: string) => {
    console.log('Barcode scanned:', data);
    setScannedData(data);
  };

  const handleConversionSubmit = () => {
    // Validate required fields
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }

    if (selectedProduct && user) {
      try {
        const quantityNum = parseFloat(quantity);
        
        if (isNaN(quantityNum)) {
          Alert.alert('Error', 'Please enter a valid quantity');
          return;
        }
        

        console.log('Submitting with values:', {
          productId: selectedProduct.id,
          userId: user.id,
          quantity: quantityNum
        });

        // submitDelivery(selectedProduct.id, user.id, parseFloat(quantity), notes, parseFloat(temperature), driverName, licensePlate.toUpperCase());
    
        Alert.alert('Success', 'Stock take submitted successfully.');
        handleUIReset();
      } catch (error) {
        Alert.alert('Error', 'Failed to submit stock take.');
      }
    }
  }

  const handleConversionStart = async () => {
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    if (selectedProduct && user) {
      try {
        const conversionId = await submitStartConversion(selectedProduct.id, 'in_progress', user.id)
        submitInputConversion(selectedProduct.id, parseFloat(quantity), 'input', conversionId)
        Alert.alert('Success', 'Stock take submitted successfully.');
        handleUIReset();
      } catch (error) {
        console.error('Error starting conversion:', error);
      }
    }
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
              <TextInput placeholder="Quantity (kg)" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} style={styles.input} />
              <Button title="Start" onPress={handleConversionStart} />
            </View>
          )}

         {!selectedProduct && <Button title="Back" onPress={handleUIReset} />}
         {selectedProduct && <Button title="Cancel" onPress={handleUIReset} />}
        </View>
      )}

      <ActiveConversions
        visible={activeConversions.length > 0}
        conversions={activeConversions}
        conversionItems={activeConversionItems}
        conversionProducts={activeConversionProducts}
        onSelect={(conversion) => {
          console.log('Selected conversion:', conversion);
          // Handle the selected conversion
        }}
        onCancel={() => {
          // This will close it, you might want to clear the activeConversions
          setActiveConversions([]);
        }}
      />

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

