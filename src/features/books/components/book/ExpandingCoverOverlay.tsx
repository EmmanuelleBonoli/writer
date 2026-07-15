import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExpandingCoverOverlayProps } from '@/types/book.types';

import { COVER_HEIGHT, COVER_WIDTH } from './BookCover';

const EXPAND_DURATION = 320;
const OPEN_DURATION = 380;
const CLOSE_DURATION = 280;
const COVER_ASPECT_RATIO = COVER_HEIGHT / COVER_WIDTH;
const OPEN_ANGLE_DEG = -150;

/**
 * Superposition plein écran réutilisable : une "couverture" s'agrandit depuis sa case d'origine
 * puis pivote comme si elle s'ouvrait, révélant une "page" derrière elle.
 */
export function ExpandingCoverOverlay({
  originRect,
  coverBackgroundColor,
  onClose,
  interactivePage = false,
  renderCover,
  pageContent,
}: ExpandingCoverOverlayProps) {
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

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
    backgroundColor: coverBackgroundColor,
    backfaceVisibility: 'hidden',
    transform: [{ perspective: 1200 }, { rotateY: `${rotateY.value}deg` }],
    transformOrigin: 'left',
  }));

  return (
    <Modal transparent visible animationType="none" onRequestClose={handleClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View
        style={[styles.page, pageStyle, { backgroundColor: theme.background }]}
        pointerEvents={interactivePage ? 'auto' : 'none'}
      >
        {pageContent}
      </Animated.View>

      <Animated.View style={[styles.cover, coverStyle]} pointerEvents="none">
        {renderCover({ widthValue: w, targetWidth })}
      </Animated.View>
    </Modal>
  );
}

// Ombre commune aux deux faces de l'overlay (page et couverture), portée plus marquée qu'une carte au repos.
const floatingShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
} as const;

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
    borderRadius: Radii.card,
    padding: 20,
    justifyContent: 'center',
    ...floatingShadow,
  },
  cover: {
    position: 'absolute',
    borderRadius: Radii.card,
    padding: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...floatingShadow,
  },
});
