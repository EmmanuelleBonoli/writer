import { ArrowLeft, ChevronDown, ChevronUp, Repeat, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SearchOverlayProps, SearchResult, SearchResultType } from '@/types/search.types';

import { replaceInBook, searchBook } from '../../search-book';

const ACCENT_COLOR = '#22D3EE';

// Même ordre que le rail de navigation : Bible, Personnages, Lieux, Timeline, Rédaction, Notes.
const RESULT_TYPE_ORDER: SearchResultType[] = ['bible', 'character', 'place', 'timelineEvent', 'scene', 'note'];

const TYPE_LABELS: Record<SearchResultType, string> = {
  bible: 'Bible',
  character: 'Personnages',
  place: 'Lieux',
  scene: 'Scènes',
  note: 'Notes',
  timelineEvent: 'Timeline',
};

/** Recherche dans tout le livre, affichée dans la même zone de contenu que les autres sections (le rail reste visible) — résultats groupés par type, un tap ouvre directement la fiche. */
export function SearchOverlay({
  book,
  onClose,
  onOpenBible,
  onOpenCharacter,
  onOpenPlace,
  onOpenScene,
  onOpenNote,
  onOpenTimelineEvent,
  onReplace,
}: SearchOverlayProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [replaceWith, setReplaceWith] = useState('');
  const [replaceMessage, setReplaceMessage] = useState<string | null>(null);
  const results = searchBook(book, query);
  const occurrenceCount = query.trim() ? replaceInBook(book, query, replaceWith).count : 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setReplaceMessage(null);
  };

  const handleReplaceWithChange = (value: string) => {
    setReplaceWith(value);
    setReplaceMessage(null);
  };

  const handleReplaceAll = () => {
    const result = replaceInBook(book, query, replaceWith);
    onReplace(result.book);
    setReplaceMessage(`${result.count} remplacement${result.count > 1 ? 's' : ''} effectué${result.count > 1 ? 's' : ''}.`);
  };

  const groups = RESULT_TYPE_ORDER.map((type) => ({
    type,
    label: TYPE_LABELS[type],
    items: results.filter((result) => result.type === type),
  })).filter((group) => group.items.length > 0);

  const handlePressResult = (result: SearchResult) => {
    onClose();
    if (result.type === 'bible') onOpenBible();
    else if (result.type === 'character') onOpenCharacter(result.id);
    else if (result.type === 'place') onOpenPlace(result.id);
    else if (result.type === 'scene') onOpenScene(result.id);
    else if (result.type === 'note') onOpenNote(result.id);
    else onOpenTimelineEvent(result.id);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} style={styles.backLink} hitSlop={8}>
        <ArrowLeft size={16} color={theme.textSecondary} />
        <Text style={[styles.backLinkLabel, { color: theme.textSecondary }]}>Retour</Text>
      </Pressable>

      <View style={[styles.searchRow, { borderColor: theme.border }]}>
        <Search size={16} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Rechercher dans ce livre…"
          placeholderTextColor={theme.textSecondary}
          autoFocus
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      {query.trim().length > 0 && (
        <View style={styles.replaceBlock}>
          <Pressable onPress={() => setShowReplace((v) => !v)} style={styles.replaceToggle} hitSlop={8}>
            {showReplace ? (
              <ChevronUp size={14} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={14} color={theme.textSecondary} />
            )}
            <Text style={[styles.replaceToggleLabel, { color: theme.textSecondary }]}>Remplacer</Text>
          </Pressable>

          {showReplace && (
            <>
              <View style={[styles.searchRow, { borderColor: theme.border }]}>
                <Repeat size={16} color={theme.textSecondary} />
                <TextInput
                  value={replaceWith}
                  onChangeText={handleReplaceWithChange}
                  placeholder="Remplacer par…"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.searchInput, { color: theme.text }]}
                />
              </View>
              <Pressable
                onPress={handleReplaceAll}
                disabled={occurrenceCount === 0}
                style={[styles.replaceButton, { backgroundColor: ACCENT_COLOR, opacity: occurrenceCount === 0 ? 0.5 : 1 }]}
              >
                <Text style={styles.replaceButtonLabel}>
                  Remplacer partout ({occurrenceCount} occurrence{occurrenceCount > 1 ? 's' : ''})
                </Text>
              </Pressable>
              {replaceMessage && <Text style={[styles.replaceMessage, { color: theme.textSecondary }]}>{replaceMessage}</Text>}
            </>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.resultsContainer} keyboardShouldPersistTaps="handled">
        {query.trim().length === 0 ? (
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Cherchez un nom, un lieu, ou un mot dans vos scènes ou vos notes.
          </Text>
        ) : groups.length === 0 ? (
          <Text style={[styles.hint, { color: theme.textSecondary }]}>Aucun résultat pour "{query}".</Text>
        ) : (
          groups.map((group) => (
            <View key={group.type} style={styles.group}>
              <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>{group.label.toUpperCase()}</Text>
              {group.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handlePressResult(item)}
                  style={[styles.resultCard, { backgroundColor: theme.backgroundElement }]}
                >
                  <Text style={[styles.resultTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.resultSnippet, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.snippet}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.three,
    alignSelf: 'flex-start',
  },
  backLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.four,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  replaceBlock: {
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  replaceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
  },
  replaceToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  replaceButton: {
    borderRadius: Radii.card,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
  },
  replaceButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  replaceMessage: {
    fontSize: 12,
  },
  resultsContainer: {
    paddingBottom: 40,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  group: {
    marginBottom: Spacing.four,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  resultCard: {
    borderRadius: Radii.card,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  resultSnippet: {
    fontSize: 12,
    lineHeight: 16,
  },
});
