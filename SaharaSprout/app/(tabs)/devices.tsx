import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Define the device type
interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'pump' | 'valve';
  status: 'online' | 'offline';
}

const DeviceManagement = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const devices: Device[] = [
    { id: '1', name: 'Soil Moisture Sensor 1', type: 'sensor', status: 'online' },
    { id: '2', name: 'Water Pump', type: 'pump', status: 'online' },
    { id: '3', name: 'Valve 1', type: 'valve', status: 'offline' },
    { id: '4', name: 'Soil Moisture Sensor 2', type: 'sensor', status: 'online' },
  ];

  const renderDevice = ({ item }: { item: Device }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <Ionicons 
          name={item.type === 'sensor' ? 'water-outline' : item.type === 'pump' ? 'water' : 'apps-outline'} 
          size={24} 
          color={theme.icon} 
        />
        <View style={styles.deviceTextContainer}>
          <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
          <ThemedText style={[styles.deviceStatus, { color: item.status === 'online' ? theme.primary : theme.textSecondary }]}>
            {item.status}
          </ThemedText>
        </View>
      </View>
      <TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={24} color={theme.icon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <ThemedText style={styles.title}>Device Management</ThemedText>
      </SafeAreaView>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        style={styles.deviceList}
      />

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color={Colors.light.background} />
        <ThemedText style={styles.addButtonText}>Add New Device</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

export default DeviceManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondary,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceTextContainer: {
    marginLeft: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceStatus: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
