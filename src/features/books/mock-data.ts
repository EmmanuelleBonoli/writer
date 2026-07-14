import type { Book } from './types';

export const mockBooks: Book[] = [
  {
    id: 'book_1',
    title: 'Les Ombres de Val-Noir',
    genre: ['Fantasy'],
    createdAt: Date.now(),
  },
  {
    id: 'book_2',
    title: 'Le Dernier Témoin',
    genre: ['Polar'],
    createdAt: Date.now(),
  },
  {
    id: 'book_3',
    title: 'Rencontre à Val-Noir',
    genre: ['Romance', 'Fantasy'],
    createdAt: Date.now(),
  },
];