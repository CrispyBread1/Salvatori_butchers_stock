import React, { useState, useEffect } from 'react';
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
import { Colors } from '@/constants/Colors';

interface PreviousDeliveriesProps {
  deliveries: Delivery[];
  products: Product[];
}

const PreviousDeliveries: React.FC<PreviousDeliveriesProps> = ({
  deliveries,
  products,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<Delivery[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // console.log('deliveries', deliveries);
    // Reset to first page when deliveries change
    setCurrentPage(1);
  }, [deliveries]);

  const getDeliveryProduct = (productId: number) => {
    return products.find(item => item.id === productId);
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const matches = deliveries.filter((delivery) => {
      const product = getDeliveryProduct(delivery.product);
      const created_at =  new Date(delivery.created_at).toLocaleString()
      return (
        product?.name.toLowerCase().includes(query) ||
        delivery.supplier?.toLowerCase().includes(query) ||
        delivery.batch_code?.toString().includes(query) ||
        delivery.quantity?.toString().includes(query) ||
        delivery.date?.toString().includes(query)
      );
    });
    var sorted_matches = sortDeliveriesByDate(matches)
    setFiltered(sorted_matches);
    setCurrentPage(1); // reset to first page on search
  }, [searchQuery, deliveries, products]);

  const sortDeliveriesByDate = (deliveries: Delivery[]): Delivery[] => {
    return deliveries.sort((a, b) => {
      return b.date.localeCompare(a.date); // newest first
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = filtered.slice(startIndex, endIndex);

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
          <Text style={styles.boldText}>{item.batch_code}</Text>
          <Text style={styles.statusText}>Date: {item.date}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.boldText}>{deliveryProduct?.name}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.itemText}>
            {item ? `Qty: ${item.quantity ? item.quantity : 'Empty'}` : 'No items'}
          </Text>
          <Text style={styles.itemText}>
            {item ? `Supplier: ${item.supplier ? item.supplier : 'Empty'}` : 'No items'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliveries</Text>

      {/* Search Input   ----       ----       ----*/}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search deliveries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Results Info   ----       ----       ----*/}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          Showing {currentDeliveries.length} of {filtered.length} deliveries
          {searchQuery ? ` (filtered from ${deliveries.length} total)` : ''}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.noResults}>
          {searchQuery ? 'No deliveries match your search' : 'No deliveries found'}
        </Text>
      ) : (
        <>
          <View style={styles.tableContainer}>
            {/* Table Header  ----       ----       ----*/}
            <View style={styles.tableHeader}>
              <View style={styles.tableCell}>
                <Text style={styles.headerText}>Batch Code</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.headerText}>Product</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.headerText}>Details</Text>
              </View>
            </View>

            {/* Table Data   ----       ----       ----*/}
            <FlatList
              data={currentDeliveries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderDeliveryRow}
              style={styles.tableData}
              scrollEnabled={true} 
            />
          </View>

          {/* Pagination Controls   ----       ----       ----*/}
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
    height: '80%',
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
    height: '73%',
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
  boldText: {
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
    backgroundColor: Colors.buttons.primary,
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
    backgroundColor: Colors.buttons.primary,
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
