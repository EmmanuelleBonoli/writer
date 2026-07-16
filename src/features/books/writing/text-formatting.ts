/**
 * Ajoute un retrait d'alinéa (tabulation) en début de chaque paragraphe. Un `TextInput` ne peut pas
 * appliquer un retrait de première ligne comme un vrai traitement de texte : on matérialise l'alinéa
 * par une tabulation, aussi bien pour la saisie directe que pour le texte importé depuis un .docx ou
 * repris depuis un événement de la timeline.
 */
export function withAlineaIndent(text: string): string {
  const indented = text.replace(/\n(?!\t)/g, '\n\t');
  return indented.length > 0 && !indented.startsWith('\t') ? `\t${indented}` : indented;
}
