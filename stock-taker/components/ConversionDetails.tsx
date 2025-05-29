import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import ProductPicker from '@/components/ProductPicker';
import { Product } from '@/models/Product';
import { Conversion } from '@/models/Conversion';
import { useFocusEffect } from 'expo-router';

type StorageType = 'rounds' | 'freezer' | 'fridge' | 'waste';

interface ConversionOutput {
  productId: number;
  quantity: string;
  type: string;
  conversionId: string;
  storageType: StorageType;
}

interface ConversionDetailsProps {
  conversion: Conversion;
  inputProduct: Product;
  products: Product[];
  onSubmit: (outputs: ConversionOutput[]) => void;
  onCancel: () => void;
}

export default function ConversionDetails({ 
  conversion, 
  inputProduct, 
  products, 
  onSubmit, 
  onCancel 
}: ConversionDetailsProps) {
  const [outputs, setOutputs] = useState<ConversionOutput[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    const foundWasteProduct = products.find(item => item.id === -1);  
    if (!foundWasteProduct) {
      const wasteProduct = { "cost": 0, "id": -1, "name": 'Waste', "product_category": 'waste', "product_value": 0, "sage_code": 'waste', "sold_as": '', "stock_category": '', "stock_count": 0, "supplier": ''}
      wasteProduct as Product
      products.unshift(wasteProduct)
    }
  }, []);
  

  const handleAddOutput = () => {
    setEditingIndex(null);
    setShowPicker(true);
  };

  const handleEditOutput = (index: number) => {
    setEditingIndex(index);
    setShowPicker(true);
  };

  const handleProductSelect = (product: Product) => {
    const newOutput: ConversionOutput = {
      productId: product.id,
      quantity: '',
      type: 'output',
      conversionId: conversion.id,
      storageType: 'waste',
    };

    if (editingIndex !== null) {
      // Edit existing output
      const updatedOutputs = [...outputs];
      updatedOutputs[editingIndex] = { ...updatedOutputs[editingIndex], productId: product.id };
      setOutputs(updatedOutputs);
    } else {
      // Add new output
      setOutputs([...outputs, newOutput]);
    }
    
    setShowPicker(false);
    setEditingIndex(null);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const updatedOutputs = [...outputs];
    updatedOutputs[index].quantity = quantity;
    setOutputs(updatedOutputs);
  };

  const handleStorageTypeChange = (index: number, storageType: StorageType) => {
    const updatedOutputs = [...outputs];
    updatedOutputs[index].storageType = storageType;
    setOutputs(updatedOutputs);
  };

  const handleRemoveOutput = (index: number) => {
    const updatedOutputs = outputs.filter((_, i) => i !== index);
    setOutputs(updatedOutputs);
  };

  const handleSubmit = () => {
    // Validate all outputs have quantities
    const invalidOutputs = outputs.filter(output => !output.quantity.trim() || parseFloat(output.quantity) <= 0);
    
    if (outputs.length === 0) {
      Alert.alert('Error', 'Please add at least one output product');
      return;
    }
    
    if (invalidOutputs.length > 0) {
      Alert.alert('Error', 'Please enter valid quantities for all output products');
      return;
    }

    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    onSubmit(outputs);
  };

  const handleCancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  const getProductById = (productId: number): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const renderRadioButton = (
    index: number, 
    value: StorageType, 
    label: string, 
    selectedValue: StorageType
  ) => (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => handleStorageTypeChange(index, value)}
    >
      <View style={[
        styles.radioButton,
        selectedValue === value && styles.radioButtonSelected
      ]}>
        {selectedValue === value && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.productName}>{inputProduct.name}</Text>
          <Text style={styles.subtitle}>What has this been converted to?</Text>
        </View>

        {/* Output Products List */}
        <View style={styles.outputsList}>
          {outputs.map((output, index) => {
            const product = getProductById(output.productId);
            if (!product) return null;
            
            return (
            <View key={`${output.productId}-${index}`} style={styles.outputItem}>
              <View style={styles.outputHeader}>
                <TouchableOpacity 
                  style={styles.productButton}
                  onPress={() => handleEditOutput(index)}
                >
                  <Text style={styles.outputProductName}>{product.name}</Text>
                  <Text style={styles.changeText}>Tap to change</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveOutput(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.quantityInput}
                placeholder="Quantity (kg)"
                value={output.quantity}
                keyboardType="decimal-pad"
                onChangeText={(text) => handleQuantityChange(index, text)}
              />

              {/* Storage Type Radio Buttons */}
              { (output.productId !== -1) && <View style={styles.storageTypeContainer}>
                <Text style={styles.storageTypeLabel}>Storage Type:</Text>
                <View style={styles.radioGroup}>
                  {renderRadioButton(index, 'rounds', 'Rounds', output.storageType)}
                  {renderRadioButton(index, 'freezer', 'Freezer', output.storageType)}
                  {renderRadioButton(index, 'fridge', 'Fridge', output.storageType)}
                </View>
              </View>}
            </View>
            );
          })}

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddOutput}>
            <Text style={styles.addButtonText}>+ Add Output Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, outputs.length === 0 && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={outputs.length === 0}
          >
            <Text style={styles.submitButtonText}>Submit Conversion</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Picker Modal */}
      <ProductPicker
        visible={showPicker}
        products={products}
        onSelect={handleProductSelect}
        onCancel={() => {
          setShowPicker(false);
          setEditingIndex(null);
        }}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirm Submission</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to submit this conversion?
            </Text>
            <Text style={styles.confirmDetails}>
              {outputs.length} output product{outputs.length !== 1 ? 's' : ''} will be recorded.
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.confirmCancelButton} onPress={handleCancelSubmit}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmSubmitButton} onPress={handleConfirmSubmit}>
                <Text style={styles.confirmSubmitText}>Yes, Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '95%',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  outputsList: {
    gap: 15,
  },
  outputItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productButton: {
    flex: 1,
  },
  outputProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  changeText: {
    fontSize: 12,
    color: '#007AFF',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  storageTypeContainer: {
    marginTop: 5,
  },
  storageTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtons: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  confirmText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  confirmDetails: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 25,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmSubmitButton: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
