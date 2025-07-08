import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Product } from '@/models/Product'; 
import { Colors } from '@/constants/Colors';

interface ProductPickerProps {
  visible: boolean;
  products: Product[];
  onSelect: (product: Product) => void;
  onCancel: () => void;
  itemsPerPage?: number;
}

const ProductPicker: React.FC<ProductPickerProps> = ({
  visible,
  products,
  onSelect,
  onCancel,
  itemsPerPage = 15,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(query)
    );
    setFiltered(matches);
    setPage(0); // reset to first page on search
  }, [searchQuery, products]);

  const paginated = filtered.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select a Product</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#aaa"
          />

          {paginated.length === 0 ? (
            <Text style={styles.noResults}>No products found</Text>
          ) : (
            <FlatList
              data={paginated}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.productItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.productText}>{item.name}</Text>
                </Pressable>
              )}
            />
          )}

          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={[styles.pageButton, page === 0 && styles.disabledButton]}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </Pressable>
            <Text style={styles.pageInfo}>
              Page {page + 1} of {totalPages || 1}
            </Text>
            <Pressable
              onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={[
                styles.pageButton,
                page >= totalPages - 1 && styles.disabledButton,
              ]}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </Pressable>
          </View>

          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ProductPicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  productItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productText: {
    fontSize: 16,
  },
  noResults: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  pageButton: {
    padding: 10,
    backgroundColor: Colors.buttons.primary,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
  },
  cancelButton: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: Colors.buttons.primary
  },
  cancelButtonText: {
    color: '#fa4352',
    fontSize: 16,
  },
});
