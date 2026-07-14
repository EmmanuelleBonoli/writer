export type BookGenre =
  | 'Roman'
  | 'Fantasy'
  | 'Polar'
  | 'Romance'
  | 'Science-fiction'
  | 'Historique';

export interface Book {
  id: string;
  title: string;
  genre: BookGenre[];
  createdAt: number;
}

/** Position et dimensions d'une couverture mesurées dans la fenêtre, point de départ de l'animation d'ouverture. */
export interface BookRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
