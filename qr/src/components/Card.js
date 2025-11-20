import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import colors from '../theme/colors';
import appConfig from '../config/appConfig';

export default function Card({ children, style }) {
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colorScheme.card,
          borderRadius: appConfig.ui.USE_ROUNDED_CARDS ? 16 : 8,
          borderColor: colorScheme.border,
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});