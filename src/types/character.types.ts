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
}
