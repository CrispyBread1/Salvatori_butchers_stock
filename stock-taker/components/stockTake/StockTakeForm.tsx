import React, { useState, useEffect, ChangeEvent } from 'react';
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
  handleUIReset: () => void;
  submitStockTake: (formData: Record<number, string | number>, timestamp: string) => void;
  isLoading?: boolean;
}

export default function StockTakeForm({ 
  products, 
  handleUIReset, 
  submitStockTake,
  isLoading = false 
}: Props) {
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingFormData, setPendingFormData] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [allFilteredProducts, setAllFilteredProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);

  const [countedProducts, setCountedProducts] = useState({})

  const ITEMS_PER_PAGE = 10;

  
  // Use the form's built-in isDirty state instead of manual tracking
  const isEdited = isDirty;

  // Update filtered products when search query changes
  useEffect(() => {
    const allProducts = Object.values(products).flat();
  
    if (searchQuery.trim() === '') {
      setAllFilteredProducts(allProducts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query)
      );
      setAllFilteredProducts(filtered);
    }
  
    setPage(0); // Reset to first page on search change
  }, [searchQuery, products]);
  

  // Function to handle back/cancel button
  const handleCancel = () => {
    if (isEdited) {
      Alert.alert('Unsaved Changes', 'Are you sure you want to cancel? All entries will be lost.', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard Changes', onPress: handleUIReset },
      ]);
    } else {
      handleUIReset();
    }
  };

  
  // Handle date picker change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    
    if (date && pendingFormData) {
      setSelectedDate(date);
      submitStockTake(pendingFormData, date.toISOString());
      setPendingFormData({});
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, Math.floor((allFilteredProducts.length - 1) / ITEMS_PER_PAGE)));
  };
  
  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleStockChange = (product: Product, quantity: string) => {
    setCountedProducts({
      ...countedProducts,  // Spread the existing state
      [product.id]: quantity  // Update the specific product
    });
  };

  // Handle form submission
  const onSubmit = () => {
    if (isEdited) {
      Alert.alert('Confirm Submission', 'Are you sure you want to submit this stock take?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => checkStockDate() },
      ]);
    }
  };

  
  // Check if the stock take was completed today or on another date
  const checkStockDate = () => {
    const timestamp = new Date().toISOString();
    Alert.alert('Stock Take Date', 'Was this stock take completed today?', [
      {
        text: 'No, Select Date',
        onPress: () => {
          setPendingFormData(countedProducts);
          setShowDatePicker(true);
        },
      },
      { 
        text: 'Yes, Today', 
        onPress: () => {
          if (Platform.OS === 'android') {
            ToastAndroid.show('Submitting stock take...', ToastAndroid.SHORT);
          }
          submitStockTake(countedProducts, timestamp);
        }
      },
    ]);
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
  
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#aaa"
          />
          {searchQuery !== '' && (
            <Pressable style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>
  
          {allFilteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No products found matching your search' : 'No products found'}
              </Text>
              {searchQuery && (
                <Pressable style={styles.resetSearchButton} onPress={clearSearch}>
                  <Text style={styles.resetSearchText}>Clear Search</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.categoryBlock}>
              {allFilteredProducts
                .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
                .map((product) => (
                  <View key={product.id} style={styles.productRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Controller
                      control={control}
                      defaultValue=""
                      name={String(product.id)}
                      rules={{
                        pattern: {
                          value: /^[0-9]*\.?[0-9]*$/,
                          message: 'Please enter a valid number',
                        },
                      }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={[styles.input, error && styles.inputError]}
                            keyboardType="decimal-pad"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              handleStockChange(product, text); // Your function here
                            }}
                            placeholder="0.00"
                            placeholderTextColor="#aaa"
                          />
                          {error && <Text style={styles.errorText}>Invalid number</Text>}
                        </View>
                      )}
                    />
                  </View>
                ))}
          
              {/* Pagination Controls */}
              <View style={styles.paginationContainer}>
                <Pressable
                  onPress={handlePrevPage}
                  disabled={page === 0}
                  style={[styles.pageButton, page === 0 && styles.pageButtonDisabled]}
                >
                  <Text style={styles.pageButtonText}>Previous</Text>
                </Pressable>
                <Text style={styles.pageInfo}>
                  Page {page + 1} of {Math.ceil(allFilteredProducts.length / ITEMS_PER_PAGE)}
                </Text>
                <Pressable
                  onPress={handleNextPage}
                  disabled={(page + 1) * ITEMS_PER_PAGE >= allFilteredProducts.length}
                  style={[
                    styles.pageButton,
                    (page + 1) * ITEMS_PER_PAGE >= allFilteredProducts.length && styles.pageButtonDisabled,
                  ]}
                >
                  <Text style={styles.pageButtonText}>Next</Text>
                </Pressable>
              </View>
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
            </View>
          )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
}

const titleCaseWord = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.substr(1).toLowerCase();
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  pageButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  pageButtonDisabled: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
  },  
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
  searchContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#888',
  },
  resetSearchButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  resetSearchText: {
    color: '#007bff',
    fontSize: 14,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
