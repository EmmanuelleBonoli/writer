import type { Book } from '@/types/book.types';

import { createMainArc, EMPTY_BIBLE } from './book-defaults';

export const mockBooks: Book[] = [
  {
    id: 'book_1',
    title: 'Les Ombres de Val-Noir',
    genre: ['Fantasy'],
    createdAt: Date.now(),
    bible: EMPTY_BIBLE,
    characters: [],
    places: [],
    timeline: [],
    arcs: [createMainArc()],
    scenes: [],
  },
  {
    id: 'book_2',
    title: 'Le Dernier Témoin',
    genre: ['Polar'],
    createdAt: Date.now(),
    bible: EMPTY_BIBLE,
    characters: [],
    places: [],
    timeline: [],
    arcs: [createMainArc()],
    scenes: [],
  },
  {
    id: 'book_3',
    title: 'Rencontre à Val-Noir',
    genre: ['Romance', 'Fantasy'],
    createdAt: Date.now(),
    bible: EMPTY_BIBLE,
    characters: [],
    places: [],
    timeline: [],
    arcs: [createMainArc()],
    scenes: [],
  },
];
