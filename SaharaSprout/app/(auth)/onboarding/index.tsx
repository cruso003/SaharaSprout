import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to SaharaSprout',
    description: 'Automated watering for your farm',
    icon: 'droplet',
  },
  {
    id: '2',
    title: 'Monitor & Control',
    description: 'Track soil moisture and manage water flow remotely',
    icon: 'bar-chart-2',
  },
  {
    id: '3',
    title: 'Smart Alerts',
    description: 'Get timely notifications for your irrigation system',
    icon: 'bell',
  },
  {
    id: '4',
    title: 'Get Started',
    description: 'Sign in to begin your smart farming journey',
    icon: 'log-in',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
      </TouchableOpacity>

      <AnimatePresence exitBeforeEnter>
        <MotiView
          key={currentIndex}
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.slideContainer}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 150 }}
            style={styles.iconContainer}
          >
            <Feather name={slides[currentIndex].icon as any} size={60} color={colors.primary} />
          </MotiView>
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200 }}
            style={[styles.title, { color: colors.text }]}
          >
            {slides[currentIndex].title}
          </MotiText>
          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 300 }}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {slides[currentIndex].description}
          </MotiText>
        </MotiView>
      </AnimatePresence>

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <MotiView
            key={index}
            style={[styles.dot, { backgroundColor: colors.primary }]}
            animate={{
              scale: currentIndex === index ? 1.2 : 1,
              opacity: currentIndex === index ? 1 : 0.5,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleNext}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    width: width * 0.8,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
