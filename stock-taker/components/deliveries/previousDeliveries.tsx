import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Product } from '@/models/Product';
import { Delivery } from '@/models/Delivery';

interface PreviousDeliveriesProps {
  deliveries: Delivery[];
  products: Product[];
}

const PreviousDeliveries: React.FC<PreviousDeliveriesProps> = ({
  deliveries,
  products,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log('deliveries', deliveries);
    // Reset to first page when deliveries change
    setCurrentPage(1);
  }, [deliveries]);

  // Filter deliveries based on search query
  const filteredDeliveries = useMemo(() => {
    if (!searchQuery.trim()) return deliveries;

    return deliveries.filter((delivery) => {
      const product = getDeliveryProduct(delivery.product);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        product?.name.toLowerCase().includes(searchLower) ||
        delivery.driver_name?.toLowerCase().includes(searchLower) ||
        delivery.license_plate?.toLowerCase().includes(searchLower) ||
        delivery.batch_code?.toLowerCase().includes(searchLower) ||
        delivery.quantity?.toString().includes(searchLower) ||
        delivery.temperature?.toString().includes(searchLower)
      );
    });
  }, [deliveries, searchQuery, products]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getDeliveryProduct = (productId: number) => {
    return products.find(item => item.id === productId);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageJump = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Pressable
          key={i}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton
          ]}
          onPress={() => handlePageJump(i)}
        >
          <Text style={[
            styles.pageButtonText,
            currentPage === i && styles.activePageButtonText
          ]}>
            {i}
          </Text>
        </Pressable>
      );
    }

    return buttons;
  };

  const renderDeliveryRow = ({ item }: { item: Delivery }) => {
    const deliveryProduct = getDeliveryProduct(item.product);
    
    return (
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text style={styles.deliveryText}>{deliveryProduct?.name}</Text>
          <Text style={styles.statusText}>Date: {item.created_at}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.itemText}>
            {item ? `Qty: ${item.quantity}` : 'No items'}
          </Text>
          <Text style={styles.typeText}>
            {item ? `Temp: ${item.temperature}` : ''}
          </Text>
          <Text style={styles.typeText}>
            {item ? `Driver: ${item.driver_name}` : ''}
          </Text>
          <Text style={styles.typeText}>
            {item ? `License Plate: ${item.license_plate}` : ''}
          </Text>
          <Text style={styles.typeText}>
            {item ? `Batch Code: ${item.batch_code}` : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliveries</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search deliveries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Showing {currentDeliveries.length} of {filteredDeliveries.length} deliveries
          {searchQuery ? ` (filtered from ${deliveries.length} total)` : ''}
        </Text>
      </View>

      {filteredDeliveries.length === 0 ? (
        <Text style={styles.noResults}>
          {searchQuery ? 'No deliveries match your search' : 'No deliveries found'}
        </Text>
      ) : (
        <>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableCell}>
                <Text style={styles.headerText}>Delivery</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.headerText}>Details</Text>
              </View>
            </View>

            {/* Table Data */}
            <FlatList
              data={currentDeliveries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderDeliveryRow}
              style={styles.tableData}
              scrollEnabled={false} // Disable scroll since we're using pagination
            />
          </View>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <Pressable
                style={[
                  styles.navButton,
                  currentPage === 1 && styles.disabledButton
                ]}
                onPress={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <Text style={[
                  styles.navButtonText,
                  currentPage === 1 && styles.disabledButtonText
                ]}>
                  Previous
                </Text>
              </Pressable>

              <View style={styles.pageButtonsContainer}>
                {renderPaginationButtons()}
              </View>

              <Pressable
                style={[
                  styles.navButton,
                  currentPage === totalPages && styles.disabledButton
                ]}
                onPress={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <Text style={[
                  styles.navButtonText,
                  currentPage === totalPages && styles.disabledButtonText
                ]}>
                  Next
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default PreviousDeliveries;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  resultsInfo: {
    marginBottom: 10,
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableData: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemText: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  pageButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  activePageButton: {
    backgroundColor: '#007AFF',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activePageButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
