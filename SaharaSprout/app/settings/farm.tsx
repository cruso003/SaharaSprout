import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, TextInput, Alert, Switch } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import MapView, { Marker } from 'react-native-maps';

const FarmSettings = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // Farm details
  const [farmName, setFarmName] = useState('SaharaSprout Farm');
  const [farmSize, setFarmSize] = useState('2.5');
  const [farmSizeUnit, setFarmSizeUnit] = useState('acres');
  const [location, setLocation] = useState({
    latitude: 0.347596,
    longitude: 32.582520,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Zone settings
  const [zones, setZones] = useState([
    { id: '1', name: 'Zone 1', size: '0.8', crops: 'Tomatoes', active: true },
    { id: '2', name: 'Zone 2', size: '1.2', crops: 'Peppers', active: true },
    { id: '3', name: 'Zone 3', size: '0.5', crops: 'Okra', active: true },
  ]);
  
  // System settings
  const [autoAdjustThresholds, setAutoAdjustThresholds] = useState(true);
  const [weatherBasedIrrigation, setWeatherBasedIrrigation] = useState(true);
  const [smartScheduling, setSmartScheduling] = useState(true);
  
  // Edit zone
// Edit zone
const editZone = (zoneId: string): void => {
    router.push({
        pathname: '/settings/farm/zone',
        params: { zoneId }
    });
};
  
  // Toggle zone active state
  const toggleZoneActive = (zoneId: string) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, active: !zone.active } : zone
    ));
  };
  
  // Add new zone
  const addZone = () => {
    router.push('/settings/farm/add-zone');
  };
  
  // Save farm settings
  const saveFarmSettings = () => {
    Alert.alert('Success', 'Farm settings have been updated successfully.');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Farm Settings</ThemedText>
          <TouchableOpacity onPress={saveFarmSettings} style={styles.saveButton}>
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.farmDetailsCard}>
            <ThemedText style={styles.cardTitle}>Farm Details</ThemedText>
            
            <View style={styles.inputRow}>
              <ThemedText style={styles.inputLabel}>Farm Name</ThemedText>
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={farmName}
                onChangeText={setFarmName}
                placeholder="Enter farm name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <View style={styles.inputRow}>
              <ThemedText style={styles.inputLabel}>Farm Size</ThemedText>
              <View style={styles.sizeInputContainer}>
                <TextInput
                  style={[styles.sizeInput, { color: theme.text }]}
                  value={farmSize}
                  onChangeText={setFarmSize}
                  keyboardType="numeric"
                  placeholder="Size"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity 
                  style={styles.unitSelector}
                  onPress={() => setFarmSizeUnit(farmSizeUnit === 'acres' ? 'hectares' : 'acres')}
                >
                  <ThemedText style={styles.unitText}>{farmSizeUnit}</ThemedText>
                  <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <ThemedText style={styles.inputLabel}>Farm Location</ThemedText>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={location}
                >
                  <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
                </MapView>
              </View>
              <TouchableOpacity style={styles.updateLocationButton}>
                <Ionicons name="location" size={16} color="#fff" />
                <ThemedText style={styles.updateLocationText}>Update Location</ThemedText>
              </TouchableOpacity>
            </View>
          </Card>
          
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Irrigation Zones</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={addZone}>
              <Ionicons name="add" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          {zones.map((zone) => (
            <Card key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View style={styles.zoneInfo}>
                  <ThemedText style={styles.zoneName}>{zone.name}</ThemedText>
                  <ThemedText style={styles.zoneDetails}>
                    {zone.size} {farmSizeUnit} • {zone.crops}
                  </ThemedText>
                </View>
                <Switch
                  value={zone.active}
                  onValueChange={() => toggleZoneActive(zone.id)}
                  trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                  thumbColor={zone.active ? theme.primary : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.zoneActions}>
                <TouchableOpacity 
                  style={styles.zoneButton}
                  onPress={() => editZone(zone.id)}
                >
                  <Ionicons name="create-outline" size={16} color={theme.primary} />
                  <ThemedText style={styles.zoneButtonText}>Edit</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.zoneButton}>
                  <Ionicons name="analytics-outline" size={16} color={theme.primary} />
                  <ThemedText style={styles.zoneButtonText}>Thresholds</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.zoneButton}>
                  <Ionicons name="trash-outline" size={16} color={Colors.light.error} />
                  <ThemedText style={[styles.zoneButtonText, { color: Colors.light.error }]}>
                    Delete
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
          
          <Card style={styles.systemSettingsCard}>
            <ThemedText style={styles.cardTitle}>System Settings</ThemedText>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>
                  Auto-Adjust Thresholds
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Allow AI to adjust thresholds based on crop needs
                </ThemedText>
              </View>
              <Switch
                value={autoAdjustThresholds}
                onValueChange={setAutoAdjustThresholds}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={autoAdjustThresholds ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>
                  Weather-Based Irrigation
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Adjust irrigation based on weather forecast
                </ThemedText>
              </View>
              <Switch
                value={weatherBasedIrrigation}
                onValueChange={setWeatherBasedIrrigation}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={weatherBasedIrrigation ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingName}>
                  Smart Scheduling
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Optimize watering times based on evaporation rates
                </ThemedText>
              </View>
              <Switch
                value={smartScheduling}
                onValueChange={setSmartScheduling}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
                thumbColor={smartScheduling ? theme.primary : '#f4f3f4'}
              />
            </View>
          </Card>
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  farmDetailsCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sizeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unitText: {
    marginRight: 4,
  },
  locationContainer: {
    marginBottom: 8,
  },
  mapContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  updateLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  updateLocationText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  zoneDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  zoneActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  zoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  zoneButtonText: {
    marginLeft: 4,
    color: Colors.light.primary,
  },
  systemSettingsCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
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
});

export default FarmSettings;
