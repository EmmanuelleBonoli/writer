/** Compte les mots d'un texte (séparés par des espaces/retours à la ligne) — 0 si le texte est vide. */
export function wordCount(content: string): number {
  const trimmed = content.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}
