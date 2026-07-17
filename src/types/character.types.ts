import type { Book } from './book.types';

export interface Character {
  id: string;
  name: string;
  age: string;
  appearance: string;
  psychology: string;
  arc: string;
  relations: string;
  voice: string;
}

export interface CharactersSectionProps {
  book: Book;
  /** Personnage à ouvrir directement à l'arrivée sur l'onglet (ex. depuis un résultat de recherche). */
  focusCharacterId: string | null;
  onFocusConsumed: () => void;
}
