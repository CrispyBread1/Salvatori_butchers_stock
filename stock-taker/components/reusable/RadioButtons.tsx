import { Colors } from '@/constants/Colors';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonGroupProps {
  label: string;
  options: RadioOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
}) => {
  const renderRadioButton = (
    value: string, 
    label: string, 
    selectedValue: string
  ) => (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => configureRadioButton(value)}
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

  const configureRadioButton = (value: string) => {
    if (value == selectedValue)
      onValueChange('')
    else
      onValueChange(value)
  }

  return (
    <View style={styles.storageTypeContainer}>
      <Text style={styles.storageTypeLabel}>{label}</Text>
      <View style={styles.radioGroup}>
        {options.map((option) => 
          renderRadioButton(option.value, option.label, selectedValue)
        )}
      </View>
    </View>
  );
};

export default RadioButtonGroup;

const styles = StyleSheet.create({
  storageTypeContainer: {
    marginTop: 5,
    marginBottom: 15,
    marginLeft: 10, 

  },
  storageTypeLabel: {
    fontSize: 16,
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
    borderColor: Colors.buttons.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: Colors.buttons.primary,
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
});
