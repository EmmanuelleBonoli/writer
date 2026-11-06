import { ArrowLeft, Settings } from 'lucide-react-native';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookCompactHeaderProps } from '@/types/book.types';

/** En-tête d'une ligne sur téléphone : remplace le grand titre, pour laisser la hauteur de l'écran au contenu. */
export function BookCompactHeader({
  sectionLabel,
  bookTitle,
  accentColor,
  onBack,
  onOpenSettings,
}: BookCompactHeaderProps): ReactElement {
  const theme = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <Pressable onPress={onBack} style={styles.iconButton} accessibilityLabel="Retour à l'étagère">
        <ArrowLeft size={20} color={theme.text} />
      </Pressable>

      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={styles.titles}>
        <Text style={[styles.sectionLabel, { color: theme.text }]} numberOfLines={1}>
          {sectionLabel}
        </Text>
        <Text style={[styles.bookTitle, { color: theme.textSecondary }]} numberOfLines={1}>
          {bookTitle}
        </Text>
      </View>

      <Pressable onPress={onOpenSettings} style={styles.iconButton} accessibilityLabel="Réglages">
        <Settings size={20} color={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  titles: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: 12,
  },
});
