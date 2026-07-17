import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Download, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/AppLogo';
import { showToast } from '@/components/toast/toast-store';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Book, BookRect } from '@/types/book.types';

import { useBooksStore } from '../books-store';
import { AddBookCard } from '../components/book/AddBookCard';
import { BookExpandedOverlay } from '../components/book/BookExpandedOverlay';
import { BooksList } from '../components/book/BooksList';
import { CreateBookOverlay } from '../components/book/CreateBookOverlay';
import { parseBookImport } from '../import-project';

const PROJECT_JSON_MIME_TYPE = 'application/json';

/** Écran d'accueil : liste des livres de l'utilisateur. */
export function ShelfScreen() {
  const theme = useTheme();
  const router = useRouter();
  const books = useBooksStore((state) => state.books);
  const importBook = useBooksStore((state) => state.importBook);
  const [openBook, setOpenBook] = useState<{ book: Book; rect: BookRect } | null>(null);
  const [createRect, setCreateRect] = useState<BookRect | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  /** Recharge un projet sauvegardé (fichier JSON) : crée un nouveau livre et l'ouvre directement. */
  const handleImportProject = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: PROJECT_JSON_MIME_TYPE });
    if (result.canceled) return;

    const asset = result.assets[0];
    setIsImporting(true);
    try {
      const text = asset.file ? await asset.file.text() : await new File(asset.uri).text();
      const book = parseBookImport(text);
      const imported = importBook(book);
      router.push({ pathname: '/book/[id]', params: { id: imported.id } });
    } catch (error) {
      console.error("Échec de l'import du projet :", error);
      showToast(`Import impossible : ${error instanceof Error ? error.message : "ce fichier n'a pas pu être chargé."}`);
    } finally {
      setIsImporting(false);
    }
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
        <Pressable onPress={handleImportProject} disabled={isImporting} style={styles.settingsButton} hitSlop={8}>
          {isImporting ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <Download size={22} color={theme.textSecondary} />
          )}
        </Pressable>
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
