import type { Book } from './book.types';
import type { Character } from './character.types';
import type { Place } from './place.types';
import type { Scene } from './writing.types';

export interface RewriteTextWithAiParams {
  book: Book;
  content: string;
  instruction: string;
  context: string;
}

export interface RewriteSceneWithAiParams {
  book: Book;
  scene: Scene;
  instruction: string;
}

export interface RewriteCharacterFieldWithAiParams {
  book: Book;
  character: Character;
  fieldKey: string;
  content: string;
  instruction: string;
}

export interface RewritePlaceFieldWithAiParams {
  book: Book;
  place: Place;
  fieldKey: string;
  content: string;
  instruction: string;
}
