import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';
import Card from '../components/Card';
import HistoryItem from '../components/HistoryItem';
import SegmentedControl from '../components/SegmentedControl';
import BannerAdPlaceholder from '../components/BannerAdPlaceholder';

export default function HistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('scanned');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const { scanHistory, generatedHistory, deleteHistoryItem, clearHistory, toggleFavorite, language } = useAppContext();
  const t = createTranslator(language);
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const currentHistory = activeTab === 'scanned' ? scanHistory : generatedHistory;
  const kind = activeTab;

  // Filter items based on search and type filter
  const filteredItems = currentHistory.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.meta && JSON.stringify(item.meta).toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type filter
    const matchesType = filterType === 'all' || 
      (activeTab === 'scanned' ? item.parsedType === filterType : item.mode === filterType);
    
    return matchesSearch && matchesType;
  });

  const handleDeleteItem = (kind, id) => {
    Alert.alert(
      t('alert_confirm'),
      'Are you sure you want to delete this item?',
      [
        { text: t('alert_cancel'), style: 'cancel' },
        { 
          text: t('alert_yes'), 
          style: 'destructive',
          onPress: () => deleteHistoryItem(kind, id)
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      t('history_clear'),
      t('history_clear_confirm'),
      [
        { text: t('alert_cancel'), style: 'cancel' },
        { 
          text: t('alert_yes'), 
          style: 'destructive',
          onPress: () => clearHistory(kind)
        },
      ]
    );
  };

  const getFilterTypes = () => {
    if (activeTab === 'scanned') {
      return [
        { label: 'All', value: 'all' },
        { label: 'URL', value: 'url' },
        { label: 'Text', value: 'text' },
        { label: 'Phone', value: 'phone' },
        { label: 'Email', value: 'email' },
        { label: 'Wi-Fi', value: 'wifi' },
      ];
    } else {
      return [
        { label: 'All', value: 'all' },
        { label: 'Text', value: 'text' },
        { label: 'URL', value: 'url' },
        { label: 'Phone', value: 'phone' },
        { label: 'Email', value: 'email' },
        { label: 'Wi-Fi', value: 'wifi' },
      ];
    }
  };

  const renderItem = ({ item }) => (
    <HistoryItem
      item={item}
      kind={kind}
      onPress={() => navigation.navigate('Detail', { item, kind })}
      onDelete={handleDeleteItem}
      onToggleFavorite={toggleFavorite}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <View style={styles.header}>
        <SegmentedControl
          options={[
            { label: t('history_scanned'), value: 'scanned' },
            { label: t('history_generated'), value: 'generated' },
          ]}
          selectedValue={activeTab}
          onValueChange={setActiveTab}
          style={styles.tabControl}
        />
        
        <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={colorScheme.error} />
          <Text style={[styles.clearText, { color: colorScheme.error }]}>
            {t('history_clear')}
          </Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colorScheme.mutedText} />
          <TextInput
            style={[styles.searchInput, { color: colorScheme.text }]}
            placeholder={t('history_search')}
            placeholderTextColor={colorScheme.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colorScheme.mutedText} />
            </TouchableOpacity>
          )}
        </View>
        
        <SegmentedControl
          options={getFilterTypes()}
          selectedValue={filterType}
          onValueChange={setFilterType}
          style={styles.filterControl}
        />
      </Card>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={colorScheme.mutedText} />
            <Text style={[styles.emptyText, { color: colorScheme.mutedText }]}>
              {t('history_no_items')}
            </Text>
          </View>
        }
      />

      <BannerAdPlaceholder placement="history" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabControl: {
    flex: 1,
    marginRight: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  searchCard: {
    marginBottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    paddingVertical: 8,
  },
  filterControl: {
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});