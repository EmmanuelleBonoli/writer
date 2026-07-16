import { forwardRef } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface TimelineCaptureLayerProps {
  svgMarkup: string;
  width: number;
  height: number;
}

/**
 * Rendu hors-écran du SVG statique de la timeline, dans une View de taille fixe (pas de `ScrollView`,
 * pas de clipping) : condition nécessaire pour que la capture en image (utilisée dans l'export Word)
 * soit fidèle, contrairement à une capture du graphe interactif scrollable.
 * `collapsable={false}` évite qu'Android optimise cette vue hors de l'arbre natif avant la capture.
 */
export const TimelineCaptureLayer = forwardRef<View, TimelineCaptureLayerProps>(
  ({ svgMarkup, width, height }, ref) => (
    <View ref={ref} collapsable={false} style={{ position: 'absolute', left: -99999, top: 0, width, height }}>
      <SvgXml xml={svgMarkup} width={width} height={height} />
    </View>
  ),
);
TimelineCaptureLayer.displayName = 'TimelineCaptureLayer';
