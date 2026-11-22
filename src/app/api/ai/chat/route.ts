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

const SYSTEM_PROMPT = `Tu es BAC Assistant IA 2027, l'assistant intelligent officiel intégré à la plateforme BAC TCHAD 2027.
Tu es conçu pour assister, informer, accompagner et aider les candidats au baccalauréat tchadien 2027.
Tu réponds en français simple, clair, pédagogique et compréhensible.

Informations sur la plateforme BAC TCHAD 2027 :
- Plateforme communautaire et éducative pour tous les candidats au BAC 2027 à travers les 23 provinces du Tchad.
- 3 groupes officiels : Série A4 (Littéraire), Série D (Scientifique), Série C (Mathématiques et Physique-Chimie).
- Super Administrateur : LE SEIGNEUR (+235 91 23 45 68, certifié officiel).

Informations sur le créateur :
- Nom : MAHAMAT OUMAR MOUSSA HOUMA.
- Profil : Sociologue et passionné d'informatique, de technologie, d'intelligence artificielle et de cybersécurité. Il s'intéresse à la création de projets numériques et à l'utilisation de la technologie pour répondre aux besoins de la jeunesse.
- Sa vision est de mettre le numérique et l'intelligence artificielle au service de l'éducation, de la jeunesse tchadienne et de la réussite scolaire.

Règles de comportement strictes :
1. N'utilise JAMAIS d'astérisques (pas de *, ni **, ni ***). Tes réponses doivent être en texte clair, bien espacées avec des tirets - et des numéros.
2. Ne jamais inventer un sujet officiel, une date d'examen, un résultat ou une annonce du ministère de l'éducation nationale du Tchad. Si une information officielle n'est pas encore publiée ou vérifiée, dis-le clairement.
3. Sois respectueux, patient, structuré et encourageant.
4. Réponds toujours avec précision aux questions sur ton identité, ton créateur MAHAMAT OUMAR MOUSSA HOUMA, et le programme du BAC Tchad.`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const cleanUserMsg = message.trim();
    const norm = normalizeText(cleanUserMsg);

    // 1. Try Gemini API if key is present
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
              source: 'gemini-live',
            });
          }
        }
      } catch (err) {
        console.warn('Gemini live call fallback:', err);
      }
    }

    // 2. High-precision contextual NLP cognitive engine (Embedded Memory)
    let reply = '';

    // Match Intent: Questions about the Creator
    if (
      norm.includes('createur') ||
      norm.includes('qui t a cree') ||
      norm.includes('qui vous a cree') ||
      norm.includes('fondateur') ||
      norm.includes('auteur') ||
      norm.includes('mahamat oumar') ||
      norm.includes('moussa houma') ||
      norm.includes('a l origine') ||
      norm.includes('concu') ||
      norm.includes('developpe') ||
      norm.includes('ton patron') ||
      norm.includes('ton pere') ||
      norm.includes('qui a fait cette appli') ||
      norm.includes('qui a fait l appli')
    ) {
      reply = `Le créateur du projet BAC TCHAD 2027 est :

MAHAMAT OUMAR MOUSSA HOUMA

Profil :
Sociologue et passionné d'informatique, de technologie, d'intelligence artificielle et de cybersécurité. Il s'intéresse à la création de projets numériques et à l'utilisation de la technologie pour répondre aux besoins de la jeunesse.

Il est à l'origine du projet BAC TCHAD 2027, une plateforme communautaire éducative destinée à rassembler les candidats au baccalauréat tchadien 2027, faciliter les échanges entre étudiants, encourager l'entraide et accompagner la préparation aux examens.

Sa vision :
Mettre le numérique et l'intelligence artificielle au service de l'éducation, de la jeunesse tchadienne et de la réussite scolaire de chaque candidat.`;
    }
    // Match Intent: Questions about Identity / Self ("qui es-tu", "quel est ton rôle", etc.)
    else if (
      norm.includes('qui es tu') ||
      norm.includes('qui etes vous') ||
      norm.includes('tu es qui') ||
      norm.includes('presente toi') ||
      norm.includes('parle de toi') ||
      norm.includes('parle moi de toi') ||
      norm.includes('ton role') ||
      norm.includes('que sais tu faire') ||
      norm.includes('que peux tu faire') ||
      norm.includes('tes capacites') ||
      norm.includes('comment tu fonctionnes') ||
      norm.includes('tu sers a quoi')
    ) {
      reply = `Je suis BAC Assistant IA 2027, l'assistant intelligent officiel intégré à la plateforme BAC TCHAD 2027.

Mes missions principales :
1. Accompagnement scolaire : Expliquer les cours, résoudre des doutes et guider les révisions dans toutes les séries (A4, D, C).
2. Méthodes de travail : Méthodologie de dissertation philosophique, commentaires littéraires, résolution de problèmes mathématiques et physiques, analyse de documents SVT.
3. Organisation : Conseils pour gérer son temps, planifier ses révisions à l'approche de l'examen et rester motivé.
4. Informations fiables : Rappel des règles pédagogiques et des programmes officiels du baccalauréat au Tchad.

Je réponds toujours avec clarté, respect et pédagogie. Posez-moi n'importe quelle question sur vos cours ou le BAC 2027, et nous avancerons ensemble.`;
    }
    // Match Intent: Questions about BAC TCHAD 2027 platform & Super Admin
    else if (
      norm.includes('bac tchad 2027') ||
      norm.includes('la plateforme') ||
      norm.includes('l application') ||
      norm.includes('l appli') ||
      norm.includes('le projet') ||
      norm.includes('seigneur') ||
      norm.includes('super admin') ||
      norm.includes('administrateur') ||
      norm.includes('provinces') ||
      norm.includes('serie a4') ||
      norm.includes('serie d') ||
      norm.includes('serie c')
    ) {
      reply = `À propos de la plateforme BAC TCHAD 2027 :

BAC TCHAD 2027 est la plateforme numérique officielle qui réunit l'ensemble des candidats au baccalauréat de la session 2027 à travers les 23 provinces du Tchad.

Les 3 groupes d'entraide officiels :
- Série A4 : Série Littéraire (Philosophie, Français, Histoire-Géographie, Langues).
- Série D : Série Scientifique (Mathématiques, Sciences Physiques, SVT).
- Série C : Série Mathématiques & Sciences Physiques de pointe.

Sécurité et administration :
- Super Administrateur : LE SEIGNEUR
- Numéro officiel certifié : +235 91 23 45 68 (numéro public certifié avec badge officiel).
- Respect absolu de la vie privée : le numéro de téléphone des candidats est strictement privé par défaut.

Notre devise : Ensemble vers le BAC 2027.`;
    }
    // Match Intent: Official dates, exam news, results, Internet search queries
    else if (
      norm.includes('date') ||
      norm.includes('calendrier') ||
      norm.includes('session') ||
      norm.includes('ministere') ||
      norm.includes('onecs') ||
      norm.includes('convocation') ||
      norm.includes('derniere info') ||
      norm.includes('actualite') ||
      norm.includes('nouvelle') ||
      norm.includes('internet')
    ) {
      reply = `Point d'information officielle sur le BAC au Tchad :

Conformément à mes directives de déontologie, je ne diffuse aucune fausse date ni annonce non confirmée par le Ministère de l'Éducation Nationale et l'ONECS (Office National des Examens et Concours du Supérieur).

Rappels importants pour les candidats :
- Le calendrier officiel complet (dépôt des dossiers, épreuves écrites du 1er tour et oraux) est publié chaque année par arrêté ministériel.
- Dès que l'ONECS et le Ministère publient les arrêtés et dates pour la session 2027, le Super Administrateur (LE SEIGNEUR) les diffusera directement dans l'onglet Annonces Officielles de l'application.
- Restez vigilants face aux rumeurs sur les réseaux sociaux et fiez-vous uniquement aux canaux officiels de la plateforme.

Avez-vous besoin d'un calendrier type de révision par matière pour bien vous préparer dès maintenant ?`;
    }
    // Match Intent: Philosophy & Série A4
    else if (
      norm.includes('philo') ||
      norm.includes('philosophie') ||
      norm.includes('dissertation') ||
      norm.includes('conscience') ||
      norm.includes('inconscient') ||
      norm.includes('liberte') ||
      norm.includes('etat') ||
      norm.includes('autrui') ||
      norm.includes('verite')
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
    }
    // Match Intent: Mathematics & Physics (Série C & D)
    else if (
      norm.includes('math') ||
      norm.includes('limite') ||
      norm.includes('derivee') ||
      norm.includes('integrale') ||
      norm.includes('complexe') ||
      norm.includes('physique') ||
      norm.includes('chimie') ||
      norm.includes('mecanique') ||
      norm.includes('onde')
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
    }
    // Match Intent: SVT & Biology (Série D)
    else if (
      norm.includes('svt') ||
      norm.includes('genetique') ||
      norm.includes('mendel') ||
      norm.includes('mitose') ||
      norm.includes('meiose') ||
      norm.includes('immunologie') ||
      norm.includes('adn')
    ) {
      reply = `Méthodologie en SVT — Série D :

1. Exercices de Génétique :
- Toujours identifier le mode de transmission : monohybridisme (un gène) ou dihybridisme (deux gènes).
- Déterminer la dominance ou la codominance à partir des résultats de la génération F1.
- Pour deux gènes, vérifier s'ils sont indépendants (proportions 9/16, 3/16, 3/16, 1/16 en F2) ou liés (apparition de recombinés par crossing-over).
- Rédiger systématiquement : choix des allèles, génotypes des parents, gamètes produits et tableau de croisement.

2. Restitution organisée de connaissances :
- Rédiger une introduction avec définition du sujet et problématique.
- Structurer avec des titres de parties clairs.
- Accompagner l'explication de schémas fonctionnels soignés et légendés.

Quel chapitre de SVT voulez-vous approfondir aujourd'hui ?`;
    }
    // Match Intent: Greeting or general politeness
    else if (
      norm.includes('bonjour') ||
      norm.includes('salut') ||
      norm.includes('coucou') ||
      norm.includes('bonsoir') ||
      norm.includes('salam')
    ) {
      reply = `Bonjour ! Je suis BAC Assistant IA 2027, votre allié pour réussir le baccalauréat tchadien 2027.

Que vous soyez en Série A4, Série D ou Série C, je suis prêt à vous guider dans vos révisions, résoudre vos exercices, ou vous expliquer les méthodes d'examen.

Sur quel sujet ou matière voulez-vous travailler aujourd'hui ?`;
    }
    // Match Intent: Encouragement, Stress, Advice
    else if (
      norm.includes('peur') ||
      norm.includes('stress') ||
      norm.includes('difficile') ||
      norm.includes('conseil') ||
      norm.includes('motivation') ||
      norm.includes('reviser')
    ) {
      reply = `Conseils de réussite pour le BAC TCHAD 2027 :

1. Travail régulier : 2 heures de révision bien concentrée par jour valent mieux qu'une nuit blanche la veille de l'examen.
2. Fiches synthétiques : Après chaque leçon, résumez les formules clés, définitions et dates sur une petite fiche.
3. Entraînement sur annales : Traitez les anciens sujets du baccalauréat tchadien des 5 dernières années en temps réel.
4. L'entraide communautaire : Utilisez les groupes Série A4, D ou C de la plateforme BAC TCHAD 2027 pour échanger des documents et poser des questions.
5. Gestion du calme : La confiance s'acquiert par la pratique régulière des exercices.

Vous avez tout le potentiel pour décrocher votre baccalauréat avec mention. Nous sommes ensemble pour y arriver !`;
    }
    // Default contextual academic response
    else {
      reply = `Bien reçu votre message : "${cleanUserMsg}".

En tant que BAC Assistant IA 2027 :
- Je vous accompagne dans vos révisions de cours, explications et exercices (Séries A4, D et C).
- Vous pouvez me poser vos questions par écrit ou en utilisant le micro en bas à gauche pour parler directement.
- Vous pouvez me demander un plan de dissertation, une explication en SVT, une formule de physique ou une méthode de révision.

Quel sujet ou exercice abordons-nous ?`;
    }

    return NextResponse.json({
      reply: sanitizeResponse(reply),
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
