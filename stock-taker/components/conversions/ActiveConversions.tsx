import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Conversion } from '@/models/Conversion';
import { ConversionItem } from '@/models/ConversionItem';
import { Product } from '@/models/Product';

interface ActiveConversionsProps {
  conversions: Conversion[];
  conversionItems: ConversionItem[];
  conversionProducts: Product[];
  conversionCancelFunc: (conversion: Conversion) => void;
  onSelect: (conversion: Conversion) => void;
  onCancel: () => void;
}

const ActiveConversions: React.FC<ActiveConversionsProps> = ({
  conversions,
  conversionItems,
  conversionProducts,
  conversionCancelFunc,
  onSelect,
  onCancel,
}) => {

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Force re-render by updating state
    setRefreshKey(prev => prev + 1);
  }, [conversions, conversionItems, conversionProducts]);


  // Get the first conversion item for each conversion to display in the table
  const getConversionItem = (conversionId: string) => {
    return conversionItems.find(item => item.conversion_id === conversionId.toString());    
  };

  const getConversionProduct = (conversionId: string) => {
    const activeConversionItem = getConversionItem(conversionId)
    return conversionProducts.find(
      item => item.id === activeConversionItem?.product_id
    );
  };

  const handleCancelConversion = (conversion: Conversion) => {
    Alert.alert('Remove Conversion', 'Are you sure you want to cancel? The entry will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Cancel Conversion', onPress: () => conversionCancelFunc(conversion) },
    ]);
    
  }
  

  const renderConversionRow = ({ item }: { item: Conversion }) => {
    const conversionItem = getConversionItem(item.id);
    
    return (
      <Pressable
        style={styles.tableRow}
        onPress={() => onSelect(item)}
      >
        <View style={styles.tableCell}>
          <Text style={styles.conversionText}> {getConversionProduct(item.id)?.name}</Text>
          <Text style={styles.statusText}>Status: {item.status}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.itemText}>
            {conversionItem ? `Qty: ${conversionItem.quantity}` : 'No items'}
          </Text>
          <Text style={styles.typeText}>
            {conversionItem ? `Type: ${conversionItem.type}` : ''}
          </Text>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleCancelConversion(item)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Conversions</Text>

      {conversions.length === 0 ? (
        <Text style={styles.noResults}>No conversions found</Text>
      ) : (
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableCell}>
              <Text style={styles.headerText}>Conversion</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.headerText}>Details</Text>
            </View>
          </View>

          {/* Table Data */}
          <FlatList
            data={conversions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderConversionRow}
            style={styles.tableData}
          />
        </View>
      )}
{/* 
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Hide</Text>
      </Pressable> */}
    </View>
  );
};

export default ActiveConversions;

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
    maxHeight: 300,
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
    position: 'relative',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conversionText: {
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
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  
  removeButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 18.5, // Helps center the × symbol better
  },
  cancelButtonText: {
    color: '#fa4352',
    fontSize: 16,
    fontWeight: '500',
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
});
