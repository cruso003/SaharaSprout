import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, Switch, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';

const AdvancedSettings = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // Developer settings
  const [devMode, setDevMode] = useState(false);
  const [debugLogging, setDebugLogging] = useState(false);
  const [manualControl, setManualControl] = useState(false);
  
  // Communication settings
  const [enableLoRa, setEnableLoRa] = useState(true);
  const [fallbackToSMS, setFallbackToSMS] = useState(true);
  const [enableP2P, setEnableP2P] = useState(false);
  
  // Hardware settings
  const [deepSleep, setDeepSleep] = useState(true);
  const [highPrecisionMode, setHighPrecisionMode] = useState(false);
  const [extendedRange, setExtendedRange] = useState(false);
  
  // Handle factory reset
  const handleFactoryReset = () => {
    Alert.alert(
      'Factory Reset',
      'Are you sure you want to reset all settings to factory defaults? This will not delete your account or farm data, but all device configurations and preferences will be reset.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            // Here you would implement the actual reset logic
            Alert.alert('Reset Complete', 'All settings have been reset to factory defaults.');
            router.back();
          }
        }
      ]
    );
  };
  
  // Handle debug export
  const handleDebugExport = () => {
    Alert.alert(
      'Export Debug Data',
      'Debug data will be collected and exported. This may take a few moments.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export',
          onPress: () => {
            // Simulate export process
            setTimeout(() => {
              Alert.alert('Export Complete', 'Debug data has been saved to your downloads folder as SaharaSprout_Debug_20250510.zip');
            }, 2000);
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Advanced Settings</ThemedText>
          <View style={{ width: 28 }} />
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={24} color={Colors.light.error} />
            <ThemedText style={styles.warningText}>
              These settings are intended for advanced users. Incorrect configuration may affect system performance.
            </ThemedText>
          </View>
          
          {/* Developer Settings */}
          <Card style={styles.settingsCard}>
            <ThemedText style={styles.cardTitle}>Developer Options</ThemedText>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>Developer Mode</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Enable advanced controls and debugging tools
                </ThemedText>
              </View>
              <Switch
                value={devMode}
                onValueChange={setDevMode}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={devMode ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            {devMode && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingName}>Debug Logging</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Collect detailed system logs for troubleshooting
                    </ThemedText>
                  </View>
                  <Switch
                    value={debugLogging}
                    onValueChange={setDebugLogging}
                    trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                    thumbColor={debugLogging ? theme.primary : '#f4f3f4'}
                  />
                </View>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingName}>Manual Control</ThemedText>
                    <ThemedText style={styles.settingDescription}>
                      Override AI decisions and control devices directly
                    </ThemedText>
                  </View>
                  <Switch
                    value={manualControl}
                    onValueChange={setManualControl}
                    trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                    thumbColor={manualControl ? theme.primary : '#f4f3f4'}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleDebugExport}
                >
                  <ThemedText style={styles.actionButtonText}>Export Debug Data</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </Card>
          
          {/* Communication Settings */}
          <Card style={styles.settingsCard}>
            <ThemedText style={styles.cardTitle}>Communication Protocol</ThemedText>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>LoRa Connectivity</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Enable long-range radio communication between devices
                </ThemedText>
              </View>
              <Switch
                value={enableLoRa}
                onValueChange={setEnableLoRa}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={enableLoRa ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>SMS Fallback</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Use SMS for critical commands when internet is unavailable
                </ThemedText>
              </View>
              <Switch
                value={fallbackToSMS}
                onValueChange={setFallbackToSMS}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={fallbackToSMS ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>P2P Mesh Network</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Enable direct device-to-device communication without central hub
                </ThemedText>
              </View>
              <Switch
                value={enableP2P}
                onValueChange={setEnableP2P}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={enableP2P ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/settings/advanced/network-config')}
            >
              <ThemedText style={styles.actionButtonText}>Network Configuration</ThemedText>
            </TouchableOpacity>
          </Card>
          
          {/* Hardware Settings */}
          <Card style={styles.settingsCard}>
            <ThemedText style={styles.cardTitle}>Hardware Configuration</ThemedText>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>Deep Sleep Mode</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Put devices to sleep between readings to save battery
                </ThemedText>
              </View>
              <Switch
                value={deepSleep}
                onValueChange={setDeepSleep}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={deepSleep ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>High Precision Mode</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Increase sensor reading frequency and accuracy (uses more power)
                </ThemedText>
              </View>
              <Switch
                value={highPrecisionMode}
                onValueChange={setHighPrecisionMode}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={highPrecisionMode ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>Extended Range Mode</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Boost transmission power for longer range (uses more power)
                </ThemedText>
              </View>
              <Switch
                value={extendedRange}
                onValueChange={setExtendedRange}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={extendedRange ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/settings/advanced/hardware-config')}
            >
              <ThemedText style={styles.actionButtonText}>Hardware Configuration</ThemedText>
            </TouchableOpacity>
          </Card>
          
          {/* Factory Reset */}
          <Card style={styles.resetCard}>
            <ThemedText style={styles.resetTitle}>Factory Reset</ThemedText>
            <ThemedText style={styles.resetDescription}>
              Reset all settings to factory defaults. This will not delete your account or farm data, but all device configurations and preferences will be reset.
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleFactoryReset}
            >
              <ThemedText style={styles.resetButtonText}>Reset to Factory Defaults</ThemedText>
            </TouchableOpacity>
          </Card>
          
          <View style={styles.versionInfo}>
            <ThemedText style={styles.buildText}>Build: 2025.05.10.1234</ThemedText>
            <ThemedText style={styles.firmwareText}>Firmware: v2.1.3.56</ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.light.error,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButton: {
    backgroundColor: `${Colors.light.primary}20`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  resetCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },
  resetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.error,
  },
  resetDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: Colors.light.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 40,
  },
  buildText: {
    fontSize: 12,
    opacity: 0.6,
  },
  firmwareText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
});

export default AdvancedSettings;
