import { ScrollView, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { Book, BookRect } from '../types';
import { BookCover } from './BookCover';

interface BooksListProps {
  books: Book[];
  onOpenBook: (book: Book, rect: BookRect) => void;
}

/** Grille de couvertures de livres, avec état vide dédié. */
export function BooksList({ books, onOpenBook }: BooksListProps) {
  const theme = useTheme();

  if (books.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Aucun livre pour l'instant. Créez votre premier projet pour commencer.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {books.map((book) => (
        <BookCover key={book.id} book={book} onOpen={onOpenBook} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
