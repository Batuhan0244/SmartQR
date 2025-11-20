import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';
import colors from '../theme/colors';
import appConfig from '../config/appConfig';

export default function PrimaryButton({ title, onPress, style, textStyle, disabled = false }) {
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  if (appConfig.ui.ENABLE_GRADIENT_BACKGROUND && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
        <LinearGradient
          colors={[colorScheme.primary, colorScheme.accent]}
          style={[styles.gradientButton, { opacity: disabled ? 0.6 : 1 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[
        styles.flatButton, 
        { 
          backgroundColor: disabled ? colorScheme.mutedText : colorScheme.primary,
          borderRadius: appConfig.ui.USE_ROUNDED_CARDS ? 12 : 8,
        },
        style
      ]}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});