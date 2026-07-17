import { RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RevertFieldButtonProps } from '@/types/common.types';

/** Affiché sous un champ qui vient d'être réécrit par l'IA, pour revenir à la version d'avant. */
export function RevertFieldButton({ onPress }: RevertFieldButtonProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.button} hitSlop={6}>
      <RotateCcw size={12} color={theme.textSecondary} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>Revenir à la version précédente</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: -Spacing.two,
    marginBottom: Spacing.three,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
