import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MinTouchTarget, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChapterManagerProps } from '@/types/writing.types';

import { groupScenesByChapter } from '../../writing/chapter-grouping';
import { wordCount } from '../../writing/word-count';
import { ConfirmDialog } from '../shared/ConfirmDialog';

/** Gestion des chapitres du livre : titre, réordonnancement, suppression — les scènes s'y rattachent depuis leur fiche. */
export function ChapterManager({ chapters, scenes, onAdd, onUpdate, onDelete, onMove }: ChapterManagerProps) {
  const theme = useTheme();
  const [chapterIdToDelete, setChapterIdToDelete] = useState<string | null>(null);
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const chapterToDelete = sortedChapters.find((chapter) => chapter.id === chapterIdToDelete);
  const sceneGroups = groupScenesByChapter(scenes, chapters);

  const wordsInChapter = (chapterId: string): number =>
    (sceneGroups.find((group) => group.chapter?.id === chapterId)?.scenes ?? []).reduce(
      (total, scene) => total + wordCount(scene.content),
      0,
    );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>Chapitres</Text>
        <Pressable onPress={onAdd} style={styles.addButton}>
          <Plus size={12} color="#ffffff" />
          <Text style={styles.addButtonLabel}>Nouveau chapitre</Text>
        </Pressable>
      </View>

      {sortedChapters.length === 0 ? (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Aucun chapitre pour l'instant — les scènes restent groupées sous "Sans chapitre".
        </Text>
      ) : (
        sortedChapters.map((chapter, index) => (
          <View key={chapter.id} style={[styles.chapterRow, { borderBottomColor: theme.border }]}>
            <View style={styles.chapterTitleColumn}>
              <TextInput
                value={chapter.title}
                onChangeText={(v) => onUpdate(chapter.id, { title: v })}
                style={[styles.titleInput, { color: theme.text, borderColor: theme.border }]}
              />
              <Text style={[styles.wordCount, { color: theme.textSecondary }]}>{wordsInChapter(chapter.id)} mots</Text>
            </View>
            <View style={styles.chapterActions}>
              <Pressable onPress={() => onMove(chapter.id, -1)} disabled={index === 0} style={styles.actionButton}>
                <ChevronUp size={20} color={index === 0 ? theme.border : theme.textSecondary} />
              </Pressable>
              <Pressable
                onPress={() => onMove(chapter.id, 1)}
                disabled={index === sortedChapters.length - 1}
                style={styles.actionButton}
              >
                <ChevronDown size={20} color={index === sortedChapters.length - 1 ? theme.border : theme.textSecondary} />
              </Pressable>
              <Pressable onPress={() => setChapterIdToDelete(chapter.id)} style={styles.actionButton}>
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        ))
      )}

      <ConfirmDialog
        visible={chapterToDelete !== undefined}
        title="Supprimer ce chapitre ?"
        message={`« ${chapterToDelete?.title || 'Sans titre'} » sera supprimé. Ses scènes sont conservées, sans chapitre.`}
        onCancel={() => setChapterIdToDelete(null)}
        onConfirm={() => {
          if (chapterIdToDelete) onDelete(chapterIdToDelete);
          setChapterIdToDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.card,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  headerLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#0D9488',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    minHeight: MinTouchTarget,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingBottom: Spacing.two,
    marginBottom: Spacing.two,
  },
  chapterTitleColumn: {
    flex: 1,
    gap: 4,
  },
  titleInput: {
    fontSize: 13,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    minHeight: MinTouchTarget,
  },
  wordCount: {
    fontSize: 12,
  },
  chapterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
