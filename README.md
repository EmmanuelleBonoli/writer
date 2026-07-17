# Writer

Application d'aide à l'écriture de roman (Expo / React Native, iOS · Android · Web). Un livre = un projet indépendant, avec tout ce qu'il faut pour construire son univers, structurer son intrigue et rédiger le manuscrit.

## Fonctionnalités

**Bible du roman** — ton, pitch, synopsis développé, thèmes explorés, règles du monde.

**Personnages** — fiches complètes (âge, apparence, psychologie, arc narratif, relations, voix), en galerie + détail.

**Lieux** — description sensorielle et fonction narrative de chaque lieu de l'univers.

**Timeline** — événements clés de l'intrigue, regroupés par arc principal et sous-arcs narratifs (avec jonctions entre arcs), vue liste ou graphique.

**Rédaction**
- Scènes reliables à des personnages, des lieux et un événement de la timeline
- Regroupement en chapitres (création, réorganisation, nombre de mots par chapitre, filtrage de l'affichage par chapitre)
- Import d'un document Word (`.docx`) existant
- Dictée vocale
- Réécriture assistée par IA (Gemini, via un Worker Cloudflare) : réécrit un passage existant ou génère un champ vide à partir du reste du contexte (bible, personnages, lieux, chapitre) ; un bouton permet de revenir à la version précédente après une réécriture

**Notes** — carnet libre pour les idées en vrac, pistes à explorer, dialogues à recaser, séparé de la Bible.

**Recherche globale** — cherche un mot dans toute la Bible, les personnages, les lieux, les scènes, les notes et la timeline, avec un tap pour ouvrir directement la fiche concernée. Inclut un rechercher-remplacer global (utile par exemple pour renommer un personnage partout d'un coup).

**Cohérence des données** — les références vers un élément supprimé (personnage, lieu, événement, arc) sont nettoyées automatiquement en arrière-plan, sans intervention nécessaire.

**Export** — génère le manuscrit en Word ou PDF, sections au choix, avec sommaire automatique dès qu'il y a des chapitres.

**Sauvegarde de projet** — export/import JSON pour recharger un livre sur un autre appareil (l'app ne dépend d'aucun backend : tout est stocké localement).

**Thème** clair/sombre automatique (suit le système).

## Stack technique

- [Expo](https://expo.dev) / React Native, [Expo Router](https://docs.expo.dev/router/introduction) (routing par fichiers)
- TypeScript
- [Zustand](https://github.com/pmndrs/zustand) (état global + persistance locale)
- [docx](https://www.npmjs.com/package/docx) (génération du manuscrit Word), `expo-print` (PDF)
- `expo-speech-recognition` (dictée vocale), `expo-document-picker` (import `.docx` / JSON)
- Worker Cloudflare + [Gemini](https://ai.google.dev/) (réécriture IA) — voir `server/ai-rewrite-worker/`
- [lucide-react-native](https://lucide.dev/) (icônes)

## Démarrer le projet

```bash
npm install
npx expo start
```

Depuis la sortie de la commande, ouvrez l'app dans un [build de développement](https://docs.expo.dev/develop/development-builds/introduction/), un émulateur Android, un simulateur iOS, [Expo Go](https://expo.dev/go), ou le web.

## Configurer la réécriture assistée par IA (optionnel)

La réécriture IA passe par un petit Worker Cloudflare qui appelle l'API Gemini — sans cette configuration, le reste de l'app fonctionne normalement, seule cette fonctionnalité reste indisponible.

1. Créez une clé API sur [Google AI Studio](https://aistudio.google.com/apikey).
2. Déployez le Worker :
   ```bash
   cd server/ai-rewrite-worker
   npx wrangler login
   npx wrangler secret put GEMINI_API_KEY
   npm run deploy
   ```
3. Copiez `.env.example` en `.env` à la racine du projet et renseignez l'URL affichée par `wrangler deploy` :
   ```
   EXPO_PUBLIC_AI_REWRITE_ENDPOINT=https://ai-rewrite-worker.<ton-sous-domaine>.workers.dev
   ```
4. Relancez `npx expo start`.

## Structure du projet

```
src/
  app/                 Routes (Expo Router)
  features/books/       Logique et composants de l'app (un dossier par section : bible, characters,
                         places, timeline, writing, notes, search, export...)
  types/                 Types TypeScript centralisés (un fichier par domaine)
  components/            Composants transverses (logo, toasts...)
  hooks/, constants/      Utilitaires partagés
server/ai-rewrite-worker/ Worker Cloudflare pour la réécriture IA (Gemini)
```
