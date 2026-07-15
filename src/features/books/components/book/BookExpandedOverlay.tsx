import { useRouter } from 'expo-router';
import { BookOpen, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BookExpandedOverlayProps, CoverFaceProps } from '@/types/book.types';

import { useBooksStore } from '../../books-store';
import { useGenreColor } from '../../genre-colors';
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

            <View style={styles.pitchContainer}>
              {book.bible.pitch ? (
                <Text style={[styles.pitchText, { color: theme.text }]}>{book.bible.pitch}</Text>
              ) : (
                <Text style={[styles.pitchEmpty, { color: theme.textSecondary }]}>Aucun pitch pour l'instant.</Text>
              )}
            </View>

            <Pressable onPress={handleOpen} style={[styles.openButton, { backgroundColor: theme.text }]}>
              <BookOpen size={16} color={theme.background} />
              <Text style={[styles.openLabel, { color: theme.background }]}>Ouvrir le livre</Text>
            </Pressable>
          </View>
        }
      />

      <Modal transparent visible={confirmingDelete} animationType="fade" onRequestClose={() => setConfirmingDelete(false)}>
        <Pressable style={styles.confirmBackdrop} onPress={() => setConfirmingDelete(false)}>
          <Pressable style={[styles.confirmCard, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>Supprimer ce livre ?</Text>
            <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
              « {book.title} » sera définitivement supprimé.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setConfirmingDelete(false)} style={styles.confirmCancel}>
                <Text style={[styles.confirmCancelLabel, { color: theme.text }]}>Annuler</Text>
              </Pressable>
              <Pressable onPress={handleConfirmDelete} style={styles.confirmDelete}>
                <Text style={styles.confirmDeleteLabel}>Supprimer</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  pitchContainer: {
    flex: 1,
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
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radii.card,
    padding: Spacing.four,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  confirmMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  confirmCancel: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  confirmCancelLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDelete: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.card,
    backgroundColor: '#EF4444',
  },
  confirmDeleteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
