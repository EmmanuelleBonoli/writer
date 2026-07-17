import type { Book } from './book.types';

export type SearchResultType = 'bible' | 'character' | 'place' | 'scene' | 'note' | 'timelineEvent';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  snippet: string;
}

export interface ReplaceInBookResult {
  book: Book;
  count: number;
}

export interface SearchOverlayProps {
  book: Book;
  onClose: () => void;
  onOpenBible: () => void;
  onOpenCharacter: (id: string) => void;
  onOpenPlace: (id: string) => void;
  onOpenScene: (id: string) => void;
  onOpenNote: (id: string) => void;
  onOpenTimelineEvent: (id: string) => void;
  /** Applique le livre déjà mis à jour par le rechercher-remplacer (voir `replaceInBook`). */
  onReplace: (book: Book) => void;
}
