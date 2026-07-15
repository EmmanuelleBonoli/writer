import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import type { GenreChipProps, GenreSelectorProps } from '@/types/book.types';

import { ALL_GENRES } from '../../book-defaults';
import { useGenreColor } from '../../genre-colors';

/** Puces de sélection multiple des genres/thèmes d'un livre — utilisé à la création et dans la Bible. */
export function GenreSelector({ selectedGenres, onToggle }: GenreSelectorProps) {
  return (
    <View style={styles.chips}>
      {ALL_GENRES.map((genre) => (
        <GenreChip key={genre} genre={genre} selected={selectedGenres.includes(genre)} onToggle={() => onToggle(genre)} />
      ))}
    </View>
  );
}

function GenreChip({ genre, selected, onToggle }: GenreChipProps) {
  const color = useGenreColor(genre);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.chip, { borderColor: color, backgroundColor: selected ? color : 'transparent' }]}
    >
      <Text style={[styles.chipLabel, { color: selected ? '#ffffff' : color }]}>{genre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
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
