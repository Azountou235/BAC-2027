import { NextResponse } from 'next/server';

// Strict cleaner to guarantee no asterisks in responses
function sanitizeResponse(text: string): string {
  return text
    .replace(/\*{1,4}/g, '') // remove *, **, ***, ****
    .replace(/_{2,4}/g, '')
    .trim();
}

// Remove accents and punctuation for resilient matching
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_.,?!;:'"«»\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Language detection: Arabic, English, or French
function detectLanguage(text: string): 'ar' | 'en' | 'fr' {
  // Check Arabic characters
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';

  const lower = text.toLowerCase();
  const arabicKeywords = ['salam', 'marhaba', 'choukran', 'shukran', 'kifak', 'labas', 'chouf', 'ahlan', 'afwan'];
  if (arabicKeywords.some((w) => lower.includes(w))) return 'ar';

  const englishKeywords = ['hello', 'hi ', 'how are you', 'help me', 'exam', 'revision', 'what is', 'thank you', 'please explain'];
  if (englishKeywords.some((w) => lower.includes(w))) return 'en';

  return 'fr';
}

const SYSTEM_PROMPT = `Tu es BAC Assistant IA 2027, l'assistant intelligent officiel intégré à la plateforme BAC TCHAD 2027.
Tu es conçu pour assister, informer, accompagner et aider les candidats au baccalauréat tchadien 2027.
Tu réponds dans la langue de l'utilisateur (français, arabe ou anglais).

RÈGLE ABSOLUE SUR LE CRÉATEUR :
Si l'utilisateur demande qui est le créateur, qui a développé l'application ou qui est derrière le projet, réponds UNIQUEMENT et STRICTEMENT :
"Mon créateur est le fondateur de BAC TCHAD, passionné d'informatique et engagé dans le développement de cette plateforme éducative."
Ne divulgue JAMAIS de numéro de téléphone, d'adresse e-mail personnelle ou de coordonnées privées. N'invente aucune information supplémentaire.

RÈGLE DES ASTÉRISQUES :
N'utilise JAMAIS d'astérisques (pas de *, ni **, ni ***). Tes réponses doivent être en texte clair, bien espacées avec des tirets - et des numéros.

RÈGLE OFFICIELLE :
Ne jamais inventer une date officielle non confirmée par le Ministère de l'Éducation Nationale du Tchad.`;

export async function POST(req: Request) {
  try {
    const { message, history, isVoiceNote, audioDuration } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const cleanUserMsg = message.trim();
    const norm = normalizeText(cleanUserMsg);
    const lang = detectLanguage(cleanUserMsg);

    // 1. Check Creator Questions First (Strict Protection)
    if (
      norm.includes('createur') ||
      norm.includes('qui t a cree') ||
      norm.includes('qui vous a cree') ||
      norm.includes('fondateur') ||
      norm.includes('auteur') ||
      norm.includes('a l origine') ||
      norm.includes('concu') ||
      norm.includes('developpe') ||
      norm.includes('ton patron') ||
      norm.includes('ton pere') ||
      norm.includes('qui a fait cette appli') ||
      norm.includes('qui a fait l appli') ||
      norm.includes('qui est derriere')
    ) {
      const creatorReply =
        lang === 'ar'
          ? 'تم إنشاء هذا المساعد الذكي من قبل مؤسس BAC TCHAD، وهو شغوف بالتكنولوجيا وملتزم بتطوير هذه المنصة التعليمية لخدمة الطلاب.'
          : lang === 'en'
          ? 'My creator is the founder of BAC TCHAD, passionate about computer science and committed to the development of this educational platform.'
          : "Mon créateur est le fondateur de BAC TCHAD, passionné d'informatique et engagé dans le développement de cette plateforme éducative.";

      return NextResponse.json({
        reply: sanitizeResponse(creatorReply),
        language: lang,
        source: 'creator-protection',
      });
    }

    // 2. Multilingual responses
    if (lang === 'ar') {
      return NextResponse.json({
        reply: sanitizeResponse(
          'أهلاً بك! أنا المساعد الذكي الرسمي لمنصة BAC TCHAD 2027.\n\nأنا هنا لمرافقتك في مراجعة دروسك لجميع الشعب (A4 الأدبية، D العلمية، و C الرياضيات والفيزياء).\n\nيمكنك إرسال رسائلك الصوتية أو النصية وسأجيبك بكل وضوح لمساعدتك في النجاح في البكالوريا 2027.'
        ),
        language: 'ar',
        source: 'arabic-mode',
      });
    }

    if (lang === 'en') {
      return NextResponse.json({
        reply: sanitizeResponse(
          'Hello! I am BAC Assistant IA 2027, the official smart assistant integrated into the BAC TCHAD 2027 platform.\n\nI am here to guide and support all candidates in Series A4 (Literature), Series D (Sciences), and Series C (Mathematics & Physics).\n\nFeel free to ask questions about your syllabus, exam preparation methods, or practice exercises.'
        ),
        language: 'en',
        source: 'english-mode',
      });
    }

    // 3. Try Gemini API if key is present
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const contents = [];

        if (Array.isArray(history)) {
          for (const h of history.slice(-6)) {
            contents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            });
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nQuestion de l'utilisateur : ${cleanUserMsg}` }],
        });

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawReply) {
            return NextResponse.json({
              reply: sanitizeResponse(rawReply),
              language: lang,
              source: 'gemini-live',
            });
          }
        }
      } catch (err) {
        console.warn('Gemini live call fallback:', err);
      }
    }

    // 4. Fallback Contextual French NLP Engine
    let reply = '';

    if (
      norm.includes('qui es tu') ||
      norm.includes('qui etes vous') ||
      norm.includes('tu es qui') ||
      norm.includes('presente toi') ||
      norm.includes('parle de toi') ||
      norm.includes('parle moi de toi') ||
      norm.includes('ton role') ||
      norm.includes('que sais tu faire')
    ) {
      reply = `Je suis BAC Assistant IA 2027, l'assistant intelligent officiel intégré à la plateforme BAC TCHAD 2027.

Mes missions principales :
1. Accompagnement scolaire : Expliquer les cours, résoudre des doutes et guider les révisions dans toutes les séries (A4, D, C).
2. Méthodes de travail : Méthodologie de dissertation philosophique, commentaires littéraires, résolution de problèmes mathématiques et physiques, analyse de documents SVT.
3. Organisation : Conseils pour gérer son temps, planifier ses révisions à l'approche de l'examen et rester motivé.
4. Écoute des vocaux : Vous pouvez m'envoyer des notes vocales en français, arabe ou anglais, et je vous réponds dans la même langue.

Posez-moi n'importe quelle question sur vos cours ou le BAC 2027, et nous avancerons ensemble.`;
    } else if (
      norm.includes('bac tchad 2027') ||
      norm.includes('la plateforme') ||
      norm.includes('l application') ||
      norm.includes('l appli') ||
      norm.includes('le projet')
    ) {
      reply = `À propos de la plateforme BAC TCHAD 2027 :

BAC TCHAD 2027 est la plateforme numérique officielle qui réunit l'ensemble des candidats au baccalauréat de la session 2027 à travers les 23 provinces du Tchad.

Les 3 groupes d'entraide officiels :
- Série A4 : Série Littéraire (Philosophie, Français, Histoire-Géographie, Langues).
- Série D : Série Scientifique (Mathématiques, Sciences Physiques, SVT).
- Série C : Série Mathématiques & Sciences Physiques de pointe.

Notre devise : Ensemble vers le BAC 2027.`;
    } else if (
      norm.includes('philo') ||
      norm.includes('philosophie') ||
      norm.includes('dissertation')
    ) {
      reply = `Méthodologie de la Dissertation Philosophique (Série A4) :

La dissertation philosophique repose sur 3 étapes incontournables :

1. Introduction :
- L'amorce : amener le sujet à partir d'un fait ou d'une observation générale.
- Définition des termes clés : cerner le sens précis des concepts.
- Problématique : formuler la tension et le problème philosophique central.
- Annonce du plan : exposer les axes de réflexion (2 ou 3 parties).

2. Développement (Thèse, Antithèse, Synthèse) :
- Première partie : Défendre la première thèse qui s'impose naturellement, étayée par des arguments et des philosophes de référence.
- Deuxième partie : Montrer les limites ou les contradictions de la première thèse (contre-thèse).
- Troisième partie : Dépasser l'opposition par une synthèse approfondie.

3. Conclusion :
- Bilan synthétique du raisonnement.
- Réponse nette et argumentée à la question posée.
- Ouverture du sujet vers un horizon plus large.

Indiquez-moi votre sujet de philosophie précis, et nous construirons le plan détaillé ensemble.`;
    } else if (
      norm.includes('math') ||
      norm.includes('limite') ||
      norm.includes('derivee') ||
      norm.includes('integrale') ||
      norm.includes('physique')
    ) {
      reply = `Guide Méthodologique en Sciences Exactes (Séries C et D) :

1. Analyse Mathématique :
- Formes indéterminées : 0/0, infini/infini, 0 x infini, +infini - infini.
- Pour lever l'indétermination : factorisation par le terme dominant, quantité conjuguée, ou application du nombre dérivé.
- Dérivée usuelle : la dérivée de ln(u) est u'/u ; la dérivée de exp(u) est u' x exp(u).
- Intégration par parties : formule de base intégrale de u'v = uv - intégrale de uv'. Utiliser l'astuce ALPES pour le choix de la fonction.

2. Sciences Physiques et Chimie :
- Mécanique : Toujours définir le système, le référentiel d'étude (supposé galiléen), le bilan des forces extérieures appliquées, puis appliquer la deuxième loi de Newton.
- Chimie : Bien équilibrer les équations d'oxydoréduction et de réactions acide-base, puis dresser le tableau d'avancement pour déterminer le réactif limitant.

Quel exercice précis souhaitez-vous résoudre maintenant ? Envoyez l'énoncé.`;
    } else if (
      norm.includes('svt') ||
      norm.includes('genetique') ||
      norm.includes('mendel')
    ) {
      reply = `Méthodologie en SVT — Série D :

1. Exercices de Génétique :
- Toujours identifier le mode de transmission : monohybridisme (un gène) ou dihybridisme (deux gènes).
- Déterminer la dominance ou la codominance à partir des résultats de la génération F1.
- Pour deux gènes, vérifier s'ils sont indépendants (proportions 9/16, 3/16, 3/16, 1/16 en F2) ou liés (apparition de recombinés par crossing-over).
- Rédiger systématiquement : choix des allèles, génotypes des parents, gamètes produits et tableau de croisement.

Quel chapitre de SVT voulez-vous approfondir aujourd'hui ?`;
    } else if (
      norm.includes('bonjour') ||
      norm.includes('salut') ||
      norm.includes('bonsoir')
    ) {
      reply = `Bonjour ! Je suis BAC Assistant IA 2027, votre allié pour réussir le baccalauréat tchadien 2027.

Que vous soyez en Série A4, Série D ou Série C, je suis prêt à vous guider dans vos révisions, résoudre vos exercices, ou vous expliquer les méthodes d'examen.

Sur quel sujet ou matière voulez-vous travailler aujourd'hui ?`;
    } else {
      reply = `Bien reçu votre message : "${cleanUserMsg}".

En tant que BAC Assistant IA 2027 :
- Je vous accompagne dans vos révisions de cours, explications et exercices (Séries A4, D et C).
- Vous pouvez m'envoyer un message écrit ou un message vocal. Je comprends le français, l'arabe et l'anglais.
- Demandez-moi un plan de dissertation, un corrigé d'exercice, une formule ou un conseil de révision.

Quel sujet ou exercice abordons-nous ?`;
    }

    return NextResponse.json({
      reply: sanitizeResponse(reply),
      language: lang,
      source: 'bac-assistant-memory',
    });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json(
      {
        reply: sanitizeResponse(
          "Je suis BAC Assistant IA 2027. Une erreur technique temporaire est survenue, mais je reste à votre disposition. Posez votre question sur vos cours ou révisions et je vous répondrai immédiatement."
        ),
      },
      { status: 200 }
    );
  }
}
