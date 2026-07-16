import { ChevronDown, ChevronUp, GitBranch, List, PenLine, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Arc, TimelineEvent, TimelineSectionProps } from '@/types/timeline.types';
import type { Scene } from '@/types/writing.types';

import { ARC_COLORS, createMainArc, MAIN_ARC_ID } from '../../book-defaults';
import { useBooksStore } from '../../books-store';
import { useBookCollection } from '../../hooks/use-book-collection';
import { createSceneFromEvent } from '../../writing/scene-factory';
import { LabeledField } from '../shared/LabeledField';
import { MasterDetail } from '../shared/MasterDetail';
import { TagChips } from '../shared/TagChips';
import { ArcManager } from './ArcManager';
import { SCENE_LINK_COLOR, SceneLinkBadge } from './SceneLinkBadge';
import { TimelineGraphView } from './TimelineGraphView';

const ACCENT_COLOR = '#F5A524';

function createEvent(order: number): TimelineEvent {
  return {
    id: `evt_${Date.now()}`,
    title: 'Nouvel événement',
    description: '',
    characterIds: [],
    placeId: '',
    arcId: MAIN_ARC_ID,
    order,
  };
}

/** Timeline du livre — liste ordonnée d'événements clés, regroupés par arcs narratifs, avec une vue graphique. */
export function TimelineSection({ book, onOpenScene }: TimelineSectionProps) {
  const theme = useTheme();
  const updateBook = useBooksStore((state) => state.updateBook);
  const [view, setView] = useState<'list' | 'graph'>('list');
  const [managingArcs, setManagingArcs] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const arcs = book.arcs.length > 0 ? book.arcs : [createMainArc()];
  const sortedEvents = [...book.timeline].sort((a, b) => a.order - b.order);

  const { setField, toggleInField, add, remove, move } = useBookCollection<TimelineEvent>(
    book,
    (b) => b.timeline,
    (b, timeline) => ({ ...b, timeline }),
  );

  const { add: addScene } = useBookCollection<Scene>(
    book,
    (b) => b.scenes,
    (b, scenes) => ({ ...b, scenes }),
  );

  const handleAdd = () => {
    const event = createEvent(sortedEvents.length);
    add(event);
    return event;
  };

  const handleDelete = (id: string) => remove(id);

  const moveEvent = (id: string, direction: -1 | 1) =>
    move(sortedEvents, id, direction, (event, i) => ({ ...event, order: i }));

  const toggleCharacter = (event: TimelineEvent, characterId: string) =>
    toggleInField(event.id, 'characterIds', characterId);

  const togglePlace = (event: TimelineEvent, placeId: string) => {
    setField(event.id, 'placeId', event.placeId === placeId ? '' : placeId);
  };

  const findLinkedScene = (eventId: string) => book.scenes.find((scene) => scene.timelineEventId === eventId) ?? null;

  /** Ouvre la scène reliée à l'événement, ou la crée (préremplie depuis l'événement) si elle n'existe pas encore. */
  const handleOpenEventScene = (eventId: string) => {
    const existing = findLinkedScene(eventId);
    if (existing) {
      onOpenScene(existing.id);
      return;
    }
    const event = sortedEvents.find((e) => e.id === eventId);
    if (!event) return;
    const scene = createSceneFromEvent(book.scenes.length, event);
    addScene(scene);
    onOpenScene(scene.id);
  };

  const handleAddArc = () => {
    const newArc: Arc = {
      id: `arc_${Date.now()}`,
      title: 'Nouveau sous-arc',
      color: ARC_COLORS[arcs.length % ARC_COLORS.length],
      isMain: false,
      linkedArcId: null,
      connectsToEventId: null,
    };
    updateBook(book.id, (current) => ({
      ...current,
      arcs: [...(current.arcs.length ? current.arcs : [createMainArc()]), newArc],
    }));
  };

  const handleUpdateArc = (id: string, patch: Partial<Arc>) => {
    updateBook(book.id, (current) => ({
      ...current,
      arcs: current.arcs.map((arc) => (arc.id === id ? { ...arc, ...patch } : arc)),
    }));
  };

  const handleDeleteArc = (id: string) => {
    updateBook(book.id, (current) => ({
      ...current,
      arcs: current.arcs
        .filter((arc) => arc.id !== id)
        .map((arc) => (arc.linkedArcId === id ? { ...arc, linkedArcId: null, connectsToEventId: null } : arc)),
      timeline: current.timeline.map((event) => (event.arcId === id ? { ...event, arcId: MAIN_ARC_ID } : event)),
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setManagingArcs((v) => !v)}
          style={[styles.arcsToggle, { borderColor: theme.border }, managingArcs && { backgroundColor: theme.text }]}
        >
          <GitBranch size={14} color={managingArcs ? theme.background : theme.text} />
          <Text style={[styles.arcsToggleLabel, { color: managingArcs ? theme.background : theme.text }]}>
            Arcs narratifs
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedEventId(handleAdd().id)}
          style={[styles.addButton, { backgroundColor: ACCENT_COLOR }]}
        >
          <Plus size={14} color="#ffffff" />
          <Text style={styles.addButtonLabel}>Nouvel événement</Text>
        </Pressable>

        <View style={[styles.viewSwitch, { borderColor: theme.border }]}>
          <Pressable
            onPress={() => setView('list')}
            style={[styles.viewSwitchOption, view === 'list' && { backgroundColor: theme.text }]}
          >
            <List size={14} color={view === 'list' ? theme.background : theme.text} />
          </Pressable>
          <Pressable
            onPress={() => setView('graph')}
            style={[styles.viewSwitchOption, view === 'graph' && { backgroundColor: theme.text }]}
          >
            <GitBranch size={14} color={view === 'graph' ? theme.background : theme.text} />
          </Pressable>
        </View>
      </View>

      {managingArcs && (
        <ArcManager
          arcs={arcs}
          events={sortedEvents}
          onAdd={handleAddArc}
          onUpdate={handleUpdateArc}
          onDelete={handleDeleteArc}
        />
      )}

      {!selectedEventId && view === 'graph' ? (
        <TimelineGraphView
          events={sortedEvents}
          arcs={arcs}
          scenes={book.scenes}
          onSelectEvent={setSelectedEventId}
          onOpenEventScene={handleOpenEventScene}
        />
      ) : (
        <MasterDetail
          items={sortedEvents}
          accentColor={ACCENT_COLOR}
          addLabel="Nouvel événement"
          emptyLabel="Aucun événement pour l'instant. Créez le premier pour commencer votre timeline."
          onAdd={handleAdd}
          onDelete={handleDelete}
          selectedId={selectedEventId}
          onSelectId={setSelectedEventId}
          hideAddButton
          cardAccentColor={(event) => arcs.find((arc) => arc.id === event.arcId)?.color ?? theme.border}
          renderCard={(event) => (
            <>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                  {event.title || 'Sans titre'}
                </Text>
                <SceneLinkBadge linked={findLinkedScene(event.id) !== null} onPress={() => handleOpenEventScene(event.id)} />
              </View>
              <Text style={[styles.cardPreview, { color: theme.textSecondary }]} numberOfLines={2}>
                {event.description || 'Événement vide.'}
              </Text>
            </>
          )}
          renderCardAccessory={(event, index) => (
            <View style={styles.reorderButtons}>
              <Pressable onPress={() => moveEvent(event.id, -1)} disabled={index === 0} hitSlop={6}>
                <ChevronUp size={16} color={index === 0 ? theme.border : theme.textSecondary} />
              </Pressable>
              <Pressable onPress={() => moveEvent(event.id, 1)} disabled={index === sortedEvents.length - 1} hitSlop={6}>
                <ChevronDown size={16} color={index === sortedEvents.length - 1 ? theme.border : theme.textSecondary} />
              </Pressable>
            </View>
          )}
          renderDetail={(event) => {
            const linkedScene = findLinkedScene(event.id);
            return (
              <View>
                <LabeledField label="Titre" value={event.title} onChangeText={(v) => setField(event.id, 'title', v)} />
                <LabeledField
                  label="Ce qu'il se passe"
                  value={event.description}
                  onChangeText={(v) => setField(event.id, 'description', v)}
                  multiline
                  numberOfLines={4}
                />

                <Pressable
                  onPress={() => handleOpenEventScene(event.id)}
                  style={[styles.sceneLinkRow, { borderColor: linkedScene ? SCENE_LINK_COLOR : theme.border }]}
                >
                  <PenLine size={14} color={linkedScene ? SCENE_LINK_COLOR : theme.textSecondary} />
                  <Text style={[styles.sceneLinkLabel, { color: linkedScene ? SCENE_LINK_COLOR : theme.textSecondary }]}>
                    {linkedScene
                      ? `Scène rédigée : ${linkedScene.title || 'Sans titre'}`
                      : 'Créer et ouvrir la scène pour cet événement'}
                  </Text>
                </Pressable>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Arc narratif</Text>
                <TagChips
                  options={arcs.map((arc) => ({ id: arc.id, label: arc.title }))}
                  selectedIds={[event.arcId]}
                  onToggle={(id) => setField(event.id, 'arcId', id)}
                />

                <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>
                  Personnages présents
                </Text>
                {book.characters.length === 0 ? (
                  <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>Aucun personnage créé pour l'instant.</Text>
                ) : (
                  <TagChips
                    options={book.characters.map((c) => ({ id: c.id, label: c.name || 'Sans nom' }))}
                    selectedIds={event.characterIds}
                    onToggle={(id) => toggleCharacter(event, id)}
                  />
                )}

                <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: Spacing.four }]}>Lieu</Text>
                {book.places.length === 0 ? (
                  <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>Aucun lieu créé pour l'instant.</Text>
                ) : (
                  <TagChips
                    options={book.places.map((p) => ({ id: p.id, label: p.name || 'Sans nom' }))}
                    selectedIds={event.placeId ? [event.placeId] : []}
                    onToggle={(id) => togglePlace(event, id)}
                  />
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  arcsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  arcsToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewSwitch: {
    marginLeft: 'auto',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  viewSwitchOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  cardPreview: {
    fontSize: 12,
    marginTop: Spacing.two,
    lineHeight: 16,
  },
  reorderButtons: {
    gap: Spacing.one,
  },
  sceneLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.four,
  },
  sceneLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  emptyHint: {
    fontSize: 12,
  },
});
