import { create } from 'zustand';

import type { Book } from '@/types/book.types';

import { createMainArc, EMPTY_BIBLE } from './book-defaults';
import { mockBooks } from './mock-data';

interface BooksState {
  books: Book[];
  addBook: (data: Omit<Book, 'id' | 'createdAt' | 'bible' | 'characters' | 'places' | 'timeline' | 'arcs' | 'scenes'>) => Book;
  deleteBook: (id: string) => void;
  updateBook: (id: string, updater: (book: Book) => Book) => void;
}

/** Source unique des livres de l'utilisateur, partagée entre l'étagère et les écrans de détail (routes séparées). */
export const useBooksStore = create<BooksState>((set) => ({
  books: mockBooks,

  addBook: (data) => {
    const book: Book = {
      ...data,
      id: `book_${Date.now()}`,
      createdAt: Date.now(),
      bible: EMPTY_BIBLE,
      characters: [],
      places: [],
      timeline: [],
      arcs: [createMainArc()],
      scenes: [],
    };
    set((state) => ({ books: [...state.books, book] }));
    return book;
  },

  deleteBook: (id) => {
    set((state) => ({ books: state.books.filter((book) => book.id !== id) }));
  },

  updateBook: (id, updater) => {
    set((state) => ({ books: state.books.map((book) => (book.id === id ? updater(book) : book)) }));
  },
}));
