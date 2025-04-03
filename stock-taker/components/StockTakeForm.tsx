import React from 'react';
import { View, Text, Button, ScrollView, Alert, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

interface Product {
  id: number;
  name: string;
  product_category: string;
}

interface Props {
  products: { [category: string]: Product[] };
  refreshStock: () => void;
}

export default function StockTakeForm({ products, refreshStock }: Props) {
  const { control, handleSubmit, reset } = useForm();

  const onSubmit = (data: Record<string, string>) => {
    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to submit this stock take?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => submitStockTake(data) }
      ]
    );
  };

  const submitStockTake = async (formData: Record<string, string>) => {
    console.log('Submitting stock take:', formData);
    // TODO: Replace with actual Supabase logic
  };

  return (
    <ScrollView style={{ padding: 20 }}>
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
                    onChangeText={(text) => onChange(text)}
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
