import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/Card';

const AddDevice = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { type } = useLocalSearchParams();
  
  const [deviceName, setDeviceName] = useState('');
  const [selectedZone, setSelectedZone] = useState('zone1');
  const [isSearching, setIsSearching] = useState(false);
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [step, setStep] = useState(1); // 1: Search, 2: Configure, 3: Complete
  const [autoConnect, setAutoConnect] = useState(true);
  
  // Define the valid device types
  type DeviceType = 'sensor' | 'pump' | 'valve' | 'controller' | 'gateway';
  
  // Types mapped to display names
  const deviceTypeLabels: Record<DeviceType, string> = {
    sensor: 'Sensor',
    pump: 'Water Pump',
    valve: 'Valve',
    controller: 'Controller',
    gateway: 'Gateway'
  };
  
  // Mock found devices based on type
  const mockFoundDevices = {
    sensor: [
      { id: 's1', name: 'Soil Moisture Sensor', model: 'SMS100', address: 'F4:12:FA:3D:18:CC', signal: 85 },
      { id: 's2', name: 'Soil NPK Sensor', model: 'SNK200', address: 'F4:12:FA:3D:19:01', signal: 72 },
      { id: 's3', name: 'Soil pH Sensor', model: 'SPH100', address: 'F4:12:FA:3D:18:DD', signal: 68 },
    ],
    pump: [
      { id: 'p1', name: 'Water Pump', model: 'WP500', address: 'F4:12:FA:3E:01:A2', signal: 90 },
    ],
    valve: [
      { id: 'v1', name: 'Irrigation Valve', model: 'IV100', address: 'F4:12:FA:3F:02:B1', signal: 75 },
      { id: 'v2', name: 'Micro Valve', model: 'MV50', address: 'F4:12:FA:3F:03:C2', signal: 82 },
    ],
    controller: [
      { id: 'c1', name: 'ESP32 Controller', model: 'ESP32-S3', address: 'F4:12:FA:40:10:D3', signal: 95 },
    ],
    gateway: [
      { id: 'g1', name: 'LoRa Gateway', model: 'LRG100', address: 'F4:12:FA:41:20:E4', signal: 88 },
    ]
  };
  
  // Start device search
  const startDeviceSearch = () => {
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setFoundDevices(mockFoundDevices[type as keyof typeof mockFoundDevices] || []);
      setIsSearching(false);
    }, 2000);
  };
  
  // Handle device selection
// Define the Device interface
interface Device {
    id: string;
    name: string;
    model: string;
    address: string;
    signal: number;
}

// Handle device selection
const handleDeviceSelect = (device: Device): void => {
    setSelectedDevice(device);
    setDeviceName(device.name);
    setStep(2);
};
  
  // Handle device configuration and completion
  const handleConfigureDevice = () => {
    // In a real app, this would send configuration to the device
    setStep(3);
    
    // After a delay, navigate back to devices screen
    setTimeout(() => {
      router.replace('/devices');
    }, 3000);
  };
  
  // Render search step
  const renderSearchStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>
        Search for {type && typeof type === 'string' && type in deviceTypeLabels ? deviceTypeLabels[type as DeviceType] : 'Device'}
      </ThemedText>
      <ThemedText style={styles.stepDescription}>
        Make sure your device is in pairing mode and within range
      </ThemedText>
      
      <Card style={styles.searchCard}>
        {isSearching ? (
          <View style={styles.searchingContainer}>
            <View style={styles.loadingIndicator}>
              <Ionicons name="radio" size={24} color={theme.primary} />
            </View>
            <ThemedText style={styles.searchingText}>
              Searching for devices...
            </ThemedText>
          </View>
        ) : foundDevices.length > 0 ? (
          <View>
            <ThemedText style={styles.foundDevicesTitle}>
              Found Devices
            </ThemedText>
            <View style={{paddingHorizontal: 5}} >
                {foundDevices.map((device, index) => (
              <TouchableOpacity 
                key={device.id} 
                style={styles.deviceItem}
                onPress={() => handleDeviceSelect(device)}
              >
                <View style={styles.deviceItemLeft}>
                  <View style={styles.deviceItemIcon}>
                    <Ionicons
                      name={
                        type === 'sensor' ? 'analytics' :
                        type === 'pump' ? 'water' :
                        type === 'valve' ? 'options' :
                        type === 'controller' ? 'hardware-chip' :
                        'wifi'
                      }
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.deviceItemInfo}>
                    <ThemedText style={styles.deviceItemName}>{device.name}</ThemedText>
                    <ThemedText style={styles.deviceItemModel}>{device.model}</ThemedText>
                  </View>
                </View>
                <View style={styles.deviceItemSignal}>
                  <Ionicons name="cellular" size={16} color={theme.primary} />
                  <ThemedText style={styles.deviceItemSignalText}>{device.signal}%</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
            </View>
            
          </View>
        ) : (
          <View style={styles.noDevicesContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.textSecondary} />
            <ThemedText style={styles.noDevicesText}>
              No devices found
            </ThemedText>
            <ThemedText style={styles.noDevicesTips}>
              • Ensure the device is powered on{'\n'}
              • Check that it's in pairing mode{'\n'}
              • Make sure it's within range
            </ThemedText>
          </View>
        )}
      </Card>
      
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          isSearching && { opacity: 0.7 },
          foundDevices.length > 0 && { display: 'none' }
        ]}
        onPress={startDeviceSearch}
        disabled={isSearching}
      >
        <Ionicons name="search" size={20} color="#fff" />
        <ThemedText style={styles.actionButtonText}>
          {isSearching ? 'Searching...' : foundDevices.length > 0 ? 'Search Again' : 'Start Search'}
        </ThemedText>
      </TouchableOpacity>
      
      {foundDevices.length > 0 && (
        <TouchableOpacity 
          style={[styles.secondaryButton]}
          onPress={startDeviceSearch}
        >
          <Ionicons name="refresh" size={20} color={theme.primary} />
          <ThemedText style={styles.secondaryButtonText}>Search Again</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Render configure step
  const renderConfigureStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>
        Configure Device
      </ThemedText>
      <ThemedText style={styles.stepDescription}>
        Set up your new {selectedDevice?.name}
      </ThemedText>
      
      <Card style={styles.configureCard}>
        <View style={styles.configField}>
          <ThemedText style={styles.configLabel}>Device Name</ThemedText>
          <TextInput
            style={[styles.configInput, { color: theme.text }]}
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="Enter device name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        
        <View style={styles.configField}>
          <ThemedText style={styles.configLabel}>Assign to Zone</ThemedText>
          <View style={styles.zoneButtons}>
            <TouchableOpacity 
              style={[styles.zoneButton, selectedZone === 'zone1' && styles.zoneButtonActive]}
              onPress={() => setSelectedZone('zone1')}
            >
              <ThemedText style={[styles.zoneButtonText, selectedZone === 'zone1' && styles.zoneButtonTextActive]}>
                Zone 1
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.zoneButton, selectedZone === 'zone2' && styles.zoneButtonActive]}
              onPress={() => setSelectedZone('zone2')}
            >
              <ThemedText style={[styles.zoneButtonText, selectedZone === 'zone2' && styles.zoneButtonTextActive]}>
                Zone 2
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.zoneButton, selectedZone === 'zone3' && styles.zoneButtonActive]}
              onPress={() => setSelectedZone('zone3')}
            >
              <ThemedText style={[styles.zoneButtonText, selectedZone === 'zone3' && styles.zoneButtonTextActive]}>
                Zone 3
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.configField}>
          <View style={styles.configLabelRow}>
            <ThemedText style={styles.configLabel}>Auto-Connect on Startup</ThemedText>
            <Switch
              value={autoConnect}
              onValueChange={setAutoConnect}
              trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
              thumbColor={autoConnect ? theme.primary : '#f4f3f4'}
            />
          </View>
          <ThemedText style={styles.configDescription}>
            Device will automatically connect to the system when powered on
          </ThemedText>
        </View>
        
        {type === 'sensor' && (
          <View style={styles.configField}>
            <ThemedText style={styles.configLabel}>Calibration</ThemedText>
            <TouchableOpacity style={styles.calibrationButton}>
              <Ionicons name="options-outline" size={18} color={theme.primary} />
              <ThemedText style={styles.calibrationButtonText}>Calibrate After Setup</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.deviceInfoBox}>
          <ThemedText style={styles.deviceInfoTitle}>Device Information</ThemedText>
          <View style={styles.deviceInfoRow}>
            <ThemedText style={styles.deviceInfoLabel}>Model:</ThemedText>
            <ThemedText style={styles.deviceInfoValue}>{selectedDevice?.model}</ThemedText>
          </View>
          <View style={styles.deviceInfoRow}>
            <ThemedText style={styles.deviceInfoLabel}>Address:</ThemedText>
            <ThemedText style={styles.deviceInfoValue}>{selectedDevice?.address}</ThemedText>
          </View>
          <View style={styles.deviceInfoRow}>
            <ThemedText style={styles.deviceInfoLabel}>Signal:</ThemedText>
            <View style={styles.deviceInfoSignal}>
              <Ionicons name="cellular" size={14} color={theme.primary} />
              <ThemedText style={styles.deviceInfoValue}>{selectedDevice?.signal}%</ThemedText>
            </View>
          </View>
        </View>
      </Card>
      
      <TouchableOpacity 
        style={[styles.actionButton, !deviceName.trim() && { opacity: 0.7 }]}
        onPress={handleConfigureDevice}
        disabled={!deviceName.trim()}
      >
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <ThemedText style={styles.actionButtonText}>
          Add Device
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => setStep(1)}
      >
        <Ionicons name="arrow-back" size={20} color={theme.primary} />
        <ThemedText style={styles.secondaryButtonText}>Back to Search</ThemedText>
      </TouchableOpacity>
    </View>
  );
  
  // Render completion step
  const renderCompletionStep = () => (
    <View style={styles.completionContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={theme.primary} />
      </View>
      <ThemedText style={styles.completionTitle}>
        Device Added Successfully!
      </ThemedText>
      <ThemedText style={styles.completionDescription}>
        Your {deviceName} has been added to {
          selectedZone === 'zone1' ? 'Zone 1' :
          selectedZone === 'zone2' ? 'Zone 2' : 'Zone 3'
        }
      </ThemedText>
      
      {type === 'sensor' && (
        <Card style={styles.nextStepsCard}>
          <ThemedText style={styles.nextStepsTitle}>Recommended Next Steps</ThemedText>
          <View style={styles.nextStep}>
            <Ionicons name="options" size={20} color={theme.primary} />
            <ThemedText style={styles.nextStepText}>Calibrate sensor for optimal accuracy</ThemedText>
          </View>
          <View style={styles.nextStep}>
            <Ionicons name="analytics" size={20} color={theme.primary} />
            <ThemedText style={styles.nextStepText}>Set appropriate thresholds for your crops</ThemedText>
          </View>
        </Card>
      )}
      
      <ThemedText style={styles.redirectingText}>
        Redirecting to Devices screen...
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            Add {deviceTypeLabels[type as DeviceType] || 'Device'}
          </TouchableOpacity>
          <ThemedText style={styles.title}>
            Add {type && typeof type === 'string' && type in deviceTypeLabels ? deviceTypeLabels[type as DeviceType] : 'Device'}
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.progressStepActive]}>
            <View style={styles.progressDot}>
              <ThemedText style={styles.progressNumber}>1</ThemedText>
            </View>
            <ThemedText style={styles.progressLabel}>Search</ThemedText>
          </View>
          <View style={[styles.progressConnector, step >= 2 && styles.progressConnectorActive]} />
          <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
            <View style={styles.progressDot}>
              <ThemedText style={styles.progressNumber}>2</ThemedText>
            </View>
            <ThemedText style={styles.progressLabel}>Configure</ThemedText>
          </View>
          <View style={[styles.progressConnector, step >= 3 && styles.progressConnectorActive]} />
          <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
            <View style={styles.progressDot}>
              <ThemedText style={styles.progressNumber}>3</ThemedText>
            </View>
            <ThemedText style={styles.progressLabel}>Complete</ThemedText>
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderSearchStep()}
          {step === 2 && renderConfigureStep()}
          {step === 3 && renderCompletionStep()}
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressStepActive: {
    opacity: 1,
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressConnector: {
    height: 2,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressConnectorActive: {
    backgroundColor: Colors.light.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  searchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  searchingText: {
    fontSize: 16,
  },
  foundDevicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  deviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.7, // Limit to 70% of the width to reserve space for signal
  },
  deviceItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceItemName: {
    fontSize: 16,
    fontWeight: '500',
    // Add text truncation for long names
    overflow: 'hidden',
  },
  deviceItemModel: {
    fontSize: 12,
    opacity: 0.7,
    // Add text truncation for long models
    overflow: 'hidden',
  },
  deviceItemSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  deviceItemSignalText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noDevicesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noDevicesText: {
    fontSize: 16,
    marginVertical: 12,
  },
  noDevicesTips: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  configureCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  configField: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  configLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  configDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  zoneButtons: {
    flexDirection: 'row',
  },
  zoneButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 8,
    borderRadius: 8,
  },
  zoneButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  zoneButtonText: {
    fontSize: 14,
  },
  zoneButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  calibrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: `${Colors.light.primary}20`,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  calibrationButtonText: {
    color: Colors.light.primary,
    marginLeft: 4,
  },
  deviceInfoBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
  },
  deviceInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  deviceInfoLabel: {
    width: 70,
    fontSize: 13,
    opacity: 0.7,
  },
  deviceInfoValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  deviceInfoSignal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completionDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  nextStepsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nextStepText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  redirectingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default AddDevice;
