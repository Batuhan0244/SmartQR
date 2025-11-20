import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';

export default function HistoryItem({ item, kind, onPress, onDelete, onToggleFavorite }) {
  const { language, isFavorite } = useAppContext();
  const t = createTranslator(language);
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const isFav = isFavorite(kind, item.id);
  const iconName = getIconName(item);
  const previewText = getPreviewText(item);

  function getIconName(item) {
    if (kind === 'generated') return 'qr-code-outline';
    
    switch (item.parsedType) {
      case 'url': return 'link-outline';
      case 'phone': return 'call-outline';
      case 'email': return 'mail-outline';
      case 'sms': return 'chatbubble-outline';
      case 'wifi': return 'wifi-outline';
      case 'vcard': return 'person-outline';
      case 'crypto': return 'logo-bitcoin';
      default: return 'text-outline';
    }
  }

  function getPreviewText(item) {
    if (item.content.length > 50) {
      return item.content.substring(0, 50) + '...';
    }
    return item.content;
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('Just now');
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colorScheme.card, borderColor: colorScheme.border }]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <Ionicons name={iconName} size={24} color={colorScheme.primary} style={styles.icon} />
        <View style={styles.content}>
          <Text style={[styles.preview, { color: colorScheme.text }]} numberOfLines={1}>
            {previewText}
          </Text>
          <Text style={[styles.timestamp, { color: colorScheme.mutedText }]}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onToggleFavorite(kind, item.id)} style={styles.actionButton}>
          <Ionicons 
            name={isFav ? 'star' : 'star-outline'} 
            size={24} 
            color={isFav ? colorScheme.warning : colorScheme.mutedText} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onDelete(kind, item.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color={colorScheme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  preview: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});