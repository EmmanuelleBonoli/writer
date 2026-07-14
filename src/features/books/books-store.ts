import { create } from 'zustand';

import { mockBooks } from './mock-data';
import type { Book } from './types';

interface BooksState {
  books: Book[];
  addBook: (data: Omit<Book, 'id' | 'createdAt'>) => Book;
  deleteBook: (id: string) => void;
}

/** Source unique des livres de l'utilisateur, partagée entre l'étagère et les écrans de détail (routes séparées). */
export const useBooksStore = create<BooksState>((set) => ({
  books: mockBooks,

  addBook: (data) => {
    const book: Book = { ...data, id: `book_${Date.now()}`, createdAt: Date.now() };
    set((state) => ({ books: [...state.books, book] }));
    return book;
  },

  deleteBook: (id) => {
    set((state) => ({ books: state.books.filter((book) => book.id !== id) }));
  },
}));
