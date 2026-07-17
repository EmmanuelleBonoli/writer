import type { ReactNode } from 'react';

export interface TagOption {
  id: string;
  label: string;
}

export interface TagChipsProps {
  options: TagOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export interface CheckableDropdownProps {
  label: string;
  options: TagOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
}

export interface LabeledFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export interface MasterDetailProps<T extends { id: string }> {
  items: T[];
  accentColor: string;
  addLabel: string;
  emptyLabel: string;
  onAdd: () => T;
  onDelete: (id: string) => void;
  renderCard: (item: T) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  /** Actions accessoires affichées à côté de chaque carte de la liste (ex. flèches de réordonnancement). */
  renderCardAccessory?: (item: T, index: number) => ReactNode;
  /** Couleur de liseré à gauche de chaque carte (ex. couleur de l'arc narratif d'un événement). */
  cardAccentColor?: (item: T) => string;
  /** Sélection pilotée depuis l'extérieur (ex. tap sur un nœud du graphe Timeline) — sinon gérée en interne. */
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  /** Masque le bouton d'ajout interne, quand l'appelant en affiche un ailleurs (ex. barre d'outils toujours visible). */
  hideAddButton?: boolean;
}

export interface AiRewriteField {
  key: string;
  label: string;
  value: string;
}

export interface AiRewritePanelProps {
  title: string;
  fields: AiRewriteField[];
  rewrite: (fieldKey: string, content: string, instruction: string) => Promise<string>;
  /** `previousValue` = valeur du champ juste avant application, pour permettre à l'appelant de proposer un retour en arrière. */
  onApply: (fieldKey: string, text: string, previousValue: string) => void;
}

export interface RevertFieldButtonProps {
  onPress: () => void;
}
