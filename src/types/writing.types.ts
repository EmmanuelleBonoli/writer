import type { Book } from './book.types';

export interface Scene {
  id: string;
  title: string;
  order: number;
  content: string;
  characterIds: string[];
  placeIds: string[];
  /** Événement de la timeline auquel cette scène correspond (null = non reliée). */
  timelineEventId: string | null;
}

export interface WritingSectionProps {
  book: Book;
  /** Scène à ouvrir directement à l'arrivée sur l'onglet (ex. depuis l'icône "scène rédigée" de la Timeline). */
  focusSceneId: string | null;
  onFocusConsumed: () => void;
}
