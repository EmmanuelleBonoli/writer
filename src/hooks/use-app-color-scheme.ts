import { useSettingsStore } from '@/features/settings/settings-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Thème effectif de l'app : la préférence utilisateur (clair/sombre) prime sur le thème système, sauf en "auto". */
export function useAppColorScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((state) => state.themePreference);
  const resolved = preference === 'auto' ? systemScheme : preference;
  return resolved === 'dark' ? 'dark' : 'light';
}
