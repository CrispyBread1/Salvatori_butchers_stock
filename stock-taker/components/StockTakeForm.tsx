import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Alert, TextInput, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Product {
  id: number;
  name: string;
  product_category: string;
}

interface Props {
  products: { [category: string]: Product[] };
  resetUI: () => void;
}

export default function StockTakeForm({ products, resetUI }: Props) {
  const { control, handleSubmit, setValue, watch } = useForm();
  const [isEdited, setIsEdited] = useState(false); // Track if any input is edited
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, string> | null>(null);

  const onSubmit = (data: Record<string, string>) => {
    if (isEdited) {
      Alert.alert(
        'Confirm Submission',
        'Are you sure you want to submit this stock take?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => checkStockDate(data) }
        ]
      );
    }
  };

  // Check if any form field is edited by comparing initial values with current values
  const handleInputChange = (id: string, newValue: string) => {
    // Check if the new value is different from the initial value
    setIsEdited(true); // Mark as edited
  };

  const handleCancel = () => {
    if (isEdited) {
      Alert.alert(
        'Unsaved Changes',
        'Are you sure you want to cancel? You have unsaved changes.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => resetUI() } // Reset the form to clear inputs
        ]
      );
    } else {
      resetUI(); // No unsaved changes, reset form directly
    }
  };

  const checkStockDate = (formData: Record<string, string>) => {

      const timestamp = new Date().toISOString();
      Alert.alert(
        'Take Date',
        'Was this completed today?',
        [
          { text: 'No', onPress: () => {
            setPendingFormData(formData);
            setShowDatePicker(true);
          } },
          { text: 'Yes', onPress: () => {
            submitStockTake(formData, timestamp)
          } } // Reset the form to clear inputs
        ]
      );
  }; // Reset the form to clear inputs
      
  

  const submitStockTake = async (formData: Record<string, string>, timestamp: string) => {
    console.log('Submitting stock take:', formData, timestamp);

    // TODO: Replace with actual logic for submitting the stock take
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Button title="Cancel" onPress={handleCancel} />

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false); // close picker
            if (date && pendingFormData) {
              const chosenTimestamp = new Date(date).toISOString();
              submitStockTake(pendingFormData, chosenTimestamp);
              setPendingFormData(null); // clear it out
            }
          }}
        />
      )}


      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Stock Take for {new Date().toLocaleDateString()}
      </Text>

      {Object.entries(products).map(([category, items]) => (
        <View key={category} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}>
            {category}
          </Text>
          {items.map((product) => (
            <View key={product.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
              <Text style={{ flex: 1 }}>{product.name}</Text>

              {/* Controlled Input with react-hook-form */}
              <Controller
                control={control}
                defaultValue="0.00"
                name={String(product.id)}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={{
                      borderWidth: 1,
                      padding: 5,
                      width: 60,
                      textAlign: 'center',
                      borderRadius: 5,
                      borderColor: '#ccc',
                    }}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      handleInputChange(String(product.id), text); // Check if input is edited
                    }}
                  />
                )}
              />
            </View>
          ))}
        </View>
      ))}

      <Button title="Submit Stock Take" onPress={handleSubmit(onSubmit)} color="blue" />
    </ScrollView>
  );
}
