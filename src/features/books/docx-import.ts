import { XMLParser } from 'fast-xml-parser';
import JSZip from 'jszip';

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: false,
  parseTagValue: false,
});

function collectRunText(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectRunText).join('');
  if (node && typeof node === 'object') {
    let text = '';
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'w:t') text += collectRunText(value);
      else if (key === 'w:tab') text += '\t';
      else if (key === 'w:br' || key === 'w:cr') text += '\n';
      else text += collectRunText(value);
    }
    return text;
  }
  return '';
}

function collectParagraphs(node: unknown, paragraphs: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((child) => collectParagraphs(child, paragraphs));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'w:p') {
        const paragraphNodes = Array.isArray(value) ? value : [value];
        paragraphNodes.forEach((p) => paragraphs.push(collectRunText(p).trim()));
      } else {
        collectParagraphs(value, paragraphs);
      }
    }
  }
}

/**
 * Extrait le texte brut (paragraphe par paragraphe) d'un document Word (.docx) à partir de son contenu
 * binaire. Un .docx est une archive ZIP contenant du XML : on la dézippe, on lit `word/document.xml`,
 * et on parcourt récursivement l'arbre pour retrouver chaque paragraphe (`w:p`) et le texte de ses runs
 * (`w:t`), quelle que soit leur profondeur (liens hypertexte, suivi des modifications, tableaux...).
 */
export async function extractTextFromDocx(data: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(data);
  const documentXmlFile = zip.file('word/document.xml');
  if (!documentXmlFile) {
    throw new Error("Ce fichier ne semble pas être un document Word (.docx) valide.");
  }

  const xml = await documentXmlFile.async('text');
  const parsed: unknown = parser.parse(xml);

  const paragraphs: string[] = [];
  collectParagraphs(parsed, paragraphs);
  return paragraphs.filter((paragraph) => paragraph.length > 0).join('\n\n');
}
