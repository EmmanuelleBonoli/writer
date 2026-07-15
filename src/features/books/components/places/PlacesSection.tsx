import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Place, PlacesSectionProps } from '@/types/place.types';

import { useBookCollection } from '../../hooks/use-book-collection';
import { LabeledField } from '../shared/LabeledField';
import { MasterDetail } from '../shared/MasterDetail';

const ACCENT_COLOR = '#2F9BFF';

function createPlace(): Place {
  return {
    id: `place_${Date.now()}`,
    name: 'Nouveau lieu',
    description: '',
    function: '',
  };
}

/** Fiches des lieux de l'univers du livre — galerie + fiche détaillée, sur le même gabarit que les Personnages. */
export function PlacesSection({ book }: PlacesSectionProps) {
  const theme = useTheme();
  const { setField, add, remove } = useBookCollection<Place>(
    book,
    (b) => b.places,
    (b, places) => ({ ...b, places }),
  );

  const handleAdd = () => {
    const place = createPlace();
    add(place);
    return place;
  };

  const handleDelete = (id: string) => remove(id);

  return (
    <MasterDetail
      items={book.places}
      accentColor={ACCENT_COLOR}
      addLabel="Nouveau lieu"
      emptyLabel="Aucun lieu pour l'instant. Créez la première fiche pour commencer."
      onAdd={handleAdd}
      onDelete={handleDelete}
      renderCard={(place) => (
        <>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{place.name || 'Sans nom'}</Text>
          <Text style={[styles.cardPreview, { color: theme.textSecondary }]} numberOfLines={2}>
            {place.description || 'Fiche vide.'}
          </Text>
        </>
      )}
      renderDetail={(place) => (
        <View>
          <LabeledField label="Nom" value={place.name} onChangeText={(v) => setField(place.id, 'name', v)} />
          <LabeledField
            label="Description sensorielle"
            value={place.description}
            onChangeText={(v) => setField(place.id, 'description', v)}
            placeholder="vue, son, odeurs, ambiance…"
            multiline
            numberOfLines={5}
          />
          <LabeledField
            label="Fonction narrative"
            value={place.function}
            onChangeText={(v) => setField(place.id, 'function', v)}
            placeholder="quels événements s'y déroulent, ce que le lieu symbolise…"
            multiline
            numberOfLines={5}
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
