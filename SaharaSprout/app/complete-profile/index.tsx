import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Card } from "@/components/Card";
import { TextInput } from "@/components/TextInput";
import { router } from "expo-router";
import useUserStore from "@/states/stores/userStore";
import { Picker } from "@react-native-picker/picker";
import auth from "@/api/auth/auth";

const generateDeviceId = (prefix: string) => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
};

const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - can be adjusted based on your specific requirements
    return phone.length >= 10;
  };
  
  const validateMoistureThreshold = (threshold: string) => {
    const value = parseInt(threshold);
    return !isNaN(value) && value >= 0 && value <= 100;
  };

  interface FormErrors {
    primaryPhone?: string;
    emergencyContact?: string;
    farm?: {
      name?: string;
      location?: string;
      country?: string;
    };
    mainDevice?: {
      name?: string;
    };
    alerts?: {
      moistureThreshold?: string;
    };
  }

const ProfileCompletion = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user } = useUserStore();
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Contact Information
    if (!formData.primaryPhone) {
      newErrors.primaryPhone = 'Primary phone number is required';
    } else if (!validatePhoneNumber(formData.primaryPhone)) {
      newErrors.primaryPhone = 'Please enter a valid phone number';
    }

    // Farm Information
    if (!formData.farm.name) {
      newErrors.farm = { ...newErrors.farm, name: 'Farm name is required' };
    }
    if (!formData.farm.location) {
      newErrors.farm = { ...newErrors.farm, location: 'Farm location is required' };
    }
    if (!formData.farm.country) {
      newErrors.farm = { ...newErrors.farm, country: 'Country is required' };
    }

    // Device Configuration
    if (!formData.mainDevice.name) {
      newErrors.mainDevice = { name: 'Controller name is required' };
    }

    // Alert Preferences
    if (!validateMoistureThreshold(formData.alerts.moistureThreshold)) {
      newErrors.alerts = { 
        moistureThreshold: 'Please enter a valid threshold between 0 and 100' 
      };
    }

    if (formData.alerts.emergencyContact && !validatePhoneNumber(formData.alerts.emergencyContact)) {
      newErrors.emergencyContact = 'Please enter a valid emergency contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const userId = user?.uid ?? ""

  const [formData, setFormData] = useState({
    primaryPhone: "",
    secondaryPhone: "",
    preferredContactMethod: "both",

    farm: {
      name: "",
      location: "",
      country: "",
    },

    mainDevice: {
      id: "",
      name: "",
      location: "",
    },

    subDevices: {
      moistureSensor: {
        id: "",
        name: "Moisture Sensor",
        type: "sensor",
        enabled: true,
      },
      pump: {
        id: "",
        name: "Water Pump",
        type: "pump",
        enabled: true,
      },
      valve: {
        id: "",
        name: "Solenoid Valve",
        type: "valve",
        enabled: true,
      },
    },

    alerts: {
      moistureThreshold: "30",
      systemStatusNotifications: true,
      preferredAlertTimes: "anytime",
      emergencyContact: "",
    },
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      mainDevice: {
        ...prev.mainDevice,
        id: generateDeviceId("CTR"),
      },
      subDevices: {
        moistureSensor: {
          ...prev.subDevices.moistureSensor,
          id: generateDeviceId("SNS"),
        },
        pump: {
          ...prev.subDevices.pump,
          id: generateDeviceId("PMP"),
        },
        valve: {
          ...prev.subDevices.valve,
          id: generateDeviceId("VLV"),
        },
      },
    }));
  }, []);

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show error message to user
      Alert.alert(
        'Validation Error',
        'Please check the form for errors and try again.'
      );
      return;
    }

    try {
      const response = await auth.completeProfile(userId, formData)

      if (response.status === 200 || response.status === 201) {
        router.replace("/dashboard");
      } else {
        Alert.alert(
          'Error',
          'Failed to complete profile. Please try again.'
        );
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      Alert.alert(
        'Error',
        'An error occurred while saving your profile. Please check your connection and try again.'
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Complete Your Profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Set up your irrigation system control preferences
          </ThemedText>
        </View>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Contact Information
          </ThemedText>
          <TextInput
            label="Primary Phone Number"
            value={formData.primaryPhone}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                primaryPhone: text,
              }))
            }
            keyboardType="phone-pad"
            placeholder="Enter your primary phone number"
            error={errors.primaryPhone}
          />
          <TextInput
            label="Secondary Phone Number (Optional)"
            value={formData.secondaryPhone}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                secondaryPhone: text,
              }))
            }
            keyboardType="phone-pad"
            placeholder="Enter a backup phone number"
          />
          <View style={styles.pickerContainer}>
            <ThemedText style={styles.label}>
              Preferred Contact Method
            </ThemedText>
            <Picker
              selectedValue={formData.preferredContactMethod}
              onValueChange={(value: string) =>
                setFormData((prev) => ({
                  ...prev,
                  preferredContactMethod: value,
                }))
              }
              style={styles.pickerContainer}
            >
              <Picker.Item label="SMS" value="sms" />
              <Picker.Item label="App Notifications" value="app" />
              <Picker.Item label="Both" value="both" />
            </Picker>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Farm Location</ThemedText>
          <TextInput
            label="Farm Name"
            value={formData.farm.name}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                farm: { ...prev.farm, name: text },
              }))
            }
            placeholder="Give your farm a name"
            error={errors.farm?.name}
          />
          <TextInput
            label="Farm Location"
            value={formData.farm.location}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                farm: { ...prev.farm, location: text },
              }))
            }
            placeholder="Enter farm's location/address"
            error={errors.farm?.location}
          />
          <TextInput
            label="Country"
            value={formData.farm.country}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                farm: { ...prev.farm, country: text },
              }))
            }
            placeholder="Enter your country"
            error={errors.farm?.country}
          />
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            System Configuration
          </ThemedText>

          <View style={styles.subsection}>
            <ThemedText style={styles.subsectionTitle}>
              Main Controller
            </ThemedText>
            <TextInput
              label="Controller ID (Auto-generated)"
              value={formData.mainDevice.id}
              editable={false}
              style={styles.readOnlyInput}
            />
            <TextInput
              label="Controller Name"
              value={formData.mainDevice.name}
              onChangeText={(text: string) =>
                setFormData((prev) => ({
                  ...prev,
                  mainDevice: { ...prev.mainDevice, name: text },
                }))
              }
              placeholder="Name your controller"
              error={errors.mainDevice?.name}
            />
          </View>

          <View style={styles.subsection}>
            <ThemedText style={styles.subsectionTitle}>
              Connected Devices
            </ThemedText>
            {Object.entries(formData.subDevices).map(([key, device]) => (
              <View key={key} style={styles.deviceRow}>
                <ThemedText style={styles.deviceTitle}>
                  {device.name}
                </ThemedText>
                <TextInput
                  label="Device ID (Auto-generated)"
                  value={device.id}
                  editable={false}
                  style={styles.readOnlyInput}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Alert Preferences</ThemedText>
          <TextInput
            label="Moisture Threshold (%)"
            value={formData.alerts.moistureThreshold}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                alerts: { ...prev.alerts, moistureThreshold: text },
              }))
            }
            keyboardType="numeric"
            placeholder="Enter moisture threshold"
            error={errors.alerts?.moistureThreshold}
          />
          <TextInput
            label="Emergency Contact"
            value={formData.alerts.emergencyContact}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                alerts: { ...prev.alerts, emergencyContact: text },
              }))
            }
            placeholder="Emergency contact number"
          />
        </Card>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>
            Complete Setup
          </ThemedText>
        </TouchableOpacity>
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
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subsection: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  deviceRow: {
    marginBottom: 16,
  },
  deviceTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: Colors.light.secondary,
    opacity: 0.8,
  },
  pickerContainer: {
    marginBottom: 16,
    color: Colors.light.secondary,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  submitButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileCompletion;
