import { RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MinTouchTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RevertFieldButtonProps } from '@/types/common.types';

/** Affiché sous un champ qui vient d'être réécrit par l'IA, pour revenir à la version d'avant. */
export function RevertFieldButton({ onPress }: RevertFieldButtonProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.button}>
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
    minHeight: MinTouchTarget,
    marginTop: -Spacing.three,
    marginBottom: Spacing.one,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
