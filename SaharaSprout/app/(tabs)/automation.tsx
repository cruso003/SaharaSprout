import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { LineChart, BarChart } from "react-native-chart-kit";
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

const Automation = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [skipRainyDays, setSkipRainyDays] = useState(true);
  const [activeTab, setActiveTab] = useState("moisture"); // moisture, pH, npk

  // Thresholds state
  const [moistureThreshold, setMoistureThreshold] = useState(30);
  const [phThreshold, setPhThreshold] = useState(6.5);
  const [nitrogenThreshold, setNitrogenThreshold] = useState(40);
  const [phosphorusThreshold, setPhosphorusThreshold] = useState(35);
  const [potassiumThreshold, setPotassiumThreshold] = useState(45);

  // System state
  const [systemPaused, setSystemPaused] = useState(false);

  // Example data for irrigation plan
  const irrigationPlan = [
    {
      zone: "Zone 1",
      startTime: "07:30",
      duration: "45 min",
      soilType: "Clay Loam",
    },
    {
      zone: "Zone 2",
      startTime: "08:30",
      duration: "30 min",
      soilType: "Sandy Loam",
    },
    {
      zone: "Zone 3",
      startTime: "18:00",
      duration: "25 min",
      soilType: "Silt Loam",
    },
  ];

  // Example weekly plan
  const weeklyPlan = [
    { day: "Mon", status: "active" },
    { day: "Tue", status: "inactive" },
    { day: "Wed", status: "active" },
    { day: "Thu", status: "inactive" },
    { day: "Fri", status: "active" },
    { day: "Sat", status: "inactive" },
    { day: "Sun", status: "inactive" },
  ];

  // Example water usage data
  const waterUsageData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [20, 45, 28, 15, 30, 22, 17],
        color: (opacity = 1) => theme.primary,
        strokeWidth: 2,
      },
    ],
  };

  // NPK and pH history data
  const nutrientHistory = {
    labels: ["1W", "2W", "3W", "4W", "5W", "6W"],
    datasets: [
      {
        data: [
          { x: "1W", y: 6.2 },
          { x: "2W", y: 6.4 },
          { x: "3W", y: 6.3 },
          { x: "4W", y: 6.5 },
          { x: "5W", y: 6.7 },
          { x: "6W", y: 6.5 },
        ],
        color: (opacity = 1) => theme.primary,
      },
      {
        data:
          activeTab === "pH"
            ? [
                { x: "1W", y: 6.2 },
                { x: "2W", y: 6.4 },
                { x: "3W", y: 6.3 },
                { x: "4W", y: 6.5 },
                { x: "5W", y: 6.7 },
                { x: "6W", y: 6.5 },
              ]
            : activeTab === "npkN"
            ? [
                { x: "1W", y: 35 },
                { x: "2W", y: 38 },
                { x: "3W", y: 42 },
                { x: "4W", y: 40 },
                { x: "5W", y: 41 },
                { x: "6W", y: 40 },
              ]
            : activeTab === "npkP"
            ? [
                { x: "1W", y: 30 },
                { x: "2W", y: 32 },
                { x: "3W", y: 34 },
                { x: "4W", y: 35 },
                { x: "5W", y: 36 },
                { x: "6W", y: 35 },
              ]
            : [
                { x: "1W", y: 40 },
                { x: "2W", y: 42 },
                { x: "3W", y: 45 },
                { x: "4W", y: 43 },
                { x: "5W", y: 44 },
                { x: "6W", y: 45 },
              ],
        color: (opacity = 1) => theme.primary,
      },
    ],
  };

  // NPK comparison data
  const npkData = {
    labels: ["N", "P", "K"],
    datasets: [
      {
        data: [40, 35, 45],
        colors: [
          (opacity = 1) => "#28A745", // Green for N
          (opacity = 1) => "#17A2B8", // Blue for P
          (opacity = 1) => "#6610F2", // Purple for K
        ],
      },
    ],
  };

  // Current soil readings
  const soilReadings = {
    moisture: 43,
    pH: 6.5,
    nitrogen: 40,
    phosphorus: 35,
    potassium: 45,
    temperature: 24,
  };

  const renderThresholdSlider = () => {
    let sliderValue, setSliderValue, minValue, maxValue, unit, optimalRange;

    if (activeTab === "moisture") {
      sliderValue = moistureThreshold;
      setSliderValue = setMoistureThreshold;
      minValue = 0;
      maxValue = 100;
      unit = "%";
      optimalRange = "30-50%";
    } else if (activeTab === "pH") {
      sliderValue = phThreshold;
      setSliderValue = setPhThreshold;
      minValue = 4;
      maxValue = 9;
      unit = "";
      optimalRange = "6.0-7.0";
    } else if (activeTab === "npkN") {
      sliderValue = nitrogenThreshold;
      setSliderValue = setNitrogenThreshold;
      minValue = 0;
      maxValue = 100;
      unit = "ppm";
      optimalRange = "30-50 ppm";
    } else if (activeTab === "npkP") {
      sliderValue = phosphorusThreshold;
      setSliderValue = setPhosphorusThreshold;
      minValue = 0;
      maxValue = 100;
      unit = "ppm";
      optimalRange = "30-40 ppm";
    } else {
      sliderValue = potassiumThreshold;
      setSliderValue = setPotassiumThreshold;
      minValue = 0;
      maxValue = 100;
      unit = "ppm";
      optimalRange = "40-60 ppm";
    }

    return (
      <>
        <View style={styles.thresholdHeader}>
          <View>
            <ThemedText style={styles.thresholdLabel}>
              {activeTab === "moisture"
                ? "Soil Moisture Threshold"
                : activeTab === "pH"
                ? "pH Level Threshold"
                : activeTab === "npkN"
                ? "Nitrogen (N) Threshold"
                : activeTab === "npkP"
                ? "Phosphorus (P) Threshold"
                : "Potassium (K) Threshold"}
            </ThemedText>
            <ThemedText style={styles.optimalRange}>
              Optimal range: {optimalRange}
            </ThemedText>
          </View>
          <ThemedText style={styles.thresholdValue}>
            {sliderValue}
            {unit}
          </ThemedText>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                {
                  width: `${
                    ((sliderValue - minValue) / (maxValue - minValue)) * 100
                  }%`,
                  backgroundColor:
                    activeTab === "moisture"
                      ? theme.primary
                      : activeTab === "pH"
                      ? "#FF9800"
                      : activeTab === "npkN"
                      ? "#28A745"
                      : activeTab === "npkP"
                      ? "#17A2B8"
                      : "#6610F2",
                },
              ]}
            />
          </View>

          <Slider
            style={styles.slider}
            minimumValue={minValue}
            maximumValue={maxValue}
            step={activeTab === "pH" ? 0.1 : 1}
            value={sliderValue}
            onValueChange={setSliderValue}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor={
              activeTab === "moisture"
                ? theme.primary
                : activeTab === "pH"
                ? "#FF9800"
                : activeTab === "npkN"
                ? "#28A745"
                : activeTab === "npkP"
                ? "#17A2B8"
                : "#6610F2"
            }
          />

          <View style={styles.sliderLabels}>
            <ThemedText style={styles.sliderLabelText}>
              {activeTab === "moisture"
                ? "Dry"
                : activeTab === "pH"
                ? "Acidic"
                : "Low"}
            </ThemedText>
            <ThemedText style={styles.sliderLabelText}>
              {activeTab === "moisture"
                ? "Optimal"
                : activeTab === "pH"
                ? "Neutral"
                : "Optimal"}
            </ThemedText>
            <ThemedText style={styles.sliderLabelText}>
              {activeTab === "moisture"
                ? "Wet"
                : activeTab === "pH"
                ? "Alkaline"
                : "High"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.currentReadingContainer}>
          <ThemedText style={styles.currentReadingLabel}>
            Current reading:
          </ThemedText>
          <View
            style={[
              styles.readingBadge,
              {
                backgroundColor:
                  activeTab === "moisture"
                    ? theme.primary
                    : activeTab === "pH"
                    ? "#FF9800"
                    : activeTab === "npkN"
                    ? "#28A745"
                    : activeTab === "npkP"
                    ? "#17A2B8"
                    : "#6610F2",
              },
            ]}
          >
            <ThemedText style={styles.readingBadgeText}>
              {activeTab === "moisture"
                ? `${soilReadings.moisture}%`
                : activeTab === "pH"
                ? soilReadings.pH
                : activeTab === "npkN"
                ? `${soilReadings.nitrogen} ppm`
                : activeTab === "npkP"
                ? `${soilReadings.phosphorus} ppm`
                : `${soilReadings.potassium} ppm`}
            </ThemedText>
          </View>
        </View>
      </>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Automation</ThemedText>
            <TouchableOpacity>
              <Ionicons name="refresh-outline" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* AI Irrigation Plan Card */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.sectionTitle}>
                Today's Irrigation Plan
              </ThemedText>
              <View style={styles.cardAction}>
                <ThemedText style={styles.skipText}>Skip rainy days</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    skipRainyDays && styles.toggleActive,
                  ]}
                  onPress={() => setSkipRainyDays(!skipRainyDays)}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      skipRainyDays && styles.toggleCircleActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timelineContainer}>
              {irrigationPlan.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIconContainer}>
                    <Ionicons name="water" size={20} color={theme.background} />
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineContentHeader}>
                      <ThemedText style={styles.timelineZone}>
                        {item.zone}
                      </ThemedText>
                      <ThemedText style={styles.timelineTime}>
                        {item.startTime} ({item.duration})
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.timelineSoilType}>
                      {item.soilType}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <ThemedText style={styles.weeklyPlanTitle}>
              Weekly Schedule
            </ThemedText>
            <View style={styles.weeklyPlanContainer}>
              {weeklyPlan.map((day, index) => (
                <View key={index} style={styles.dayItem}>
                  <ThemedText style={styles.dayText}>{day.day}</ThemedText>
                  <View
                    style={[
                      styles.dayStatus,
                      {
                        backgroundColor:
                          day.status === "active"
                            ? theme.primary
                            : "rgba(0,0,0,0.1)",
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </Card>

          {/* Threshold Management Card */}
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Threshold Management
            </ThemedText>

            <View style={styles.thresholdTabsContainer}>
              <TouchableOpacity
                style={[
                  styles.thresholdTab,
                  activeTab === "moisture" && styles.activeThresholdTab,
                ]}
                onPress={() => setActiveTab("moisture")}
              >
                <Ionicons
                  name="water-outline"
                  size={18}
                  color={
                    activeTab === "moisture" ? theme.background : theme.text
                  }
                />
                <ThemedText
                  style={[
                    styles.thresholdTabText,
                    activeTab === "moisture" && styles.activeThresholdTabText,
                  ]}
                >
                  Moisture
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.thresholdTab,
                  activeTab === "pH" && [
                    styles.activeThresholdTab,
                    { backgroundColor: "#FF9800" },
                  ],
                ]}
                onPress={() => setActiveTab("pH")}
              >
                <Ionicons
                  name="flask-outline"
                  size={18}
                  color={activeTab === "pH" ? theme.background : theme.text}
                />
                <ThemedText
                  style={[
                    styles.thresholdTabText,
                    activeTab === "pH" && styles.activeThresholdTabText,
                  ]}
                >
                  pH
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.thresholdTab,
                  activeTab.includes("npk") && [
                    styles.activeThresholdTab,
                    {
                      backgroundColor:
                        activeTab === "npkN"
                          ? "#28A745"
                          : activeTab === "npkP"
                          ? "#17A2B8"
                          : "#6610F2",
                    },
                  ],
                ]}
                onPress={() =>
                  setActiveTab(
                    activeTab.includes("npk")
                      ? activeTab === "npkN"
                        ? "npkP"
                        : activeTab === "npkP"
                        ? "npkK"
                        : "npkN"
                      : "npkN"
                  )
                }
              >
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color={
                    activeTab.includes("npk") ? theme.background : theme.text
                  }
                />
                <ThemedText
                  style={[
                    styles.thresholdTabText,
                    activeTab.includes("npk") && styles.activeThresholdTabText,
                  ]}
                >
                  {activeTab === "npkN"
                    ? "N"
                    : activeTab === "npkP"
                    ? "P"
                    : activeTab === "npkK"
                    ? "K"
                    : "NPK"}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.thresholdContainer}>
              {renderThresholdSlider()}
            </View>

            {/* Show NPK comparison chart when in NPK mode */}
            {activeTab.includes("npk") && (
              <View style={styles.npkChartContainer}>
                <ThemedText style={styles.npkChartTitle}>
                  NPK Comparison
                </ThemedText>
                <BarChart
                  data={npkData}
                  width={width - 64}
                  height={180}
                  chartConfig={{
                    backgroundColor: theme.cardBackground,
                    backgroundGradientFrom: theme.cardBackground,
                    backgroundGradientTo: theme.cardBackground,
                    decimalPlaces: 0,
                    color: (opacity = 1, index = 0) =>
                      npkData.datasets[0].colors[index](opacity),
                    labelColor: (opacity = 1) => theme.text,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  style={styles.npkChart}
                  yAxisLabel=""
                  yAxisSuffix="ppm"
                />
              </View>
            )}
          </Card>

          {/* Emergency Controls Card */}
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Emergency Controls
            </ThemedText>
            <View style={styles.emergencyContainer}>
              <TouchableOpacity
                style={[
                  styles.emergencyButton,
                  {
                    backgroundColor: systemPaused
                      ? theme.secondary
                      : theme.error,
                  },
                ]}
                onPress={() => setSystemPaused(!systemPaused)}
              >
                <Ionicons
                  name={systemPaused ? "play-circle" : "pause-circle"}
                  size={24}
                  color={theme.background}
                />
                <ThemedText style={styles.emergencyButtonText}>
                  {systemPaused ? "Resume Irrigation" : "Pause All Irrigation"}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.emergencyButton,
                  { backgroundColor: theme.secondary },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.background}
                />
                <ThemedText style={styles.emergencyButtonText}>
                  Skip Today
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Water Usage Analytics Card */}
          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Water Usage Analytics
            </ThemedText>
            <View style={styles.chartContainer}>
              <LineChart
                data={waterUsageData}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: theme.cardBackground,
                  backgroundGradientFrom: theme.cardBackground,
                  backgroundGradientTo: theme.cardBackground,
                  decimalPlaces: 0,
                  color: (opacity = 1) => theme.primary,
                  labelColor: (opacity = 1) => theme.text,
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: theme.primary,
                  },
                  propsForLabels: {
                    fontSize: 12,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
            <View style={styles.savingStats}>
              <View style={styles.statItem}>
                <Ionicons
                  name="water-outline"
                  size={20}
                  color={theme.primary}
                />
                <ThemedText style={styles.statValue}>32% saved</ThemedText>
                <ThemedText style={styles.statLabel}>
                  vs. manual irrigation
                </ThemedText>
              </View>

              <View style={styles.statItem}>
                <Ionicons
                  name="trending-down-outline"
                  size={20}
                  color={theme.primary}
                />
                <ThemedText style={styles.statValue}>145L</ThemedText>
                <ThemedText style={styles.statLabel}>
                  water saved this week
                </ThemedText>
              </View>
            </View>
            {/* AI Recommendations and Insights Section */}
            <View style={styles.optimizationContainer}>
              <View style={styles.optimizationHeader}>
                <Ionicons name="bulb-outline" size={20} color={theme.primary} />
                <ThemedText style={styles.optimizationTitle}>
                  AI Farm Insights
                </ThemedText>
              </View>

              {/* Crop Recommendations */}
              <View style={styles.insightSection}>
                <ThemedText style={styles.insightSectionTitle}>
                  Recommended Crops
                </ThemedText>
                <View style={styles.cropRecommendations}>
                  <View style={styles.cropItem}>
                    <Ionicons name="leaf" size={18} color="#28A745" />
                    <ThemedText style={styles.cropName}>Tomatoes</ThemedText>
                  </View>
                  <View style={styles.cropItem}>
                    <Ionicons name="leaf" size={18} color="#28A745" />
                    <ThemedText style={styles.cropName}>
                      Bell Peppers
                    </ThemedText>
                  </View>
                  <View style={styles.cropItem}>
                    <Ionicons name="leaf" size={18} color="#28A745" />
                    <ThemedText style={styles.cropName}>Okra</ThemedText>
                  </View>
                </View>
              </View>

              {/* Soil Improvement Suggestions */}
              <View style={styles.insightSection}>
                <ThemedText style={styles.insightSectionTitle}>
                  Soil Improvement
                </ThemedText>
                <View style={styles.suggestionItem}>
                  <Ionicons
                    name="nutrition-outline"
                    size={16}
                    color={theme.primary}
                  />
                  <ThemedText style={styles.suggestionText}>
                    Adding organic compost to Zone 1 would increase nitrogen
                    levels for better crop yield
                  </ThemedText>
                </View>
                <View style={styles.suggestionItem}>
                  <Ionicons
                    name="flask-outline"
                    size={16}
                    color={theme.primary}
                  />
                  <ThemedText style={styles.suggestionText}>
                    pH levels in Zone 3 are slightly high - consider adding
                    sulfur-based amendments
                  </ThemedText>
                </View>
              </View>

              {/* System Learning Insights */}
              <View style={styles.insightSection}>
                <ThemedText style={styles.insightSectionTitle}>
                  System Improvements
                </ThemedText>
                <View style={styles.suggestionItem}>
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color={theme.primary}
                  />
                  <ThemedText style={styles.suggestionText}>
                    System has optimized water usage by 22% in the last 30 days
                    through AI learning
                  </ThemedText>
                </View>
              </View>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  timelineContainer: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  timelineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineContentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineZone: {
    fontSize: 16,
    fontWeight: "600",
  },
  timelineTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  timelineSoilType: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  weeklyPlanTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },
  weeklyPlanContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  dayItem: {
    alignItems: "center",
  },
  dayText: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  thresholdTabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  thresholdTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  activeThresholdTab: {
    backgroundColor: Colors.light.primary,
  },
  thresholdTabText: {
    marginLeft: 4,
    fontSize: 14,
  },
  activeThresholdTabText: {
    color: Colors.light.background,
  },
  thresholdContainer: {
    marginTop: 5,
  },
  thresholdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  thresholdLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  optimalRange: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  thresholdValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderContainer: {
    marginVertical: 10,
    height: 40,
  },
  sliderTrack: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    opacity: 0.7,
  },
  currentReadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  currentReadingLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  readingBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  readingBadgeText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: "600",
  },
  npkChartContainer: {
    marginTop: 20,
  },
  npkChartTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  npkChart: {
    borderRadius: 16,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 2,
    marginLeft: 10,
  },
  toggleActive: {
    backgroundColor: Colors.light.primary,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  skipText: {
    fontSize: 14,
  },
  emergencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 12,
    flex: 0.48,
  },
  emergencyButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 15,
  },
  savingStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  optimizationContainer: {
    marginTop: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    padding: 12,
  },
  optimizationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  optimizationTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    opacity: 0.9,
  },
  insightSection: {
    marginBottom: 14,
  },
  insightSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.primary,
  },
  cropRecommendations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  cropName: {
    marginLeft: 4,
    fontSize: 14,
  },
});

export default Automation;
