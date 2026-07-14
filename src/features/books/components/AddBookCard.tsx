import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

import { COVER_HEIGHT, COVER_WIDTH } from './BookCover';

interface AddBookCardProps {
  onPress?: () => void;
}

/** Carte flottante toujours visible pour démarrer un nouveau livre — même gabarit qu'une couverture, style neutre. */
export function AddBookCard({ onPress }: AddBookCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 120 }));
    onPress?.();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.card,
          pulseStyle,
          { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
        ]}
      >
        <Text style={[styles.plus, { color: theme.textSecondary }]}>+</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nouveau livre</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  plus: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
