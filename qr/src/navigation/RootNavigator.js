import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import MainTabs from './MainTabs';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScannerScreen from '../screens/ScannerScreen';
import GeneratorScreen from '../screens/GeneratorScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { hasSeenOnboarding, isLoading, language } = useAppContext();
  const t = createTranslator(language);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          // Add these options to fix PlatformConstants issue
          animation: 'slide_from_right',
          headerBackTitleVisible: false,
        }}
      >
        {!hasSeenOnboarding ? (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ gestureEnabled: false }}
          />
        ) : null}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Scanner" 
          component={ScannerScreen}
          options={{ 
            headerShown: true, 
            title: t('scanner_title'),
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen 
          name="Generator" 
          component={GeneratorScreen}
          options={{ 
            headerShown: true, 
            title: t('generator_title')
          }}
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          options={{ 
            headerShown: true, 
            title: t('detail_title')
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}