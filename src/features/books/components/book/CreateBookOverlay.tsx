import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookGenre, CreateBookOverlayProps } from '@/types/book.types';

import { useBooksStore } from '../../books-store';
import { ExpandingCoverOverlay } from './ExpandingCoverOverlay';
import { GenreSelector } from './GenreSelector';

const CREATE_COVER_BACKGROUND = '#3A3550';

/** Superposition de création : la carte flottante s'ouvre sur un formulaire (titre + thèmes), puis navigue vers le livre créé. */
export function CreateBookOverlay({ originRect, onClose }: CreateBookOverlayProps) {
  const theme = useTheme();
  const router = useRouter();
  const addBook = useBooksStore((state) => state.addBook);
  const [title, setTitle] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<BookGenre[]>([]);

  const toggleGenre = (genre: BookGenre) => {
    setSelectedGenres((current) =>
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
    );
  };

  const canSubmit = title.trim().length > 0 && selectedGenres.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const book = addBook({ title: title.trim(), genre: selectedGenres });
    onClose();
    router.push({ pathname: '/book/[id]', params: { id: book.id } });
  };

  return (
    <ExpandingCoverOverlay
      originRect={originRect}
      coverBackgroundColor={CREATE_COVER_BACKGROUND}
      onClose={onClose}
      interactivePage
      renderCover={() => (
        <>
          <Plus size={32} color="#ffffff" strokeWidth={2} style={styles.coverPlus} />
          <Text style={styles.coverLabel}>Nouveau livre</Text>
        </>
      )}
      pageContent={
        <View style={styles.form}>
          <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Titre</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Le titre de votre roman"
            placeholderTextColor={theme.textSecondary}
            style={[styles.titleInput, { color: theme.text, borderColor: theme.border }]}
          />

          <Text style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>Thèmes</Text>
          <GenreSelector selectedGenres={selectedGenres} onToggle={toggleGenre} />

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitButton, { backgroundColor: canSubmit ? theme.text : theme.backgroundElement }]}
          >
            <Text style={[styles.submitLabel, { color: canSubmit ? theme.background : theme.textSecondary }]}>
              Créer le livre
            </Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  coverPlus: {
    marginBottom: Spacing.one,
  },
  coverLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  formLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  titleInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  submitButton: {
    marginTop: 'auto',
    borderRadius: Radii.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
