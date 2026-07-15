import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AddBookCardProps } from '@/types/book.types';

import { useMeasureOnPress } from '../../hooks/use-measure-on-press';
import { COVER_HEIGHT, COVER_WIDTH } from './BookCover';

/** Carte flottante toujours visible pour démarrer un nouveau livre */
export function AddBookCard({ onOpen }: AddBookCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const { ref, handlePress: measureAndOpen } = useMeasureOnPress(onOpen);

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 120 }));
    measureAndOpen();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <View ref={ref} collapsable={false}>
        <Animated.View
          style={[
            styles.card,
            pulseStyle,
            { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
          ]}
        >
          <Plus size={28} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>Nouveau livre</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: Radii.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
