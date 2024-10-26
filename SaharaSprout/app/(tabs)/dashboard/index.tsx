import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, Platform, StatusBar } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { WeatherIcon } from '@/components/WeatherIcon';
import { StatusIndicator } from '@/components/StatusIndicator';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [isAutoWatering, setIsAutoWatering] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Dummy data for the moisture chart
  const moistureData = {
    labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
    datasets: [
      {
        data: [30, 45, 28, 80, 99, 43],
        color: (opacity = 1) => theme.primary,
        strokeWidth: 2,
      },
    ],
  };

  const toggleWateringMode = () => {
    setIsAutoWatering(!isAutoWatering);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.header}>
          <ThemedText style={styles.title}>Dashboard</ThemedText>
          <TouchableOpacity 
            onPress={() => {
              router.push('/notifications');
              setHasUnreadNotifications(false);
            }}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.icon} />
            {hasUnreadNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </SafeAreaView>

        <Card style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Soil Moisture Levels</ThemedText>
          <LineChart
            data={moistureData}
            width={width - 64}
            height={220}
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.text,
              labelColor: (opacity = 1) => theme.text,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: theme.primary
              }
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.primary }]} />
              <ThemedText>Moisture %</ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Water Flow Control</ThemedText>
          <View style={styles.wateringControl}>
            <TouchableOpacity
              style={[styles.wateringButton, isAutoWatering && styles.activeButton]}
              onPress={toggleWateringMode}
            >
              <ThemedText style={isAutoWatering ? styles.activeButtonText : {}}>Auto</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.wateringButton, !isAutoWatering && styles.activeButton]}
              onPress={toggleWateringMode}
            >
              <ThemedText style={!isAutoWatering ? styles.activeButtonText : {}}>Manual</ThemedText>
            </TouchableOpacity>
          </View>
          {!isAutoWatering && (
            <View style={styles.manualControls}>
              <TouchableOpacity style={styles.durationButton}>
                <ThemedText>5 min</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.durationButton}>
                <ThemedText>15 min</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.durationButton}>
                <ThemedText>30 min</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Weather Overview</ThemedText>
          <View style={styles.weatherInfo}>
            <WeatherIcon condition="sunny" size={48} color={theme.icon} />
            <View>
              <ThemedText style={styles.temperature}>28°C</ThemedText>
              <ThemedText>Sunny</ThemedText>
            </View>
            <View>
              <ThemedText>Humidity: 45%</ThemedText>
              <ThemedText>Wind: 5 km/h</ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <ThemedText style={styles.sectionTitle}>System Status</ThemedText>
          <View style={styles.statusInfo}>
            <StatusIndicator status="good" />
            <ThemedText style={styles.statusText}>All devices connected</ThemedText>
          </View>
          <View style={styles.statusInfo}>
            <StatusIndicator status="good" />
            <ThemedText style={styles.statusText}>Strong SIM signal</ThemedText>
          </View>
          <TouchableOpacity style={styles.detailsButton}>
            <ThemedText style={styles.detailsButtonText}>View Details</ThemedText>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'android'? StatusBar.currentHeight : 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'red',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  wateringControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  wateringButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  activeButton: {
    backgroundColor: Colors.light.primary,
  },
  activeButtonText: {
    color: Colors.light.background,
  },
  manualControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  durationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    marginLeft: 10,
  },
  detailsButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    marginTop: 10,
  },
  detailsButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
  },
});

export default Dashboard;