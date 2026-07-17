import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Character, CharactersSectionProps } from '@/types/character.types';

import { useBookCollection } from '../../hooks/use-book-collection';
import { useFocusSelection } from '../../hooks/use-focus-selection';
import { useRevertableField } from '../../hooks/use-revertable-field';
import { rewriteCharacterFieldWithAi } from '../../writing/ai-rewrite';
import { AiRewritePanel } from '../shared/AiRewritePanel';
import { LabeledField } from '../shared/LabeledField';
import { MasterDetail } from '../shared/MasterDetail';

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
export function CharactersSection({ book, focusCharacterId, onFocusConsumed }: CharactersSectionProps) {
  const theme = useTheme();
  const [selectedCharacterId, setSelectedCharacterId] = useFocusSelection(focusCharacterId, onFocusConsumed);
  const { setField, add, remove } = useBookCollection<Character>(
    book,
    (b) => b.characters,
    (b, characters) => ({ ...b, characters }),
  );
  const { remember, renderRevertButton } = useRevertableField<keyof Character>(setField);

  const handleAdd = () => {
    const character = createCharacter();
    add(character);
    return character;
  };

  const handleDelete = (id: string) => remove(id);

  return (
    <MasterDetail
      items={book.characters}
      accentColor={ACCENT_COLOR}
      addLabel="Nouveau personnage"
      emptyLabel="Aucun personnage pour l'instant. Créez la première fiche pour commencer."
      onAdd={handleAdd}
      onDelete={handleDelete}
      selectedId={selectedCharacterId}
      onSelectId={setSelectedCharacterId}
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
          {renderRevertButton(character.id, 'appearance')}
          <LabeledField
            label="Psychologie (traits, peurs, désirs)"
            value={character.psychology}
            onChangeText={(v) => setField(character.id, 'psychology', v)}
            multiline
            numberOfLines={4}
          />
          {renderRevertButton(character.id, 'psychology')}
          <LabeledField
            label="Arc narratif"
            value={character.arc}
            onChangeText={(v) => setField(character.id, 'arc', v)}
            multiline
            numberOfLines={4}
          />
          {renderRevertButton(character.id, 'arc')}
          <LabeledField
            label="Relations avec les autres personnages"
            value={character.relations}
            onChangeText={(v) => setField(character.id, 'relations', v)}
            multiline
            numberOfLines={4}
          />
          {renderRevertButton(character.id, 'relations')}
          <LabeledField
            label="Voix / façon de parler"
            value={character.voice}
            onChangeText={(v) => setField(character.id, 'voice', v)}
            placeholder="tics de langage, niveau de langue, rythme de phrase…"
            multiline
            numberOfLines={3}
          />
          {renderRevertButton(character.id, 'voice')}

          <AiRewritePanel
            key={character.id}
            title="Réécriture assistée par IA — choisissez le champ à réécrire"
            fields={[
              { key: 'appearance', label: 'Apparence', value: character.appearance },
              { key: 'psychology', label: 'Psychologie', value: character.psychology },
              { key: 'arc', label: 'Arc narratif', value: character.arc },
              { key: 'relations', label: 'Relations', value: character.relations },
              { key: 'voice', label: 'Voix', value: character.voice },
            ]}
            rewrite={(fieldKey, content, instruction) =>
              rewriteCharacterFieldWithAi({ book, character, fieldKey, content, instruction })
            }
            onApply={(fieldKey, text, previousValue) => {
              remember(character.id, fieldKey, previousValue);
              setField(character.id, fieldKey as keyof Character, text);
            }}
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
