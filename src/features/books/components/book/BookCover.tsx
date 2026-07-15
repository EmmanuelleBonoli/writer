import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii } from '@/constants/theme';
import type { BookCoverProps } from '@/types/book.types';

import { useGenreColor } from '../../genre-colors';
import { useMeasureOnPress } from '../../hooks/use-measure-on-press';
import { GenreStripe } from './GenreStripe';

export const COVER_WIDTH = 108;
export const COVER_HEIGHT = 162;

/** Couverture de livre vue de face, posée dans la grille de l'étagère. */
export function BookCover({ book, onOpen }: BookCoverProps) {
  const spineColor = useGenreColor(book.genre[0]);
  const { ref, handlePress } = useMeasureOnPress((rect) => onOpen(book, rect));

  return (
    <Pressable onPress={handlePress}>
      <View ref={ref} style={[styles.cover, { backgroundColor: spineColor }]} collapsable={false}>
        <GenreStripe genres={book.genre} />

        <Text style={styles.genreLabel} numberOfLines={2}>
          {book.genre.join(' · ')}
        </Text>

        <Text style={styles.titleText} numberOfLines={4}>
          {book.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: Radii.card,
    padding: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  genreLabel: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 10,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
  },
});
