import { useRouter } from 'expo-router';
import { PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { BOOK_SECTIONS, type BookSectionId } from '../book-sections';
import { useBooksStore } from '../books-store';
import { BibleSection } from '../components/BibleSection';
import { BookDetailMenu, RAIL_BACKGROUND } from '../components/BookDetailMenu';
import { CharactersSection } from '../components/CharactersSection';
import { PlacesSection } from '../components/PlacesSection';

interface BookDetailScreenProps {
  bookId: string;
}

/** Écran de détail d'un livre : rail de navigation vers ses différents éléments (Bible, Personnages, Lieux...). */
export function BookDetailScreen({ bookId }: BookDetailScreenProps) {
  const theme = useTheme();
  const router = useRouter();
  const book = useBooksStore((state) => state.books.find((b) => b.id === bookId));
  const [activeSection, setActiveSection] = useState<BookSectionId>('bible');
  const [menuOpen, setMenuOpen] = useState(true);

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
          <BookDetailMenu activeSection={activeSection} onSelectSection={setActiveSection} onBack={() => router.back()} />
        )}

        <View style={styles.content}>
          <View style={[styles.sectionAccent, { backgroundColor: section.color }]} />
          <Text style={[styles.genre, { color: theme.textSecondary }]}>{book.genre.join(' · ')}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>

          <Text style={[styles.sectionLabel, { color: theme.text }]}>{section.label}</Text>

          {activeSection === 'bible' && <BibleSection book={book} />}
          {activeSection === 'characters' && <CharactersSection book={book} />}
          {activeSection === 'places' && <PlacesSection book={book} />}
          {(activeSection === 'timeline' || activeSection === 'writing') && (
            <Text style={[styles.sectionPlaceholder, { color: theme.textSecondary }]}>{section.placeholder}</Text>
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
