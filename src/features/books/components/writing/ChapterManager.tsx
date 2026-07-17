import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChapterManagerProps } from '@/types/writing.types';

import { groupScenesByChapter } from '../../writing/chapter-grouping';
import { wordCount } from '../../writing/word-count';

/** Gestion des chapitres du livre : titre, réordonnancement, suppression — les scènes s'y rattachent depuis leur fiche. */
export function ChapterManager({ chapters, scenes, onAdd, onUpdate, onDelete, onMove }: ChapterManagerProps) {
  const theme = useTheme();
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
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
              <Pressable onPress={() => onMove(chapter.id, -1)} disabled={index === 0} hitSlop={6}>
                <ChevronUp size={16} color={index === 0 ? theme.border : theme.textSecondary} />
              </Pressable>
              <Pressable onPress={() => onMove(chapter.id, 1)} disabled={index === sortedChapters.length - 1} hitSlop={6}>
                <ChevronDown size={16} color={index === sortedChapters.length - 1 ? theme.border : theme.textSecondary} />
              </Pressable>
              <Pressable onPress={() => onDelete(chapter.id)} hitSlop={6}>
                <Trash2 size={14} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        ))
      )}
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
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontSize: 11,
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
  },
  wordCount: {
    fontSize: 11,
  },
  chapterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
