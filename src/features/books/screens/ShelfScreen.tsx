import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/AppLogo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AddBookCard } from '../components/AddBookCard';
import { BookExpandedOverlay } from '../components/BookExpandedOverlay';
import { BooksList } from '../components/BooksList';
import { mockBooks } from '../mock-data';
import type { Book, BookRect } from '../types';

/** Écran d'accueil : liste des livres de l'utilisateur. */
export function ShelfScreen() {
  const theme = useTheme();
  const [books] = useState(mockBooks);
  const [openBook, setOpenBook] = useState<{ book: Book; rect: BookRect } | null>(null);

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

      <View style={styles.floatingAddButton} pointerEvents="box-none">
        <AddBookCard />
      </View>

      {openBook && (
        <BookExpandedOverlay
          book={openBook.book}
          originRect={openBook.rect}
          onClose={() => setOpenBook(null)}
        />
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
  floatingAddButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.four,
    alignItems: 'center',
  },
});
