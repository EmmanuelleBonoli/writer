import type { Book, BookSectionId } from './book.types';

export type ExportFormat = 'pdf' | 'word';

export type ExportableSectionId = Exclude<BookSectionId, 'export'>;

export interface ExportSectionProps {
  book: Book;
}
