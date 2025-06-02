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

interface PreviousDeliveriesProps {
  deliveries: Delivery[];
  products: Product[];
}

const PreviousDeliveries: React.FC<PreviousDeliveriesProps> = ({
  deliveries,
  products,
}) => {

  useEffect(() => {
    console.log('deliveries', deliveries)
    // console.log('products', products)
    // console.log('conversionProducts', conversionProducts)
  }, [deliveries  ]);


  // Get the first conversion item for each conversion to display in the table
  // const getConversionItem = (conversionId: string) => {
  //   return conversionItems.find(item => item.conversion_id === conversionId.toString());    
  // };

  const getDeliveryProduct = (productId: number) => {
    return products.find(
      item => item.id === productId
    );
  };
  

  const renderDeliveryRow = ({ item }: { item: Delivery }) => {
    // Has to be item here, errors otherwise
    const deliveryProduct = getDeliveryProduct(item.product);
    
    return (
      // Might incorporate this later
      // <Pressable
      //   style={styles.tableRow}
      //   onPress={() => onSelect(item)}
      // >
        <>
          <View style={styles.tableCell}>
            <Text style={styles.deliveryText}> {deliveryProduct?.name}</Text>
            <Text style={styles.statusText}>Date: {item.created_at}</Text>
          </View><View style={styles.tableCell}>
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
        </>
      // </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliveries</Text>

      {deliveries.length === 0 ? (
        <Text style={styles.noResults}>No deliveries found</Text>
      ) : (
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
            data={deliveries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDeliveryRow}
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
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
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
