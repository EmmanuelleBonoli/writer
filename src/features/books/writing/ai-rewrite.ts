import type {
  RewriteCharacterFieldWithAiParams,
  RewritePlaceFieldWithAiParams,
  RewriteSceneWithAiParams,
  RewriteTextWithAiParams,
} from '@/types/ai-rewrite.types';

/** URL du Worker Cloudflare déployé (voir server/ai-rewrite-worker/), renseignée dans `.env` — ce n'est pas un secret, juste une valeur de config. */
const AI_REWRITE_ENDPOINT = process.env.EXPO_PUBLIC_AI_REWRITE_ENDPOINT;

/**
 * Demande au Worker Cloudflare de réécrire un texte, avec la bible du livre et un bloc de contexte
 * libre fourni par l'appelant (personnages/lieux tagués pour une scène, autres champs pour une fiche…).
 */
export async function rewriteTextWithAi({ book, content, instruction, context }: RewriteTextWithAiParams): Promise<string> {
  if (!AI_REWRITE_ENDPOINT) {
    throw new Error("URL du service de réécriture non configurée (EXPO_PUBLIC_AI_REWRITE_ENDPOINT dans .env).");
  }

  const response = await fetch(AI_REWRITE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      instruction,
      genre: book.genre.join(', '),
      bible: {
        tone: book.bible.tone,
        pitch: book.bible.pitch,
        synopsis: book.bible.synopsis,
        themes: book.bible.themes,
        worldRules: book.bible.worldRules,
      },
      context,
    }),
  });

  const data = (await response.json()) as { text?: string; error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'La réécriture a échoué.');
  }
  if (!data.text) {
    throw new Error("L'IA n'a renvoyé aucun texte.");
  }
  return data.text;
}

/** Réécrit le texte d'une scène, avec pour contexte les personnages/lieux tagués et l'événement de timeline relié. */
export async function rewriteSceneWithAi({ book, scene, instruction }: RewriteSceneWithAiParams): Promise<string> {
  const characters = book.characters
    .filter((character) => scene.characterIds.includes(character.id))
    .map(
      (character) =>
        `- ${character.name} : psychologie (${character.psychology}), arc narratif (${character.arc}), voix (${character.voice})`,
    );
  const places = book.places
    .filter((place) => scene.placeIds.includes(place.id))
    .map((place) => `- ${place.name} : ${place.description}`);
  const timelineEvent = scene.timelineEventId
    ? (book.timeline.find((event) => event.id === scene.timelineEventId) ?? null)
    : null;

  const context = `Personnages présents dans cette scène :
${characters.length > 0 ? characters.join('\n') : 'aucun personnage tagué'}

Lieux :
${places.length > 0 ? places.join('\n') : 'aucun lieu tagué'}

Événement de la timeline relié à cette scène :
${timelineEvent ? `${timelineEvent.title} — ${timelineEvent.description}` : 'aucun événement de la timeline relié à cette scène'}`;

  return rewriteTextWithAi({ book, content: scene.content, instruction, context });
}

/** Réécrit un champ d'une fiche personnage, avec les *autres* champs déjà remplis comme contexte de cohérence (le champ en cours de réécriture est exclu du contexte pour ne pas le dupliquer avec `content`). */
export async function rewriteCharacterFieldWithAi({
  book,
  character,
  fieldKey,
  content,
  instruction,
}: RewriteCharacterFieldWithAiParams): Promise<string> {
  const otherFields: [string, string, string][] = [
    ['age', 'Âge', character.age || 'non précisé'],
    ['appearance', 'Apparence', character.appearance || 'non précisée'],
    ['psychology', 'Psychologie', character.psychology || 'non précisée'],
    ['arc', 'Arc narratif', character.arc || 'non précisé'],
    ['relations', 'Relations', character.relations || 'non précisées'],
    ['voice', 'Voix', character.voice || 'non précisée'],
  ];
  const contextLines = otherFields
    .filter(([key]) => key !== fieldKey)
    .map(([, label, value]) => `${label} : ${value}`);

  const context = `Fiche du personnage concerné :
Nom : ${character.name}
${contextLines.join('\n')}`;

  return rewriteTextWithAi({ book, content, instruction, context });
}

/** Réécrit un champ d'une fiche lieu, avec les *autres* champs déjà remplis comme contexte de cohérence (le champ en cours de réécriture est exclu du contexte pour ne pas le dupliquer avec `content`). */
export async function rewritePlaceFieldWithAi({
  book,
  place,
  fieldKey,
  content,
  instruction,
}: RewritePlaceFieldWithAiParams): Promise<string> {
  const otherFields: [string, string, string][] = [
    ['description', 'Description', place.description || 'non précisée'],
    ['function', 'Fonction narrative', place.function || 'non précisée'],
  ];
  const contextLines = otherFields
    .filter(([key]) => key !== fieldKey)
    .map(([, label, value]) => `${label} : ${value}`);

  const context = `Fiche du lieu concerné :
Nom : ${place.name}
${contextLines.join('\n')}`;

  return rewriteTextWithAi({ book, content, instruction, context });
}
