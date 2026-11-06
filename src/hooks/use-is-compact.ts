import { useWindowDimensions } from 'react-native';

// En dessous, le rail latéral et les grandes marges laissent trop peu de largeur au contenu : on bascule en affichage téléphone.
const COMPACT_MAX_WIDTH = 600;

/** Indique si la fenêtre est assez étroite pour utiliser l'affichage téléphone. */
export function useIsCompact(): boolean {
  const { width } = useWindowDimensions();
  return width < COMPACT_MAX_WIDTH;
}
