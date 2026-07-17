import type { Book } from './book.types';

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface NotesSectionProps {
  book: Book;
  /** Note à ouvrir directement à l'arrivée sur l'onglet (ex. depuis un résultat de recherche). */
  focusNoteId: string | null;
  onFocusConsumed: () => void;
}
