import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, Modal } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import Slider from '@react-native-community/slider';
import { Calendar, DateData } from 'react-native-calendars';

const IrrigationControl = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [isManualMode, setIsManualMode] = useState(false);
  const [isPumpActive, setIsPumpActive] = useState(false);
  const [moistureThreshold, setMoistureThreshold] = useState(30);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ [date: string]: { selected: boolean; marked: boolean; selectedColor: string } }>({});

  const toggleMode = () => {
    setIsManualMode(!isManualMode);
    if (isPumpActive) setIsPumpActive(false);
  };

  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };


  const onDayPress = (day: DateData) => {
    const updatedSelectedDates = { ...selectedDates };
    if (updatedSelectedDates[day.dateString]) {
      delete updatedSelectedDates[day.dateString];
    } else {
      updatedSelectedDates[day.dateString] = { selected: true, marked: true, selectedColor: theme.primary };
    }
    setSelectedDates(updatedSelectedDates);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Irrigation Control</ThemedText>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Water Pump Control</ThemedText>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[styles.modeButton, !isManualMode && styles.activeMode]}
                onPress={() => toggleMode()}
              >
                <ThemedText style={!isManualMode ? styles.activeModeText : {}}>Auto</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isManualMode && styles.activeMode]}
                onPress={() => toggleMode()}
              >
                <ThemedText style={isManualMode ? styles.activeModeText : {}}>Manual</ThemedText>
              </TouchableOpacity>
            </View>
            {isManualMode && (
              <TouchableOpacity
                style={[styles.pumpButton, isPumpActive && styles.pumpButtonActive]}
                onPress={() => setIsPumpActive(!isPumpActive)}
              >
                <Ionicons 
                  name={isPumpActive ? "water" : "water-outline"} 
                  size={24} 
                  color={Colors.light.background} 
                />
                <ThemedText style={styles.pumpButtonText}>
                  {isPumpActive ? 'Turn Pump Off' : 'Turn Pump On'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </Card>

          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Scheduling</ThemedText>
            <TouchableOpacity style={styles.scheduleButton} onPress={toggleCalendar}>
              <Ionicons name="calendar-outline" size={24} color={theme.primary} />
              <ThemedText style={styles.scheduleButtonText}>Set Irrigation Schedule</ThemedText>
            </TouchableOpacity>
          </Card>

          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Soil Moisture Threshold</ThemedText>
            <View style={styles.thresholdContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={moistureThreshold}
                onValueChange={setMoistureThreshold}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.backgroundSecondary}
                thumbTintColor={theme.primary}
              />
              <ThemedText style={styles.thresholdText}>
                Current Threshold: {moistureThreshold}%
              </ThemedText>
            </View>
          </Card>

          <Card style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
            <ThemedView style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="refresh-outline" size={24} color={theme.primary} />
                <ThemedText style={styles.quickActionText}>Refresh Sensor Data</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="stats-chart-outline" size={24} color={theme.primary} />
                <ThemedText style={styles.quickActionText}>View Water Usage</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </Card>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={isCalendarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleCalendar}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Set Irrigation Schedule</ThemedText>
            <Calendar
              markedDates={selectedDates}
              onDayPress={onDayPress}
              theme={{
                backgroundColor: theme.background,
                calendarBackground: theme.background,
                textSectionTitleColor: theme.text,
                selectedDayBackgroundColor: theme.primary,
                selectedDayTextColor: '#ffffff',
                todayTextColor: theme.primary,
                dayTextColor: theme.text,
                textDisabledColor: theme.textSecondary,
                dotColor: theme.primary,
                selectedDotColor: '#ffffff',
                arrowColor: theme.primary,
                monthTextColor: theme.text,
                indicatorColor: theme.primary,
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={toggleCalendar}>
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  activeMode: {
    backgroundColor: Colors.light.primary,
  },
  activeModeText: {
    color: Colors.light.background,
  },
  pumpButton: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pumpButtonActive: {
    backgroundColor: Colors.light.secondary,
  },
  pumpButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    padding: 15,
    borderRadius: 8,
  },
  scheduleButtonText: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  thresholdContainer: {
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thresholdText: {
    marginTop: 10,
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.secondary,
    marginHorizontal: 5,
  },
  quickActionText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.light.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
  },
});

export default IrrigationControl;