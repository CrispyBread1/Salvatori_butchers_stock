import {
  CameraView,
  CameraType,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { useState, useEffect } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';

type BarcodeScannerProps = {
  onScanned: (data: string) => void;
};

export default function BarcodeScanner({ onScanned }: BarcodeScannerProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Improved permission handling
  useEffect(() => {
    (async () => {
      if (permission) {
        setHasPermission(permission.granted);
      } else {
        const permissionResult = await requestPermission();
        setHasPermission(permissionResult.granted);
      }
    })();
  }, [permission, requestPermission]);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    const barcode = result.data;
    if (barcode) {
      setScanned(true);
      onScanned(barcode);
      Alert.alert('Scanned!', `Barcode: ${barcode}`);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Handle permission states explicitly
  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>No access to camera</Text>
        <Button 
          title="Grant Permission" 
          onPress={async () => {
            const permissionResult = await requestPermission();
            setHasPermission(permissionResult.granted);
          }} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            style={[styles.button, styles.scanAgainButton]}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  camera: {
    height: screenHeight * 0.6,
    width: screenWidth * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanAgainButton: {
    backgroundColor: '#32cd32',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
