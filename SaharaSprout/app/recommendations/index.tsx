import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';

const AllRecommendations = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Sample recommendations data
  const recommendations: RecommendationItem[] = [
    {
      id: '1',
      category: 'crop',
      title: 'Optimal Crops',
      description: 'Based on current soil conditions and climate, these crops are most likely to thrive:',
      recommendations: ['Tomatoes', 'Bell Peppers', 'Okra', 'Eggplant', 'Chili Peppers'],
      icon: 'leaf',
    },
    {
      id: '2',
      category: 'soil',
      title: 'Soil Improvement',
      description: 'Consider these amendments to optimize your soil health:',
      recommendations: [
        'Add organic compost to Zone 1 to increase nitrogen levels',
        'Apply sulfur-based amendments to Zone 3 to lower pH',
        'Supplement Zone 2 with phosphorus for improved root development',
      ],
      icon: 'flask',
    },
    {
      id: '3',
      category: 'water',
      title: 'Water Optimization',
      description: 'The system has automatically optimized your irrigation schedule based on soil and weather patterns:',
      recommendations: [
        'Water usage reduced by 22% through AI optimization',
        'Zone 1 irrigation duration decreased by 15 minutes',
        'Zone 3 slow drip pattern improved moisture retention by 18%',
      ],
      icon: 'water',
    },
    {
      id: '4',
      category: 'planning',
      title: 'Seasonal Planning',
      description: 'Based on climate forecasts and soil analysis, consider these upcoming activities:',
      recommendations: [
        'Plan crop rotation for next month to prevent soil nutrient depletion',
        'Add mulch in 2 weeks to prepare for predicted temperature increase',
        'Consider harvesting Zone 1 crops within 10-14 days for optimal yield',
      ],
      icon: 'calendar',
    },
    {
      id: '5',
      category: 'pest',
      title: 'Pest Prevention',
      description: 'Potential pest risks have been identified based on current conditions:',
      recommendations: [
        'Monitor Zone 2 for aphids - early signs detected from leaf analysis',
        'Consider introducing ladybugs as natural predators',
        'Check undersides of leaves in Zone 1 for spider mite prevention',
      ],
      icon: 'bug',
    },
  ];

type CategoryType = 'crop' | 'soil' | 'water' | 'planning' | 'pest';

interface RecommendationItem {
    id: string;
    category: CategoryType;
    title: string;
    description: string;
    recommendations: string[];
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

const getCategoryColor = (category: CategoryType): string => {
    switch (category) {
        case 'crop': return '#4CAF50';  // Green
        case 'soil': return '#FF9800';  // Orange
        case 'water': return '#2196F3'; // Blue
        case 'planning': return '#9C27B0'; // Purple
        case 'pest': return '#F44336'; // Red
        default: return theme.primary;
    }
};

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>AI Recommendations</ThemedText>
          <View style={styles.placeholderRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.subtitle}>
            Personalized insights for your farm based on soil conditions, weather patterns, and historical data
          </ThemedText>

          <View style={styles.filterContainer}>
            <ThemedText style={styles.filterLabel}>Filter by:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
                <ThemedText style={styles.filterButtonTextActive}>All</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText style={styles.filterButtonText}>Crops</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText style={styles.filterButtonText}>Soil</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText style={styles.filterButtonText}>Water</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText style={styles.filterButtonText}>Planning</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <ThemedText style={styles.filterButtonText}>Pests</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {recommendations.map((rec) => (
            <Card key={rec.id} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(rec.category) }]}>
                  <Ionicons name={rec.icon as React.ComponentProps<typeof Ionicons>['name']} size={24} color="#fff" />
                </View>
                <ThemedText style={styles.recommendationTitle}>{rec.title}</ThemedText>
              </View>
              
              <ThemedText style={styles.recommendationDescription}>{rec.description}</ThemedText>
              
              {rec.recommendations.map((item, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={[styles.bulletPoint, { backgroundColor: getCategoryColor(rec.category) }]} />
                  <ThemedText style={styles.recommendationItemText}>{item}</ThemedText>
                </View>
              ))}
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: `${getCategoryColor(rec.category)}20` }]}>
                <ThemedText style={[styles.actionButtonText, { color: getCategoryColor(rec.category) }]}>Apply This Advice</ThemedText>
              </TouchableOpacity>
            </Card>
          ))}
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
  placeholderRight: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.7,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
  },
  filterButtonTextActive: {
    fontSize: 14,
    color: '#fff',
  },
  recommendationCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 8,
  },
  recommendationItemText: {
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  actionButtonText: {
    fontWeight: '600',
  },
});

export default AllRecommendations;
