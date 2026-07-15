import { create } from 'zustand';

import type { ThemePreference } from '@/types/settings.types';

interface SettingsState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

/** Préférences globales de l'application. */
export const useSettingsStore = create<SettingsState>((set) => ({
  themePreference: 'auto',
  setThemePreference: (preference) => set({ themePreference: preference }),
}));
