import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';

import type { Character } from './character.types';
import type { Note } from './note.types';
import type { Place } from './place.types';
import type { Arc, TimelineEvent } from './timeline.types';
import type { Chapter, Scene } from './writing.types';

export type BookGenre =
  | 'Roman'
  | 'Fantasy'
  | 'Polar'
  | 'Romance'
  | 'Science-fiction'
  | 'Historique';

export interface BookBible {
  tone: string;
  pitch: string;
  synopsis: string;
  themes: string;
  worldRules: string;
}

export interface Book {
  id: string;
  title: string;
  genre: BookGenre[];
  createdAt: number;
  bible: BookBible;
  characters: Character[];
  places: Place[];
  timeline: TimelineEvent[];
  arcs: Arc[];
  chapters: Chapter[];
  scenes: Scene[];
  notes: Note[];
}

/** Position et dimensions d'une couverture mesurées dans la fenêtre, point de départ de l'animation d'ouverture. */
export interface BookRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BookSectionId = 'bible' | 'characters' | 'places' | 'timeline' | 'writing' | 'notes' | 'export';

export interface BookSectionConfig {
  id: BookSectionId;
  label: string;
  icon: LucideIcon;
  color: string;
  placeholder: string;
}

export interface BibleSectionProps {
  book: Book;
}

export interface GenreSelectorProps {
  selectedGenres: BookGenre[];
  onToggle: (genre: BookGenre) => void;
}

export interface GenreChipProps {
  genre: BookGenre;
  selected: boolean;
  onToggle: () => void;
}

export interface GenreStripeProps {
  genres: BookGenre[];
}

export interface BookCoverProps {
  book: Book;
  onOpen: (book: Book, rect: BookRect) => void;
}

export interface BooksListProps {
  books: Book[];
  onOpenBook: (book: Book, rect: BookRect) => void;
}

export interface CreateBookOverlayProps {
  originRect: BookRect;
  onClose: () => void;
}

export interface BookExpandedOverlayProps {
  book: Book;
  originRect: BookRect;
  onClose: () => void;
}

export interface CoverFaceProps {
  book: Book;
  originWidth: number;
  targetWidth: number;
  widthValue: SharedValue<number>;
}

export interface ExpandingCoverOverlayProps {
  originRect: BookRect;
  coverBackgroundColor: string;
  onClose: () => void;
  interactivePage?: boolean;
  renderCover: (params: { widthValue: SharedValue<number>; targetWidth: number }) => ReactNode;
  pageContent: ReactNode;
}

export interface BookDetailMenuProps {
  activeSection: BookSectionId;
  onSelectSection: (id: BookSectionId) => void;
  onBack: () => void;
  onSearch: () => void;
  /** La recherche est actuellement affichée — met en avant son onglet et neutralise celui de la section en dessous. */
  searchActive: boolean;
}

export interface AddBookCardProps {
  onOpen: (rect: BookRect) => void;
}

export interface BookDetailScreenProps {
  bookId: string;
}
