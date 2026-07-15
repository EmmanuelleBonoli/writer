import type { Book } from './book.types';

export interface Place {
  id: string;
  name: string;
  description: string;
  function: string;
}

export interface PlacesSectionProps {
  book: Book;
}
