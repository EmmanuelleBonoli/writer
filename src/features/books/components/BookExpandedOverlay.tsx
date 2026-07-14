import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

import { useGenreColor } from '../genre-colors';
import type { Book, BookRect } from '../types';
import { COVER_HEIGHT, COVER_WIDTH } from './BookCover';
import { GenreStripe } from './GenreStripe';

interface BookExpandedOverlayProps {
  book: Book;
  originRect: BookRect;
  onClose: () => void;
}

const EXPAND_DURATION = 320;
const OPEN_DURATION = 380;
const CLOSE_DURATION = 280;
const COVER_ASPECT_RATIO = COVER_HEIGHT / COVER_WIDTH;
const OPEN_ANGLE_DEG = -150;

/** Superposition plein écran : la couverture s'agrandit depuis sa case puis pivote comme si elle s'ouvrait. */
export function BookExpandedOverlay({ book, originRect, onClose }: BookExpandedOverlayProps) {
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const spineColor = useGenreColor(book.genre[0]);

  const targetWidth = Math.min(280, windowWidth * 0.62);
  const targetHeight = targetWidth * COVER_ASPECT_RATIO;
  const targetX = (windowWidth - targetWidth) / 2;
  const targetY = (windowHeight - targetHeight) / 2;

  const x = useSharedValue(originRect.x);
  const y = useSharedValue(originRect.y);
  const w = useSharedValue(originRect.width);
  const h = useSharedValue(originRect.height);
  const rotateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(targetX, { duration: EXPAND_DURATION });
    y.value = withTiming(targetY, { duration: EXPAND_DURATION });
    w.value = withTiming(targetWidth, { duration: EXPAND_DURATION });
    h.value = withTiming(targetHeight, { duration: EXPAND_DURATION }, (finished) => {
      if (finished) {
        rotateY.value = withTiming(OPEN_ANGLE_DEG, { duration: OPEN_DURATION });
      }
    });
    backdropOpacity.value = withTiming(0.65, { duration: EXPAND_DURATION });
  }, []);

  const handleClose = () => {
    rotateY.value = withTiming(0, { duration: CLOSE_DURATION }, (finished) => {
      if (finished) {
        x.value = withTiming(originRect.x, { duration: CLOSE_DURATION });
        y.value = withTiming(originRect.y, { duration: CLOSE_DURATION });
        w.value = withTiming(originRect.width, { duration: CLOSE_DURATION });
        h.value = withTiming(originRect.height, { duration: CLOSE_DURATION }, (finished2) => {
          if (finished2) {
            runOnJS(onClose)();
          }
        });
      }
    });
    backdropOpacity.value = withTiming(0, { duration: CLOSE_DURATION });
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const pageStyle = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
  }));

  const coverStyle = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
    backgroundColor: spineColor,
    backfaceVisibility: 'hidden',
    transform: [{ perspective: 1200 }, { rotateY: `${rotateY.value}deg` }],
    transformOrigin: 'left',
  }));

  const coverTitleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(w.value, [originRect.width, targetWidth], [15, 17], Extrapolation.CLAMP),
    lineHeight: interpolate(w.value, [originRect.width, targetWidth], [19, 21], Extrapolation.CLAMP),
  }));

  return (
    <Modal transparent visible animationType="none" onRequestClose={handleClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View
        style={[styles.page, pageStyle, { backgroundColor: theme.background }]}
        pointerEvents="none"
      >
        <Text style={[styles.pageTitle, { color: theme.text }]}>{book.title}</Text>
        <Text style={[styles.pageHint, { color: theme.textSecondary }]}>
          Le contenu du livre arrive bientôt.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.cover, coverStyle]} pointerEvents="none">
        <GenreStripe genres={book.genre} />

        <Text style={styles.genreLabel} numberOfLines={2}>
          {book.genre.join(' · ')}
        </Text>
        <Animated.Text style={[styles.coverTitle, coverTitleStyle]} numberOfLines={5}>
          {book.title}
        </Animated.Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  page: {
    position: 'absolute',
    borderRadius: 8,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  pageHint: {
    fontSize: 13,
  },
  cover: {
    position: 'absolute',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
