import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
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
  submitStockTake: (formData: Record<string, string>, timestamp: string) => void;
  isLoading?: boolean;
}

export default function StockTakeForm({ 
  products, 
  resetUI, 
  submitStockTake,
  isLoading = false 
}: Props) {
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, string> | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Use the form's built-in isDirty state instead of manual tracking
  const isEdited = isDirty;

  // Function to handle back/cancel button
  const handleCancel = () => {
    if (isEdited) {
      Alert.alert('Unsaved Changes', 'Are you sure you want to cancel? All entries will be lost.', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard Changes', onPress: resetUI },
      ]);
    } else {
      resetUI();
    }
  };

  // Check if the stock take was completed today or on another date
  const checkStockDate = (formData: Record<string, string>) => {
    const timestamp = new Date().toISOString();
    Alert.alert('Stock Take Date', 'Was this stock take completed today?', [
      {
        text: 'No, Select Date',
        onPress: () => {
          setPendingFormData(configureEmptyOptions(formData));
          setShowDatePicker(true);
        },
      },
      { 
        text: 'Yes, Today', 
        onPress: () => {
          if (Platform.OS === 'android') {
            ToastAndroid.show('Submitting stock take...', ToastAndroid.SHORT);
          }
          submitStockTake(configureEmptyOptions(formData), timestamp);
        }
      },
    ]);
  };

  // Handle form submission
  const onSubmit = (data: Record<string, string>) => {
    if (isEdited) {
      Alert.alert('Confirm Submission', 'Are you sure you want to submit this stock take?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => checkStockDate(data) },
      ]);
    }
  };

  // Convert empty values to "0.00" and validate numeric inputs
  const configureEmptyOptions = (formData: Record<string, string>): Record<string, string> => {
    const updatedData: Record<string, string> = {};
  
    Object.entries(formData).forEach(([key, value]) => {
      // Handle empty values
      if (!value || value.trim() === '') {
        updatedData[key] = '0.00';
      } 
      // Ensure proper decimal format
      else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          updatedData[key] = numValue.toFixed(2);
        } else {
          updatedData[key] = '0.00';
        }
      }
    });
  
    return updatedData;
  };
  
  // Handle date picker change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    
    if (date && pendingFormData) {
      setSelectedDate(date);
      submitStockTake(pendingFormData, date.toISOString());
      setPendingFormData(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <Text style={styles.headerText}>
          Stock Take for {selectedDate.toLocaleDateString()}
        </Text>

        {Object.entries(products).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products found</Text>
          </View>
        ) : (
          Object.entries(products).map(([category, items]) => (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.categoryHeader}>{titleCaseWord(category)}</Text>
              {items.map((product) => (
                <View key={product.id} style={styles.productRow}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Controller
                    control={control}
                    defaultValue=""
                    name={String(product.id)}
                    rules={{ 
                      pattern: {
                        value: /^[0-9]*\.?[0-9]*$/,
                        message: "Please enter a valid number"
                      }
                    }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={[
                            styles.input,
                            error && styles.inputError
                          ]}
                          keyboardType="decimal-pad"
                          value={value}
                          onChangeText={onChange}
                          placeholder="0.00"
                          placeholderTextColor="#aaa"
                        />
                        {error && (
                          <Text style={styles.errorText}>Invalid number</Text>
                        )}
                      </View>
                    )}
                  />
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.buttonSubmit, !isEdited && styles.buttonDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={!isEdited}
          >
            <Text style={styles.buttonText}>Submit Stock Take</Text>
          </Pressable>
          
          <Pressable style={styles.buttonCancel} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const titleCaseWord = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  categoryBlock: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  productRow: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    flex: 1,
    paddingRight: 10,
  },
  inputContainer: {
    width: 120,
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
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonSubmit: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  buttonCancel: {
    backgroundColor: '#fa4352',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  underline: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginTop: 8,
  },
});
