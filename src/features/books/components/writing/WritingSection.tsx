import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { ChevronDown, ChevronUp, Mic, Plus, Square, Download } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Scene, WritingSectionProps } from '@/types/writing.types';

import { extractTextFromDocx } from '../../docx-import';
import { useBookCollection } from '../../hooks/use-book-collection';
import { rewriteSceneWithAi } from '../../writing/ai-rewrite';
import { applyEventToScene, createScene } from '../../writing/scene-factory';
import { withAlineaIndent } from '../../writing/text-formatting';
import { AiRewritePanel } from '../shared/AiRewritePanel';
import { CheckableDropdown } from '../shared/CheckableDropdown';
import { LabeledField } from '../shared/LabeledField';
import { MasterDetail } from '../shared/MasterDetail';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const ACCENT_COLOR = '#0D9488';

function wordCount(content: string): number {
  const trimmed = content.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/** Rédaction du livre — scènes ordonnées, reliables à des personnages, des lieux et un événement de la timeline. */
export function WritingSection({ book, focusSceneId, onFocusConsumed }: WritingSectionProps) {
  const theme = useTheme();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [importingSceneId, setImportingSceneId] = useState<string | null>(null);
  const [dictatingSceneId, setDictatingSceneId] = useState<string | null>(null);
  const dictationBaseRef = useRef('');

  const sortedScenes = [...book.scenes].sort((a, b) => a.order - b.order);
  const sortedEvents = [...book.timeline].sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (focusSceneId) {
      setSelectedSceneId(focusSceneId);
      onFocusConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSceneId]);

  const { setField, patchItem, toggleInField, add, remove, move } = useBookCollection<Scene>(
    book,
    (b) => b.scenes,
    (b, scenes) => ({ ...b, scenes }),
  );

  const handleAdd = () => {
    const scene = createScene(sortedScenes.length);
    add(scene);
    return scene;
  };

  const handleDelete = (id: string) => remove(id);

  const moveScene = (id: string, direction: -1 | 1) =>
    move(sortedScenes, id, direction, (scene, i) => ({ ...scene, order: i }));

  const toggleCharacter = (scene: Scene, characterId: string) => toggleInField(scene.id, 'characterIds', characterId);

  const togglePlace = (scene: Scene, placeId: string) => toggleInField(scene.id, 'placeIds', placeId);

  /** Relie (ou délie) une scène à un événement ; en cas de liaison, complète les champs vides de la scène avec les données de l'événement. */
  const linkTimelineEvent = (scene: Scene, eventId: string) => {
    if (scene.timelineEventId === eventId) {
      setField(scene.id, 'timelineEventId', null);
      return;
    }
    const event = sortedEvents.find((e) => e.id === eventId);
    if (!event) return;
    patchItem(scene.id, { timelineEventId: eventId, ...applyEventToScene(scene, event) });
  };

  const handleImportDocx = async (scene: Scene) => {
    const result = await DocumentPicker.getDocumentAsync({ type: DOCX_MIME_TYPE });
    if (result.canceled) return;

    const asset = result.assets[0];
    setImportingSceneId(scene.id);
    try {
      const buffer = asset.file ? await asset.file.arrayBuffer() : await new File(asset.uri).arrayBuffer();
      const text = await extractTextFromDocx(buffer);
      setField(scene.id, 'content', withAlineaIndent(text));
    } catch (error) {
      console.error("Échec de l'import du document Word :", error);
      Alert.alert('Import impossible', "Ce fichier n'a pas pu être lu. Vérifiez qu'il s'agit bien d'un document Word (.docx).");
    } finally {
      setImportingSceneId(null);
    }
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (!dictatingSceneId) return;
    const transcript = event.results[0]?.transcript ?? '';
    const base = dictationBaseRef.current;
    setField(dictatingSceneId, 'content', withAlineaIndent(base ? `${base} ${transcript}` : transcript));
    if (event.isFinal) {
      dictationBaseRef.current = base ? `${base} ${transcript}` : transcript;
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (!dictatingSceneId) return;
    console.error('Erreur de reconnaissance vocale :', event.error, event.message);
    Alert.alert('Dictée impossible', "La reconnaissance vocale a rencontré une erreur. Réessayez.");
  });

  useSpeechRecognitionEvent('end', () => {
    setDictatingSceneId(null);
  });

  const handleToggleDictation = async (scene: Scene) => {
    if (dictatingSceneId === scene.id) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Micro indisponible', "Vous devez autoriser l'accès au micro pour utiliser la dictée vocale.");
      return;
    }

    dictationBaseRef.current = scene.content;
    setDictatingSceneId(scene.id);
    ExpoSpeechRecognitionModule.start({ lang: 'fr-FR', interimResults: true, continuous: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setSelectedSceneId(handleAdd().id)}
          style={[styles.addButton, { backgroundColor: ACCENT_COLOR }]}
        >
          <Plus size={14} color="#ffffff" />
          <Text style={styles.addButtonLabel}>Nouvelle scène</Text>
        </Pressable>
      </View>

      <MasterDetail
        items={sortedScenes}
        accentColor={ACCENT_COLOR}
        addLabel="Nouvelle scène"
        emptyLabel="Aucune scène pour l'instant. Créez la première pour commencer votre rédaction."
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedSceneId}
        onSelectId={setSelectedSceneId}
        hideAddButton
        renderCard={(scene) => (
          <>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{scene.title || 'Sans titre'}</Text>
            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{wordCount(scene.content)} mots</Text>
            <Text style={[styles.cardPreview, { color: theme.textSecondary }]} numberOfLines={2}>
              {scene.content || 'Scène vide.'}
            </Text>
          </>
        )}
        renderCardAccessory={(scene, index) => (
          <View style={styles.reorderButtons}>
            <Pressable onPress={() => moveScene(scene.id, -1)} disabled={index === 0} hitSlop={6}>
              <ChevronUp size={16} color={index === 0 ? theme.border : theme.textSecondary} />
            </Pressable>
            <Pressable onPress={() => moveScene(scene.id, 1)} disabled={index === sortedScenes.length - 1} hitSlop={6}>
              <ChevronDown size={16} color={index === sortedScenes.length - 1 ? theme.border : theme.textSecondary} />
            </Pressable>
          </View>
        )}
        renderDetail={(scene) => (
          <View>
            <CheckableDropdown
              label="Événement de la timeline"
              options={sortedEvents.map((e) => ({ id: e.id, label: e.title || 'Sans titre' }))}
              selectedIds={scene.timelineEventId ? [scene.timelineEventId] : []}
              onToggle={(id) => linkTimelineEvent(scene, id)}
              placeholder="Non reliée"
            />

            <LabeledField label="Titre" value={scene.title} onChangeText={(v) => setField(scene.id, 'title', v)} />

            <View style={styles.tagRow}>
              <View style={styles.tagRowItem}>
                <CheckableDropdown
                  label="Personnages présents"
                  options={book.characters.map((c) => ({ id: c.id, label: c.name || 'Sans nom' }))}
                  selectedIds={scene.characterIds}
                  onToggle={(id) => toggleCharacter(scene, id)}
                  placeholder="Aucun personnage"
                />
              </View>
              <View style={styles.tagRowItem}>
                <CheckableDropdown
                  label="Lieux"
                  options={book.places.map((p) => ({ id: p.id, label: p.name || 'Sans nom' }))}
                  selectedIds={scene.placeIds}
                  onToggle={(id) => togglePlace(scene, id)}
                  placeholder="Aucun lieu"
                />
              </View>
            </View>

            <LabeledField
              label="Texte"
              value={scene.content}
              onChangeText={(v) => setField(scene.id, 'content', withAlineaIndent(v))}
              placeholder="Écrivez ici…"
              multiline
              numberOfLines={12}
            />

            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => handleToggleDictation(scene)}
                disabled={dictatingSceneId !== null && dictatingSceneId !== scene.id}
                style={[
                  styles.importButton,
                  { borderColor: dictatingSceneId === scene.id ? '#EF4444' : theme.border },
                ]}
              >
                {dictatingSceneId === scene.id ? (
                  <Square size={14} color="#EF4444" />
                ) : (
                  <Mic size={14} color={theme.text} />
                )}
                <Text style={[styles.importButtonLabel, { color: dictatingSceneId === scene.id ? '#EF4444' : theme.text }]}>
                  {dictatingSceneId === scene.id ? 'Arrêter la dictée' : 'Dicter'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleImportDocx(scene)}
                disabled={importingSceneId === scene.id}
                style={[styles.importButton, { borderColor: theme.border }]}
              >
                {importingSceneId === scene.id ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <Download size={14} color={theme.text} />
                )}
                <Text style={[styles.importButtonLabel, { color: theme.text }]}>
                  {importingSceneId === scene.id ? 'Import en cours…' : 'Importer un .docx'}
                </Text>
              </Pressable>
            </View>

            <AiRewritePanel
              key={scene.id}
              title="Réécriture assistée par IA — utilise la bible, les personnages et le lieu tagués ci-dessus"
              fields={[{ key: 'content', label: 'Texte', value: scene.content }]}
              rewrite={(_fieldKey, _content, instruction) => rewriteSceneWithAi({ book, scene, instruction })}
              onApply={(_fieldKey, text) => setField(scene.id, 'content', text)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
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
  reorderButtons: {
    gap: Spacing.one,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tagRowItem: {
    flex: 1,
    minWidth: 150,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  importButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
