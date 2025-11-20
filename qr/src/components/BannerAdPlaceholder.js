import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import appConfig from '../config/appConfig';
import colors from '../theme/colors';

export default function BannerAdPlaceholder({ placement }) {
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  // Check if ads are enabled for this placement
  const placementKey = `ENABLE_BANNER_${placement.toUpperCase()}`;
  if (!appConfig.ads.ENABLE_ADS || !appConfig.ads[placementKey]) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.card, borderColor: colorScheme.border }]}>
      <Text style={[styles.text, { color: colorScheme.mutedText }]}>
        Ad Banner (placeholder)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});