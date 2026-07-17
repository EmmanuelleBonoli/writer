import type { Book } from './book.types';

export interface Chapter {
  id: string;
  title: string;
  /** Ordre des chapitres entre eux (l'ordre des scènes se lit, lui, au sein de son chapitre). */
  order: number;
}

export interface Scene {
  id: string;
  title: string;
  /** Ordre de la scène au sein de son chapitre (ou parmi les scènes sans chapitre). */
  order: number;
  content: string;
  characterIds: string[];
  placeIds: string[];
  /** Événement de la timeline auquel cette scène correspond (null = non reliée). */
  timelineEventId: string | null;
  /** Chapitre auquel cette scène appartient (null = pas encore rangée dans un chapitre). */
  chapterId: string | null;
}

export interface WritingSectionProps {
  book: Book;
  /** Scène à ouvrir directement à l'arrivée sur l'onglet (ex. depuis l'icône "scène rédigée" de la Timeline). */
  focusSceneId: string | null;
  onFocusConsumed: () => void;
}

export interface ChapterManagerProps {
  chapters: Chapter[];
  /** Scènes du livre, pour afficher le nombre de mots total de chaque chapitre. */
  scenes: Scene[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Chapter>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}
