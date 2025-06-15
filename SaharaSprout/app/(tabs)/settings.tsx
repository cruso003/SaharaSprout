import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Switch, Platform, StatusBar, TextInput, Alert, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import useUserStore from '@/states/stores/userStore';

// Interface for setting item props
interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hasSwitch?: boolean;
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
  hasChevron?: boolean;
  onPress?: () => void;
  description?: string;
  destructive?: boolean;
}

const Settings = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { clearUserData, user } = useUserStore();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsCommunication, setSmsCommunication] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [batteryOptimization, setBatteryOptimization] = useState(true);
  const [autoScheduleUpdates, setAutoScheduleUpdates] = useState(true);
  const [deviceName, setDeviceName] = useState('SaharaSprout Hub');
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Log out function
  const logOut = async () => {
    if (confirmLogout) {
      await clearUserData();
      router.replace('/login');
    } else {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
    }
  };

  // Function to handle language selection
  const handleLanguageSelect = () => {
    router.push('/settings/language');
  };

  // Function to navigate to farm settings
  const navigateToFarmSettings = () => {
    router.push('/settings/farm');
  };

  // Function to navigate to backup settings
  const navigateToBackupSettings = () => {
    router.push('/settings/backup');
  };

  // Function to navigate to advanced settings
  const navigateToAdvancedSettings = () => {
    router.push('/settings/advanced');
  };

  // Function to navigate to help and support
  const navigateToHelpSupport = () => {
    router.push('/settings/help');
  };

  // Function to show the about dialog
  const showAboutDialog = () => {
    Alert.alert(
      'About SaharaSprout',
      'Version 2.1.3\n\nSaharaSprout is an innovative smart irrigation system designed for agricultural applications in areas with limited internet connectivity.\n\n© 2025 SaharaSprout Technologies',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  // Render a setting item
  const renderSettingItem = ({ 
    icon, 
    title, 
    hasSwitch = false, 
    initialValue = false,
    onToggle,
    hasChevron = true, 
    onPress,
    description,
    destructive = false 
  }: SettingItemProps) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={hasSwitch && !onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[
          styles.settingIconContainer, 
          destructive && { backgroundColor: `${Colors.light.error}20` }
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={destructive ? Colors.light.error : theme.primary} 
          />
        </View>
        <View style={styles.settingTextContainer}>
          <ThemedText style={[
            styles.settingTitle,
            destructive && { color: Colors.light.error }
          ]}>
            {title}
          </ThemedText>
          {description && (
            <ThemedText style={styles.settingDescription}>
              {description}
            </ThemedText>
          )}
        </View>
      </View>
      
      {hasSwitch && (
        <Switch
          trackColor={{ false: 'rgba(0,0,0,0.1)', true: `${theme.primary}80` }}
          thumbColor={initialValue ? theme.primary : '#f4f3f4'}
          ios_backgroundColor="rgba(0,0,0,0.1)"
          onValueChange={onToggle}
          value={initialValue}
        />
      )}
      
      {!hasSwitch && hasChevron && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={destructive ? Colors.light.error : theme.textSecondary} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Settings</ThemedText>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          <TouchableOpacity style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.profileImageContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person" size={40} color={theme.primary} />
                )}
              </View>
              <View style={styles.profileDetails}>
                <ThemedText style={styles.profileName}>{user?.name || 'Your Name'}</ThemedText>
                <ThemedText style={styles.profileEmail}>{user?.email || 'email@example.com'}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Farm Settings */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Farm Settings</ThemedText>
          </View>
          
          <Card style={styles.settingsCard}>
            {renderSettingItem({
              icon: 'business',
              title: 'Farm Profile',
              hasChevron: true,
              onPress: navigateToFarmSettings,
              description: 'Manage farm name, location, and zones',
            })}
            
            {renderSettingItem({
              icon: 'leaf',
              title: 'Crop Management',
              hasChevron: true,
              onPress: () => router.push('/settings/crops'),
              description: 'Configure crop preferences and growing conditions',
            })}
            
            {renderSettingItem({
              icon: 'water',
              title: 'Irrigation Thresholds',
              hasChevron: true,
              onPress: () => router.push('/automation'),
              description: 'Set soil moisture, pH, and nutrient thresholds',
            })}
          </Card>
          
          {/* Notification Settings */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          </View>
          
          <Card style={styles.settingsCard}>
            {renderSettingItem({
              icon: 'notifications',
              title: 'Push Notifications',
              hasSwitch: true,
              initialValue: pushNotifications,
              onToggle: setPushNotifications,
              description: 'Receive alerts on your device',
            })}
            
            {renderSettingItem({
              icon: 'mail',
              title: 'Email Notifications',
              hasSwitch: true,
              initialValue: emailNotifications,
              onToggle: setEmailNotifications,
              description: 'Receive alerts via email',
            })}
            
            {renderSettingItem({
              icon: 'chatbubble',
              title: 'SMS Communication',
              hasSwitch: true,
              initialValue: smsCommunication,
              onToggle: setSmsCommunication,
              description: 'Allow system to communicate via SMS (fallback)',
            })}
            
            {renderSettingItem({
              icon: 'warning',
              title: 'Emergency Alerts',
              hasSwitch: true,
              initialValue: emergencyAlerts,
              onToggle: setEmergencyAlerts,
              description: 'Critical notifications for urgent issues',
            })}
          </Card>
          
          {/* Device Settings */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Device Settings</ThemedText>
          </View>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="hardware-chip" size={20} color={theme.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={styles.settingTitle}>Device Name</ThemedText>
                  <TextInput
                    style={[styles.deviceNameInput, { color: theme.text }]}
                    value={deviceName}
                    onChangeText={setDeviceName}
                    placeholder="Enter device name"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>
            </View>
            
            {renderSettingItem({
              icon: 'sync',
              title: 'Auto-Sync Data',
              hasSwitch: true,
              initialValue: autoSync,
              onToggle: setAutoSync,
              description: 'Automatically sync data when online',
            })}
            
            {renderSettingItem({
              icon: 'cellular',
              title: 'Low Data Mode',
              hasSwitch: true,
              initialValue: lowDataMode,
              onToggle: setLowDataMode,
              description: 'Reduce data usage for cellular connections',
            })}
            
            {renderSettingItem({
              icon: 'battery-full',
              title: 'Battery Optimization',
              hasSwitch: true,
              initialValue: batteryOptimization,
              onToggle: setBatteryOptimization,
              description: 'Optimize power usage for controllers',
            })}
            
            {renderSettingItem({
              icon: 'time',
              title: 'Auto-Schedule Updates',
              hasSwitch: true,
              initialValue: autoScheduleUpdates,
              onToggle: setAutoScheduleUpdates,
              description: 'Schedule firmware updates during off-hours',
            })}
          </Card>
          
          {/* App Settings */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
          </View>
          
          <Card style={styles.settingsCard}>
            {renderSettingItem({
              icon: 'moon',
              title: 'Dark Mode',
              hasSwitch: true,
              initialValue: isDarkMode,
              onToggle: setIsDarkMode,
            })}
            
            {renderSettingItem({
              icon: 'globe',
              title: 'Language',
              hasChevron: true,
              onPress: handleLanguageSelect,
              description: 'English',
            })}
            
            {renderSettingItem({
              icon: 'thermometer',
              title: 'Temperature Unit',
              hasChevron: true,
              onPress: () => {
                setTemperatureUnit(temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius');
              },
              description: temperatureUnit === 'celsius' ? '°C Celsius' : '°F Fahrenheit',
            })}
            
            {renderSettingItem({
              icon: 'save',
              title: 'Backup & Restore',
              hasChevron: true,
              onPress: navigateToBackupSettings,
              description: 'Manage app data and settings',
            })}
          </Card>
          
          {/* Advanced Settings */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Advanced</ThemedText>
          </View>
          
          <Card style={styles.settingsCard}>
            {renderSettingItem({
              icon: 'construct',
              title: 'Developer Settings',
              hasChevron: true,
              onPress: navigateToAdvancedSettings,
              description: 'Advanced configuration options',
            })}
            
            {renderSettingItem({
              icon: 'help-circle',
              title: 'Help & Support',
              hasChevron: true,
              onPress: navigateToHelpSupport,
            })}
            
            {renderSettingItem({
              icon: 'information-circle',
              title: 'About',
              hasChevron: true,
              onPress: showAboutDialog,
              description: 'Version 2.1.3',
            })}
          </Card>
          
          {/* Account Actions */}
          <Card style={{...styles.settingsCard, ...styles.logoutCard}}>
            {renderSettingItem({
              icon: 'log-out',
              title: confirmLogout ? 'Tap again to confirm' : 'Log Out',
              hasChevron: false,
              onPress: logOut,
              destructive: true,
            })}
          </Card>
          
          <View style={styles.versionInfo}>
            <ThemedText style={styles.versionText}>SaharaSprout v2.1.3</ThemedText>
            <ThemedText style={styles.copyrightText}>© 2025 SaharaSprout Technologies</ThemedText>
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
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  deviceNameInput: {
    fontSize: 14,
    marginTop: 4,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logoutCard: {
    marginTop: 8,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.7,
  },
  copyrightText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
});

export default Settings;
