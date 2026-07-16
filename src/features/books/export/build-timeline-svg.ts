import { Colors } from '@/constants/theme';
import type { Arc, TimelineEvent } from '@/types/timeline.types';

import { computeTimelineLayout, TIMELINE_NODE_HEIGHT, TIMELINE_NODE_WIDTH } from '../timeline/timeline-layout';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * Génère le SVG statique (orientation verticale) du graphe timeline pour l'export. Réutilise
 * `computeTimelineLayout` — la même géométrie que le graphe interactif de l'app — pour un rendu fidèle.
 * Couleurs fixées au thème clair : un document exporté doit rester lisible sur fond blanc à l'impression,
 * indépendamment du thème (clair/sombre) actif dans l'app au moment de l'export.
 */
export function buildTimelineSvgMarkup(events: TimelineEvent[], arcs: Arc[]): string {
  const { width, height, nodes, laneGuides, arcLines, linkPaths } = computeTimelineLayout(events, arcs, 'vertical');
  const { text, textSecondary, border, background } = Colors.light;

  const laneMarkup = laneGuides
    .map(
      (lane) => `
        <line x1="${lane.x1}" y1="${lane.y1}" x2="${lane.x2}" y2="${lane.y2}" stroke="${border}" stroke-width="1" />
        <text x="${lane.labelX}" y="${lane.labelY}" font-size="11" fill="${textSecondary}">${escapeXml(lane.title)}</text>`,
    )
    .join('');

  const arcLineMarkup = arcLines
    .map(
      (line) =>
        `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="${line.color}" stroke-width="2" />`,
    )
    .join('');

  const linkPathMarkup = linkPaths
    .map((link) => `<path d="${link.d}" fill="none" stroke="${link.color}" stroke-width="2" stroke-dasharray="5,4" />`)
    .join('');

  const nodeMarkup = nodes
    .map((node) => {
      const event = events.find((e) => e.id === node.id);
      const arc = arcs.find((a) => a.id === node.arcId);
      const title = escapeXml(truncate(event?.title || 'Sans titre', 22));
      const description = event?.description ? escapeXml(truncate(event.description, 46)) : null;
      return `
        <rect x="${node.x}" y="${node.y}" width="${TIMELINE_NODE_WIDTH}" height="${TIMELINE_NODE_HEIGHT}" rx="8"
          fill="${background}" stroke="${arc?.color ?? border}" stroke-width="2" />
        <text x="${node.x + 8}" y="${node.y + 20}" font-size="12" font-weight="700" fill="${text}">${title}</text>
        ${description ? `<text x="${node.x + 8}" y="${node.y + 36}" font-size="10" fill="${textSecondary}">${description}</text>` : ''}`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="0" y="0" width="${width}" height="${height}" fill="${background}" />
    ${laneMarkup}
    ${arcLineMarkup}
    ${linkPathMarkup}
    ${nodeMarkup}
  </svg>`;
}
