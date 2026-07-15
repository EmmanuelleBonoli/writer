import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BibleSectionProps, BookBible, BookGenre } from '@/types/book.types';

import { useBooksStore } from '../../books-store';
import { GenreSelector } from '../book/GenreSelector';
import { LabeledField } from '../shared/LabeledField';

/** Bible du roman : titre, genre, ton, pitch, synopsis, thèmes, règles du monde. */
export function BibleSection({ book }: BibleSectionProps) {
  const theme = useTheme();
  const updateBook = useBooksStore((state) => state.updateBook);

  const setBibleField = (key: keyof BookBible, value: string) => {
    updateBook(book.id, (current) => ({ ...current, bible: { ...current.bible, [key]: value } }));
  };

  const setTitle = (value: string) => {
    updateBook(book.id, (current) => ({ ...current, title: value }));
  };

  const toggleGenre = (genre: BookGenre) => {
    updateBook(book.id, (current) => {
      const isSelected = current.genre.includes(genre);
      // Toujours garder au moins un genre : la couleur de couverture en dépend.
      if (isSelected && current.genre.length === 1) return current;
      return {
        ...current,
        genre: isSelected ? current.genre.filter((g) => g !== genre) : [...current.genre, genre],
      };
    });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <LabeledField label="Titre du roman" value={book.title} onChangeText={setTitle} />

      <View style={styles.genreField}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Genre</Text>
        <GenreSelector selectedGenres={book.genre} onToggle={toggleGenre} />
      </View>

      <LabeledField
        label="Ton"
        value={book.bible.tone}
        onChangeText={(v) => setBibleField('tone', v)}
        placeholder="ex : mélancolique, satirique…"
      />
      <LabeledField
        label="Pitch (1 paragraphe)"
        value={book.bible.pitch}
        onChangeText={(v) => setBibleField('pitch', v)}
        multiline
        numberOfLines={3}
      />
      <LabeledField
        label="Synopsis développé"
        value={book.bible.synopsis}
        onChangeText={(v) => setBibleField('synopsis', v)}
        multiline
        numberOfLines={6}
      />
      <LabeledField
        label="Thèmes explorés"
        value={book.bible.themes}
        onChangeText={(v) => setBibleField('themes', v)}
        placeholder="mort, filiation, vengeance…"
        multiline
        numberOfLines={2}
      />
      <LabeledField
        label="Règles du monde (optionnel)"
        value={book.bible.worldRules}
        onChangeText={(v) => setBibleField('worldRules', v)}
        multiline
        numberOfLines={4}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  genreField: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
});
