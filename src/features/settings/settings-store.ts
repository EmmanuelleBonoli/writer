import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'auto';

interface SettingsState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

/** Préférences globales de l'application. */
export const useSettingsStore = create<SettingsState>((set) => ({
  themePreference: 'auto',
  setThemePreference: (preference) => set({ themePreference: preference }),
}));
