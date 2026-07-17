import type { Book } from '@/types/book.types';
import type { ReplaceInBookResult, SearchResult } from '@/types/search.types';

interface SearchableField {
  label: string;
  value: string;
}

/** Extrait un extrait du texte autour de la première occurrence de la recherche, avec des points de suspension si tronqué. */
function snippetAround(value: string, query: string): string {
  const lower = value.toLowerCase();
  const index = lower.indexOf(query);
  if (index === -1) return value.slice(0, 90);
  const start = Math.max(0, index - 25);
  const end = Math.min(value.length, index + query.length + 45);
  return `${start > 0 ? '…' : ''}${value.slice(start, end)}${end < value.length ? '…' : ''}`;
}

/** Renvoie l'extrait du premier champ où la recherche apparaît, ou `null` si aucun champ ne correspond. */
function firstMatch(fields: SearchableField[], query: string): string | null {
  for (const field of fields) {
    if (field.value.toLowerCase().includes(query)) {
      return `${field.label} : ${snippetAround(field.value, query)}`;
    }
  }
  return null;
}

/** Recherche insensible à la casse dans tous les champs texte du livre (personnages, lieux, scènes, notes, timeline). */
export function searchBook(book: Book, rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const results: SearchResult[] = [];

  const bibleSnippet = firstMatch(
    [
      { label: 'Ton', value: book.bible.tone },
      { label: 'Pitch', value: book.bible.pitch },
      { label: 'Synopsis', value: book.bible.synopsis },
      { label: 'Thèmes', value: book.bible.themes },
      { label: 'Règles du monde', value: book.bible.worldRules },
    ],
    query,
  );
  if (bibleSnippet) results.push({ type: 'bible', id: 'bible', title: 'Bible', snippet: bibleSnippet });

  for (const character of book.characters) {
    const snippet = firstMatch(
      [
        { label: 'Nom', value: character.name },
        { label: 'Âge', value: character.age },
        { label: 'Apparence', value: character.appearance },
        { label: 'Psychologie', value: character.psychology },
        { label: 'Arc narratif', value: character.arc },
        { label: 'Relations', value: character.relations },
        { label: 'Voix', value: character.voice },
      ],
      query,
    );
    if (snippet) results.push({ type: 'character', id: character.id, title: character.name || 'Sans nom', snippet });
  }

  for (const place of book.places) {
    const snippet = firstMatch(
      [
        { label: 'Nom', value: place.name },
        { label: 'Description', value: place.description },
        { label: 'Fonction narrative', value: place.function },
      ],
      query,
    );
    if (snippet) results.push({ type: 'place', id: place.id, title: place.name || 'Sans nom', snippet });
  }

  for (const scene of book.scenes) {
    const snippet = firstMatch(
      [
        { label: 'Titre', value: scene.title },
        { label: 'Texte', value: scene.content },
      ],
      query,
    );
    if (snippet) results.push({ type: 'scene', id: scene.id, title: scene.title || 'Sans titre', snippet });
  }

  for (const note of book.notes ?? []) {
    const snippet = firstMatch(
      [
        { label: 'Titre', value: note.title },
        { label: 'Contenu', value: note.content },
      ],
      query,
    );
    if (snippet) results.push({ type: 'note', id: note.id, title: note.title || 'Sans titre', snippet });
  }

  for (const event of book.timeline) {
    const snippet = firstMatch(
      [
        { label: 'Titre', value: event.title },
        { label: 'Description', value: event.description },
      ],
      query,
    );
    if (snippet) results.push({ type: 'timelineEvent', id: event.id, title: event.title || 'Sans titre', snippet });
  }

  return results;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remplace toutes les occurrences de `find` (insensible à la casse, correspondance simple sur des
 * sous-chaînes) par `replaceWith`, dans tous les champs texte du livre. Renvoie le livre mis à jour et
 * le nombre total de remplacements effectués.
 */
export function replaceInBook(book: Book, find: string, replaceWith: string): ReplaceInBookResult {
  const trimmedFind = find.trim();
  if (!trimmedFind) return { book, count: 0 };

  const regex = new RegExp(escapeRegExp(trimmedFind), 'gi');
  let count = 0;

  const apply = (text: string): string => {
    const matches = text.match(regex);
    if (matches) count += matches.length;
    return text.replace(regex, replaceWith);
  };

  const bible = {
    tone: apply(book.bible.tone),
    pitch: apply(book.bible.pitch),
    synopsis: apply(book.bible.synopsis),
    themes: apply(book.bible.themes),
    worldRules: apply(book.bible.worldRules),
  };

  const characters = book.characters.map((character) => ({
    ...character,
    name: apply(character.name),
    age: apply(character.age),
    appearance: apply(character.appearance),
    psychology: apply(character.psychology),
    arc: apply(character.arc),
    relations: apply(character.relations),
    voice: apply(character.voice),
  }));

  const places = book.places.map((place) => ({
    ...place,
    name: apply(place.name),
    description: apply(place.description),
    function: apply(place.function),
  }));

  const scenes = book.scenes.map((scene) => ({
    ...scene,
    title: apply(scene.title),
    content: apply(scene.content),
  }));

  const notes = (book.notes ?? []).map((note) => ({
    ...note,
    title: apply(note.title),
    content: apply(note.content),
  }));

  const timeline = book.timeline.map((event) => ({
    ...event,
    title: apply(event.title),
    description: apply(event.description),
  }));

  return { book: { ...book, bible, characters, places, scenes, notes, timeline }, count };
}
