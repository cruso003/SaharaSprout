import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Modal, TextInput } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { router } from 'expo-router';

// Define device types and interfaces
interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'pump' | 'valve' | 'controller' | 'gateway';
  status: 'online' | 'offline' | 'warning';
  battery?: number;
  signalStrength?: number;
  lastReading?: string;
  lastUpdate?: string;
  zone?: string;
  details?: { [key: string]: any };
}

// Extract type for Ionicons name prop
import type { ComponentProps } from 'react';
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface DeviceTypeInfo {
  icon: IoniconsName;
  color: string;
  title: string;
}

const DeviceManagement = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDeviceModalVisible, setIsAddDeviceModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDeviceDetailModalVisible, setIsDeviceDetailModalVisible] = useState(false);

  // Sample devices data
  const devices: Device[] = [
    { 
      id: '1', 
      name: 'Main Controller', 
      type: 'controller', 
      status: 'online',
      battery: 85,
      signalStrength: 90,
      lastUpdate: '10 min ago',
      zone: 'All Zones',
      details: {
        model: 'ESP32-S3',
        firmware: 'v2.1.3',
        uptime: '18 days',
        ipAddress: '192.168.1.105',
        connectedDevices: 5
      }
    },
    { 
      id: '2', 
      name: 'Zone 1 Moisture Sensor', 
      type: 'sensor', 
      status: 'online',
      battery: 72,
      signalStrength: 85,
      lastReading: '43%',
      lastUpdate: '5 min ago',
      zone: 'Zone 1',
      details: {
        sensorType: 'Soil Moisture',
        accuracy: '±3%',
        depthLevel: '15cm',
        calibrationDate: '2025-04-12'
      }
    },
    { 
      id: '3', 
      name: 'Zone 1 pH Sensor', 
      type: 'sensor', 
      status: 'online',
      battery: 68,
      signalStrength: 80,
      lastReading: '6.5',
      lastUpdate: '5 min ago',
      zone: 'Zone 1',
      details: {
        sensorType: 'pH Level',
        accuracy: '±0.1',
        calibrationDate: '2025-04-12'
      }
    },
    { 
      id: '4', 
      name: 'Zone 1 Valve', 
      type: 'valve', 
      status: 'offline',
      battery: 15,
      signalStrength: 10,
      lastUpdate: '2 days ago',
      zone: 'Zone 1',
      details: {
        valveType: 'Solenoid',
        flowRate: '2.5 L/min',
        installDate: '2025-01-15'
      }
    },
    { 
      id: '5', 
      name: 'Main Water Pump', 
      type: 'pump', 
      status: 'online',
      battery: 90,
      signalStrength: 95,
      lastUpdate: '8 min ago',
      zone: 'All Zones',
      details: {
        pumpType: 'Submersible',
        power: '0.5 HP',
        flowRate: '15 L/min',
        installDate: '2025-01-10'
      }
    },
    { 
      id: '6', 
      name: 'Zone 2 NPK Sensor', 
      type: 'sensor', 
      status: 'warning',
      battery: 35,
      signalStrength: 60,
      lastReading: 'N:40, P:35, K:45',
      lastUpdate: '30 min ago',
      zone: 'Zone 2',
      details: {
        sensorType: 'NPK Analyzer',
        accuracy: '±5%',
        calibrationNeeded: true,
        calibrationDate: '2025-03-01'
      }
    },
    { 
      id: '7', 
      name: 'LoRa Gateway', 
      type: 'gateway', 
      status: 'online',
      battery: 95,
      signalStrength: 100,
      lastUpdate: '2 min ago',
      zone: 'All Zones',
      details: {
        model: 'SX1302',
        range: '10km',
        connectedNodes: 6,
        uptime: '25 days'
      }
    },
  ];

  // Device type information mapping
  const deviceTypeInfo: { [key: string]: DeviceTypeInfo } = {
    sensor: { icon: 'analytics', color: '#2196F3', title: 'Sensors' },
    pump: { icon: 'water', color: '#4CAF50', title: 'Pumps' },
    valve: { icon: 'options', color: '#FF9800', title: 'Valves' },
    controller: { icon: 'hardware-chip', color: '#9C27B0', title: 'Controllers' },
    gateway: { icon: 'wifi', color: '#795548', title: 'Gateways' },
    all: { icon: 'grid', color: theme.primary, title: 'All Devices' }
  };

  // Filter devices based on selected filter and search query
  const getFilteredDevices = () => {
    let filteredList = devices;
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      filteredList = filteredList.filter(device => device.type === selectedFilter);
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filteredList = filteredList.filter(
        device => 
          device.name.toLowerCase().includes(query) || 
          device.zone?.toLowerCase().includes(query)
      );
    }
    
    return filteredList;
  };

  // Get status color for device
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'warning': return '#FF9800';
      default: return theme.textSecondary;
    }
  };

  // Get battery level color
  const getBatteryColor = (level: number) => {
    if (level >= 70) return '#4CAF50';
    if (level >= 30) return '#FF9800';
    return '#F44336';
  };

  // Get signal strength icon
  const getSignalIcon = (strength: number) => {
    if (strength >= 80) return 'cellular';
    if (strength >= 40) return 'cellular-outline';
    return 'warning-outline';
  };

  // Handle open device details
  const handleOpenDeviceDetails = (device: Device) => {
    setSelectedDevice(device);
    setIsDeviceDetailModalVisible(true);
  };

  // Render device item
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity onPress={() => handleOpenDeviceDetails(item)}>
      <Card style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <View style={[styles.deviceTypeIcon, { backgroundColor: deviceTypeInfo[item.type].color }]}>
            <Ionicons name={deviceTypeInfo[item.type].icon} size={20} color="#fff" />
          </View>
          <View style={styles.deviceInfo}>
            <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
            <View style={styles.deviceZoneRow}>
              <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
              <ThemedText style={styles.deviceZone}>{item.zone}</ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </View>
        
        <View style={styles.deviceStatusRow}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <ThemedText style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</ThemedText>
          </View>
          
          {item.lastReading && (
            <View style={styles.readingIndicator}>
              <Ionicons name="analytics-outline" size={12} color={theme.textSecondary} />
              <ThemedText style={styles.readingText}>{item.lastReading}</ThemedText>
            </View>
          )}
          
          {item.battery && (
            <View style={styles.batteryIndicator}>
              <Ionicons 
                name={item.battery > 20 ? "battery-half" : "battery-dead"} 
                size={12} 
                color={getBatteryColor(item.battery)} 
              />
              <ThemedText style={styles.batteryText}>{item.battery}%</ThemedText>
            </View>
          )}
          
          {item.signalStrength && (
            <View style={styles.signalIndicator}>
              <Ionicons name={getSignalIcon(item.signalStrength)} size={12} color={theme.textSecondary} />
            </View>
          )}
        </View>
        
        <View style={styles.lastUpdateContainer}>
          <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
          <ThemedText style={styles.lastUpdateText}>Updated {item.lastUpdate}</ThemedText>
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Render device type filters
  const renderDeviceTypeFilters = () => (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {Object.keys(deviceTypeInfo).map(type => (
        <TouchableOpacity 
          key={type}
          style={[
            styles.filterButton,
            selectedFilter === type && { backgroundColor: deviceTypeInfo[type].color }
          ]}
          onPress={() => setSelectedFilter(type)}
        >
          <Ionicons 
            name={deviceTypeInfo[type].icon} 
            size={16} 
            color={selectedFilter === type ? '#fff' : theme.text} 
          />
          <ThemedText 
            style={[
              styles.filterText,
              selectedFilter === type && { color: '#fff' }
            ]}
          >
            {deviceTypeInfo[type].title}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render device detail modal
  const renderDeviceDetailModal = () => {
    if (!selectedDevice) return null;
    
    return (
      <Modal
        visible={isDeviceDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDeviceDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.deviceDetailContainer}>
            <View style={styles.deviceDetailHeader}>
              <TouchableOpacity onPress={() => setIsDeviceDetailModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              <ThemedText style={styles.deviceDetailTitle}>{selectedDevice.name}</ThemedText>
              <TouchableOpacity>
                <Ionicons name="settings-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.deviceDetailContent}>
              <View style={styles.deviceDetailSummary}>
                <View style={[styles.deviceDetailIcon, { backgroundColor: deviceTypeInfo[selectedDevice.type].color }]}>
                  <Ionicons name={deviceTypeInfo[selectedDevice.type].icon} size={32} color="#fff" />
                </View>
                <View style={styles.deviceDetailInfo}>
                  <View style={styles.deviceDetailInfoRow}>
                    <ThemedText style={styles.deviceDetailLabel}>Type:</ThemedText>
                    <ThemedText style={styles.deviceDetailValue}>
                      {selectedDevice.type.charAt(0).toUpperCase() + selectedDevice.type.slice(1)}
                    </ThemedText>
                  </View>
                  <View style={styles.deviceDetailInfoRow}>
                    <ThemedText style={styles.deviceDetailLabel}>Status:</ThemedText>
                    <View style={styles.deviceDetailStatus}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedDevice.status) }]} />
                      <ThemedText style={styles.deviceDetailStatusText}>
                        {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.deviceDetailInfoRow}>
                    <ThemedText style={styles.deviceDetailLabel}>Zone:</ThemedText>
                    <ThemedText style={styles.deviceDetailValue}>{selectedDevice.zone}</ThemedText>
                  </View>
                </View>
              </View>
              
              {selectedDevice.lastReading && (
                <Card style={styles.deviceDetailCard}>
                  <ThemedText style={styles.deviceDetailCardTitle}>Current Reading</ThemedText>
                  <View style={styles.readingValueContainer}>
                    <ThemedText style={styles.readingValue}>{selectedDevice.lastReading}</ThemedText>
                    <ThemedText style={styles.readingTimestamp}>as of {selectedDevice.lastUpdate}</ThemedText>
                  </View>
                </Card>
              )}
              
              <Card style={styles.deviceDetailCard}>
                <ThemedText style={styles.deviceDetailCardTitle}>Device Status</ThemedText>
                
                <View style={styles.statusItemsContainer}>
                  {selectedDevice.battery && (
                    <View style={styles.statusItem}>
                      <View style={[styles.statusItemIcon, { backgroundColor: getBatteryColor(selectedDevice.battery) }]}>
                        <Ionicons name="battery-half" size={16} color="#fff" />
                      </View>
                      <ThemedText style={styles.statusItemLabel}>Battery</ThemedText>
                      <ThemedText style={styles.statusItemValue}>{selectedDevice.battery}%</ThemedText>
                    </View>
                  )}
                  
                  {selectedDevice.signalStrength && (
                    <View style={styles.statusItem}>
                      <View style={[styles.statusItemIcon, { 
                        backgroundColor: selectedDevice.signalStrength > 70 ? '#4CAF50' : 
                                         selectedDevice.signalStrength > 30 ? '#FF9800' : '#F44336' 
                      }]}>
                        <Ionicons name={getSignalIcon(selectedDevice.signalStrength)} size={16} color="#fff" />
                      </View>
                      <ThemedText style={styles.statusItemLabel}>Signal</ThemedText>
                      <ThemedText style={styles.statusItemValue}>{selectedDevice.signalStrength}%</ThemedText>
                    </View>
                  )}
                  
                  <View style={styles.statusItem}>
                    <View style={[styles.statusItemIcon, { backgroundColor: theme.primary }]}>
                      <Ionicons name="time" size={16} color="#fff" />
                    </View>
                    <ThemedText style={styles.statusItemLabel}>Last Update</ThemedText>
                    <ThemedText style={styles.statusItemValue}>{selectedDevice.lastUpdate}</ThemedText>
                  </View>
                </View>
              </Card>
              
              <Card style={styles.deviceDetailCard}>
                <ThemedText style={styles.deviceDetailCardTitle}>Technical Details</ThemedText>
                
                {selectedDevice.details && Object.entries(selectedDevice.details).map(([key, value], index) => (
                  <View key={index} style={styles.detailRow}>
                    <ThemedText style={styles.detailKey}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{value.toString()}</ThemedText>
                  </View>
                ))}
              </Card>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setIsDeviceDetailModalVisible(false);
                    // Navigate to calibration screen or show calibration modal
                  }}
                >
                  <Ionicons name="options" size={18} color="#fff" />
                  <ThemedText style={styles.actionButtonText}>Calibrate</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: selectedDevice.status === 'online' ? '#F44336' : '#4CAF50' }]}
                  onPress={() => {
                    // Toggle device on/off logic
                    setIsDeviceDetailModalVisible(false);
                  }}
                >
                  <Ionicons name={selectedDevice.status === 'online' ? "power" : "power-outline"} size={18} color="#fff" />
                  <ThemedText style={styles.actionButtonText}>
                    {selectedDevice.status === 'online' ? 'Turn Off' : 'Turn On'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    );
  };

  // Render add device modal
  const renderAddDeviceModal = () => (
    <Modal
      visible={isAddDeviceModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsAddDeviceModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.addDeviceContainer}>
          <View style={styles.addDeviceHeader}>
            <TouchableOpacity onPress={() => setIsAddDeviceModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <ThemedText style={styles.addDeviceTitle}>Add New Device</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.addDeviceContent}>
            <ThemedText style={styles.addDeviceSubtitle}>
              Select device type to add to your SaharaSprout system
            </ThemedText>
            
            {Object.entries(deviceTypeInfo)
              .filter(([key]) => key !== 'all')
              .map(([type, info]) => (
                <TouchableOpacity 
                  key={type}
                  style={styles.deviceTypeOption}
                  onPress={() => {
                    setIsAddDeviceModalVisible(false);
                    // Navigate to specific device setup flow
                    router.push({
                      pathname: "/devices/add",
                      params: { type }
                    });
                  }}
                >
                  <View style={[styles.deviceTypeOptionIcon, { backgroundColor: info.color }]}>
                    <Ionicons name={info.icon} size={24} color="#fff" />
                  </View>
                  <View style={styles.deviceTypeOptionInfo}>
                    <ThemedText style={styles.deviceTypeOptionTitle}>{info.title}</ThemedText>
                    <ThemedText style={styles.deviceTypeOptionDescription}>
                      {type === 'sensor' ? 'Add moisture, pH, NPK, or temperature sensors' :
                       type === 'pump' ? 'Add water pumps for irrigation control' :
                       type === 'valve' ? 'Add water distribution valves' :
                       type === 'controller' ? 'Add system controllers or ESP devices' :
                       'Add network or connectivity devices'}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              ))}
              
            <TouchableOpacity 
              style={styles.scanQrButton}
              onPress={() => {
                setIsAddDeviceModalVisible(false);
                // Navigate to QR scanner
                router.push('/devices/scan');
              }}
            >
              <Ionicons name="qr-code" size={20} color="#fff" />
              <ThemedText style={styles.scanQrButtonText}>Scan QR Code</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Devices</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/devices/diagnostics')}>
              <Ionicons name="pulse" size={22} color={theme.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setIsAddDeviceModalVisible(true)}>
              <Ionicons name="add-circle" size={22} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search devices..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {Object.keys(deviceTypeInfo).map(type => (
            <TouchableOpacity 
              key={type}
              style={[
                styles.filterButton,
                selectedFilter === type && { backgroundColor: deviceTypeInfo[type].color }
              ]}
              onPress={() => setSelectedFilter(type)}
            >
              <Ionicons 
                name={deviceTypeInfo[type].icon} 
                size={16} 
                color={selectedFilter === type ? '#fff' : theme.text} 
              />
              <ThemedText 
                style={[
                  styles.filterText,
                  selectedFilter === type && { color: '#fff' }
                ]}
              >
                {deviceTypeInfo[type].title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber}>{devices.filter(d => d.status === 'online').length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Online</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber}>{devices.filter(d => d.status === 'warning').length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Warnings</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNumber}>{devices.filter(d => d.status === 'offline').length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Offline</ThemedText>
          </View>
        </View>

        <FlatList
          data={getFilteredDevices()}
          renderItem={renderDeviceItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.deviceList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.textSecondary} />
              <ThemedText style={styles.emptyText}>
                {searchQuery.length > 0 
                  ? `No devices found matching "${searchQuery}"`
                  : `No ${selectedFilter !== 'all' ? deviceTypeInfo[selectedFilter].title.toLowerCase() : 'devices'} found`
                }
              </ThemedText>
              <TouchableOpacity 
                style={styles.addDeviceButton}
                onPress={() => setIsAddDeviceModalVisible(true)}
              >
                <ThemedText style={styles.addDeviceButtonText}>Add New Device</ThemedText>
              </TouchableOpacity>
            </View>
          }
        />

        {renderDeviceDetailModal()}
        {renderAddDeviceModal()}

        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => setIsAddDeviceModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 5,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterText: {
    fontSize: 13,
    marginLeft: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
  },
  deviceList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  deviceCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceZoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deviceZone: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
  },
  readingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  readingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  batteryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  signalIndicator: {
    marginRight: 12,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 11,
    opacity: 0.6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  addDeviceButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addDeviceButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  deviceDetailContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  deviceDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  deviceDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceDetailContent: {
    padding: 16,
  },
  deviceDetailSummary: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  deviceDetailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceDetailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  deviceDetailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceDetailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 8,
    width: 50,
  },
  deviceDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  deviceDetailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDetailStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deviceDetailCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  deviceDetailCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  readingValueContainer: {
    alignItems: 'center',
  },
  readingValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  readingTimestamp: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  statusItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusItemLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusItemValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailKey: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  addDeviceContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  addDeviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  addDeviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addDeviceContent: {
    padding: 16,
  },
  addDeviceSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  deviceTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: 12,
  },
  deviceTypeOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceTypeOptionInfo: {
    flex: 1,
  },
  deviceTypeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceTypeOptionDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  scanQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  scanQrButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
 });
 
 export default DeviceManagement;
