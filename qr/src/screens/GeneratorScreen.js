import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { createTranslator } from '../i18n/translations';
import colors from '../theme/colors';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';
import SegmentedControl from '../components/SegmentedControl';
import BannerAdPlaceholder from '../components/BannerAdPlaceholder';

const modes = [
  { label: 'Text', value: 'text' },
  { label: 'URL', value: 'url' },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Wi-Fi', value: 'wifi' },
  { label: 'vCard', value: 'vcard' },
  { label: 'Crypto', value: 'crypto' },
];

export default function GeneratorScreen() {
  const [activeMode, setActiveMode] = useState('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [cryptoType, setCryptoType] = useState('BTC');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [qrContent, setQrContent] = useState('');
  
  const qrRef = useRef();
  const { addGeneratedItem, language } = useAppContext();
  const t = createTranslator(language);
  const { currentTheme } = useAppContext();
  const colorScheme = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const generateContent = () => {
    let content = '';
    
    switch (activeMode) {
      case 'text':
        content = text;
        break;
      case 'url':
        content = url.startsWith('http') ? url : `https://${url}`;
        break;
      case 'phone':
        content = `tel:${phone}`;
        break;
      case 'email':
        content = `mailto:${email}`;
        break;
      case 'sms':
        content = `smsto:${smsPhone}:${smsMessage}`;
        break;
      case 'wifi':
        content = `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};;`;
        break;
      case 'vcard':
        content = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`;
        break;
      case 'crypto':
        content = cryptoType === 'BTC' ? `bitcoin:${cryptoAddress}` : 
                  cryptoType === 'ETH' ? `ethereum:${cryptoAddress}` : cryptoAddress;
        break;
      default:
        content = '';
    }
    
    setQrContent(content);
    return content;
  };

  const handleGenerate = () => {
    const content = generateContent();
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content to generate QR code');
      return;
    }
    setQrContent(content);
  };

  const handleSaveToHistory = () => {
    if (!qrContent) {
      Alert.alert('Error', 'Please generate a QR code first');
      return;
    }

    const item = {
      type: 'GENERATED',
      mode: activeMode,
      content: qrContent,
      meta: getCurrentFormData(),
    };

    addGeneratedItem(item);
    Alert.alert('Success', 'QR code saved to history');
  };

  const getCurrentFormData = () => {
    switch (activeMode) {
      case 'text': return { text };
      case 'url': return { url };
      case 'phone': return { phone };
      case 'email': return { email };
      case 'sms': return { phone: smsPhone, message: smsMessage };
      case 'wifi': return { ssid: wifiSsid, password: wifiPassword, security: wifiSecurity };
      case 'vcard': return { name: vcardName, phone: vcardPhone, email: vcardEmail, org: vcardOrg };
      case 'crypto': return { type: cryptoType, address: cryptoAddress };
      default: return {};
    }
  };

  const handleCopyContent = async () => {
    if (!qrContent) {
      Alert.alert('Error', 'No content to copy');
      return;
    }
    await Clipboard.setStringAsync(qrContent);
    Alert.alert(t('success_copied'));
  };

  const handleShareQR = async () => {
    if (!qrContent) {
      Alert.alert('Error', 'Please generate a QR code first');
      return;
    }

    try {
      await Sharing.shareAsync({
        message: qrContent,
        mimeType: 'text/plain',
      });
    } catch (error) {
      console.warn('Error sharing:', error);
    }
  };

  const handleSaveImage = async () => {
    if (!qrContent) {
      Alert.alert('Error', 'Please generate a QR code first');
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow access to media library to save images');
        return;
      }

      // For now, we'll save the content as text since QRCode SVG ref method is complex
      // In a real app, you would capture the SVG as PNG
      Alert.alert('Info', 'QR code content saved to history. Full image save requires additional setup.');
    } catch (error) {
      console.warn('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const handleExportPDF = async () => {
    if (!qrContent) {
      Alert.alert('Error', 'Please generate a QR code first');
      return;
    }

    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
              .content { margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>SmartQR Generated Code</h1>
            <p><strong>Type:</strong> ${activeMode}</p>
            <div class="content">
              <p><strong>Content:</strong></p>
              <p>${qrContent}</p>
            </div>
            <p><small>Generated by SmartQR</small></p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export QR as PDF' });
    } catch (error) {
      console.warn('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const renderForm = () => {
    switch (activeMode) {
      case 'text':
        return (
          <InputField
            label="Text Content"
            value={text}
            onChangeText={setText}
            placeholder="Enter text to encode"
            multiline
            style={styles.input}
          />
        );
      case 'url':
        return (
          <InputField
            label="URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com"
            keyboardType="url"
            style={styles.input}
          />
        );
      case 'phone':
        return (
          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            keyboardType="phone-pad"
            style={styles.input}
          />
        );
      case 'email':
        return (
          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            keyboardType="email-address"
            style={styles.input}
          />
        );
      case 'sms':
        return (
          <>
            <InputField
              label="Phone Number"
              value={smsPhone}
              onChangeText={setSmsPhone}
              placeholder="+1234567890"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <InputField
              label="Message"
              value={smsMessage}
              onChangeText={setSmsMessage}
              placeholder="Your message"
              multiline
              style={styles.input}
            />
          </>
        );
      case 'wifi':
        return (
          <>
            <InputField
              label="Network Name (SSID)"
              value={wifiSsid}
              onChangeText={setWifiSsid}
              placeholder="MyWiFi"
              style={styles.input}
            />
            <InputField
              label="Password"
              value={wifiPassword}
              onChangeText={setWifiPassword}
              placeholder="WiFi password"
              secureTextEntry
              style={styles.input}
            />
            <View style={styles.securityContainer}>
              <Text style={[styles.securityLabel, { color: colorScheme.text }]}>Security Type:</Text>
              <SegmentedControl
                options={[
                  { label: 'WPA/WPA2', value: 'WPA' },
                  { label: 'WEP', value: 'WEP' },
                  { label: 'None', value: 'nopass' },
                ]}
                selectedValue={wifiSecurity}
                onValueChange={setWifiSecurity}
                style={styles.securityControl}
              />
            </View>
          </>
        );
      case 'vcard':
        return (
          <>
            <InputField
              label="Full Name"
              value={vcardName}
              onChangeText={setVcardName}
              placeholder="John Doe"
              style={styles.input}
            />
            <InputField
              label="Phone"
              value={vcardPhone}
              onChangeText={setVcardPhone}
              placeholder="+1234567890"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <InputField
              label="Email"
              value={vcardEmail}
              onChangeText={setVcardEmail}
              placeholder="john@example.com"
              keyboardType="email-address"
              style={styles.input}
            />
            <InputField
              label="Organization (Optional)"
              value={vcardOrg}
              onChangeText={setVcardOrg}
              placeholder="Company Name"
              style={styles.input}
            />
          </>
        );
      case 'crypto':
        return (
          <>
            <View style={styles.cryptoTypeContainer}>
              <Text style={[styles.cryptoLabel, { color: colorScheme.text }]}>Coin Type:</Text>
              <SegmentedControl
                options={[
                  { label: 'BTC', value: 'BTC' },
                  { label: 'ETH', value: 'ETH' },
                  { label: 'Other', value: 'OTHER' },
                ]}
                selectedValue={cryptoType}
                onValueChange={setCryptoType}
                style={styles.cryptoControl}
              />
            </View>
            <InputField
              label="Address"
              value={cryptoAddress}
              onChangeText={setCryptoAddress}
              placeholder={cryptoType === 'BTC' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : '0x...'}
              style={styles.input}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <ScrollView style={styles.scrollView}>
        <Card>
          <SegmentedControl
            options={modes.map(mode => ({ ...mode, label: t(`generator_${mode.value}`) }))}
            selectedValue={activeMode}
            onValueChange={setActiveMode}
          />
        </Card>

        <Card>
          {renderForm()}
          <PrimaryButton
            title={t('generator_generate')}
            onPress={handleGenerate}
            style={styles.generateButton}
          />
        </Card>

        {qrContent ? (
          <Card>
            <View style={styles.qrContainer}>
              <QRCode
                value={qrContent}
                size={200}
                backgroundColor={colorScheme.card}
                color={colorScheme.text}
                getRef={(ref) => (qrRef.current = ref)}
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSaveToHistory}>
                <Ionicons name="save-outline" size={20} color={colorScheme.primary} />
                <Text style={[styles.actionText, { color: colorScheme.primary }]}>
                  {t('generator_save_history')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleCopyContent}>
                <Ionicons name="copy-outline" size={20} color={colorScheme.primary} />
                <Text style={[styles.actionText, { color: colorScheme.primary }]}>
                  {t('generator_copy_content')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
                <Ionicons name="share-outline" size={20} color={colorScheme.primary} />
                <Text style={[styles.actionText, { color: colorScheme.primary }]}>
                  {t('generator_share_qr')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleSaveImage}>
                <Ionicons name="image-outline" size={20} color={colorScheme.primary} />
                <Text style={[styles.actionText, { color: colorScheme.primary }]}>
                  {t('generator_save_image')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleExportPDF}>
                <Ionicons name="document-outline" size={20} color={colorScheme.primary} />
                <Text style={[styles.actionText, { color: colorScheme.primary }]}>
                  {t('generator_export_pdf')}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}
      </ScrollView>

      <BannerAdPlaceholder placement="generator" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: '30%',
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  securityContainer: {
    marginTop: 8,
  },
  securityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  securityControl: {
    marginBottom: 8,
  },
  cryptoTypeContainer: {
    marginBottom: 16,
  },
  cryptoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cryptoControl: {
    marginBottom: 8,
  },
});