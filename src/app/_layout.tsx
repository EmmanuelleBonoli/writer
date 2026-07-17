import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { ToastHost } from '@/components/toast/ToastHost';
import { useBooksStore } from '@/features/books/books-store';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  const [isHydrated, setIsHydrated] = useState(() => useBooksStore.persist.hasHydrated());

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
      return undefined;
    }
    return useBooksStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
      SplashScreen.hideAsync();
    });
  }, [isHydrated]);

  if (!isHydrated) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <ToastHost />
    </ThemeProvider>
  );
}
