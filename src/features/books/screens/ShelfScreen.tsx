import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/AppLogo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Book, BookRect } from '@/types/book.types';

import { useBooksStore } from '../books-store';
import { AddBookCard } from '../components/book/AddBookCard';
import { BookExpandedOverlay } from '../components/book/BookExpandedOverlay';
import { BooksList } from '../components/book/BooksList';
import { CreateBookOverlay } from '../components/book/CreateBookOverlay';

/** Écran d'accueil : liste des livres de l'utilisateur. */
export function ShelfScreen() {
  const theme = useTheme();
  const router = useRouter();
  const books = useBooksStore((state) => state.books);
  const [openBook, setOpenBook] = useState<{ book: Book; rect: BookRect } | null>(null);
  const [createRect, setCreateRect] = useState<BookRect | null>(null);

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
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton} hitSlop={8}>
          <Settings size={22} color={theme.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.listContainer}>
        <BooksList books={books} onOpenBook={(book, rect) => setOpenBook({ book, rect })} />
      </View>

      <View style={styles.footer}>
        <AddBookCard onOpen={setCreateRect} />
      </View>

      {openBook && (
        <BookExpandedOverlay book={openBook.book} originRect={openBook.rect} onClose={() => setOpenBook(null)} />
      )}

      {createRect && <CreateBookOverlay originRect={createRect} onClose={() => setCreateRect(null)} />}
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
  settingsButton: {
    padding: Spacing.one,
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
