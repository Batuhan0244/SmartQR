import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import colors from '../theme/colors';

export default function InputField({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  style 
}) {
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={style}>
      {label && (
        <Text style={[styles.label, { color: colorScheme.text }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: colorScheme.card,
            borderColor: colorScheme.border,
            color: colorScheme.text,
            height: multiline ? 100 : 48,
          },
          multiline && { textAlignVertical: 'top' }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorScheme.mutedText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
});