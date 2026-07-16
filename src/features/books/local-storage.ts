import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

const WRITE_DEBOUNCE_MS = 1000;

/**
 * Adaptateur AsyncStorage dont l'écriture est debouncée : sans ça, chaque frappe pendant la rédaction
 * d'une scène resérialiserait et réécrirait tout le store sur le disque, ce qui ralentirait la saisie.
 */
export function createDebouncedAsyncStorage(delayMs: number = WRITE_DEBOUNCE_MS): StateStorage {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return {
    getItem: (name) => AsyncStorage.getItem(name),
    removeItem: (name) => AsyncStorage.removeItem(name),
    setItem: (name, value) => {
      if (timeout) clearTimeout(timeout);
      return new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          AsyncStorage.setItem(name, value).finally(resolve);
        }, delayMs);
      });
    },
  };
}
