import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import colors from '../theme/colors';

export default function SegmentedControl({ options, selectedValue, onValueChange, style }) {
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.border }, style]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.segment,
            index === 0 && styles.firstSegment,
            index === options.length - 1 && styles.lastSegment,
            selectedValue === option.value && { backgroundColor: colorScheme.primary },
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            style={[
              styles.segmentText,
              { color: selectedValue === option.value ? '#ffffff' : colorScheme.text },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  firstSegment: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  lastSegment: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
});