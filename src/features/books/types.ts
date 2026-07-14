export type BookGenre =
  | 'Roman'
  | 'Fantasy'
  | 'Polar'
  | 'Romance'
  | 'Science-fiction'
  | 'Historique';

export const ALL_GENRES: BookGenre[] = ['Roman', 'Fantasy', 'Polar', 'Romance', 'Science-fiction', 'Historique'];

export interface BookBible {
  tone: string;
  pitch: string;
  synopsis: string;
  themes: string;
  worldRules: string;
}

export interface Character {
  id: string;
  name: string;
  age: string;
  appearance: string;
  psychology: string;
  arc: string;
  relations: string;
  voice: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  function: string;
}

export interface Book {
  id: string;
  title: string;
  genre: BookGenre[];
  createdAt: number;
  bible: BookBible;
  characters: Character[];
  places: Place[];
}

export const EMPTY_BIBLE: BookBible = {
  tone: '',
  pitch: '',
  synopsis: '',
  themes: '',
  worldRules: '',
};

/** Position et dimensions d'une couverture mesurées dans la fenêtre, point de départ de l'animation d'ouverture. */
export interface BookRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
