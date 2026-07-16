import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Book } from '@/types/book.types';

import { createMainArc, EMPTY_BIBLE } from './book-defaults';
import { createDebouncedAsyncStorage } from './local-storage';
import { mockBooks } from './mock-data';

interface BooksState {
  books: Book[];
  addBook: (data: Omit<Book, 'id' | 'createdAt' | 'bible' | 'characters' | 'places' | 'timeline' | 'arcs' | 'scenes'>) => Book;
  /** Ajoute un livre importé depuis une sauvegarde JSON (nouvel id pour éviter toute collision avec un livre existant). */
  importBook: (book: Book) => Book;
  deleteBook: (id: string) => void;
  updateBook: (id: string, updater: (book: Book) => Book) => void;
}

/** Source unique des livres de l'utilisateur, partagée entre l'étagère et les écrans de détail (routes séparées), persistée localement. */
export const useBooksStore = create<BooksState>()(
  persist(
    (set) => ({
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

      importBook: (book) => {
        const imported: Book = { ...book, id: `book_${Date.now()}` };
        set((state) => ({ books: [...state.books, imported] }));
        return imported;
      },

      deleteBook: (id) => {
        set((state) => ({ books: state.books.filter((book) => book.id !== id) }));
      },

      updateBook: (id, updater) => {
        set((state) => ({ books: state.books.map((book) => (book.id === id ? updater(book) : book)) }));
      },
    }),
    {
      name: 'writer-books-store',
      storage: createJSONStorage(() => createDebouncedAsyncStorage()),
      partialize: (state) => ({ books: state.books }),
    },
  ),
);
