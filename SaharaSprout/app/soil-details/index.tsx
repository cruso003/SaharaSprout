import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

type SoilParameter = 'moisture' | 'ph' | 'nitrogen' | 'phosphorus' | 'potassium';
type ZoneType = 'all' | 'zone1' | 'zone2' | 'zone3';

const SoilDetails = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedZone, setSelectedZone] = useState<ZoneType>('all');
  const [selectedParameter, setSelectedParameter] = useState<SoilParameter>('moisture');

  // Mock data for soil parameters
  const soilData = {
    moisture: {
      all: 43,
      zone1: 38,
      zone2: 45,
      zone3: 47,
      optimal: '30-50%',
      unit: '%',
      icon: 'water',
      color: '#2196F3',
      description: 'Soil moisture measures the water content in soil. Optimal levels vary by crop and soil type.',
    },
    ph: {
      all: 6.5,
      zone1: 6.7,
      zone2: 6.4,
      zone3: 6.3,
      optimal: '6.0-7.0',
      unit: '',
      icon: 'flask',
      color: '#FF9800',
      description: 'pH measures soil acidity or alkalinity. Most plants prefer slightly acidic to neutral soil.',
    },
    nitrogen: {
      all: 40,
      zone1: 35,
      zone2: 42,
      zone3: 44,
      optimal: '30-50 ppm',
      unit: 'ppm',
      icon: 'leaf',
      color: '#4CAF50',
      description: 'Nitrogen is essential for leaf growth and protein formation in plants.',
    },
    phosphorus: {
      all: 35,
      zone1: 28,
      zone2: 38,
      zone3: 40,
      optimal: '30-40 ppm',
      unit: 'ppm',
      icon: 'nutrition',
      color: '#E91E63',
      description: 'Phosphorus helps plants develop strong root systems and is important for flowering.',
    },
    potassium: {
      all: 45,
      zone1: 42,
      zone2: 46,
      zone3: 48,
      optimal: '40-60 ppm',
      unit: 'ppm',
      icon: 'flower',
      color: '#9C27B0',
      description: 'Potassium improves overall plant health and disease resistance.',
    },
  };

  // Sample comparison data for bar chart
  const getComparisonData = () => {
    const labels = ['Zone 1', 'Zone 2', 'Zone 3'];
    const data = [
      soilData[selectedParameter].zone1,
      soilData[selectedParameter].zone2,
      soilData[selectedParameter].zone3,
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => soilData[selectedParameter].color,
        }
      ]
    };
  };

  const getCurrentValue = () => {
    return selectedZone === 'all' 
      ? soilData[selectedParameter].all 
      : selectedZone === 'zone1'
      ? soilData[selectedParameter].zone1
      : selectedZone === 'zone2'
      ? soilData[selectedParameter].zone2
      : soilData[selectedParameter].zone3;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Soil Details</ThemedText>
          <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/soil-history')}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.parameterTabsContainer}>
            {Object.keys(soilData).map((param) => (
              <TouchableOpacity
                key={param}
                style={[
                  styles.parameterTab,
                  selectedParameter === param && styles.activeParameterTab,
                  selectedParameter === param && { backgroundColor: soilData[param as SoilParameter].color },
                ]}
                onPress={() => setSelectedParameter(param as SoilParameter)}
              >
                <Ionicons
                  name={soilData[param as SoilParameter].icon as any}
                  size={18}
                  color={selectedParameter === param ? '#fff' : theme.text}
                />
                <ThemedText
                  style={[
                    styles.parameterTabText,
                    selectedParameter === param && styles.activeParameterTabText,
                  ]}
                >
                  {param.charAt(0).toUpperCase() + param.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.detailCard}>
            <View style={styles.currentValueContainer}>
              <View style={[styles.iconCircle, { backgroundColor: soilData[selectedParameter].color }]}>
                <Ionicons name={soilData[selectedParameter].icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.valueTextContainer}>
                <ThemedText style={styles.parameterName}>
                  {selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}
                </ThemedText>
                <View style={styles.valueRow}>
                  <ThemedText style={styles.currentValue}>{getCurrentValue()}</ThemedText>
                  <ThemedText style={styles.valueUnit}>{soilData[selectedParameter].unit}</ThemedText>
                </View>
                <ThemedText style={styles.optimalRange}>
                  Optimal: {soilData[selectedParameter].optimal}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={styles.description}>
              {soilData[selectedParameter].description}
            </ThemedText>
          </Card>

          <View style={styles.zoneFilterContainer}>
            <ThemedText style={styles.zoneFilterLabel}>Filter by Zone:</ThemedText>
            <View style={styles.zoneButtonsContainer}>
              <TouchableOpacity
                style={[styles.zoneButton, selectedZone === 'all' && styles.activeZoneButton]}
                onPress={() => setSelectedZone('all')}
              >
                <ThemedText
                  style={[styles.zoneButtonText, selectedZone === 'all' && styles.activeZoneButtonText]}
                >
                  All Zones
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.zoneButton, selectedZone === 'zone1' && styles.activeZoneButton]}
                onPress={() => setSelectedZone('zone1')}
              >
                <ThemedText
                  style={[styles.zoneButtonText, selectedZone === 'zone1' && styles.activeZoneButtonText]}
                >
                  Zone 1
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.zoneButton, selectedZone === 'zone2' && styles.activeZoneButton]}
                onPress={() => setSelectedZone('zone2')}
              >
                <ThemedText
                  style={[styles.zoneButtonText, selectedZone === 'zone2' && styles.activeZoneButtonText]}
                >
                  Zone 2
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.zoneButton, selectedZone === 'zone3' && styles.activeZoneButton]}
                onPress={() => setSelectedZone('zone3')}
              >
                <ThemedText
                  style={[styles.zoneButtonText, selectedZone === 'zone3' && styles.activeZoneButtonText]}
                >
                  Zone 3
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <Card style={styles.comparisonCard}>
            <ThemedText style={styles.comparisonTitle}>Zone Comparison</ThemedText>
            <View style={styles.chartContainer}>
              <BarChart
                data={getComparisonData()}
                width={width - 64}
                height={220}
                yAxisLabel=""
                chartConfig={{
                  backgroundColor: theme.cardBackground,
                  backgroundGradientFrom: theme.cardBackground,
                  backgroundGradientTo: theme.cardBackground,
                  decimalPlaces: selectedParameter === 'ph' ? 1 : 0,
                  color: (opacity = 1) => soilData[selectedParameter].color,
                  labelColor: (opacity = 1) => theme.text,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.7,
                }}
                yAxisSuffix={soilData[selectedParameter].unit}
                showValuesOnTopOfBars
                fromZero
                style={styles.chart}
              />
            </View>
          </Card>

          <Card style={styles.recommendationsCard}>
            <View style={styles.recommendationsHeader}>
              <ThemedText style={styles.recommendationsTitle}>Recommendations</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: soilData[selectedParameter].color }]} />
              <ThemedText style={styles.recommendationText}>
                {selectedParameter === 'moisture' ? 'Current moisture levels are optimal for most crops.' :
                 selectedParameter === 'ph' ? 'Consider adding lime to Zone 3 to raise pH slightly.' :
                 selectedParameter === 'nitrogen' ? 'Add nitrogen-rich organic matter to Zone 1.' :
                 selectedParameter === 'phosphorus' ? 'Supplement Zone 1 with bone meal to increase phosphorus.' :
                 'Potassium levels are optimal across all zones.'}
              </ThemedText>
            </View>
          </Card>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: soilData[selectedParameter].color }]}
            onPress={() => router.push('/automation')}
          >
            <ThemedText style={styles.actionButtonText}>Adjust Thresholds</ThemedText>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
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
  historyButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  parameterTabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  parameterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  activeParameterTab: {
    backgroundColor: Colors.light.primary,
  },
  parameterTabText: {
    marginLeft: 4,
    fontSize: 14,
  },
  activeParameterTabText: {
    color: '#fff',
  },
  detailCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  valueTextContainer: {
    flex: 1,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  valueUnit: {
    fontSize: 16,
    opacity: 0.7,
    marginLeft: 4,
  },
  optimalRange: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  zoneFilterContainer: {
    marginBottom: 16,
  },
  zoneFilterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  zoneButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  zoneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  activeZoneButton: {
    backgroundColor: Colors.light.primary,
  },
  zoneButtonText: {
    fontSize: 14,
  },
  activeZoneButtonText: {
    color: '#fff',
  },
  comparisonCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  recommendationsCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default SoilDetails;
