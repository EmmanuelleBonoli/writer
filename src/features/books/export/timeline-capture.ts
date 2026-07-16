import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Capture la couche `TimelineCaptureLayer` montée hors-écran en PNG base64, pour l'insertion dans le document Word. */
export async function captureTimelineImage(ref: RefObject<View | null>): Promise<string> {
  return captureRef(ref, { format: 'png', result: 'base64' });
}
