import type { Book } from '@/types/book.types';

function isBookLike(value: unknown): value is Book {
  if (!value || typeof value !== 'object') return false;
  const book = value as Record<string, unknown>;
  return (
    typeof book.title === 'string' &&
    Array.isArray(book.genre) &&
    typeof book.bible === 'object' &&
    book.bible !== null &&
    Array.isArray(book.characters) &&
    Array.isArray(book.places) &&
    Array.isArray(book.timeline) &&
    Array.isArray(book.arcs) &&
    Array.isArray(book.scenes)
  );
}

/**
 * Parse et valide un fichier de sauvegarde de projet (JSON exporté depuis l'app). Le fichier vient de
 * l'extérieur de l'app (choisi par l'utilisateur) : on vérifie sa forme minimale avant de l'accepter, pour
 * échouer avec un message clair plutôt que de planter plus loin dans l'app sur des données incohérentes.
 */
export function parseBookImport(raw: string): Book {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Ce fichier n'est pas un JSON valide.");
  }
  if (!isBookLike(parsed)) {
    throw new Error('Ce fichier ne correspond pas à un projet de roman valide.');
  }
  return parsed;
}
