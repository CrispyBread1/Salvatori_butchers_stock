import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

interface Product {
  id: number;
  name: string;
  product_category: string;
}

interface Props {
  products: { [category: string]: Product[] };
  isLoading?: boolean;
}

export default function PaginatedStockTakeForm({ 
  products, 
  isLoading = false 
}: Props) {
  const { control } = useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [flatProducts, setFlatProducts] = useState<Product[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Flatten the products object into an array on component mount
  useEffect(() => {
    const flattenedProducts: Product[] = [];
    Object.entries(products).forEach(([category, items]) => {
      items.forEach(product => {
        flattenedProducts.push({
          ...product,
          product_category: category
        });
      });
    });
    setFlatProducts(flattenedProducts);
    setFilteredProducts(flattenedProducts);
  }, [products]);

  // Update filtered products when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(flatProducts);
      setCurrentPage(1); // Reset to first page when clearing search
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = flatProducts.filter(product => 
      product.name.toLowerCase().includes(query)
    );

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, flatProducts]);

  // Get current products for the current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all page numbers if total pages is less than or equal to max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Ensure we always show up to maxVisiblePages - 2 (for first and last page)
      if (endPage - startPage < maxVisiblePages - 3) {
        if (currentPage < totalPages / 2) {
          // Closer to start, show more pages after current
          endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
        } else {
          // Closer to end, show more pages before current
          startPage = Math.max(2, endPage - (maxVisiblePages - 3));
        }
      }
      
      // Add ellipsis if needed before visible pages
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed after visible pages
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>
          Stock Take
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

        {/* Pagination Stats */}
        <View style={styles.paginationStats}>
          <Text style={styles.statsText}>
            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
          </Text>
        </View>

        {/* Products List */}
        {currentProducts.length === 0 ? (
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
          <View style={styles.productsContainer}>
            {currentProducts.map((product) => (
              <View key={product.id} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.categoryName}>{titleCaseWord(product.product_category)}</Text>
                </View>
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
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <Pressable 
              style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
              onPress={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </Pressable>
            
            {getPageNumbers().map((number, index) => (
              <Pressable 
                key={index}
                style={[
                  styles.pageNumButton, 
                  number === currentPage && styles.activePageButton,
                  number === '...' && styles.ellipsis
                ]}
                onPress={() => typeof number === 'number' && paginate(number)}
                disabled={number === '...'}
              >
                <Text 
                  style={[
                    styles.pageNumText,
                    number === currentPage && styles.activePageText
                  ]}
                >
                  {number}
                </Text>
              </Pressable>
            ))}
            
            <Pressable 
              style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
              onPress={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
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
  paginationStats: {
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  productsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  pageButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  pageNumButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginHorizontal: 3,
    marginVertical: 5,
  },
  activePageButton: {
    backgroundColor: '#007bff',
  },
  pageNumText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  activePageText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  ellipsis: {
    backgroundColor: 'transparent',
  },
});
