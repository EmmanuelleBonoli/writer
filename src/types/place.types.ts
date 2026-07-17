import type { Book } from './book.types';

export interface Place {
  id: string;
  name: string;
  description: string;
  function: string;
}

export interface PlacesSectionProps {
  book: Book;
  /** Lieu à ouvrir directement à l'arrivée sur l'onglet (ex. depuis un résultat de recherche). */
  focusPlaceId: string | null;
  onFocusConsumed: () => void;
}
