import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { useBooksStore } from '../books-store';
import type { Book, Place } from '../types';
import { LabeledField } from './LabeledField';
import { MasterDetail } from './MasterDetail';

interface PlacesSectionProps {
  book: Book;
}

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
  const updateBook = useBooksStore((state) => state.updateBook);

  const setField = (placeId: string, key: keyof Place, value: string) => {
    updateBook(book.id, (current) => ({
      ...current,
      places: current.places.map((p) => (p.id === placeId ? { ...p, [key]: value } : p)),
    }));
  };

  const handleAdd = () => {
    const place = createPlace();
    updateBook(book.id, (current) => ({ ...current, places: [...current.places, place] }));
    return place;
  };

  const handleDelete = (id: string) => {
    updateBook(book.id, (current) => ({ ...current, places: current.places.filter((p) => p.id !== id) }));
  };

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
