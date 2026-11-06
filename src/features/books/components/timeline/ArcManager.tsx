import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MinTouchTarget, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ArcManagerProps } from '@/types/timeline.types';

import { ARC_COLORS } from '../../book-defaults';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TagChips } from '../shared/TagChips';

const UNSPECIFIED_POINT_ID = '__unspecified__';

/** Gestion de l'arc principal et des sous-arcs narratifs : titre, couleur, et jonction avec un autre arc. */
export function ArcManager({ arcs, events, onAdd, onUpdate, onDelete }: ArcManagerProps) {
  const theme = useTheme();
  const [arcIdToDelete, setArcIdToDelete] = useState<string | null>(null);
  const arcToDelete = arcs.find((arc) => arc.id === arcIdToDelete);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>Arc principal & sous-arcs</Text>
        <Pressable onPress={onAdd} style={styles.addButton}>
          <Plus size={12} color="#ffffff" />
          <Text style={styles.addButtonLabel}>Nouveau sous-arc</Text>
        </Pressable>
      </View>

      {arcs.map((arc) => {
        const linkedEvents = events.filter((event) => event.arcId === arc.linkedArcId);

        return (
          <View key={arc.id} style={[styles.arcRow, { borderBottomColor: theme.border }]}>
            <View style={styles.arcTitleRow}>
              <View style={[styles.dot, { backgroundColor: arc.color }]} />
              <TextInput
                value={arc.title}
                editable={!arc.isMain}
                onChangeText={(v) => onUpdate(arc.id, { title: v })}
                style={[
                  styles.titleInput,
                  { color: theme.text, borderColor: theme.border },
                  arc.isMain && { backgroundColor: theme.background },
                ]}
              />
              {!arc.isMain && (
                <Pressable onPress={() => setArcIdToDelete(arc.id)} style={styles.deleteButton}>
                  <Trash2 size={16} color="#EF4444" />
                </Pressable>
              )}
            </View>

            {!arc.isMain && (
              <>
                <View style={styles.colorRow}>
                  {ARC_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => onUpdate(arc.id, { color })}
                      hitSlop={6}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        arc.color === color && { borderWidth: 2, borderColor: theme.text },
                      ]}
                    />
                  ))}
                </View>

                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>Se relie à</Text>
                <TagChips
                  options={arcs.filter((a) => a.id !== arc.id).map((a) => ({ id: a.id, label: a.title }))}
                  selectedIds={arc.linkedArcId ? [arc.linkedArcId] : []}
                  onToggle={(id) =>
                    onUpdate(arc.id, {
                      linkedArcId: arc.linkedArcId === id ? null : id,
                      connectsToEventId: null,
                    })
                  }
                />

                {arc.linkedArcId && (
                  <>
                    <Text style={[styles.subLabel, { color: theme.textSecondary, marginTop: Spacing.two }]}>
                      À quel point
                    </Text>
                    <TagChips
                      options={[
                        { id: UNSPECIFIED_POINT_ID, label: 'Point non précisé' },
                        ...linkedEvents.map((event) => ({ id: event.id, label: event.title || 'Sans titre' })),
                      ]}
                      selectedIds={[arc.connectsToEventId ?? UNSPECIFIED_POINT_ID]}
                      onToggle={(id) =>
                        onUpdate(arc.id, { connectsToEventId: id === UNSPECIFIED_POINT_ID ? null : id })
                      }
                    />
                  </>
                )}
              </>
            )}
          </View>
        );
      })}

      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Choisissez d'abord l'arc que le sous-arc rejoint, puis, si vous le souhaitez, l'événement précis de cet arc où
        la jonction se fait.
      </Text>

      <ConfirmDialog
        visible={arcToDelete !== undefined}
        title="Supprimer ce sous-arc ?"
        message={`« ${arcToDelete?.title || 'Sans titre'} » sera supprimé. Ses événements rejoignent l'arc principal.`}
        onCancel={() => setArcIdToDelete(null)}
        onConfirm={() => {
          if (arcIdToDelete) onDelete(arcIdToDelete);
          setArcIdToDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.card,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.three,
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
  arcRow: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  arcTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  titleInput: {
    flex: 1,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    minHeight: MinTouchTarget,
  },
  deleteButton: {
    width: MinTouchTarget,
    height: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  subLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
});
