import { StyleSheet, View } from 'react-native';

import type { GenreStripeProps } from '@/types/book.types';

import { useGenreColors } from '../../genre-colors';

/** Bande de reliure sur le bord de la couverture : un segment de couleur par genre du livre. */
export function GenreStripe({ genres }: GenreStripeProps) {
  const colors = useGenreColors(genres);

  return (
    <View style={styles.stripe}>
      {colors.map((color, index) => (
        <View key={index} style={[styles.segment, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
  },
  segment: {
    flex: 1,
  },
});
