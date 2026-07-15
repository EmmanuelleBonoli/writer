import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MasterDetailProps } from '@/types/common.types';

/**
 * Galerie de fiches + vue détail plein écran. Mutualisé entre Personnages et Lieux, dont la structure
 * (grille de cartes → fiche complète avec suppression) est identique, seuls les champs édités diffèrent.
 */
export function MasterDetail<T extends { id: string }>({
  items,
  accentColor,
  addLabel,
  emptyLabel,
  onAdd,
  onDelete,
  renderCard,
  renderDetail,
  renderCardAccessory,
  cardAccentColor,
  selectedId: controlledSelectedId,
  onSelectId,
  hideAddButton,
}: MasterDetailProps<T>) {
  const theme = useTheme();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const isControlled = controlledSelectedId !== undefined;
  const selectedId = isControlled ? controlledSelectedId : internalSelectedId;

  const setSelectedId = (id: string | null) => {
    onSelectId?.(id);
    if (!isControlled) setInternalSelectedId(id);
  };

  const current = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !items.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  if (current) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.detailContainer} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => setSelectedId(null)} style={styles.backLink} hitSlop={8}>
          <ArrowLeft size={14} color={theme.textSecondary} />
          <Text style={[styles.backLinkLabel, { color: theme.textSecondary }]}>Retour à la liste</Text>
        </Pressable>

        <View style={[styles.detailCard, { backgroundColor: theme.backgroundElement }]}>
          {renderDetail(current)}

          <Pressable
            onPress={() => {
              onDelete(current.id);
              setSelectedId(null);
            }}
            style={styles.deleteLink}
            hitSlop={8}
          >
            <Trash2 size={12} color="#EF4444" />
            <Text style={styles.deleteLinkLabel}>Supprimer cette fiche</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.listContainer}>
      {!hideAddButton && (
        <Pressable onPress={() => setSelectedId(onAdd().id)} style={[styles.addButton, { backgroundColor: accentColor }]}>
          <Plus size={14} color="#ffffff" />
          <Text style={styles.addButtonLabel}>{addLabel}</Text>
        </Pressable>
      )}

      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{emptyLabel}</Text>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <View key={item.id} style={styles.cardRow}>
              <Pressable
                onPress={() => setSelectedId(item.id)}
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement },
                  cardAccentColor && { borderLeftWidth: 4, borderLeftColor: cardAccentColor(item) },
                ]}
              >
                {renderCard(item)}
              </Pressable>
              {renderCardAccessory && <View style={styles.cardAccessory}>{renderCardAccessory(item, index)}</View>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 40,
  },
  detailContainer: {
    paddingBottom: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.four,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
  },
  list: {
    gap: Spacing.three,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  card: {
    flex: 1,
    borderRadius: Radii.card,
    padding: Spacing.three,
  },
  cardAccessory: {
    justifyContent: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  backLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailCard: {
    borderRadius: Radii.card,
    padding: Spacing.four,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  deleteLinkLabel: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
