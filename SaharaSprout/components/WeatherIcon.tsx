import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface WeatherIconProps {
  condition: string;
  size: number;
  color: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, size, color }) => {
  const getIconName = () => {
    switch (condition) {
      case 'sunny':
        return 'sunny';
      case 'cloudy':
        return 'cloudy';
      case 'rainy':
        return 'rainy';
      default:
        return 'help-circle-outline';
    }
  };

  return <Ionicons name={getIconName()} size={size} color={color} />;
};