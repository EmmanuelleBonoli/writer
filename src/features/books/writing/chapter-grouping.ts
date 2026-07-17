import type { Chapter, Scene } from '@/types/writing.types';

/** Clé de groupe/filtre pour les scènes sans chapitre (ou dont le chapitre a été supprimé depuis). */
export const UNASSIGNED_CHAPTER_KEY = '__no_chapter__';

export interface SceneGroup {
  /** null = scènes pas encore rangées dans un chapitre. */
  chapter: Chapter | null;
  scenes: Scene[];
}

/**
 * Regroupe les scènes par chapitre (chapitres triés par leur ordre, scènes triées par leur ordre au
 * sein du groupe), avec un groupe final pour les scènes sans chapitre — ou dont le chapitre a été
 * supprimé depuis. Utilisé à la fois par l'écran de rédaction et par l'export du manuscrit, pour que
 * les deux restent toujours d'accord sur l'ordre réel des scènes.
 */
export function groupScenesByChapter(scenes: Scene[], chapters: Chapter[]): SceneGroup[] {
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const chapterIds = new Set(sortedChapters.map((chapter) => chapter.id));

  const byChapterId = new Map<string, Scene[]>();
  const unassigned: Scene[] = [];
  for (const scene of scenes) {
    if (scene.chapterId && chapterIds.has(scene.chapterId)) {
      const group = byChapterId.get(scene.chapterId) ?? [];
      group.push(scene);
      byChapterId.set(scene.chapterId, group);
    } else {
      unassigned.push(scene);
    }
  }

  const byOrder = (a: Scene, b: Scene) => a.order - b.order;
  const groups: SceneGroup[] = sortedChapters.map((chapter) => ({
    chapter,
    scenes: (byChapterId.get(chapter.id) ?? []).sort(byOrder),
  }));
  groups.push({ chapter: null, scenes: unassigned.sort(byOrder) });

  return groups;
}

/** Aplatit les groupes en une seule liste ordonnée — c'est l'ordre réel du manuscrit. */
export function flattenSceneGroups(groups: SceneGroup[]): Scene[] {
  return groups.flatMap((group) => group.scenes);
}
