import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Notification {
  id: string;
  type: 'moisture' | 'system' | 'info';
  message: string;
  timestamp: string;
}

const NotificationScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const notifications: Notification[] = [
    { id: '1', type: 'moisture', message: 'Soil moisture below threshold in Zone 1', timestamp: '2024-10-12 10:30 AM' },
    { id: '2', type: 'system', message: 'Water pump activated', timestamp: '2024-10-12 10:35 AM' },
    { id: '3', type: 'info', message: 'Scheduled irrigation completed', timestamp: '2024-10-12 11:00 AM' },
    { id: '4', type: 'system', message: 'Low battery on Sensor 2', timestamp: '2024-10-12 02:15 PM' },
    { id: '5', type: 'moisture', message: 'Optimal moisture levels reached in Zone 2', timestamp: '2024-10-12 03:45 PM' },
  ];

  const getIconForNotificationType = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'moisture':
        return 'water-outline';
      case 'system':
        return 'cog-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons name={getIconForNotificationType(item.type)} size={24} color={theme.icon} />
      </View>
      <View style={styles.notificationContent}>
        <ThemedText style={styles.notificationMessage}>{item.message}</ThemedText>
        <ThemedText style={styles.notificationTimestamp}>{item.timestamp}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={()=>{router.back()}}>
            <Ionicons name="arrow-back" size={24} color={theme.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Notifications</ThemedText>
      </SafeAreaView>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.notificationList}
      />

      <TouchableOpacity style={styles.clearButton}>
        <ThemedText style={styles.clearButtonText}>Clear All Notifications</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondary,
  },
  notificationIcon: {
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  clearButton: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  clearButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
  },
});