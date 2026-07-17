export interface Env {
  GEMINI_API_KEY: string;
}

const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface RewriteBible {
  tone: string;
  pitch: string;
  synopsis: string;
  themes: string;
  worldRules: string;
}

interface RewriteRequestBody {
  content: string;
  instruction: string;
  genre: string;
  bible: RewriteBible;
  /** Bloc de contexte déjà formaté côté client (personnages/lieux/timeline pour une scène, autres champs de la fiche pour un personnage/lieu…). */
  context: string;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function isRewriteRequestBody(value: unknown): value is RewriteRequestBody {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.content === 'string' &&
    typeof body.instruction === 'string' &&
    typeof body.bible === 'object' &&
    body.bible !== null &&
    typeof body.context === 'string'
  );
}

/**
 * Reconstruit le contexte du roman (bible + contexte spécifique fourni par le client) pour une
 * réécriture ou, si le champ est vide, une génération depuis zéro à partir du contexte et de l'instruction.
 */
function buildPrompt(body: RewriteRequestBody): string {
  const isEmpty = !body.content.trim();
  const task = isEmpty
    ? `Le champ ci-dessous est actuellement vide. Rédige son contenu à partir du contexte donné plus haut et de l'instruction suivante.

Instruction : ${body.instruction || 'complète ce champ de façon cohérente avec le reste du profil/contexte'}`
    : `Réécris le passage ci-dessous en respectant scrupuleusement le ton et les éléments décrits plus haut.

Instruction de réécriture : ${body.instruction || 'améliorer le style tout en gardant le sens'}

Passage à réécrire :
"""
${body.content}
"""`;

  return `Contexte du roman :
Genre : ${body.genre}
Ton : ${body.bible.tone}
Pitch : ${body.bible.pitch}
Synopsis : ${body.bible.synopsis}
Thèmes : ${body.bible.themes}
Règles du monde : ${body.bible.worldRules}

${body.context}

${task}

Réponds uniquement avec le texte ${isEmpty ? 'rédigé' : 'réécrit'}, sans commentaire ni guillemets.`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Méthode non supportée.' }, 405);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Corps de requête JSON invalide.' }, 400);
    }

    if (!isRewriteRequestBody(body)) {
      return jsonResponse({ error: 'Champs requis manquants (content, instruction, bible, context).' }, 400);
    }
    if (!body.content.trim() && !body.instruction.trim()) {
      return jsonResponse({ error: 'Champ vide et aucune instruction fournie pour le générer.' }, 400);
    }

    const geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(body) }] }],
        // Une réécriture de texte ne demande pas de raisonnement profond ; on force le niveau
        // le plus rapide pour rester sous les 120s de timeout du proxy Cloudflare.
        generationConfig: { thinkingConfig: { thinkingLevel: 'minimal' } },
      }),
    });

    if (!geminiResponse.ok) {
      console.error('Erreur Gemini :', geminiResponse.status, await geminiResponse.text());
      return jsonResponse({ error: "L'appel à Gemini a échoué." }, 502);
    }

    const data = (await geminiResponse.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return jsonResponse({ error: "Gemini n'a renvoyé aucun texte." }, 502);
    }

    return jsonResponse({ text: text.trim() });
  },
};
