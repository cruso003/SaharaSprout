import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { usePushNotifications } from "./notifications/utils/usePushNotifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useColorScheme } from '@/hooks/useColorScheme';
import useUserStore from '@/states/stores/userStore';
import auth from '@/api/auth/auth';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUserData } = useUserStore();
  const { expoPushToken } = usePushNotifications();
  const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID!;
  
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const sendPushToken = async () => {
    const userId = useUserStore.getState().userID;

    const pushToken = expoPushToken?.data;

    if (userId && pushToken) {
      try {
        await auth.sendPushTokenToServer(userId, pushToken);
      } catch (error) {
        console.error("Failed to send push token:", error);
      }
    }
  }; 

  useEffect(() => {
    const initializeData = async () => {
      await setUserData();   
     sendPushToken();
    };

    initializeData();

     GoogleSignin.configure({
       webClientId,
       offlineAccess: true
      });

  }, [expoPushToken]); 

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{headerShown: false}}/>
        <Stack.Screen name='notifications/index' options={{headerShown: false}}/>
        <Stack.Screen name='complete-profile/index' options={{headerShown: false}}/>
        <Stack.Screen name='soil-details/index' options={{headerShown: false}}/>
        <Stack.Screen name='soil-history/index' options={{headerShown: false}}/>
        <Stack.Screen name='recommendations/index' options={{headerShown: false}}/>
        <Stack.Screen name='devices/add' options={{headerShown: false}}/>
        <Stack.Screen name='devices/scan' options={{headerShown: false}}/>
        <Stack.Screen name='devices/diagnostics' options={{headerShown: false}}/>
        <Stack.Screen name='settings/language' options={{headerShown: false}}/>
        <Stack.Screen name='settings/help' options={{headerShown: false}}/>
        <Stack.Screen name='settings/farms' options={{headerShown: false}}/>
        <Stack.Screen name='settings/crops' options={{headerShown: false}}/>
        <Stack.Screen name='settings/backup' options={{headerShown: false}}/>
        <Stack.Screen name='settings/advanced' options={{headerShown: false}}/>
      </Stack>
    </ThemeProvider>
  );
}
