import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Moon, Sun, SunMoon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useSettingsStore, type ThemePreference } from '../settings-store';

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'auto', label: 'Automatique', icon: SunMoon },
];

/** Réglages de l'application. Pour l'instant : préférence de thème clair/sombre/automatique. */
export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const themePreference = useSettingsStore((state) => state.themePreference);
  const setThemePreference = useSettingsStore((state) => state.setThemePreference);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ArrowLeft size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Réglages</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Thème</Text>
      <View style={[styles.optionList, { borderColor: theme.border }]}>
        {THEME_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const selected = themePreference === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setThemePreference(option.id)}
              style={[
                styles.option,
                index > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <Icon size={18} color={theme.text} />
              <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
              {selected && <Check size={18} color={theme.text} style={styles.optionCheck} />}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  backButton: {
    padding: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  optionList: {
    borderWidth: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  optionCheck: {
    marginLeft: Spacing.two,
  },
});
