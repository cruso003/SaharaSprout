import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StatusIndicatorProps {
  status: 'good' | 'warning' | 'error';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'good':
        return '#4CAF50';
      case 'warning':
        return '#FFC107';
      case 'error':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  return (
    <View style={[styles.indicator, { backgroundColor: getColor() }]} />
  );
};

const styles = StyleSheet.create({
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
