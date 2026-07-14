import { StyleSheet, Text } from 'react-native';
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useGenreColor } from '../genre-colors';
import type { Book, BookRect } from '../types';
import { ExpandingCoverOverlay } from './ExpandingCoverOverlay';
import { GenreStripe } from './GenreStripe';

interface BookExpandedOverlayProps {
  book: Book;
  originRect: BookRect;
  onClose: () => void;
}

interface CoverFaceProps {
  book: Book;
  originWidth: number;
  targetWidth: number;
  widthValue: SharedValue<number>;
}

/** Contenu affiché sur la couverture pendant qu'elle s'agrandit : le titre grossit en phase avec la largeur animée. */
function CoverFace({ book, originWidth, targetWidth, widthValue }: CoverFaceProps) {
  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(widthValue.value, [originWidth, targetWidth], [15, 17], Extrapolation.CLAMP),
    lineHeight: interpolate(widthValue.value, [originWidth, targetWidth], [19, 21], Extrapolation.CLAMP),
  }));

  return (
    <>
      <GenreStripe genres={book.genre} />
      <Text style={styles.genreLabel} numberOfLines={2}>
        {book.genre.join(' · ')}
      </Text>
      <Animated.Text style={[styles.coverTitle, titleStyle]} numberOfLines={5}>
        {book.title}
      </Animated.Text>
    </>
  );
}

/** Superposition d'un livre existant : la couverture s'ouvre pour révéler une page de contenu (placeholder pour l'instant). */
export function BookExpandedOverlay({ book, originRect, onClose }: BookExpandedOverlayProps) {
  const theme = useTheme();
  const spineColor = useGenreColor(book.genre[0]);

  return (
    <ExpandingCoverOverlay
      originRect={originRect}
      coverBackgroundColor={spineColor}
      onClose={onClose}
      renderCover={({ widthValue, targetWidth }) => (
        <CoverFace book={book} originWidth={originRect.width} targetWidth={targetWidth} widthValue={widthValue} />
      )}
      pageContent={
        <>
          <Text style={[styles.pageTitle, { color: theme.text }]}>{book.title}</Text>
          <Text style={[styles.pageHint, { color: theme.textSecondary }]}>
            Le contenu du livre arrive bientôt.
          </Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  pageHint: {
    fontSize: 13,
  },
  genreLabel: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 14,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
