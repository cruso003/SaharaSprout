import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const SoilHistory = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedParameter, setSelectedParameter] = useState('moisture');
  const [timeRange, setTimeRange] = useState('week');

  // Soil parameter data
  const soilParameters = [
    { id: 'moisture', name: 'Moisture', icon: 'water-outline' as const, color: '#2196F3', unit: '%' },
    { id: 'ph', name: 'pH', icon: 'flask-outline' as const, color: '#FF9800', unit: '' },
    { id: 'nitrogen', name: 'Nitrogen', icon: 'leaf-outline' as const, color: '#4CAF50', unit: 'ppm' },
    { id: 'phosphorus', name: 'Phosphorus', icon: 'nutrition-outline' as const, color: '#E91E63', unit: 'ppm' },
    { id: 'potassium', name: 'Potassium', icon: 'flower-outline' as const, color: '#9C27B0', unit: 'ppm' },
  ];

  // Mock history data for chart
  const getHistoryData = () => {
    let labels;
    let data;
    
    if (timeRange === 'day') {
      labels = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'];
      data = {
        moisture: [35, 36, 34, 32, 38, 40],
        ph: [6.5, 6.5, 6.4, 6.4, 6.5, 6.5],
        nitrogen: [39, 39, 40, 40, 40, 40],
        phosphorus: [35, 35, 35, 36, 36, 35],
        potassium: [44, 44, 45, 45, 45, 45],
      };
    } else if (timeRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = {
        moisture: [40, 38, 42, 36, 45, 43, 40],
        ph: [6.5, 6.4, 6.4, 6.3, 6.5, 6.5, 6.4],
        nitrogen: [40, 41, 40, 39, 40, 42, 40],
        phosphorus: [35, 34, 34, 35, 36, 36, 35],
        potassium: [45, 45, 46, 44, 45, 47, 45],
      };
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      data = {
        moisture: [37, 35, 40, 45, 42, 43],
        ph: [6.3, 6.4, 6.5, 6.5, 6.4, 6.5],
        nitrogen: [38, 39, 40, 41, 40, 40],
        phosphorus: [32, 33, 34, 35, 35, 35],
        potassium: [42, 43, 44, 45, 45, 45],
      };
    }
    
    return {
      labels,
      datasets: [
        {
          data: data[selectedParameter] || [],
          color: (opacity = 1) => {
            const param = soilParameters.find(p => p.id === selectedParameter);
            return param ? param.color : theme.primary;
          },
          strokeWidth: 2,
        },
      ],
    };
  };
  // Get events for history timeline
 const getHistoryEvents = () => {
    const param = soilParameters.find(p => p.id === selectedParameter) || soilParameters[0];
    
    return [
      {
        date: 'May 8, 2025',
        time: '2:30 PM',
        title: `${param.name} Level Adjusted`,
        description: `System automatically adjusted irrigation duration based on ${param.name.toLowerCase()} readings.`,
        value: param.id === 'ph' ? '6.5' : param.id === 'moisture' ? '40%' : '42 ppm',
        type: 'automatic'
      },
      {
        date: 'May 5, 2025',
        time: '10:15 AM',
        title: `Low ${param.name} Alert`,
        description: `${param.name} levels dropped below optimal threshold in Zone 2.`,
        value: param.id === 'ph' ? '5.8' : param.id === 'moisture' ? '25%' : '28 ppm',
        type: 'alert'
      },
      {
        date: 'May 1, 2025',
        time: '8:45 AM',
        title: `${param.name} Threshold Updated`,
        description: `You manually updated the ${param.name.toLowerCase()} threshold for optimal plant growth.`,
        value: param.id === 'ph' ? '6.2-6.8' : param.id === 'moisture' ? '30-50%' : '35-45 ppm',
        type: 'manual'
      },
    ];
  };
 
// Function to get the correct icon for event type
type EventType = 'automatic' | 'alert' | 'manual';

const getEventIcon = (type: EventType | string): React.ComponentProps<typeof Ionicons>['name'] => {
    switch(type) {
        case 'automatic': return 'flash';
        case 'alert': return 'warning';
        case 'manual': return 'create';
        default: return 'information-circle';
    }
};
 
  // Get event background color based on type
const getEventColor = (type: EventType | string): string => {
    switch(type) {
        case 'automatic': return '#4CAF5020';
        case 'alert': return '#F4433620';
        case 'manual': return '#2196F320';
        default: return 'rgba(0,0,0,0.05)';
    }
};
 
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Soil History</ThemedText>
          <TouchableOpacity style={styles.detailsButton} onPress={() => router.push('/soil-details')}>
            <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
 
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Parameter Selection */}
          <View style={styles.parameterSelectContainer}>
            <ThemedText style={styles.sectionTitle}>Select Parameter</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parametersScroll}>
              {soilParameters.map(param => (
                <TouchableOpacity
                  key={param.id}
                  style={[
                    styles.parameterButton,
                    selectedParameter === param.id && { backgroundColor: param.color }
                  ]}
                  onPress={() => setSelectedParameter(param.id)}
                >
                  <Ionicons
                    name={param.icon}
                    size={20}
                    color={selectedParameter === param.id ? '#fff' : theme.text}
                  />
                  <ThemedText
                    style={[
                      styles.parameterButtonText,
                      selectedParameter === param.id && { color: '#fff' }
                    ]}
                  >
                    {param.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
 
          {/* Time Range Selection */}
          <View style={styles.timeRangeContainer}>
            <ThemedText style={styles.sectionTitle}>Time Range</ThemedText>
            <View style={styles.timeButtonsContainer}>
              <TouchableOpacity
                style={[styles.timeButton, timeRange === 'day' && styles.activeTimeButton]}
                onPress={() => setTimeRange('day')}
              >
                <ThemedText style={[styles.timeButtonText, timeRange === 'day' && styles.activeTimeButtonText]}>
                  24 Hours
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeButton, timeRange === 'week' && styles.activeTimeButton]}
                onPress={() => setTimeRange('week')}
              >
                <ThemedText style={[styles.timeButtonText, timeRange === 'week' && styles.activeTimeButtonText]}>
                  Week
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeButton, timeRange === 'month' && styles.activeTimeButton]}
                onPress={() => setTimeRange('month')}
              >
                <ThemedText style={[styles.timeButtonText, timeRange === 'month' && styles.activeTimeButtonText]}>
                  6 Months
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
 
          {/* History Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <ThemedText style={styles.chartTitle}>
                  {soilParameters.find(p => p.id === selectedParameter)?.name} History
                </ThemedText>
                <ThemedText style={styles.chartSubtitle}>
                  {timeRange === 'day' ? 'Last 24 hours' : timeRange === 'week' ? 'Last 7 days' : 'Last 6 months'}
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.exportButton}>
                <Ionicons name="download-outline" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
            
            <LineChart
              data={getHistoryData()}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: theme.cardBackground,
                backgroundGradientFrom: theme.cardBackground,
                backgroundGradientTo: theme.cardBackground,
                decimalPlaces: selectedParameter === 'ph' ? 1 : 0,
                color: (opacity = 1) => {
                  const param = soilParameters.find(p => p.id === selectedParameter);
                  return param ? param.color : theme.primary;
                },
                labelColor: (opacity = 1) => theme.text,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: soilParameters.find(p => p.id === selectedParameter)?.color || theme.primary
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              bezier
              style={styles.chart}
              yAxisSuffix={soilParameters.find(p => p.id === selectedParameter)?.unit || ''}
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Average</ThemedText>
                <ThemedText style={styles.statValue}>
                  {selectedParameter === 'ph' ? '6.4' : selectedParameter === 'moisture' ? '42%' : '40'} 
                  {soilParameters.find(p => p.id === selectedParameter)?.unit}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Min</ThemedText>
                <ThemedText style={styles.statValue}>
                  {selectedParameter === 'ph' ? '6.3' : selectedParameter === 'moisture' ? '36%' : '34'} 
                  {soilParameters.find(p => p.id === selectedParameter)?.unit}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Max</ThemedText>
                <ThemedText style={styles.statValue}>
                  {selectedParameter === 'ph' ? '6.5' : selectedParameter === 'moisture' ? '45%' : '47'} 
                  {soilParameters.find(p => p.id === selectedParameter)?.unit}
                </ThemedText>
              </View>
            </View>
          </Card>
 
          {/* History Timeline */}
          <View style={styles.timelineContainer}>
            <ThemedText style={styles.sectionTitle}>Event History</ThemedText>
            
            {getHistoryEvents().map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDateContainer}>
                  <ThemedText style={styles.timelineDate}>{event.date}</ThemedText>
                  <ThemedText style={styles.timelineTime}>{event.time}</ThemedText>
                </View>
                
                <View style={styles.timelineConnector}>
                  <View style={styles.timelineDot} />
                  {index < getHistoryEvents().length - 1 && <View style={styles.timelineLine} />}
                </View>
                
                <View style={[styles.timelineEventCard, { backgroundColor: getEventColor(event.type) }]}>
                  <View style={styles.timelineEventHeader}>
                    <Ionicons name={getEventIcon(event.type)} size={20} color={theme.primary} />
                    <ThemedText style={styles.timelineEventTitle}>{event.title}</ThemedText>
                  </View>
                  <ThemedText style={styles.timelineEventDescription}>{event.description}</ThemedText>
                  <View style={styles.timelineEventValue}>
                    <ThemedText style={styles.timelineEventValueText}>{event.value}</ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.downloadReportButton}>
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <ThemedText style={styles.downloadReportText}>Download Full Report</ThemedText>
          </TouchableOpacity>
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
  detailsButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  parameterSelectContainer: {
    marginBottom: 20,
  },
  parametersScroll: {
    flexDirection: 'row',
  },
  parameterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  parameterButtonText: {
    marginLeft: 6,
    fontSize: 14,
  },
  timeRangeContainer: {
    marginBottom: 20,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  activeTimeButton: {
    backgroundColor: Colors.light.primary,
  },
  timeButtonText: {
    fontSize: 14,
  },
  activeTimeButtonText: {
    color: '#fff',
  },
  chartCard: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  exportButton: {
    padding: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDateContainer: {
    width: 75,
    marginRight: 8,
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 8,
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 4,
  },
  timelineEventCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  timelineEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineEventTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  timelineEventDescription: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 8,
  },
  timelineEventValue: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  timelineEventValueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  downloadReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 24,
  },
  downloadReportText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
 });
 
 export default SoilHistory;
