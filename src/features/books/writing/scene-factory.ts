import type { TimelineEvent } from '@/types/timeline.types';
import type { Scene } from '@/types/writing.types';

import { withAlineaIndent } from './text-formatting';

export function createScene(order: number): Scene {
  return {
    id: `scene_${Date.now()}`,
    title: `Scène ${order + 1}`,
    order,
    content: '',
    characterIds: [],
    placeIds: [],
    timelineEventId: null,
  };
}

/** Crée une scène déjà reliée à un événement, entièrement préremplie depuis ses données (rien à préserver, la scène n'existait pas). */
export function createSceneFromEvent(order: number, event: TimelineEvent): Scene {
  return {
    id: `scene_${Date.now()}`,
    title: event.title || `Scène ${order + 1}`,
    order,
    content: event.description ? withAlineaIndent(event.description) : '',
    characterIds: event.characterIds,
    placeIds: event.placeId ? [event.placeId] : [],
    timelineEventId: event.id,
  };
}

/**
 * Complète les champs vides d'une scène existante avec les données de l'événement relié — ne touche
 * jamais un champ déjà renseigné, pour ne jamais écraser du texte déjà rédigé en cas de (re)liaison.
 */
export function applyEventToScene(scene: Scene, event: TimelineEvent): Partial<Scene> {
  const patch: Partial<Scene> = {};
  if (!scene.title.trim()) patch.title = event.title;
  if (!scene.content.trim() && event.description) patch.content = withAlineaIndent(event.description);
  if (scene.characterIds.length === 0 && event.characterIds.length > 0) patch.characterIds = event.characterIds;
  if (scene.placeIds.length === 0 && event.placeId) patch.placeIds = [event.placeId];
  return patch;
}
