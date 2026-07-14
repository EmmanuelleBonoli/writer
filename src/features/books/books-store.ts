import { create } from 'zustand';

import { mockBooks } from './mock-data';
import { EMPTY_BIBLE, type Book } from './types';

interface BooksState {
  books: Book[];
  addBook: (data: Omit<Book, 'id' | 'createdAt' | 'bible' | 'characters' | 'places'>) => Book;
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
