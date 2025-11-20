import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'scan-outline',
    titleKey: 'onboarding_title_1',
    description: 'Point your camera at any QR code to instantly scan and decode it.',
  },
  {
    icon: 'qr-code-outline',
    titleKey: 'onboarding_title_2',
    description: 'Create custom QR codes for URLs, contacts, Wi-Fi, and more.',
  },
  {
    icon: 'shield-checkmark-outline',
    titleKey: 'onboarding_title_3',
    description: 'Your scan history and favorites are stored securely on your device only.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setHasSeenOnboarding, language } = useAppContext();
  const t = createTranslator(language);
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
  };

  const handleScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slide);
  };

  return (
    <LinearGradient
      colors={[colorScheme.background, colorScheme.card]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.iconContainer}>
              <Ionicons name={slide.icon} size={80} color={colorScheme.primary} />
            </View>
            
            <Text style={[styles.title, { color: colorScheme.text }]}>
              {t(slide.titleKey)}
            </Text>
            
            <Text style={[styles.description, { color: colorScheme.mutedText }]}>
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentSlide ? colorScheme.primary : colorScheme.mutedText,
                },
              ]}
            />
          ))}
        </View>

        {currentSlide === slides.length - 1 ? (
          <PrimaryButton
            title={t('onboarding_button_start')}
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />
        ) : (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleGetStarted}
          >
            <Text style={[styles.skipText, { color: colorScheme.mutedText }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  getStartedButton: {
    width: '100%',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});