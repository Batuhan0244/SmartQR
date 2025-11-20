import React from 'react';
import { View, Text, ScrollView, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';
import appConfig from '../config/appConfig';
import Card from '../components/Card';
import SegmentedControl from '../components/SegmentedControl';

export default function SettingsScreen() {
  const { theme, setTheme, language, setLanguage, currentTheme } = useAppContext();
  const t = createTranslator(language);
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const handleFeedback = () => {
    Linking.openURL('mailto:support@smartqr.com?subject=SmartQR Feedback').catch(err =>
      console.warn('Error opening email client:', err)
    );
  };

  const themeOptions = [
    { label: t('settings_theme_light'), value: 'light' },
    { label: t('settings_theme_dark'), value: 'dark' },
    { label: t('settings_theme_system'), value: 'system' },
  ];

  const languageOptions = [
    { label: t('settings_language_en'), value: 'en' },
    { label: t('settings_language_tr'), value: 'tr' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <Card>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          {t('settings_theme')}
        </Text>
        <SegmentedControl
          options={themeOptions}
          selectedValue={theme}
          onValueChange={setTheme}
        />
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          {t('settings_language')}
        </Text>
        <SegmentedControl
          options={languageOptions}
          selectedValue={language}
          onValueChange={setLanguage}
        />
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          {t('settings_ads')}
        </Text>
        <View style={styles.adsInfo}>
          <Ionicons name="information-circle-outline" size={20} color={colorScheme.mutedText} />
          <Text style={[styles.adsText, { color: colorScheme.mutedText }]}>
            {t('settings_ads_description')}
          </Text>
        </View>
        <View style={styles.adsStatus}>
          <Text style={[styles.adsStatusText, { color: colorScheme.text }]}>
            Status: {appConfig.ads.ENABLE_ADS ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </Card>

      <Card>
        <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedback}>
          <Ionicons name="chatbubble-outline" size={20} color={colorScheme.primary} />
          <Text style={[styles.feedbackText, { color: colorScheme.primary }]}>
            {t('settings_feedback')}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colorScheme.mutedText} />
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          {t('settings_about')}
        </Text>
        <Text style={[styles.aboutText, { color: colorScheme.text }]}>
          SmartQR v1.0.0
        </Text>
        <Text style={[styles.description, { color: colorScheme.mutedText }]}>
          {t('settings_about_description')}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  adsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adsText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  adsStatus: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  adsStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feedbackText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});