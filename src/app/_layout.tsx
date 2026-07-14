import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from "expo-router";
import {useColorScheme} from "react-native";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
