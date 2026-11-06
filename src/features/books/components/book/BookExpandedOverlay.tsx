import { useRouter } from 'expo-router';
import { BookOpen, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookExpandedOverlayProps, CoverFaceProps } from '@/types/book.types';

import { useBooksStore } from '../../books-store';
import { useGenreColor } from '../../genre-colors';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { ExpandingCoverOverlay } from './ExpandingCoverOverlay';
import { GenreStripe } from './GenreStripe';

/** Contenu affiché sur la couverture pendant qu'elle s'agrandit : le titre grossit en phase avec la largeur animée. */
function CoverFace({ book, originWidth, targetWidth, widthValue }: CoverFaceProps) {
  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(widthValue.value, [originWidth, targetWidth], [15, 17], Extrapolation.CLAMP),
    lineHeight: interpolate(widthValue.value, [originWidth, targetWidth], [19, 21], Extrapolation.CLAMP),
  }));

  return (
    <>
      <GenreStripe genres={book.genre} />
      <Text style={styles.genreLabel} numberOfLines={2}>
        {book.genre.join(' · ')}
      </Text>
      <Animated.Text style={[styles.coverTitle, titleStyle]} numberOfLines={5}>
        {book.title}
      </Animated.Text>
    </>
  );
}

/** Superposition d'un livre existant : la couverture s'ouvre sur un aperçu, avec un bouton pour aller au détail et un pour supprimer. */
export function BookExpandedOverlay({ book, originRect, onClose }: BookExpandedOverlayProps) {
  const theme = useTheme();
  const router = useRouter();
  const deleteBook = useBooksStore((state) => state.deleteBook);
  const spineColor = useGenreColor(book.genre[0]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleOpen = () => {
    onClose();
    router.push({ pathname: '/book/[id]', params: { id: book.id } });
  };

  const handleConfirmDelete = () => {
    deleteBook(book.id);
    onClose();
  };

  return (
    <>
      <ExpandingCoverOverlay
        originRect={originRect}
        coverBackgroundColor={spineColor}
        onClose={onClose}
        interactivePage
        renderCover={({ widthValue, targetWidth }) => (
          <CoverFace book={book} originWidth={originRect.width} targetWidth={targetWidth} widthValue={widthValue} />
        )}
        pageContent={
          <View style={styles.pageBody}>
            <Pressable onPress={() => setConfirmingDelete(true)} style={styles.deleteButton} hitSlop={10}>
              <Trash2 size={16} color="#EF4444" />
            </Pressable>

            <Text style={[styles.pageTitle, { color: theme.text }]}>{book.title}</Text>

            {/* Défilable : un long pitch déborderait sinon sur le bouton d'ouverture. */}
            <ScrollView style={styles.pitchScroll} contentContainerStyle={styles.pitchContainer}>
              {book.bible.pitch ? (
                <Text style={[styles.pitchText, { color: theme.text }]}>{book.bible.pitch}</Text>
              ) : (
                <Text style={[styles.pitchEmpty, { color: theme.textSecondary }]}>Aucun pitch pour l'instant.</Text>
              )}
            </ScrollView>

            <Pressable onPress={handleOpen} style={[styles.openButton, { backgroundColor: theme.text }]}>
              <BookOpen size={16} color={theme.background} />
              <Text style={[styles.openLabel, { color: theme.background }]}>Ouvrir le livre</Text>
            </Pressable>
          </View>
        }
      />

      <ConfirmDialog
        visible={confirmingDelete}
        title="Supprimer ce livre ?"
        message={`« ${book.title} » sera définitivement supprimé.`}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pageBody: {
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.two,
    zIndex: 1,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.two,
    paddingRight: Spacing.five,
  },
  pitchScroll: {
    flex: 1,
    marginBottom: Spacing.two,
  },
  pitchContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchText: {
    fontSize: 15,
    lineHeight: 21,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pitchEmpty: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  openButton: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Radii.card,
    paddingVertical: Spacing.three,
  },
  openLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  genreLabel: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 14,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
