import { useRef } from 'react';
import type { View } from 'react-native';

import type { BookRect } from '@/types/book.types';

/**
 * Mesure la position/dimensions d'un élément dans la fenêtre au moment du tap, pour servir de point
 * de départ à l'animation d'ouverture (couverture de livre, carte "nouveau livre").
 */
export function useMeasureOnPress(onMeasured: (rect: BookRect) => void) {
  const ref = useRef<View>(null);

  const handlePress = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      onMeasured({ x, y, width, height });
    });
  };

  return { ref, handlePress };
}
