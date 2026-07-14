import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from "expo-router";
import * as SplashScreen from 'expo-splash-screen';

import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
