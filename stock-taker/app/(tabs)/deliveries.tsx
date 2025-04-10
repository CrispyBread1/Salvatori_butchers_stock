import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function DeliveriesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [barcodeScan, setBarcodeScan] = useState(false);
  const [enterManually, setEnterManually] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleScanBarcode = () => {
    setBarcodeScan(true)
    return
  }

  const handleEnterManually = () => {
    setEnterManually(true)
    return
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
        <Button title="Back" onPress={handleUIReset} />
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

