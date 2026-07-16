import type { Arc, TimelineEvent, TimelineOrientation } from '@/types/timeline.types';

export const TIMELINE_NODE_WIDTH = 130;
export const TIMELINE_NODE_HEIGHT = 56;
const MARGIN_LEFT = 12;
const MARGIN_TOP = 28;

// Espacement entre événements consécutifs (axe principal) et entre lanes d'arcs (axe transversal),
// différent selon l'orientation pour laisser assez de place aux nœuds et aux libellés.
const MAIN_SPACING = { horizontal: 140, vertical: 90 };
const CROSS_SPACING = { horizontal: 90, vertical: 160 };

export interface TimelineNodeLayout {
  id: string;
  arcId: string;
  x: number;
  y: number;
}

export interface TimelineLaneGuide {
  arcId: string;
  title: string;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
}

export interface TimelineArcLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface TimelineLinkPath {
  id: string;
  d: string;
  color: string;
}

export interface TimelineLayout {
  width: number;
  height: number;
  /** Un nœud par événement, dans le même ordre que le tableau `events` fourni en entrée. */
  nodes: TimelineNodeLayout[];
  laneGuides: TimelineLaneGuide[];
  arcLines: TimelineArcLine[];
  linkPaths: TimelineLinkPath[];
}

/**
 * Calcule la géométrie du graphe timeline (positions des nœuds, lignes d'arc, courbes de jonction,
 * lanes) indépendamment de tout rendu. Partagée entre l'affichage interactif (`TimelineGraphView`) et
 * la génération du SVG statique utilisé à l'export, pour garantir un rendu identique aux deux endroits.
 */
export function computeTimelineLayout(
  events: TimelineEvent[],
  arcs: Arc[],
  orientation: TimelineOrientation,
): TimelineLayout {
  const isHorizontal = orientation === 'horizontal';
  const laneIndex = new Map(arcs.map((arc, i) => [arc.id, i]));
  const mainSpacing = MAIN_SPACING[orientation];
  const crossSpacing = CROSS_SPACING[orientation];

  const pos = (event: TimelineEvent) => {
    const rank = events.findIndex((e) => e.id === event.id);
    const lane = laneIndex.get(event.arcId) ?? 0;
    return isHorizontal
      ? { x: MARGIN_LEFT + rank * mainSpacing, y: MARGIN_TOP + lane * crossSpacing }
      : { x: MARGIN_LEFT + lane * crossSpacing, y: MARGIN_TOP + rank * mainSpacing };
  };

  const width = isHorizontal
    ? MARGIN_LEFT * 2 + Math.max(events.length, 1) * mainSpacing
    : MARGIN_LEFT * 2 + Math.max(arcs.length, 1) * crossSpacing;
  const height = isHorizontal
    ? MARGIN_TOP + arcs.length * crossSpacing + 20
    : MARGIN_TOP + Math.max(events.length, 1) * mainSpacing + 20;

  const nodes: TimelineNodeLayout[] = events.map((event) => ({
    id: event.id,
    arcId: event.arcId,
    ...pos(event),
  }));

  const laneGuides: TimelineLaneGuide[] = arcs.map((arc, i) => {
    if (isHorizontal) {
      const y = MARGIN_TOP + i * crossSpacing + TIMELINE_NODE_HEIGHT / 2;
      return { arcId: arc.id, title: arc.title, color: arc.color, x1: 0, y1: y, x2: width, y2: y, labelX: 4, labelY: MARGIN_TOP + i * crossSpacing - 8 };
    }
    const x = MARGIN_LEFT + i * crossSpacing + TIMELINE_NODE_WIDTH / 2;
    return { arcId: arc.id, title: arc.title, color: arc.color, x1: x, y1: 0, x2: x, y2: height, labelX: MARGIN_LEFT + i * crossSpacing, labelY: 16 };
  });

  const arcLines: TimelineArcLine[] = [];
  arcs.forEach((arc) => {
    const arcEvents = events.filter((event) => event.arcId === arc.id);
    for (let i = 0; i < arcEvents.length - 1; i++) {
      const from = pos(arcEvents[i]);
      const to = pos(arcEvents[i + 1]);
      arcLines.push({
        id: `${arc.id}-${i}`,
        x1: from.x + TIMELINE_NODE_WIDTH / 2,
        y1: from.y + TIMELINE_NODE_HEIGHT / 2,
        x2: to.x + TIMELINE_NODE_WIDTH / 2,
        y2: to.y + TIMELINE_NODE_HEIGHT / 2,
        color: arc.color,
      });
    }
  });

  const linkPaths: TimelineLinkPath[] = [];
  arcs.forEach((arc) => {
    if (!arc.linkedArcId) return;
    const arcEvents = events.filter((event) => event.arcId === arc.id);
    const last = arcEvents[arcEvents.length - 1];
    if (!last) return;

    const from = pos(last);
    let to: { x: number; y: number };
    if (arc.connectsToEventId) {
      const target = events.find((event) => event.id === arc.connectsToEventId);
      if (!target) return;
      to = pos(target);
    } else {
      const targetLane = laneIndex.get(arc.linkedArcId) ?? 0;
      to = isHorizontal
        ? { x: from.x, y: MARGIN_TOP + targetLane * crossSpacing }
        : { x: MARGIN_LEFT + targetLane * crossSpacing, y: from.y };
    }

    const fromX = from.x + TIMELINE_NODE_WIDTH / 2;
    const fromY = from.y + TIMELINE_NODE_HEIGHT / 2;
    const toX = to.x + TIMELINE_NODE_WIDTH / 2;
    const toY = to.y + TIMELINE_NODE_HEIGHT / 2;

    const d = isHorizontal
      ? (() => {
          const midY = (fromY + toY) / 2;
          return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        })()
      : (() => {
          const midX = (fromX + toX) / 2;
          return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        })();

    linkPaths.push({ id: arc.id, d, color: arc.color });
  });

  return { width, height, nodes, laneGuides, arcLines, linkPaths };
}
