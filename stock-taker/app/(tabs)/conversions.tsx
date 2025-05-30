import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductPicker from '@/components/ProductPicker';
import { getProductById, getProductsByCategory } from '@/utils/products';
import { Product } from '@/models/Product'; 
import { getActiveConversionByUserId, submitStartConversion, updateConversion } from '@/utils/conversions';
import { getActiveConversionItemsByConversionId, submitInputConversion } from '@/utils/conversion_items';
import { Conversion } from '@/models/Conversion';
import ActiveConversions from '@/components/ActiveConversions';
import { ConversionItem } from '@/models/ConversionItem';
import ConversionDetails from '@/components/ConversionDetails';

export default function Conversions() {
  const { user } = useAuth();
  const router = useRouter();
  const [newConversion, setNewConversion] = useState(false);
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

  const [conversionSelected, setConversionSelected] = useState(false)
  const [activeConversionSelected, setActiveConversionsSelected] = useState<Conversion | null>(null);

  const [showConversionDetails, setShowConversionDetails] = useState(false);
  const [selectedInputProduct, setSelectedInputProduct] = useState<Product | null>(null);

  useFocusEffect(
    useCallback(() => {
      // This runs every time the screen comes into focus (tab is pressed)
      handleUIReset();
    }, [])
  );

  useEffect(() => {
    const initializeData = async () => {
      handleUIReset();
      await fetchStock('fresh'); // Wait for products to load
      // await fetchActiveConversions(); 
    };
    
    initializeData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (products.length > 0) { // Only if products are loaded
        fetchActiveConversions();
      }
    }, [products])
  );

 

  const fetchActiveConversions = async () => {
    try {
      const conversions = await getActiveConversionByUserId(user?.id || '');
      if (conversions && conversions.length > 0) {
        setActiveConversions(conversions);
        await fetchActiveConversionItems(conversions);
      } else {
        setActiveConversions([]);
      }
    } catch (error) {
      console.error('Error fetching active conversions:', error);
      setActiveConversions([]);
    }
  };

  const fetchActiveConversionItems = async (conversions: Conversion[]) => {
    if (conversions && conversions.length > 0) {
      const fetchedActiveConversionItems = [];
      
      for (const conversion of conversions) { // Use 'of' instead of 'in'
        const conversionItems = await getActiveConversionItemsByConversionId(conversion.id);
        if (conversionItems && conversionItems.length > 0) {
          fetchedActiveConversionItems.push(...conversionItems); // Add items to array
        }
      }
      setActiveConversionItems(fetchedActiveConversionItems); // Set the collected items
      getConversionProduct(fetchedActiveConversionItems);  

    } else {
      setActiveConversionItems([]); // Clear if no active conversions
    }
  };

  const getConversionProduct = async (conversionItems: ConversionItem[]) => {
    if (conversionItems && conversionItems.length > 0) {
      const activeConversionProducts = [];
        
      for (const conversionItem of conversionItems) { // Use 'of' instead of 'in'
        const conversionProduct = products.find(item => item.id === conversionItem.product_id);  
        if (conversionProduct) {
          activeConversionProducts.push(conversionProduct); // Add items to array
        }
      }
      setActiveConversionProducts(activeConversionProducts); // Set the collected items
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

  const handleNewConversion = () => {
    setNewConversion(true)
  }

  const handleUIReset = () => {
    setBarcodeScan(false)
    setEnterManually(false)
    setSelectedProduct(null)
    setQuantity('')
    setConversionSelected(false)
    setActiveConversionsSelected(null)
    setNewConversion(false)
    setShowConversionDetails(false)
    setSelectedInputProduct(null)
  }

  const handleBarcodeScanned = (data: string) => {
    console.log('Barcode scanned:', data);
    setScannedData(data);
  };

  const handleSelectedConversion = (conversion: Conversion) => {
    setActiveConversionsSelected(conversion);
    
    // Find the input product for this conversion
    const inputProduct = activeConversionProducts.find(product => {
      const conversionItem = activeConversionItems.find(item => 
        item.conversion_id === conversion.id && item.product_id === product.id
      );
      return conversionItem;
    });
    
    setSelectedInputProduct(inputProduct || null);
    setShowConversionDetails(true);
  }

  const handleConversionSubmit = async (outputs: any[]) => {
    try {
      // console.log('Conversion outputs:', outputs);
      var conversionId = ''
      const conversionItemIds = []
      for (const conversionItem of outputs) {
        if (!conversionId) {
          conversionId = conversionItem.conversionId
        }
        conversionItemIds.push(conversionItem.productId)
        await submitInputConversion(
          conversionItem.productId,
          parseFloat(conversionItem.quantity), 
          conversionItem.type,
          conversionItem.conversionId,
          conversionItem.storageType
        );
      }
      await updateConversion(conversionId, conversionItemIds)
      Alert.alert('Success', 'Conversion submitted successfully!');
      
      // Instead of handleUIReset(), do a more targeted reset:
      setShowConversionDetails(false);
      setSelectedInputProduct(null);
      setActiveConversionsSelected(null);
      
      // Refresh the active conversions to reflect the updated state
      await fetchActiveConversions();
      
    } catch (error) {
      console.error('Error submitting conversion:', error);
      Alert.alert('Error', 'Failed to submit conversion');
    }
  };
  
  const handleConversionDetailsCancel = () => {
    setShowConversionDetails(false);
    setSelectedInputProduct(null);
    setActiveConversionsSelected(null);
  };

  const handleConversionStart = async () => {
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    if (selectedProduct && user) {
      try {
        const conversionId = await submitStartConversion(selectedProduct.id, 'in_progress', user.id)
        submitInputConversion(selectedProduct.id, parseFloat(quantity), 'input', conversionId)
        Alert.alert('Success', 'Conversion started.');
        fetchStock('fresh')
        handleUIReset();
      } catch (error) {
        console.error('Error starting conversion:', error);
      }
    }
  }

  return (
    <View style={styles.container}>
       {(!newConversion && !activeConversionSelected) && <Button title="New Conversion" onPress={handleNewConversion} />}
      {(newConversion && !barcodeScan && !enterManually && !conversionSelected && !showConversionDetails) && (
        <View style={styles.buttonWrapper}>
          <Button title="Scan Barcode" onPress={handleScanBarcode} />
          <Button title="Enter Manually" onPress={handleEnterManually} />
          <Button title="Cancel" onPress={handleUIReset} />
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

          {(selectedProduct && !conversionSelected) && (
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 18 }}>
                Selected Product: {selectedProduct.name}
              </Text>
              <TextInput placeholder="Quantity (kg)" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} style={styles.input} />
              <Button title="Start" onPress={handleConversionStart} />
            </View>
          )}

         {!selectedProduct && <Button title="Back" onPress={handleUIReset} />}
        </View>
      )}

      {(!newConversion && !showConversionDetails && activeConversions) && (
        <ActiveConversions
        conversions={activeConversions}
        conversionItems={activeConversionItems}
        conversionProducts={activeConversionProducts}
        onSelect={(conversion) => {
          console.log('Selected conversion:', conversion);
          handleSelectedConversion(conversion)
        }}
        onCancel={() => {
          // This will close it, you might want to clear the activeConversions
          setActiveConversions([]);
        }}
      />)}

      {showConversionDetails && activeConversionSelected && selectedInputProduct && (
        <ConversionDetails
          conversion={activeConversionSelected}
          inputProduct={selectedInputProduct}
          products={products}
          onSubmit={handleConversionSubmit}
          onCancel={handleConversionDetailsCancel}
        />
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

