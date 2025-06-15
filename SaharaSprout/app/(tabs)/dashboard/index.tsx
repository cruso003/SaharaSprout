import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { WeatherIcon } from '@/components/WeatherIcon';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Mock data for soil health
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

  // Sample soil health indicators
  const soilHealth = {
    moisture: { value: 43, status: 'good' },
    pH: { value: 6.5, status: 'good' },
    nitrogen: { value: 40, status: 'good' },
    phosphorus: { value: 35, status: 'warning' },
    potassium: { value: 45, status: 'good' },
  };

  // Sample system overview
  const systemOverview = {
    devicesOnline: 4,
    devicesTotal: 5,
    signalStrength: 'Strong',
    batteryLevel: 85,
    nextScheduledIrrigation: 'Today, 07:30 AM'
  };

  // Render a health indicator with appropriate color
  // Define types for soil health indicators
  interface SoilHealthStatus {
    value: number;
    status: 'good' | 'warning' | 'critical' | string;
  }

  const renderHealthIndicator = (value: number, status: SoilHealthStatus['status']): React.ReactElement => {
    let statusColor: string;
    switch (status) {
      case 'good': statusColor = '#4CAF50'; break;
      case 'warning': statusColor = '#FF9800'; break;
      case 'critical': statusColor = '#F44336'; break;
      default: statusColor = theme.textSecondary;
    }
    
    return (
      <View style={styles.healthIndicator}>
        <View style={[styles.indicatorDot, { backgroundColor: statusColor }]} />
        <ThemedText style={styles.healthValue}>{value}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.title}>Dashboard</ThemedText>
            <ThemedText style={styles.subtitle}>SaharaSprout Farm</ThemedText>
          </View>
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

        {/* Farm Overview Card */}
        <Card style={styles.card}>
          <View style={styles.farmOverviewHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Farm Overview</ThemedText>
              <ThemedText style={styles.locationText}>3 Zones • 2.5 Acres</ThemedText>
            </View>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <ThemedText style={styles.viewDetailsText}>Details</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusSummary}>
            <View style={styles.statusItem}>
              <View style={styles.statusIconContainer}>
                <Ionicons name="water" size={24} color={theme.primary} />
              </View>
              <View>
                <ThemedText style={styles.statusLabel}>Next Irrigation</ThemedText>
                <ThemedText style={styles.statusValue}>Today, 07:30 AM</ThemedText>
              </View>
            </View>
            
            <View style={styles.statusDivider} />
            
            <View style={styles.statusItem}>
              <View style={styles.statusIconContainer}>
                <Ionicons name="stats-chart" size={24} color={theme.primary} />
              </View>
              <View>
                <ThemedText style={styles.statusLabel}>Soil Health</ThemedText>
                <ThemedText style={styles.statusValue}>Good</ThemedText>
              </View>
            </View>
          </View>
        </Card>

        {/* AI Recommendations */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.sectionTitle}>AI Recommendations</ThemedText>
            <Ionicons name="bulb" size={24} color={theme.primary} />
          </View>
          
          <View style={styles.recommendationsContent}>
            <View style={styles.recommendationItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="leaf" size={28} color={theme.primary} />
              </View>
              <View style={styles.recommendationText}>
                <ThemedText style={styles.recommendationTitle}>Optimal Crops</ThemedText>
                <ThemedText style={styles.recommendationValue}>Tomatoes, Peppers, Okra</ThemedText>
              </View>
            </View>
            
            <View style={styles.recommendationItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="flask" size={28} color={theme.primary} />
              </View>
              <View style={styles.recommendationText}>
                <ThemedText style={styles.recommendationTitle}>Soil Improvement</ThemedText>
                <ThemedText style={styles.recommendationValue}>Add phosphorus to Zone 2</ThemedText>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.seeMoreButton} onPress={() => router.push('/recommendations')}>
            <ThemedText style={styles.seeMoreButtonText}>See All Recommendations</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </Card>

        {/* Soil Health Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.sectionTitle}>Soil Health</ThemedText>
            <TouchableOpacity onPress={() => router.push('/soil-details')}>
              <ThemedText style={styles.cardAction}>Details</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.soilHealthVisual}>
            <View style={styles.soilHealthMeter}>
              <View style={styles.meterBackground}>
                <View 
                  style={[
                    styles.meterFill, 
                    { 
                      width: `${soilHealth.moisture.value}%`,
                      backgroundColor: soilHealth.moisture.status === 'good' ? theme.primary : 
                                       soilHealth.moisture.status === 'warning' ? '#FF9800' : '#F44336'
                    }
                  ]}
                />
              </View>
              <View style={styles.meterLabels}>
                <ThemedText style={styles.meterLabel}>Dry</ThemedText>
                <ThemedText style={styles.meterLabel}>Optimal</ThemedText>
                <ThemedText style={styles.meterLabel}>Wet</ThemedText>
              </View>
              <View style={styles.meterValueContainer}>
                <Ionicons name="water" size={18} color={theme.primary} />
                <ThemedText style={styles.meterValueText}>Moisture: {soilHealth.moisture.value}%</ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.soilIndicators}>
            <View style={styles.indicatorItem}>
              <ThemedText style={styles.indicatorLabel}>pH</ThemedText>
              {renderHealthIndicator(soilHealth.pH.value, soilHealth.pH.status)}
            </View>
            
            <View style={styles.indicatorItem}>
              <ThemedText style={styles.indicatorLabel}>N</ThemedText>
              {renderHealthIndicator(soilHealth.nitrogen.value, soilHealth.nitrogen.status)}
            </View>
            
            <View style={styles.indicatorItem}>
              <ThemedText style={styles.indicatorLabel}>P</ThemedText>
              {renderHealthIndicator(soilHealth.phosphorus.value, soilHealth.phosphorus.status)}
            </View>
            
            <View style={styles.indicatorItem}>
              <ThemedText style={styles.indicatorLabel}>K</ThemedText>
              {renderHealthIndicator(soilHealth.potassium.value, soilHealth.potassium.status)}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => router.push('/soil-history')}
          >
            <Ionicons name="time-outline" size={16} color={theme.primary} />
            <ThemedText style={styles.historyButtonText}>View History</ThemedText>
          </TouchableOpacity>
        </Card>

        {/* Weather Overview */}
        <Card style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Weather Overview</ThemedText>
          <View style={styles.weatherInfo}>
            <View style={styles.currentWeather}>
              <WeatherIcon condition="sunny" size={48} color={theme.icon} />
              <ThemedText style={styles.temperature}>28°C</ThemedText>
              <ThemedText>Sunny</ThemedText>
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Ionicons name="water-outline" size={20} color={theme.icon} />
                <ThemedText style={styles.weatherDetailText}>Humidity: 45%</ThemedText>
              </View>
              
              <View style={styles.weatherDetail}>
                <Ionicons name="navigate-outline" size={20} color={theme.icon} />
                <ThemedText style={styles.weatherDetailText}>Wind: 5 km/h</ThemedText>
              </View>
              
              <View style={styles.weatherDetail}>
                <Ionicons name="umbrella-outline" size={20} color={theme.icon} />
                <ThemedText style={styles.weatherDetailText}>Rain: 0% chance</ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.forecastContainer}>
            <View style={styles.forecastItem}>
              <ThemedText style={styles.forecastDay}>Tomorrow</ThemedText>
              <Ionicons name="partly-sunny-outline" size={24} color={theme.icon} />
              <ThemedText style={styles.forecastTemp}>26°C</ThemedText>
            </View>
            
            <View style={styles.forecastItem}>
              <ThemedText style={styles.forecastDay}>Wed</ThemedText>
              <Ionicons name="rainy-outline" size={24} color={theme.icon} />
              <ThemedText style={styles.forecastTemp}>23°C</ThemedText>
            </View>
            
            <View style={styles.forecastItem}>
              <ThemedText style={styles.forecastDay}>Thu</ThemedText>
              <Ionicons name="sunny-outline" size={24} color={theme.icon} />
              <ThemedText style={styles.forecastTemp}>29°C</ThemedText>
            </View>
          </View>
        </Card>

        {/* System Status */}
        <Card style={styles.card}>
          <ThemedText style={styles.sectionTitle}>System Status</ThemedText>
          <View style={styles.statusGrid}>
            <View style={styles.statusGridItem}>
              <View style={styles.statusIconCircle}>
                <Ionicons name="hardware-chip" size={20} color={theme.background} />
              </View>
              <ThemedText style={styles.statusGridTitle}>Devices</ThemedText>
              <ThemedText style={styles.statusGridValue}>{systemOverview.devicesOnline}/{systemOverview.devicesTotal}</ThemedText>
            </View>
            
            <View style={styles.statusGridItem}>
              <View style={styles.statusIconCircle}>
                <Ionicons name="cellular" size={20} color={theme.background} />
              </View>
              <ThemedText style={styles.statusGridTitle}>Signal</ThemedText>
              <ThemedText style={styles.statusGridValue}>{systemOverview.signalStrength}</ThemedText>
            </View>
            
            <View style={styles.statusGridItem}>
              <View style={styles.statusIconCircle}>
                <Ionicons name="battery-full" size={20} color={theme.background} />
              </View>
              <ThemedText style={styles.statusGridTitle}>Battery</ThemedText>
              <ThemedText style={styles.statusGridValue}>{systemOverview.batteryLevel}%</ThemedText>
            </View>
            
            <View style={styles.statusGridItem}>
              <View style={styles.statusIconCircle}>
                <Ionicons name="time" size={20} color={theme.background} />
              </View>
              <ThemedText style={styles.statusGridTitle}>Next Update</ThemedText>
              <ThemedText style={styles.statusGridValue}>30 min</ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllDevicesButton}
            onPress={() => router.push('/devices')}
          >
            <ThemedText style={styles.viewAllDevicesText}>View All Devices</ThemedText>
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  notificationButton: {
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: Colors.light.error,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardAction: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  farmOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  viewDetailsButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: `${Colors.light.primary}20`,
  },
  viewDetailsText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 12,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDivider: {
    width: 1,
    height: '80%',
    backgroundColor: `${Colors.light.primary}30`,
  },
  recommendationsContent: {
    marginVertical: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  seeMoreButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  soilHealthVisual: {
    marginVertical: 16,
  },
  soilHealthMeter: {
    width: '100%',
  },
  meterBackground: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 8,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meterLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  meterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  meterValueText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  soilIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  indicatorItem: {
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  healthValue: {
    fontSize: 14,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}10`,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  historyButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  weatherInfo: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  currentWeather: {
    alignItems: 'center',
    flex: 0.4,
  },
  temperature: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  weatherDetails: {
    flex: 0.6,
    justifyContent: 'center',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherDetailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: 14,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  statusGridItem: {
    width: '50%',
    padding: 10,
    alignItems: 'center',
  },
  statusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusGridTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  statusGridValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllDevicesButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllDevicesText: {
    color: Colors.light.background,
    fontWeight: '600',
  },
});

export default Dashboard;
