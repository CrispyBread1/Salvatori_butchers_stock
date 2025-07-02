import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import ProductPicker from '@/components/reusable/ProductPicker';
import { Product } from '@/models/Product';
import { submitDelivery } from '@/utils/delivery';

interface NewDeliveryProps {
  visible: boolean;
  products: Product[];
  userId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const NewDelivery: React.FC<NewDeliveryProps> = ({
  visible,
  products,
  userId,
  onSubmit,
  onCancel,
}) => {
  const [showPicker, setShowPicker] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [driverName, setDriverName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');

  const handleDeliverySubmit = () => {
    // Validate required fields
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    if (!driverName.trim()) {
      Alert.alert('Error', 'Please enter the driver name');
      return;
    }
    if (!licensePlate.trim()) {
      Alert.alert('Error', 'Please enter the license plate');
      return;
    }
    if (!batchCode.trim()) {
      Alert.alert('Error', 'Please enter the batch code');
      return;
    }
    if (!temperature.trim()) {
      Alert.alert('Error', 'Please enter the temperature');
      return;
    }

    if (selectedProduct) {
      try {
        const quantityNum = parseFloat(quantity);
        const temperatureNum = parseFloat(temperature);
        
        if (isNaN(quantityNum)) {
          Alert.alert('Error', 'Please enter a valid quantity');
          return;
        }
        
        if (isNaN(temperatureNum)) {
          Alert.alert('Error', 'Please enter a valid temperature');
          return;
        }

        console.log('Submitting with values:', {
          productId: selectedProduct.id,
          userId: userId,
          quantity: quantityNum,
          temperature: temperatureNum,
          driverName,
          licensePlate: licensePlate.toUpperCase()
        });

        submitDelivery(selectedProduct.id, userId, parseFloat(quantity), notes, parseFloat(temperature), driverName, licensePlate.toUpperCase(), batchCode);
    
        Alert.alert('Success', 'New delivery submitted successfully.');
        onSubmit();
      } catch (error) {
        Alert.alert('Error', 'Failed to submit stock take.');
      }
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setQuantity('');
    setDriverName('');
    setLicensePlate('');
    setBatchCode('');
    setTemperature('');
    setNotes('');
    setShowPicker(true);
  };

  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ProductPicker
        visible={showPicker}
        products={products}
        onSelect={(selected_product) => {
          setSelectedProduct(selected_product);
          setShowPicker(false);
        }}
        onCancel={() => onCancel()}
      />

      {selectedProduct && (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18 }}>
            Selected Product: {selectedProduct.name}
          </Text>
          <TextInput placeholder="Quantity (kg)" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} style={styles.input} />
          <TextInput placeholder="Driver Name" value={driverName} onChangeText={setDriverName} style={styles.input} />
          <TextInput placeholder="License Plate"  value={licensePlate} onChangeText={setLicensePlate} style={styles.input} />
          <TextInput placeholder="Batch Code"  value={batchCode} onChangeText={setBatchCode} style={styles.input} />
          <TextInput placeholder="Temperature"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
          <TextInput placeholder="Notes"  value={notes} onChangeText={setNotes} style={styles.input} />
          <Button title="Submit" onPress={handleDeliverySubmit} />
        </View>
      )}

      {!selectedProduct && <Button title="Back" onPress={handleCancel} />}
      {selectedProduct && <Button title="Cancel" onPress={handleCancel} />}
    </View>
  );
};

export default NewDelivery;

const styles = StyleSheet.create({
  container: {
    width: '70%',
    gap: 20,
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
