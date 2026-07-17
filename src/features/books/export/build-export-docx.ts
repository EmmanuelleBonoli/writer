import { AlignmentType, BorderStyle, Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from 'docx';

import type { Book } from '@/types/book.types';
import type { ExportableSectionId } from '@/types/export.types';

import { BOOK_SECTIONS } from '../book-sections';
import { groupScenesByChapter } from '../writing/chapter-grouping';

const SECTION_ORDER: ExportableSectionId[] = ['bible', 'characters', 'places', 'timeline', 'writing', 'notes'];
const SECONDARY_COLOR = '60646C';
const BORDER_COLOR = 'C7C9D1';
const MAX_IMAGE_WIDTH = 550;

export interface TimelineImageData {
  base64: string;
  width: number;
  height: number;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Décode une chaîne base64 en octets bruts, sans dépendre de `atob` (disponibilité incertaine selon moteur JS/plateforme). */
function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

function scaleToFit(width: number, height: number, maxWidth: number): { width: number; height: number } {
  if (width <= maxWidth) return { width, height };
  const ratio = maxWidth / width;
  return { width: maxWidth, height: Math.round(height * ratio) };
}

function sectionHeading(id: ExportableSectionId): Paragraph {
  const config = BOOK_SECTIONS.find((section) => section.id === id);
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { after: 240 },
    children: [new TextRun({ text: config?.label ?? '', color: (config?.color ?? '#000000').replace('#', ''), bold: true })],
  });
}

function fieldParagraphs(label: string, value: string): Paragraph[] {
  if (!value.trim()) return [];
  return [
    new Paragraph({
      spacing: { before: 160, after: 40 },
      children: [new TextRun({ text: label.toUpperCase(), color: SECONDARY_COLOR, bold: true, size: 16 })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: value, size: 22 })],
    }),
  ];
}

function emptyHintParagraph(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, italics: true, color: SECONDARY_COLOR, size: 22 })] });
}

function buildTitlePage(book: Book): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 3000, after: 120 },
      children: [new TextRun({ text: book.genre.join(' · '), color: SECONDARY_COLOR, size: 20 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: book.title || 'Sans titre', bold: true, size: 56 })],
    }),
  ];
}

function buildBibleParagraphs(book: Book): Paragraph[] {
  const { bible } = book;
  return [
    sectionHeading('bible'),
    ...fieldParagraphs('Ton', bible.tone),
    ...fieldParagraphs('Pitch', bible.pitch),
    ...fieldParagraphs('Synopsis développé', bible.synopsis),
    ...fieldParagraphs('Thèmes explorés', bible.themes),
    ...fieldParagraphs('Règles du monde', bible.worldRules),
  ];
}

function buildCharactersParagraphs(book: Book): Paragraph[] {
  if (book.characters.length === 0) return [sectionHeading('characters'), emptyHintParagraph('Aucun personnage.')];
  return [
    sectionHeading('characters'),
    ...book.characters.flatMap((character) => [
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: character.name || 'Sans nom', bold: true, size: 26 })],
      }),
      ...fieldParagraphs('Âge', character.age),
      ...fieldParagraphs('Apparence', character.appearance),
      ...fieldParagraphs('Psychologie', character.psychology),
      ...fieldParagraphs('Arc narratif', character.arc),
      ...fieldParagraphs('Relations', character.relations),
      ...fieldParagraphs('Voix', character.voice),
    ]),
  ];
}

function buildPlacesParagraphs(book: Book): Paragraph[] {
  if (book.places.length === 0) return [sectionHeading('places'), emptyHintParagraph('Aucun lieu.')];
  return [
    sectionHeading('places'),
    ...book.places.flatMap((place) => [
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: place.name || 'Sans nom', bold: true, size: 26 })],
      }),
      ...fieldParagraphs('Description', place.description),
      ...fieldParagraphs('Fonction narrative', place.function),
    ]),
  ];
}

function buildTimelineParagraphs(book: Book, timelineImage: TimelineImageData | null): Paragraph[] {
  if (book.timeline.length === 0) return [sectionHeading('timeline'), emptyHintParagraph('Aucun événement.')];
  if (!timelineImage) return [sectionHeading('timeline'), emptyHintParagraph('Aperçu graphique indisponible.')];

  const { width, height } = scaleToFit(timelineImage.width, timelineImage.height, MAX_IMAGE_WIDTH);
  return [
    sectionHeading('timeline'),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          type: 'png',
          data: base64ToUint8Array(timelineImage.base64),
          transformation: { width, height },
        }),
      ],
    }),
  ];
}

function buildSceneParagraphs(book: Book, scene: Book['scenes'][number], isFirst: boolean): Paragraph[] {
  const event = scene.timelineEventId ? (book.timeline.find((e) => e.id === scene.timelineEventId) ?? null) : null;
  const arc = event ? (book.arcs.find((a) => a.id === event.arcId) ?? null) : null;

  const separator = isFirst
    ? []
    : [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: '· · ·', color: BORDER_COLOR })],
        }),
      ];

  const linkBorder = { style: BorderStyle.SINGLE, size: 12, space: 8, color: (arc?.color ?? `#${BORDER_COLOR}`).replace('#', '') };
  const linkParagraphs = event
    ? [
        new Paragraph({
          spacing: { after: event.description ? 0 : 120 },
          border: { left: linkBorder },
          indent: { left: 200 },
          children: [new TextRun({ text: event.title || 'Sans titre', bold: true, size: 20 })],
        }),
        ...(event.description
          ? [
              new Paragraph({
                spacing: { after: 120 },
                border: { left: linkBorder },
                indent: { left: 200 },
                children: [new TextRun({ text: event.description, italics: true, color: SECONDARY_COLOR, size: 18 })],
              }),
            ]
          : []),
      ]
    : [];

  const contentParagraphs = scene.content.split('\n').map(
    (line) =>
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: line, size: 22 })],
      }),
  );

  return [
    ...separator,
    new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: scene.title || 'Sans titre', bold: true, size: 26 })],
    }),
    ...linkParagraphs,
    ...contentParagraphs,
  ];
}

function buildChapterHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text: title, bold: true, size: 30 })],
  });
}

function buildWritingParagraphs(book: Book): Paragraph[] {
  const groups = groupScenesByChapter(book.scenes, book.chapters).filter((group) => group.scenes.length > 0);
  if (groups.length === 0) return [sectionHeading('writing'), emptyHintParagraph('Aucune scène rédigée.')];

  const hasChapters = book.chapters.length > 0;
  return [
    sectionHeading('writing'),
    ...groups.flatMap((group) => [
      ...(hasChapters ? [buildChapterHeading(group.chapter?.title || 'Sans chapitre')] : []),
      ...group.scenes.flatMap((scene, index) => buildSceneParagraphs(book, scene, index === 0)),
    ]),
  ];
}

/** Sommaire statique (titres de chapitres dans l'ordre) — pas un champ TOC Word dynamique, pour rester identique entre l'export Word et l'export PDF. */
function buildTableOfContentsParagraphs(book: Book): Paragraph[] {
  const sortedChapters = [...book.chapters].sort((a, b) => a.order - b.order);
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      spacing: { after: 240 },
      children: [new TextRun({ text: 'Table des matières', bold: true })],
    }),
    ...sortedChapters.map(
      (chapter, index) =>
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: `${index + 1}. ${chapter.title || 'Sans titre'}`, size: 22 })],
        }),
    ),
  ];
}

function buildNotesParagraphs(book: Book): Paragraph[] {
  const notes = book.notes ?? [];
  if (notes.length === 0) return [sectionHeading('notes'), emptyHintParagraph('Aucune note.')];
  return [
    sectionHeading('notes'),
    ...notes.flatMap((note) => [
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: note.title || 'Sans titre', bold: true, size: 26 })],
      }),
      ...fieldParagraphs('Contenu', note.content),
    ]),
  ];
}

/**
 * Construit le document Word du manuscrit exporté (même contenu et ordre que l'export PDF) et le
 * sérialise en base64, prêt à être écrit sur disque puis partagé.
 */
export async function buildExportDocx(
  book: Book,
  sections: ExportableSectionId[],
  timelineImage: TimelineImageData | null,
): Promise<string> {
  const selected = new Set(sections);
  const builders: Record<ExportableSectionId, () => Paragraph[]> = {
    bible: () => buildBibleParagraphs(book),
    characters: () => buildCharactersParagraphs(book),
    places: () => buildPlacesParagraphs(book),
    timeline: () => buildTimelineParagraphs(book, timelineImage),
    writing: () => buildWritingParagraphs(book),
    notes: () => buildNotesParagraphs(book),
  };

  const includeToc = selected.has('writing') && book.chapters.length > 0;
  const children = [
    ...buildTitlePage(book),
    ...(includeToc ? buildTableOfContentsParagraphs(book) : []),
    ...SECTION_ORDER.filter((id) => selected.has(id)).flatMap((id) => builders[id]()),
  ];

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBase64String(doc);
}
