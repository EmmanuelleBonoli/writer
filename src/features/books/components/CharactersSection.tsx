import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useBooksStore } from '../books-store';
import type { Book, Character } from '../types';
import { LabeledField } from './LabeledField';
import { MasterDetail } from './MasterDetail';

interface CharactersSectionProps {
  book: Book;
}

const ACCENT_COLOR = '#12B76A';

function createCharacter(): Character {
  return {
    id: `char_${Date.now()}`,
    name: 'Nouveau personnage',
    age: '',
    appearance: '',
    psychology: '',
    arc: '',
    relations: '',
    voice: '',
  };
}

/** Fiches des personnages du livre — galerie + fiche détaillée, sur le même gabarit que les Lieux. */
export function CharactersSection({ book }: CharactersSectionProps) {
  const theme = useTheme();
  const updateBook = useBooksStore((state) => state.updateBook);

  const setField = (characterId: string, key: keyof Character, value: string) => {
    updateBook(book.id, (current) => ({
      ...current,
      characters: current.characters.map((c) => (c.id === characterId ? { ...c, [key]: value } : c)),
    }));
  };

  const handleAdd = () => {
    const character = createCharacter();
    updateBook(book.id, (current) => ({ ...current, characters: [...current.characters, character] }));
    return character;
  };

  const handleDelete = (id: string) => {
    updateBook(book.id, (current) => ({ ...current, characters: current.characters.filter((c) => c.id !== id) }));
  };

  return (
    <MasterDetail
      items={book.characters}
      accentColor={ACCENT_COLOR}
      addLabel="Nouveau personnage"
      emptyLabel="Aucun personnage pour l'instant. Créez la première fiche pour commencer."
      onAdd={handleAdd}
      onDelete={handleDelete}
      renderCard={(character) => (
        <>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{character.name || 'Sans nom'}</Text>
          {character.age ? (
            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{character.age}</Text>
          ) : null}
          <Text style={[styles.cardPreview, { color: theme.textSecondary }]} numberOfLines={2}>
            {character.psychology || character.appearance || 'Fiche vide.'}
          </Text>
        </>
      )}
      renderDetail={(character) => (
        <View>
          <View style={styles.row}>
            <View style={styles.rowGrow}>
              <LabeledField label="Nom" value={character.name} onChangeText={(v) => setField(character.id, 'name', v)} />
            </View>
            <View style={styles.rowFixed}>
              <LabeledField label="Âge" value={character.age} onChangeText={(v) => setField(character.id, 'age', v)} />
            </View>
          </View>
          <LabeledField
            label="Apparence"
            value={character.appearance}
            onChangeText={(v) => setField(character.id, 'appearance', v)}
            multiline
            numberOfLines={4}
          />
          <LabeledField
            label="Psychologie (traits, peurs, désirs)"
            value={character.psychology}
            onChangeText={(v) => setField(character.id, 'psychology', v)}
            multiline
            numberOfLines={4}
          />
          <LabeledField
            label="Arc narratif"
            value={character.arc}
            onChangeText={(v) => setField(character.id, 'arc', v)}
            multiline
            numberOfLines={4}
          />
          <LabeledField
            label="Relations avec les autres personnages"
            value={character.relations}
            onChangeText={(v) => setField(character.id, 'relations', v)}
            multiline
            numberOfLines={4}
          />
          <LabeledField
            label="Voix / façon de parler"
            value={character.voice}
            onChangeText={(v) => setField(character.id, 'voice', v)}
            placeholder="tics de langage, niveau de langue, rythme de phrase…"
            multiline
            numberOfLines={3}
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
  cardMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  cardPreview: {
    fontSize: 12,
    marginTop: Spacing.two,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowGrow: {
    flex: 2,
  },
  rowFixed: {
    flex: 1,
  },
});
