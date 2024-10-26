import React from 'react';
import { StyleSheet, View, Switch, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Define types for renderSettingItem props
interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hasSwitch?: boolean;
  hasChevron?: boolean;
}

const Settings = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Define the renderSettingItem function with typed parameters
  const renderSettingItem = ({ icon, title, hasSwitch = false, hasChevron = true }: SettingItemProps) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color={theme.icon} style={styles.settingIcon} />
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      </View>
      {hasSwitch && (
        <Switch
          trackColor={{ false: theme.textSecondary, true: theme.primary }}
          thumbColor={theme.background}
          onValueChange={() => {}}
          value={true}
        />
      )}
      {hasChevron && <Ionicons name="chevron-forward" size={24} color={theme.icon} />}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          {renderSettingItem({ icon: 'person-outline', title: 'Profile' })}
          {renderSettingItem({ icon: 'mail-outline', title: 'Email' })}
          {renderSettingItem({ icon: 'lock-closed-outline', title: 'Password' })}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Irrigation Preferences</ThemedText>
          {renderSettingItem({ icon: 'water-outline', title: 'Moisture Thresholds' })}
          {renderSettingItem({ icon: 'timer-outline', title: 'Watering Schedule' })}
          {renderSettingItem({ icon: 'flash-outline', title: 'Pump Mode', hasSwitch: true, hasChevron: false })}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          {renderSettingItem({ icon: 'notifications-outline', title: 'Push Notifications', hasSwitch: true, hasChevron: false })}
          {renderSettingItem({ icon: 'mail-outline', title: 'Email Notifications', hasSwitch: true, hasChevron: false })}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
          {renderSettingItem({ icon: 'moon-outline', title: 'Dark Mode', hasSwitch: true, hasChevron: false })}
          {renderSettingItem({ icon: 'language-outline', title: 'Language' })}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
};

export default Settings;

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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondary,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
  },
});
