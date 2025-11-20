import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

export const AppContextProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [generatedHistory, setGeneratedHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentTheme = theme === 'system' ? systemColorScheme : theme;

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [
        storedTheme,
        storedLanguage,
        storedOnboarding,
        storedScanHistory,
        storedGeneratedHistory,
        storedFavorites,
        storedScanCount,
      ] = await Promise.all([
        AsyncStorage.getItem('@smartqr_theme'),
        AsyncStorage.getItem('@smartqr_language'),
        AsyncStorage.getItem('@smartqr_has_seen_onboarding'),
        AsyncStorage.getItem('@smartqr_scan_history'),
        AsyncStorage.getItem('@smartqr_generated_history'),
        AsyncStorage.getItem('@smartqr_favorites'),
        AsyncStorage.getItem('@smartqr_scan_count'),
      ]);

      if (storedTheme) setTheme(storedTheme);
      if (storedLanguage) setLanguage(storedLanguage);
      if (storedOnboarding) setHasSeenOnboarding(JSON.parse(storedOnboarding));
      if (storedScanHistory) setScanHistory(JSON.parse(storedScanHistory));
      if (storedGeneratedHistory) setGeneratedHistory(JSON.parse(storedGeneratedHistory));
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedScanCount) setScanCount(parseInt(storedScanCount, 10));
    } catch (error) {
      console.warn('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('@smartqr_theme', newTheme);
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  };

  const persistLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('@smartqr_language', newLanguage);
    } catch (error) {
      console.warn('Error saving language:', error);
    }
  };

  const persistOnboarding = async (value) => {
    try {
      await AsyncStorage.setItem('@smartqr_has_seen_onboarding', JSON.stringify(value));
    } catch (error) {
      console.warn('Error saving onboarding:', error);
    }
  };

  const persistScanHistory = async (history) => {
    try {
      await AsyncStorage.setItem('@smartqr_scan_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Error saving scan history:', error);
    }
  };

  const persistGeneratedHistory = async (history) => {
    try {
      await AsyncStorage.setItem('@smartqr_generated_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Error saving generated history:', error);
    }
  };

  const persistFavorites = async (favs) => {
    try {
      await AsyncStorage.setItem('@smartqr_favorites', JSON.stringify(favs));
    } catch (error) {
      console.warn('Error saving favorites:', error);
    }
  };

  const persistScanCount = async (count) => {
    try {
      await AsyncStorage.setItem('@smartqr_scan_count', count.toString());
    } catch (error) {
      console.warn('Error saving scan count:', error);
    }
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    persistTheme(newTheme);
  };

  const handleSetLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    persistLanguage(newLanguage);
  };

  const handleSetHasSeenOnboarding = (value) => {
    setHasSeenOnboarding(value);
    persistOnboarding(value);
  };

  const addScanItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const newHistory = [newItem, ...scanHistory];
    setScanHistory(newHistory);
    persistScanHistory(newHistory);
    return newItem;
  };

  const addGeneratedItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const newHistory = [newItem, ...generatedHistory];
    setGeneratedHistory(newHistory);
    persistGeneratedHistory(newHistory);
    return newItem;
  };

  const deleteHistoryItem = (kind, id) => {
    if (kind === 'scanned') {
      const newHistory = scanHistory.filter(item => item.id !== id);
      setScanHistory(newHistory);
      persistScanHistory(newHistory);
    } else {
      const newHistory = generatedHistory.filter(item => item.id !== id);
      setGeneratedHistory(newHistory);
      persistGeneratedHistory(newHistory);
    }
    removeFavorite(kind, id);
  };

  const clearHistory = (kind) => {
    if (kind === 'scanned') {
      setScanHistory([]);
      persistScanHistory([]);
    } else {
      setGeneratedHistory([]);
      persistGeneratedHistory([]);
    }
  };

  const toggleFavorite = (kind, id) => {
    const favoriteKey = `${kind}:${id}`;
    let newFavorites;
    
    if (favorites.includes(favoriteKey)) {
      newFavorites = favorites.filter(fav => fav !== favoriteKey);
    } else {
      newFavorites = [...favorites, favoriteKey];
    }
    
    setFavorites(newFavorites);
    persistFavorites(newFavorites);
  };

  const isFavorite = (kind, id) => {
    return favorites.includes(`${kind}:${id}`);
  };

  const removeFavorite = (kind, id) => {
    const favoriteKey = `${kind}:${id}`;
    const newFavorites = favorites.filter(fav => fav !== favoriteKey);
    setFavorites(newFavorites);
    persistFavorites(newFavorites);
  };

  const incrementScanCount = () => {
    const newCount = scanCount + 1;
    setScanCount(newCount);
    persistScanCount(newCount);
    return newCount;
  };

  const resetScanCount = () => {
    setScanCount(0);
    persistScanCount(0);
  };

  const value = {
    theme,
    language,
    hasSeenOnboarding,
    scanHistory,
    generatedHistory,
    favorites,
    scanCount,
    isLoading,
    currentTheme,
    setTheme: handleSetTheme,
    setLanguage: handleSetLanguage,
    setHasSeenOnboarding: handleSetHasSeenOnboarding,
    addScanItem,
    addGeneratedItem,
    deleteHistoryItem,
    clearHistory,
    toggleFavorite,
    isFavorite,
    incrementScanCount,
    resetScanCount,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};