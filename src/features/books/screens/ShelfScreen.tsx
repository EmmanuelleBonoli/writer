import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/AppLogo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AddBookCard } from '../components/AddBookCard';
import { BookExpandedOverlay } from '../components/BookExpandedOverlay';
import { BooksList } from '../components/BooksList';
import { CreateBookOverlay } from '../components/CreateBookOverlay';
import { mockBooks } from '../mock-data';
import type { Book, BookRect } from '../types';

/** Écran d'accueil : liste des livres de l'utilisateur. */
export function ShelfScreen() {
  const theme = useTheme();
  const [books, setBooks] = useState(mockBooks);
  const [openBook, setOpenBook] = useState<{ book: Book; rect: BookRect } | null>(null);
  const [createRect, setCreateRect] = useState<BookRect | null>(null);

  const handleCreateBook = (data: Omit<Book, 'id' | 'createdAt'>) => {
    setBooks((current) => [...current, { ...data, id: `book_${Date.now()}`, createdAt: Date.now() }]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <AppLogo />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>L'étagère</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Chaque roman est un projet indépendant.
          </Text>
        </View>
      </View>
      <View style={styles.listContainer}>
        <BooksList books={books} onOpenBook={(book, rect) => setOpenBook({ book, rect })} />
      </View>

      <View style={styles.footer}>
        <AddBookCard onOpen={setCreateRect} />
      </View>

      {openBook && (
        <BookExpandedOverlay
          book={openBook.book}
          originRect={openBook.rect}
          onClose={() => setOpenBook(null)}
        />
      )}

      {createRect && (
        <CreateBookOverlay originRect={createRect} onClose={() => setCreateRect(null)} onCreate={handleCreateBook} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
