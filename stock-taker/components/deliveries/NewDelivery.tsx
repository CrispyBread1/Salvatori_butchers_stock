import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, Platform, TouchableOpacity } from 'react-native';
import ProductPicker from '@/components/reusable/ProductPicker';
import { Product } from '@/models/Product';
import { submitDelivery, fetchPreviousDeliveryCode } from '@/utils/delivery';
import { SupabaseUser } from '@/models/User';
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioButtonGroup from '../reusable/RadioButtons';
import { Colors } from '@/constants/Colors';

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
  const [previousDeliveryCode, setPreviousDeliveryCode] = useState(0)
  const [showProductPicker, setShowPicker] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [driverName, setDriverName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [vanTemperature, setVanTemperature] = useState('');
  const [productTemperature, setProductTemperature] = useState('');
  const [origin, setOrigin] = useState('');
  const [cutNumber, setCutNumber] = useState('');
  const [slaughterNumber, setSlaughterNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [useByDateDay, setUseByDateDay] = useState('')
  const [useByDateMonth, setUseByDateMonth] = useState('')
  const [useByDateYear, setUseByDateYear] = useState('')
  const [killDateDay, setKillDateDay] = useState('')
  const [killDateMonth, setKillDateMonth] = useState('')
  const [killDateYear, setKillDateYear] = useState('')
  
  const [selectedRTrOA, setSelectedRTrOA] = useState('');
  const [previousSelectedRTrOA, setPreviousSelectedRTrOA] = useState('');
  const [redTractor, setRedTractor] = useState(false);
  const [rspca, setRspca] = useState(false);
  const [organicAssured, setOrganicAssured] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date);
  const [killDate, setKillDate] = useState(new Date);
  const [useByDate, setUseByDate] = useState(new Date);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchPreviousDeliveryCode()
      .then((res) => {
        setPreviousDeliveryCode(res);
        // Call handleDeliveryBatchCode after state is set
        handleDeliveryBatchCode(res);
      })
      .catch((error) => {
        console.error('Error fetching previous delivery code:', error);
      });
  }, []);
  
  // Fixed batch code function - accept the fetched code as parameter
  const handleDeliveryBatchCode = (prevCode = previousDeliveryCode) => {
    console.log('handleDeliveryBatchCode is being run');
    console.log('previous delivery code:', prevCode);
    console.log('current batch code:', batchCode);
  
    // Only set batch code if it's empty
    if (batchCode === '') {
      console.log('Batch code is empty, setting new code');
      
      let newBatchCode;
      if (prevCode === 999) {
        console.log('Previous code was 999, resetting to 001');
        newBatchCode = '001';
      } else {
        console.log('Incrementing previous code');
        const nextCode = prevCode + 1;
        // Pad with leading zeros to ensure 3 digits
        newBatchCode = nextCode.toString().padStart(3, '0');
      }
      
      console.log('Setting batch code to:', newBatchCode);
      setBatchCode(newBatchCode);
    } else {
      console.log('Batch code already set, skipping');
    }
  };
  
  // Alternative approach using useEffect to watch for previousDeliveryCode changes
  useEffect(() => {
    if (previousDeliveryCode !== 0) {
      handleDeliveryBatchCode();
    }
  }, [previousDeliveryCode]);
  
  // If you prefer the alternative approach, use this simpler initial useEffect:
  useEffect(() => {
    fetchPreviousDeliveryCode()
      .then((res) => setPreviousDeliveryCode(res))
      .catch((error) => console.error('Error fetching previous delivery code:', error));
  }, []);

  useEffect(() => {
    handleRtrOA
  }, [selectedRTrOA]);

  const handleRtrOA = () => {
    // Need to fix later where i have the double click on an option means its deselected. This will cause always to have one true if clicked then unlinked
      if (selectedRTrOA ===  'red_tractor')
        setRedTractor(true)
      if (selectedRTrOA ===  'rspca')
        setRspca(true)
      if (selectedRTrOA ===  'organic_assured')
        setOrganicAssured(true)
  }

  const handleDeliverySubmit = () => {
    // Validate required fields
    
    if (!quantity.trim()) {
      Alert.alert('Error', 'Please enter a quantity');
      return;
    }
    if (!supplier.trim()) {
      Alert.alert('Error', 'Please enter the supplier');
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
    if (!vanTemperature.trim()) {
      Alert.alert('Error', 'Please enter the vehicle temperature');
      return;
    }
    if (!productTemperature.trim()) {
      Alert.alert('Error', 'Please enter the product temperature');
      return;
    }
    if (!origin.trim()) {
      Alert.alert('Error', 'Please enter the products origin');
      return;
    }
    handleUseByDate()
    handleKillDate()
    

    if (selectedProduct) {
      try {
        const quantityNum = parseFloat(quantity);
        
        if (isNaN(quantityNum)) {
          Alert.alert('Error', 'Please enter a valid quantity');
          return;
        }
      
        submitDelivery(selectedProduct.id, selectedDate.toISOString().split('T')[0], user.id, parseFloat(quantity), notes, vanTemperature, productTemperature, driverName, licensePlate.toUpperCase(), origin, killDate.toISOString(), useByDate.toISOString(), slaughterNumber, cutNumber, redTractor, rspca, organicAssured, supplier, parseInt(batchCode));
    
        Alert.alert('Success', 'New delivery submitted successfully.');
        onSubmit();
      } catch (error) {
        Alert.alert('Error', 'Failed to submit stock take.');
      }
    }
  };

  const handleUseByDate = () => {
    if (!useByDateDay.trim()) {
      Alert.alert('Error', 'Please fill in the use by date day');
      return;
    }
    if (!useByDateMonth.trim()) {
      Alert.alert('Error', 'Please fill in the use by date month');
      return;
    }
    if (!useByDateYear.trim()) {
      Alert.alert('Error', 'Please fill in the use by date year');
      return;
    }
    setUseByDate(new Date(parseInt(useByDateDay), parseInt(useByDateMonth), parseInt(useByDateYear)))
  }

  const handleKillDate = () => {
    if (!killDateDay.trim()) {
      Alert.alert('Error', 'Please fill in the kill date day');
      return;
    }
    if (!killDateMonth.trim()) {
      Alert.alert('Error', 'Please fill in the kill date month');
      return;
    }
    if (!killDateYear.trim()) {
      Alert.alert('Error', 'Please fill in the kill date year');
      return;
    }
    setKillDate(new Date(parseInt(killDateDay), parseInt(killDateMonth), parseInt(killDateYear)))
  }

  const handleDeliveryDate = () => {
    setShowDatePicker(true)
  }

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setQuantity('');
    setDriverName('');
    setLicensePlate('');
    setBatchCode('');
    setVanTemperature('');
    setProductTemperature('')
    setOrigin('')
    setCutNumber('')
    setSupplier('')
    setSlaughterNumber('')
    setNotes('');
    setUseByDateDay('');
    setUseByDateMonth('');
    setUseByDateYear('');
    setKillDateDay('');
    setKillDateMonth('');
    setKillDateYear('');
    setSelectedRTrOA('');
    setOrganicAssured(false)
    setRedTractor(false)
    setRspca(false)
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
            <View style={ styles.inputContainer }>
              <TextInput placeholder="Cases" value={quantity} keyboardType="decimal-pad" onChangeText={setQuantity} style={styles.input} />
              <TextInput placeholder="Supplier" value={supplier} onChangeText={setSupplier} style={styles.input} />
            </View>
            <View style={ styles.inputContainer }>
              <TextInput placeholder="Driver Name" value={driverName} onChangeText={setDriverName} style={styles.input} />
              <TextInput placeholder="License Plate"  value={licensePlate} onChangeText={setLicensePlate} style={styles.input} />
            </View>
            <View style={ styles.inputContainer }>
              <TextInput placeholder="Van Temp."  value={vanTemperature} keyboardType="decimal-pad" onChangeText={setVanTemperature} style={styles.input} />
              <TextInput placeholder="Product Temp."  value={productTemperature} keyboardType="decimal-pad" onChangeText={setProductTemperature} style={styles.input} />
            </View>
            <View style={ styles.inputContainer }>
              <TextInput placeholder="Slaughter No."  value={slaughterNumber} onChangeText={setSlaughterNumber} style={styles.input} />
              <TextInput placeholder="Cut No."  value={cutNumber} onChangeText={setCutNumber} style={styles.input} />
            </View>
            <View style={ styles.inputContainer }>
              <TextInput placeholder="Origin"  value={origin} onChangeText={setOrigin} style={styles.input} />
              <TextInput placeholder="Batch Code"  value={batchCode} keyboardType="decimal-pad" onChangeText={setBatchCode} style={styles.input} />
            </View>
            
            <Text style={ styles.inputHeader }>
                Use by
            </Text>
            <View style={ styles.dateInput }>
              <TextInput placeholder="Day"  value={useByDateDay} keyboardType="decimal-pad" onChangeText={setUseByDateDay} style={styles.dateInputField} />
              <TextInput placeholder="Month"  value={useByDateMonth} keyboardType="decimal-pad" onChangeText={setUseByDateMonth} style={styles.dateInputField} />
              <TextInput placeholder="Year"  value={useByDateYear} keyboardType="decimal-pad" onChangeText={setUseByDateYear} style={styles.dateInputField} />
            </View>
            <Text style={ styles.inputHeader }>
                Kill date
            </Text>
            <View style={ styles.dateInput }>
              <TextInput placeholder="Day"  value={killDateDay} keyboardType="decimal-pad" onChangeText={setKillDateDay} style={styles.dateInputField} />
              <TextInput placeholder="Month"  value={killDateMonth} keyboardType="decimal-pad" onChangeText={setKillDateMonth} style={styles.dateInputField} />
              <TextInput placeholder="Year"  value={killDateYear} keyboardType="decimal-pad" onChangeText={setKillDateYear} style={styles.dateInputField} />
            </View>

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

            <TextInput placeholder="Notes"  value={notes} onChangeText={setNotes} style={styles.noteInput} />
          </View>
          {user.admin && (
            <Button  color={ Colors.buttons.primary } title="Select Deliver Date" onPress={handleDeliveryDate} />
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
    backgroundColor: '#fff',
    borderRadius: 10,
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
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: Colors.theme.backgroundPrimary,
    marginBottom: 15,
    color: Colors.input.textPrimary
  },
  noteInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: Colors.theme.backgroundPrimary,
    marginBottom: 15
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
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
    marginBottom: 15,
  },
  dateInputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: Colors.theme.backgroundPrimary,
    flex: 1, // Each takes equal space
    marginHorizontal: 5, // Small gap between inputs
  },
  inputHeader: {
    marginBottom: 5,
    marginLeft: 10, 
    fontSize: 16,
  },
  
});
