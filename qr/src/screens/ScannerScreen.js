import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { parseScannedContent } from '../utils/parser';
import appConfig from '../config/appConfig';

const ScannerScreen = () => {
  const navigation = useNavigation();
  const { addScanItem, incrementScanCount, scanCount } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async (result) => {
    if (!isScanning || isProcessing) return;

    setIsScanning(false);
    setIsProcessing(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const parsed = parseScannedContent(result.data);

      const item = {
        id: Date.now().toString(),
        type: 'SCANNED',
        codeType: result.type || 'UNKNOWN',
        parsedType: parsed.type,
        content: result.data,
        meta: parsed.meta,
        createdAt: new Date().toISOString(),
        favorite: false,
      };

      addScanItem(item);
      incrementScanCount();

      navigation.navigate('Detail', { item });

      setTimeout(() => {
        setIsScanning(true);
        setIsProcessing(false);
      }, 1000);
    } catch (err) {
      console.log('Scan error:', err);
      Alert.alert('Error', 'Failed to process scanned code.');
      setIsScanning(true);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc12', 'code128']
        }}
      />

      <View style={styles.frame} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  frame: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    width: '80%',
    height: '40%',
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  processingOverlay: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  processingText: {
    color: '#fff',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
