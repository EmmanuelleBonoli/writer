import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useGenreColor } from '../genre-colors';
import type { Book, BookGenre, BookRect } from '../types';
import { ExpandingCoverOverlay } from './ExpandingCoverOverlay';

interface CreateBookOverlayProps {
  originRect: BookRect;
  onClose: () => void;
  onCreate: (book: Omit<Book, 'id' | 'createdAt'>) => void;
}

const ALL_GENRES: BookGenre[] = ['Roman', 'Fantasy', 'Polar', 'Romance', 'Science-fiction', 'Historique'];

// Couleur neutre de la couverture "vierge" : le genre n'est pas encore choisi, donc pas de couleur de genre.
const CREATE_COVER_BACKGROUND = '#3A3550';

export function CreateBookOverlay({ originRect, onClose, onCreate }: CreateBookOverlayProps) {
  const theme = useTheme();
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
    onCreate({ title: title.trim(), genre: selectedGenres });
    onClose();
  };

  return (
    <ExpandingCoverOverlay
      originRect={originRect}
      coverBackgroundColor={CREATE_COVER_BACKGROUND}
      onClose={onClose}
      interactivePage
      renderCover={() => (
        <>
          <Text style={styles.coverPlus}>+</Text>
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
            style={[styles.titleInput, { color: theme.text, borderColor: theme.backgroundElement }]}
          />

          <Text style={[styles.formLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>Thèmes</Text>
          <View style={styles.genreChips}>
            {ALL_GENRES.map((genre) => (
              <GenreChip key={genre} genre={genre} selected={selectedGenres.includes(genre)} onToggle={() => toggleGenre(genre)} />
            ))}
          </View>

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

interface GenreChipProps {
  genre: BookGenre;
  selected: boolean;
  onToggle: () => void;
}

function GenreChip({ genre, selected, onToggle }: GenreChipProps) {
  const color = useGenreColor(genre);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.chip, { borderColor: color, backgroundColor: selected ? color : 'transparent' }]}
    >
      <Text style={[styles.chipLabel, { color: selected ? '#ffffff' : color }]}>{genre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  coverPlus: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '300',
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
  genreChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
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
