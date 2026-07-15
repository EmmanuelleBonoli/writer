import type { Book } from './book.types';
import type { Scene } from './writing.types';

export interface Arc {
  id: string;
  title: string;
  color: string;
  isMain: boolean;
  /** Arc auquel ce sous-arc se relie (null pour l'arc principal, ou un sous-arc indépendant). */
  linkedArcId: string | null;
  /** Événement précis de l'arc cible où la jonction se fait (null = point non précisé de cet arc). */
  connectsToEventId: string | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  characterIds: string[];
  placeId: string;
  arcId: string;
  order: number;
}

export interface TimelineSectionProps {
  book: Book;
  /** Ouvre la scène reliée à un événement (bascule l'écran sur l'onglet Rédaction). */
  onOpenScene: (sceneId: string) => void;
}

export interface TimelineGraphViewProps {
  events: TimelineEvent[];
  arcs: Arc[];
  scenes: Scene[];
  onSelectEvent: (id: string) => void;
  onOpenScene: (sceneId: string) => void;
}

export type TimelineOrientation = 'horizontal' | 'vertical';

export interface ArcManagerProps {
  arcs: Arc[];
  events: TimelineEvent[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Arc>) => void;
  onDelete: (id: string) => void;
}

export interface SceneLinkBadgeProps {
  linkedSceneId: string | null;
  onOpenScene: (sceneId: string) => void;
}
