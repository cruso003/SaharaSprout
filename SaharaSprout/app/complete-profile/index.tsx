import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Card } from "@/components/Card";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import useUserStore from "@/states/stores/userStore";
import { TextInput } from "@/components/TextInput";

const ProfileCompletion = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    // Personal Information
    primaryPhone: "",
    secondaryPhone: "",
    preferredContactMethod: "both",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Farm Information
    farm: {
      name: "",
      address: "",
      size: "",
      sizeUnit: "hectares",
      cropTypes: "",
      soilType: "",
      climateType: "",
    },
    // Device Configuration
    // Main Device (ESP8266)
    mainDevice: {
      id: "",
      name: "",
      location: "",
    },
    // Sub-devices
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

    // Alert Preferences
    alerts: {
      moistureThreshold: "30",
      systemStatusNotifications: true,
      maintenanceAlerts: true,
      preferredAlertTimes: "anytime",
      emergencyContact: "",
    },
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://34.227.29.64/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // Handle successful profile completion
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Error completing profile:", error);
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
            Please provide some additional information to set up your irrigation
            system
          </ThemedText>
        </View>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Personal Information
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
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Farm Information</ThemedText>
          <TextInput
            label="Farm Name"
            value={formData.farm.name}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                farm: { ...prev.farm, name: text },
              }))
            }
            placeholder="Enter your farm's name"
          />
          <TextInput
            label="Farm Address"
            value={formData.farm.address}
            onChangeText={(text: string) =>
              setFormData((prev) => ({
                ...prev,
                farm: { ...prev.farm, address: text },
              }))
            }
            placeholder="Enter farm's physical address"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextInput
                label="Farm Size"
                value={formData.farm.size}
                onChangeText={(text: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    farm: { ...prev.farm, size: text },
                  }))
                }
                keyboardType="numeric"
                placeholder="Size"
              />
            </View>
            <View style={styles.flex}>
              <Picker
                selectedValue={formData.farm.sizeUnit}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    farm: { ...prev.farm, sizeUnit: value },
                  }))
                }
              >
                <Picker.Item label="Hectares" value="hectares" />
                <Picker.Item label="Acres" value="acres" />
              </Picker>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Device Configuration
          </ThemedText>

          {/* Main Device */}
          <View style={styles.subsection}>
            <ThemedText style={styles.subsectionTitle}>
              Main Controller (ESP8266)
            </ThemedText>
            <TextInput
              label="Controller ID"
              value={formData.mainDevice.id}
              onChangeText={(text: string) =>
                setFormData((prev) => ({
                  ...prev,
                  mainDevice: { ...prev.mainDevice, id: text },
                }))
              }
              placeholder="Enter the ESP8266 device ID"
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
              placeholder="Give your controller a name"
            />
            <TextInput
              label="Installation Location"
              value={formData.mainDevice.location}
              onChangeText={(text: string) =>
                setFormData((prev) => ({
                  ...prev,
                  mainDevice: { ...prev.mainDevice, location: text },
                }))
              }
              placeholder="Where is the controller installed?"
            />
          </View>

          {/* Sub-devices */}
          <View style={styles.subsection}>
            <ThemedText style={styles.subsectionTitle}>
              Connected Devices
            </ThemedText>
            {Object.entries(formData.subDevices).map(([key, device]) => (
              <View key={key} style={styles.deviceRow}>
                <View style={styles.deviceInfo}>
                  <ThemedText style={styles.deviceType}>
                    {device.name}
                  </ThemedText>
                  <TextInput
                    label="Device ID"
                    value={device.id}
                    onChangeText={(text: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        subDevices: {
                          ...prev.subDevices,
                          [key]: { ...device, id: text },
                        },
                      }))
                    }
                    placeholder={`Enter ${device.name} ID`}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>
            Complete Profile
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
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
  deviceInfo: {
    flex: 1,
  },
  deviceType: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
});

export default ProfileCompletion;
