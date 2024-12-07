import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { TouchableOpacity, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '@/states/stores/userStore';
import authApi from '@/api/auth/auth';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [error, setError] = useState("");
  const { setUserData } = useUserStore();

   const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
  
      const userInfo = await GoogleSignin.signIn();
  
      // Retrieve the ID Token from userInfo directly
      const idToken = userInfo.data?.idToken;
  
      if (!idToken) {
        throw new Error("Failed to retrieve ID token.");
      }
      const response = await authApi.googleSignIn(idToken);

      const data = response.data;
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
      await setUserData();
      
     if (data.profileComplete === false) {
        router.push("/complete-profile");
      } else {
        router.push("/dashboard");
      }
      
    } catch (error: any) {
      console.error("Error occurred during Google Sign-In:", error);
  
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.error("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.error("Sign in is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Play services not available or outdated");
      } else {
        console.error("Unexpected error during Google Sign-In:", error);
      }
      setError(error.message);
    }
  };
   
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000, delay: 300 }}
        >
          <Image
            source={require('../../../assets/images/sslogo.png')}
            style={styles.logo}
          />
        </MotiView>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000, delay: 600 }}
          style={[styles.title, { color: colors.text }]}
        >
          Smart Irrigation
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000, delay: 900 }}
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Efficient water management for your farm
        </MotiText>

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 1200 }}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
          >
            <Image
              source={require('../../../assets/images/googleLogo.png')}
              style={styles.googleLogo}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </MotiView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    width: '100%',
    height: 50,
  },
  googleButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
