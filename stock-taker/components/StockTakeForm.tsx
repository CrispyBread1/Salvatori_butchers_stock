import React, { useState } from 'react';
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
}

export default function StockTakeForm({ products, resetUI, submitStockTake }: Props) {
  const { control, handleSubmit } = useForm();
  const [isEdited, setIsEdited] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<Record<string, string> | null>(null);

  const handleInputChange = () => setIsEdited(true);

  const handleCancel = () => {
    if (isEdited) {
      Alert.alert('Unsaved Changes', 'Are you sure you want to cancel?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: resetUI },
      ]);
    } else {
      resetUI();
    }
  };

  const checkStockDate = (formData: Record<string, string>) => {
    const timestamp = new Date().toISOString();
    Alert.alert('Take Date', 'Was this completed today?', [
      {
        text: 'No',
        onPress: () => {
          setPendingFormData(formData);
          setShowDatePicker(true);
        },
      },
      { text: 'Yes', onPress: () => submitStockTake(formData, timestamp) },
    ]);
  };

  const onSubmit = (data: Record<string, string>) => {
    if (isEdited) {
      Alert.alert('Confirm Submission', 'Are you sure you want to submit this stock take?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => checkStockDate(data) },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date && pendingFormData) {
                submitStockTake(pendingFormData, new Date(date).toISOString());
                setPendingFormData(null);
              }
            }}
          />
        )}

        <Text style={styles.headerText}>Stock Take for {new Date().toLocaleDateString()}</Text>

        {Object.entries(products).map(([category, items]) => (
          <View key={category} style={styles.categoryBlock}>
            <Text style={styles.categoryHeader}>{titleCaseWord(category)}</Text>
            {items.map((product) => (
              <View key={product.id} style={styles.productRow}>
                <Text style={styles.productName}>{product.name}</Text>
                <Controller
                  control={control}
                  defaultValue="0.00"
                  name={String(product.id)}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        handleInputChange();
                      }}
                    />
                  )}
                />
                <View style={styles.underline} />
              </View>
            ))}
          </View>
        ))}

        <Pressable style={styles.buttonSubmit} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>Submit Stock Take</Text>
        </Pressable>
        <Pressable style={styles.buttonCancel} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const titleCaseWord = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 20,
    width: 340,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryBlock: {
    marginBottom: 25,
  },
  categoryHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  productRow: {
    marginBottom: 15,
    position: 'relative',
  },
  productName: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  underline: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginTop: 8,
    alignSelf: 'center',
  },
  buttonCancel: {
    backgroundColor: '#fa4352',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonSubmit: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
