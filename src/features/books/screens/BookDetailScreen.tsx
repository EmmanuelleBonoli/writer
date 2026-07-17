import { useRouter } from 'expo-router';
import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookDetailScreenProps, BookSectionId } from '@/types/book.types';

import { BOOK_SECTIONS } from '../book-sections';
import { useBooksStore } from '../books-store';
import { sanitizeBook } from '../sanitize-book';
import { BibleSection } from '../components/bible/BibleSection';
import { BookDetailMenu, RAIL_BACKGROUND } from '../components/book/BookDetailMenu';
import { CharactersSection } from '../components/characters/CharactersSection';
import { ExportSection } from '../components/export/ExportSection';
import { NotesSection } from '../components/notes/NotesSection';
import { PlacesSection } from '../components/places/PlacesSection';
import { SearchOverlay } from '../components/search/SearchOverlay';
import { TimelineSection } from '../components/timeline/TimelineSection';
import { WritingSection } from '../components/writing/WritingSection';

/** Écran de détail d'un livre : rail de navigation vers ses différents éléments (Bible, Personnages, Lieux...). */
export function BookDetailScreen({ bookId }: BookDetailScreenProps) {
  const theme = useTheme();
  const router = useRouter();
  const book = useBooksStore((state) => state.books.find((b) => b.id === bookId));
  const updateBook = useBooksStore((state) => state.updateBook);
  const [activeSection, setActiveSection] = useState<BookSectionId>('bible');
  const [menuOpen, setMenuOpen] = useState(true);
  // Scène à ouvrir directement à l'arrivée sur l'onglet Rédaction (déclenché depuis l'icône "scène liée" de la Timeline).
  const [focusSceneId, setFocusSceneId] = useState<string | null>(null);
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);
  const [focusCharacterId, setFocusCharacterId] = useState<string | null>(null);
  const [focusPlaceId, setFocusPlaceId] = useState<string | null>(null);
  const [focusEventId, setFocusEventId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSelectSection = (id: BookSectionId) => {
    setSearchOpen(false);
    setActiveSection(id);
  };

  const openScene = (sceneId: string) => {
    setFocusSceneId(sceneId);
    setActiveSection('writing');
  };

  const openCharacter = (characterId: string) => {
    setFocusCharacterId(characterId);
    setActiveSection('characters');
  };

  const openPlace = (placeId: string) => {
    setFocusPlaceId(placeId);
    setActiveSection('places');
  };

  const openNote = (noteId: string) => {
    setFocusNoteId(noteId);
    setActiveSection('notes');
  };

  const openTimelineEvent = (eventId: string) => {
    setFocusEventId(eventId);
    setActiveSection('timeline');
  };

  // Livre introuvable (id invalide, ou store réinitialisé après un rechargement web) : retour à l'étagère.
  useEffect(() => {
    if (!book) {
      router.replace('/');
    }
  }, [book, router]);

  // Nettoie une bonne fois les références cassées d'un livre déjà sauvegardé avant l'ajout de ce garde-fou
  useEffect(() => {
    if (!book) return;
    const sanitized = sanitizeBook(book);
    if (JSON.stringify(sanitized) !== JSON.stringify(book)) {
      updateBook(book.id, () => sanitized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  const section = BOOK_SECTIONS.find((s) => s.id === activeSection) ?? BOOK_SECTIONS[0];

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.missingText, { color: theme.textSecondary }]}>Livre introuvable.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.body}>
        {menuOpen && (
          <BookDetailMenu
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onBack={() => router.replace('/')}
            onSearch={() => setSearchOpen(true)}
            searchActive={searchOpen}
          />
        )}

        <View style={styles.content}>
          {searchOpen ? (
            <SearchOverlay
              book={book}
              onClose={() => setSearchOpen(false)}
              onOpenBible={() => setActiveSection('bible')}
              onOpenCharacter={openCharacter}
              onOpenPlace={openPlace}
              onOpenScene={openScene}
              onOpenNote={openNote}
              onOpenTimelineEvent={openTimelineEvent}
              onReplace={(updatedBook) => updateBook(book.id, () => updatedBook)}
            />
          ) : (
            <>
              <View style={[styles.sectionAccent, { backgroundColor: section.color }]} />
              <Text style={[styles.genre, { color: theme.textSecondary }]}>{book.genre.join(' · ')}</Text>
              <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>

              <Text style={[styles.sectionLabel, { color: theme.text }]}>{section.label}</Text>

              {activeSection === 'bible' && <BibleSection book={book} />}
              {activeSection === 'characters' && (
                <CharactersSection
                  book={book}
                  focusCharacterId={focusCharacterId}
                  onFocusConsumed={() => setFocusCharacterId(null)}
                />
              )}
              {activeSection === 'places' && (
                <PlacesSection book={book} focusPlaceId={focusPlaceId} onFocusConsumed={() => setFocusPlaceId(null)} />
              )}
              {activeSection === 'timeline' && (
                <TimelineSection
                  book={book}
                  onOpenScene={openScene}
                  focusEventId={focusEventId}
                  onFocusConsumed={() => setFocusEventId(null)}
                />
              )}
              {activeSection === 'writing' && (
                <WritingSection book={book} focusSceneId={focusSceneId} onFocusConsumed={() => setFocusSceneId(null)} />
              )}
              {activeSection === 'notes' && (
                <NotesSection book={book} focusNoteId={focusNoteId} onFocusConsumed={() => setFocusNoteId(null)} />
              )}
              {activeSection === 'export' && <ExportSection book={book} />}
            </>
          )}
        </View>

        <Pressable onPress={() => setMenuOpen((open) => !open)} style={styles.menuToggle} hitSlop={8}>
          {menuOpen ? <PanelLeftClose size={18} color="#ffffff" /> : <PanelLeftOpen size={18} color="#ffffff" />}
        </Pressable>

        <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton} hitSlop={8}>
          <Settings size={18} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  menuToggle: {
    position: 'absolute',
    top: Spacing.three,
    left: 18,
    width: 36,
    height: 36,
    borderRadius: Radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RAIL_BACKGROUND,
  },
  settingsButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: Radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RAIL_BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.six,
  },
  sectionAccent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.three,
  },
  genre: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: Spacing.half,
    marginBottom: Spacing.five,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  sectionPlaceholder: {
    fontSize: 14,
    lineHeight: 20,
  },
  missingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
