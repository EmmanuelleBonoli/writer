import type { Book } from '@/types/book.types';
import type { ExportableSectionId } from '@/types/export.types';

import { BOOK_SECTIONS } from '../book-sections';
import { buildTimelineSvgMarkup } from './build-timeline-svg';

const SECTION_ORDER: ExportableSectionId[] = ['bible', 'characters', 'places', 'timeline', 'writing'];

const EXPORT_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #000000;
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { padding: 32px; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .title-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 250mm;
    text-align: center;
  }
  .title-page .genre { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #60646C; margin-bottom: 8px; }
  .title-page h1 { font-size: 32px; margin: 0; }
  .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .section-accent { width: 36px; height: 4px; border-radius: 2px; }
  .section-title { font-size: 20px; font-weight: 700; }
  .field { margin-bottom: 16px; }
  .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #60646C; margin-bottom: 4px; }
  .field-value { font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
  .card { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #C7C9D1; }
  .card:last-child { border-bottom: none; }
  .card-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .scene { margin-bottom: 24px; }
  .scene-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
  .scene-link { border-left: 3px solid #C7C9D1; padding-left: 10px; margin-bottom: 10px; }
  .scene-link-title { font-size: 12px; font-weight: 700; }
  .scene-link-desc { font-size: 11px; color: #60646C; font-style: italic; }
  .scene-text { font-size: 13px; line-height: 1.6; white-space: pre-wrap; tab-size: 2; -moz-tab-size: 2; }
  .scene-separator { text-align: center; color: #C7C9D1; letter-spacing: 10px; margin: 24px 0; }
  .empty-hint { font-size: 13px; color: #60646C; font-style: italic; }
  .timeline-image { width: 100%; }
  .timeline-image svg { width: 100%; height: auto; }
`;

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sectionHeader(id: ExportableSectionId): string {
  const config = BOOK_SECTIONS.find((section) => section.id === id);
  if (!config) return '';
  return `<div class="section-header"><div class="section-accent" style="background:${config.color}"></div><div class="section-title">${escapeHtml(config.label)}</div></div>`;
}

function field(label: string, value: string): string {
  if (!value.trim()) return '';
  return `<div class="field"><div class="field-label">${escapeHtml(label)}</div><div class="field-value">${escapeHtml(value)}</div></div>`;
}

function emptyHint(text: string): string {
  return `<div class="empty-hint">${escapeHtml(text)}</div>`;
}

function buildTitlePage(book: Book): string {
  return `<div class="page title-page">
    <div class="genre">${escapeHtml(book.genre.join(' · '))}</div>
    <h1>${escapeHtml(book.title || 'Sans titre')}</h1>
  </div>`;
}

function buildBibleSection(book: Book): string {
  const { bible } = book;
  return `<div class="page">
    ${sectionHeader('bible')}
    ${field('Ton', bible.tone)}
    ${field('Pitch', bible.pitch)}
    ${field('Synopsis développé', bible.synopsis)}
    ${field('Thèmes explorés', bible.themes)}
    ${field('Règles du monde', bible.worldRules)}
  </div>`;
}

function buildCharactersSection(book: Book): string {
  const cards = book.characters
    .map(
      (character) => `
      <div class="card">
        <div class="card-name">${escapeHtml(character.name || 'Sans nom')}</div>
        ${field('Âge', character.age)}
        ${field('Apparence', character.appearance)}
        ${field('Psychologie', character.psychology)}
        ${field('Arc narratif', character.arc)}
        ${field('Relations', character.relations)}
        ${field('Voix', character.voice)}
      </div>`,
    )
    .join('');
  return `<div class="page">${sectionHeader('characters')}${cards || emptyHint('Aucun personnage.')}</div>`;
}

function buildPlacesSection(book: Book): string {
  const cards = book.places
    .map(
      (place) => `
      <div class="card">
        <div class="card-name">${escapeHtml(place.name || 'Sans nom')}</div>
        ${field('Description', place.description)}
        ${field('Fonction narrative', place.function)}
      </div>`,
    )
    .join('');
  return `<div class="page">${sectionHeader('places')}${cards || emptyHint('Aucun lieu.')}</div>`;
}

function buildTimelineSection(book: Book): string {
  if (book.timeline.length === 0) {
    return `<div class="page">${sectionHeader('timeline')}${emptyHint('Aucun événement.')}</div>`;
  }
  const svg = buildTimelineSvgMarkup(book.timeline, book.arcs);
  return `<div class="page">${sectionHeader('timeline')}<div class="timeline-image">${svg}</div></div>`;
}

function buildWritingSection(book: Book): string {
  const sortedScenes = [...book.scenes].sort((a, b) => a.order - b.order);
  const scenesHtml = sortedScenes
    .map((scene, index) => {
      const event = scene.timelineEventId ? (book.timeline.find((e) => e.id === scene.timelineEventId) ?? null) : null;
      const arc = event ? (book.arcs.find((a) => a.id === event.arcId) ?? null) : null;
      const linkHtml = event
        ? `<div class="scene-link" style="border-color:${arc?.color ?? '#C7C9D1'}">
            <div class="scene-link-title">${escapeHtml(event.title || 'Sans titre')}</div>
            ${event.description ? `<div class="scene-link-desc">${escapeHtml(event.description)}</div>` : ''}
          </div>`
        : '';
      const separator = index > 0 ? '<div class="scene-separator">· · ·</div>' : '';
      return `${separator}
        <div class="scene">
          <div class="scene-title">${escapeHtml(scene.title || 'Sans titre')}</div>
          ${linkHtml}
          <div class="scene-text">${escapeHtml(scene.content)}</div>
        </div>`;
    })
    .join('');
  return `<div class="page">${sectionHeader('writing')}${scenesHtml || emptyHint('Aucune scène rédigée.')}</div>`;
}

const SECTION_BUILDERS: Record<ExportableSectionId, (book: Book) => string> = {
  bible: buildBibleSection,
  characters: buildCharactersSection,
  places: buildPlacesSection,
  timeline: buildTimelineSection,
  writing: buildWritingSection,
};

/**
 * Construit le HTML complet du manuscrit exporté : page de titre, puis un saut de page par section
 * sélectionnée, dans l'ordre du menu de l'app (Bible, Personnages, Lieux, Timeline, Rédaction).
 */
export function buildExportHtml(book: Book, sections: ExportableSectionId[]): string {
  const selected = new Set(sections);
  const body = SECTION_ORDER.filter((id) => selected.has(id))
    .map((id) => SECTION_BUILDERS[id](book))
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>${EXPORT_CSS}</style></head><body>${buildTitlePage(book)}${body}</body></html>`;
}
