import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Note, NotesSectionProps } from '@/types/note.types';

import { useBookCollection } from '../../hooks/use-book-collection';
import { useFocusSelection } from '../../hooks/use-focus-selection';
import { LabeledField } from '../shared/LabeledField';
import { MasterDetail } from '../shared/MasterDetail';

const ACCENT_COLOR = '#F97066';

function createNote(): Note {
  return {
    id: `note_${Date.now()}`,
    title: 'Nouvelle note',
    content: '',
  };
}

/** Carnet de notes libres du livre — idées en vrac, recherches, pistes à explorer, séparées de la Bible. */
export function NotesSection({ book, focusNoteId, onFocusConsumed }: NotesSectionProps) {
  const theme = useTheme();
  const notes = book.notes ?? [];
  const [selectedNoteId, setSelectedNoteId] = useFocusSelection(focusNoteId, onFocusConsumed);

  const { setField, add, remove } = useBookCollection<Note>(
    book,
    (b) => b.notes ?? [],
    (b, updatedNotes) => ({ ...b, notes: updatedNotes }),
  );

  const handleAdd = () => {
    const note = createNote();
    add(note);
    return note;
  };

  const handleDelete = (id: string) => remove(id);

  return (
    <MasterDetail
      items={notes}
      accentColor={ACCENT_COLOR}
      addLabel="Nouvelle note"
      emptyLabel="Aucune note pour l'instant. Notez ici vos idées en vrac, pistes à explorer, bouts de dialogue à recaser…"
      onAdd={handleAdd}
      onDelete={handleDelete}
      selectedId={selectedNoteId}
      onSelectId={setSelectedNoteId}
      renderCard={(note) => (
        <>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{note.title || 'Sans titre'}</Text>
          <Text style={[styles.cardPreview, { color: theme.textSecondary }]} numberOfLines={3}>
            {note.content || 'Note vide.'}
          </Text>
        </>
      )}
      renderDetail={(note) => (
        <View>
          <LabeledField label="Titre" value={note.title} onChangeText={(v) => setField(note.id, 'title', v)} />
          <LabeledField
            label="Contenu"
            value={note.content}
            onChangeText={(v) => setField(note.id, 'content', v)}
            placeholder="Idée, recherche, dialogue à recaser…"
            multiline
            numberOfLines={12}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardPreview: {
    fontSize: 12,
    marginTop: Spacing.two,
    lineHeight: 16,
  },
});
