import {
  CameraView,
  CameraType,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';
import { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from 'react-native';

type BarcodeScannerProps = {
  onScanned: (data: string) => void;
};

export default function BarcodeScanner({ onScanned }: BarcodeScannerProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>We need permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    const barcode = result.data?.[0];
    if (barcode) {
      setScanned(true);
      onScanned(barcode);
      Alert.alert('Scanned!', `Barcode: ${barcode}`);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

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

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center', // center the scanning box vertically
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    height: '50%', // reduced from 0.7 to 0.6
    width: '90%', // optional: make it narrower if desired
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

