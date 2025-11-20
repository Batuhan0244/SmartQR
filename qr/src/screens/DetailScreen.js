import React from 'react';
import { View, Text, ScrollView, Alert, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';

export default function DetailScreen({ route, navigation }) {
  const { item, kind } = route.params;
  const { deleteHistoryItem, toggleFavorite, isFavorite, language } = useAppContext();
  const t = createTranslator(language);
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const isFav = isFavorite(kind, item.id);
  const isGenerated = kind === 'generated';
  const parsedType = isGenerated ? item.mode : item.parsedType;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(item.content);
    Alert.alert(t('success_copied'));
  };

  const handleShare = async () => {
    try {
      await Sharing.shareAsync({
        message: item.content,
        mimeType: 'text/plain',
      });
    } catch (error) {
      console.warn('Error sharing:', error);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(kind, item.id);
  };

  const handleDelete = () => {
    Alert.alert(
      t('alert_confirm'),
      'Are you sure you want to delete this item?',
      [
        { text: t('alert_cancel'), style: 'cancel' },
        { 
          text: t('alert_yes'), 
          style: 'destructive',
          onPress: () => {
            deleteHistoryItem(kind, item.id);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleAction = () => {
    switch (parsedType) {
      case 'url':
        Linking.openURL(item.content).catch(err => 
          Alert.alert('Error', 'Could not open URL')
        );
        break;
      case 'phone': {
        const phoneNumber = item.content.replace('tel:', '');
        Linking.openURL(`tel:${phoneNumber}`).catch(err =>
          Alert.alert('Error', 'Could not make phone call')
        );
        break;
      }
      case 'email': {
        const email = item.content.replace('mailto:', '');
        Linking.openURL(`mailto:${email}`).catch(err =>
          Alert.alert('Error', 'Could not open email client')
        );
        break;
      }
      case 'sms': {
        const smsData = item.content.replace('smsto:', '').split(':');
        const phone = smsData[0];
        const message = smsData[1] || '';
        Linking.openURL(`sms:${phone}?body=${encodeURIComponent(message)}`).catch(err =>
          Alert.alert('Error', 'Could not open messages')
        );
        break;
      }
      default:
        // No specific action for other types
        break;
    }
  };

  const getActionButtonText = () => {
    switch (parsedType) {
      case 'url': return t('detail_open_url');
      case 'phone': return t('detail_call');
      case 'email': return t('detail_send_email');
      case 'sms': return t('detail_send_sms');
      default: return null;
    }
  };

  const getTypeDisplayName = () => {
    if (isGenerated) {
      return `Generated ${parsedType}`;
    }
    return `Scanned ${parsedType}`;
  };

  const formatContent = () => {
    if (parsedType === 'wifi' && item.content.startsWith('WIFI:')) {
      const parts = item.content.split(';');
      const wifiInfo = {};
      parts.forEach(part => {
        const [key, value] = part.split(':');
        if (key && value) {
          wifiInfo[key] = value;
        }
      });
      return `SSID: ${wifiInfo.S || 'Unknown'}\nPassword: ${wifiInfo.P || 'None'}\nSecurity: ${wifiInfo.T || 'Unknown'}`;
    }
    
    if (parsedType === 'vcard') {
      return item.content.replace(/\n/g, '\n');
    }
    
    return item.content;
  };

  const actionButtonText = getActionButtonText();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <Card>
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {isGenerated ? 'GENERATED' : 'SCANNED'}
            </Text>
          </View>
          <Text style={[styles.codeType, { color: colorScheme.mutedText }]}>
            {item.codeType || 'QR CODE'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colorScheme.mutedText }]}>{t('detail_type')}:</Text>
          <Text style={[styles.value, { color: colorScheme.text }]}>{getTypeDisplayName()}</Text>
        </View>

        {isGenerated && (
          <View style={styles.qrContainer}>
            <QRCode
              value={item.content}
              size={200}
              backgroundColor={colorScheme.card}
              color={colorScheme.text}
            />
          </View>
        )}

        <Card style={styles.contentCard}>
          <Text style={[styles.contentLabel, { color: colorScheme.mutedText }]}>
            {t('detail_content')}
          </Text>
          <Text style={[styles.contentText, { color: colorScheme.text }]}>
            {formatContent()}
          </Text>
        </Card>

        {actionButtonText && (
          <PrimaryButton
            title={actionButtonText}
            onPress={handleAction}
            style={styles.actionButton}
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={24} color={colorScheme.primary} />
            <Text style={[styles.iconText, { color: colorScheme.primary }]}>{t('detail_copy')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colorScheme.primary} />
            <Text style={[styles.iconText, { color: colorScheme.primary }]}>{t('detail_share')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleToggleFavorite}>
            <Ionicons 
              name={isFav ? 'star' : 'star-outline'} 
              size={24} 
              color={isFav ? colorScheme.warning : colorScheme.primary} 
            />
            <Text style={[styles.iconText, { color: isFav ? colorScheme.warning : colorScheme.primary }]}>
              {isFav ? t('detail_unfavorite') : t('detail_favorite')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={colorScheme.error} />
            <Text style={[styles.iconText, { color: colorScheme.error }]}>{t('detail_delete')}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  codeType: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  contentCard: {
    marginTop: 0,
    marginBottom: 16,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  iconButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: 80,
  },
  iconText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});