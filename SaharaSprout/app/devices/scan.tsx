import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';

// Define types for scanned data
interface ScannedData {
  deviceType?: string;
  deviceId?: string;
  model?: string;
  address?: string;
  rawData?: string;
}

const { width } = Dimensions.get('window');

const QRScanner: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [flash, setFlash] = useState<boolean>(false);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);

    try {
      // Try to parse the QR code data as JSON
      const parsedData: ScannedData = JSON.parse(data);
      setScannedData(parsedData);
    } catch (e) {
      // If it's not valid JSON, store the string
      setScannedData({ rawData: data });
    }
  };

  const handleDeviceSetup = () => {
    if (!scannedData) return;
  
    if (scannedData.deviceType) {
      // Use a fixed route and pass the device type as a parameter instead
      router.replace({
        pathname: '/devices/add',
        params: {
          type: scannedData.deviceType,
          deviceId: scannedData.deviceId ?? '',
          model: scannedData.model ?? '',
          address: scannedData.address ?? ''
        }
      });
    } else {
      alert('Invalid QR code for device setup');
      setScanned(false);
      setScannedData(null);
    }
  };

  const toggleFlash = () => {
    setFlash((prev) => !prev);
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <ThemedText>Requesting camera permission...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>QR Scanner</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.centerContent}>
            <Feather name="camera-off" size={64} color={theme.textSecondary} />
            <ThemedText style={styles.permissionText}>Camera permission denied</ThemedText>
            <ThemedText style={styles.permissionSubtext}>
              Please enable camera access in your device settings to scan QR codes
            </ThemedText>

            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing='back'
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={flash}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titleLight}>Scan Device QR Code</Text>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Ionicons
              name={flash ? 'flash' : 'flash-off'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <Text style={styles.scanText}>Position the QR code within the frame</Text>
        </View>

        {scanned && (
          <View style={styles.resultContainer}>
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                <Text style={styles.resultTitle}>QR Code Detected</Text>
              </View>

              {scannedData && scannedData.deviceType && (
                <View style={styles.deviceInfo}>
                  <View style={styles.deviceInfoRow}>
                    <Text style={styles.deviceInfoLabel}>Device Type:</Text>
                    <Text style={styles.deviceInfoValue}>
                      {scannedData.deviceType.charAt(0).toUpperCase() + scannedData.deviceType.slice(1)}
                    </Text>
                  </View>

                  {scannedData.model && (
                    <View style={styles.deviceInfoRow}>
                      <Text style={styles.deviceInfoLabel}>Model:</Text>
                      <Text style={styles.deviceInfoValue}>{scannedData.model}</Text>
                    </View>
                  )}

                  {scannedData.address && (
                    <View style={styles.deviceInfoRow}>
                      <Text style={styles.deviceInfoLabel}>Device ID:</Text>
                      <Text style={styles.deviceInfoValue}>{scannedData.address}</Text>
                    </View>
                  )}
                </View>
              )}

              {scannedData && !scannedData.deviceType && scannedData.rawData && (
                <View style={styles.rawData}>
                  <Text style={styles.rawDataText}>{scannedData.rawData}</Text>
                </View>
              )}

              <View style={styles.resultActions}>
                {scannedData && scannedData.deviceType ? (
                  <TouchableOpacity style={styles.setupButton} onPress={handleDeviceSetup}>
                    <Text style={styles.setupButtonText}>Set Up Device</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.invalidQRText}>This QR code is not valid for device setup</Text>
                )}

                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={() => {
                    setScanned(false);
                    setScannedData(null);
                  }}
                >
                  <Text style={styles.scanAgainText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

// Styles (unchanged but typed for TypeScript)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleLight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  flashButton: {
    padding: 4,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionSubtext: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  permissionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.light.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.light.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.primary,
  },
  scanText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  deviceInfo: {
    marginBottom: 16,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  deviceInfoLabel: {
    width: 100,
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  rawData: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rawDataText: {
    fontSize: 14,
    color: '#000',
  },
  resultActions: {
    marginTop: 8,
  },
  setupButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  setupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  invalidQRText: {
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  scanAgainButton: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default QRScanner;
