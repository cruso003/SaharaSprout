/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryGreen = '#4CAF50';
const lightGreen = '#A5D6A7';
const darkGreen = '#388E3C';
const white = '#FFFFFF';
const black = '#000000';

export const Colors = {
  light: {
    primary: primaryGreen,
    secondary: lightGreen,
    background: white,
    backgroundSecondary: '#F2F2F7',
    cardBackground: '#fff',
    text: black,
    textSecondary: '#555555',
    icon: darkGreen,
    error: '#F44336',
  },
  dark: {
    primary: darkGreen,
    secondary: primaryGreen,
    background: '#121212',
    backgroundSecondary: '#2C2C2E',
    cardBackground: '#1C1C1E',
    text: white,
    textSecondary: '#CCCCCC',
    icon: lightGreen,
    error: '#F44336',
  },
};