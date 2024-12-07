import React from 'react';
import { 
  TextInput as RNTextInput, 
  StyleSheet, 
  View, 
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

interface ThemedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const TextInput: React.FC<ThemedTextInputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText style={[styles.label, labelStyle]}>
          {label}
        </ThemedText>
      )}
      <RNTextInput
        style={[
          styles.input,
          { 
            color: theme.text,
            borderColor: error ? theme.error : theme.cardBackground,
            backgroundColor: theme.backgroundSecondary
          },
          inputStyle
        ]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {error && (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
