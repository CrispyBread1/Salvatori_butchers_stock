import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, Platform, TouchableOpacity } from 'react-native';
import ProductPicker from '@/components/reusable/ProductPicker';
import { Product } from '@/models/Product';
import { submitDelivery } from '@/utils/delivery';
import { SupabaseUser } from '@/models/User';
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioButtonGroup from '../reusable/RadioButtons';

interface NewDeliveryProps {
  visible: boolean;
  products: Product[];
  user: SupabaseUser;
  onSubmit: () => void;
  onCancel: () => void;
}

const NewDelivery: React.FC<NewDeliveryProps> = ({
  visible,
  products,
  user,
  onSubmit,
  onCancel,
}) => {
  const [showProductPicker, setShowPicker] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [driverName, setDriverName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');

  const [useByDateDay, setUseByDateDay] = useState('');
  const [useByDateMonth, setUseByDateMonth] = useState('');
  const [useByDateYear, setUseByDateYear] = useState('');
  const [killDateDay, setKillDateDay] = useState('');
  const [killDateMonth, setKillDateMonth] = useState('');
  const [killDateYear, setKillDateYear] = useState('')
  
  const [selectedRTrOA, setSelectedRTrOA] = useState('');

  const [selectedDate, setSelectedDate] = useState(new Date);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
          userId: user.id,
          quantity: quantityNum,
          temperature: temperatureNum,
          driverName,
          licensePlate: licensePlate.toUpperCase()
        });

        submitDelivery(selectedProduct.id, selectedDate.toISOString(), user.id, parseFloat(quantity), notes, parseFloat(temperature), driverName, licensePlate.toUpperCase(), batchCode);
    
        Alert.alert('Success', 'New delivery submitted successfully.');
        onSubmit();
      } catch (error) {
        Alert.alert('Error', 'Failed to submit stock take.');
      }
    }
  };

  const handleDeliveryDate = () => {
    setShowDatePicker(true)
  }

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
    }
  };

  const handleUseByDate = () => {

  }

  const handleReset = () => {
    setSelectedProduct(null);
    setQuantity('');
    setDriverName('');
    setLicensePlate('');
    setBatchCode('');
    setTemperature('');
    setNotes('');
    setShowPicker(true);
    setShowDatePicker(false)
  };

  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ProductPicker
        visible={showProductPicker}
        products={products}
        onSelect={(selected_product) => {
          setSelectedProduct(selected_product);
          setShowPicker(false);
        }}
        onCancel={() => onCancel()}
      />

      {selectedProduct && (
        <View style={{ padding: 20 }}>
          <Text style={styles.date}>
           {selectedDate.toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            })}
          </Text>
          <Text style={ styles.productName }>
            {selectedProduct.name}
          </Text>
          <View>
            <TextInput placeholder="Quantity (kg)" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} style={styles.input} />
            <TextInput placeholder="Driver Name" value={driverName} onChangeText={setDriverName} style={styles.input} />
            <TextInput placeholder="License Plate"  value={licensePlate} onChangeText={setLicensePlate} style={styles.input} />
            <TextInput placeholder="Van Temperature"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
            <TextInput placeholder="Product Temperature"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
            <TextInput placeholder="Slaughter Number"  value={temperature} onChangeText={setTemperature} style={styles.input} />
            <TextInput placeholder="Cut Number"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
            <TextInput placeholder="Origin"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />

            <Text>
                Use by
            </Text>
            <View style={ styles.dateInput }>
              <TextInput placeholder="Day"  value={useByDateDay} keyboardType="decimal-pad" onChangeText={setUseByDateDay} style={styles.dateInputField} />
              <TextInput placeholder="Month"  value={useByDateMonth} keyboardType="decimal-pad" onChangeText={setUseByDateMonth} style={styles.dateInputField} />
              <TextInput placeholder="Year"  value={useByDateYear} keyboardType="decimal-pad" onChangeText={setUseByDateYear} style={styles.dateInputField} />
            </View>
            <Text>
                Kill date
            </Text>
            <View style={ styles.dateInput }>
              <TextInput placeholder="Day"  value={killDateDay} keyboardType="decimal-pad" onChangeText={setKillDateDay} style={styles.dateInputField} />
              <TextInput placeholder="Month"  value={killDateMonth} keyboardType="decimal-pad" onChangeText={setKillDateMonth} style={styles.dateInputField} />
              <TextInput placeholder="Year"  value={killDateYear} keyboardType="decimal-pad" onChangeText={setKillDateYear} style={styles.dateInputField} />
            </View>

            {/* DO something three boxes for as radio buttons */}
            <TextInput placeholder="Red Tractor"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
            <TextInput placeholder="Rspca"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
            <TextInput placeholder="Organic assured"  value={temperature} keyboardType="decimal-pad" onChangeText={setTemperature} style={styles.input} />
            <RadioButtonGroup
              label="Select an option if applicable"
              options={[
                { value: 'red_tractor', label: 'Red Tractor' },
                { value: 'rspca', label: 'Rspca' },
                { value: 'organic_assured', label: 'Organic Assured' }
              ]}
              selectedValue={selectedRTrOA}
              onValueChange={setSelectedRTrOA}
            />

            <TextInput placeholder="Notes"  value={notes} onChangeText={setNotes} style={styles.input} />
          </View>
          {user.admin && (
            <Button title="Select Deliver Date" onPress={handleDeliveryDate} />
          )}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
          <View style={styles.confirmButtons}>
            <TouchableOpacity style={styles.submitButton} onPress={handleDeliverySubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!selectedProduct && <Button title="Back" onPress={handleCancel}/>}
    </View>
  );
};

export default NewDelivery;

const styles = StyleSheet.create({
  container: {
    width: '70%',
    gap: 20,
  },
  date: {
    fontSize: 30,
    fontWeight: 600,
    marginBottom: 10,
    alignSelf: 'center',
  },
  productName: {
    alignSelf: 'center',
    marginBottom: 10
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
    marginBottom: 15
  },
  submitButton: {
    flex: 2,
    alignSelf: 'center',
    width: '60%',
    backgroundColor: '#28a745',
    borderRadius: 7,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    borderRadius: 7,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fcfcfc',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  dateInput: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between', // This spreads them across the width
    alignItems: 'center',
    marginBottom: 15
  },
  dateInputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    flex: 1, // Each takes equal space
    marginHorizontal: 5, // Small gap between inputs
  },
});
