import type { Book } from '@/types/book.types';

import { MAIN_ARC_ID } from './book-defaults';

/**
 * Nettoie silencieusement les références vers des personnages/lieux/événements/arcs supprimés depuis
 * (ex. un personnage tagué dans une scène, puis supprimé de la fiche Personnages). Appelé automatiquement
 * à chaque mutation du livre — aucune action ni confirmation de l'utilisateur nécessaire.
 */
export function sanitizeBook(book: Book): Book {
  const characterIds = new Set(book.characters.map((c) => c.id));
  const placeIds = new Set(book.places.map((p) => p.id));
  const eventIds = new Set(book.timeline.map((e) => e.id));
  const arcIds = new Set(book.arcs.map((a) => a.id));

  const scenes = book.scenes.map((scene) => ({
    ...scene,
    characterIds: scene.characterIds.filter((id) => characterIds.has(id)),
    placeIds: scene.placeIds.filter((id) => placeIds.has(id)),
    timelineEventId: scene.timelineEventId && eventIds.has(scene.timelineEventId) ? scene.timelineEventId : null,
  }));

  const timeline = book.timeline.map((event) => ({
    ...event,
    characterIds: event.characterIds.filter((id) => characterIds.has(id)),
    placeId: event.placeId && placeIds.has(event.placeId) ? event.placeId : '',
    arcId: event.arcId && arcIds.has(event.arcId) ? event.arcId : MAIN_ARC_ID,
  }));

  return { ...book, scenes, timeline };
}
