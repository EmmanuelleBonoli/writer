import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TagChipsProps } from '@/types/common.types';

/** Puces de sélection (personnages, lieu...) pointant vers d'autres fiches du livre — la sélection (simple/multiple) est gérée par l'appelant. */
export function TagChips({ options, selectedIds, onToggle }: TagChipsProps) {
  const theme = useTheme();

  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);
        return (
          <Pressable
            key={option.id}
            onPress={() => onToggle(option.id)}
            style={[
              styles.chip,
              { borderColor: theme.border, backgroundColor: selected ? theme.text : 'transparent' },
            ]}
          >
            <Text style={[styles.chipLabel, { color: selected ? theme.background : theme.text }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
