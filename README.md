# 🇹🇩 BAC TCHAD 2027 — Plateforme Communautaire & Messagerie PWA

> **« Ensemble vers le BAC 2027. »**  
> Plateforme officielle progressive web app (PWA) conçue pour réunir, accompagner et faire réussir les candidats au Baccalauréat Tchadien 2027.

---

## 📱 Aperçu & Fonctionnalités Clés

- **Progressive Web App (PWA) Installable** :
  - **Android** : Installation directe depuis Chrome sans passer par le store, écran de démarrage (Splash), icône dédiée, mode plein écran sans barre d'adresse.
  - **iPhone / iOS (16.4+)** : Compatible Safari avec « Ajouter à l'écran d'accueil », mode standalone, support des notifications Web Push Apple et respect des *safe areas*.
- **Authentification & Inscription Sécurisée** :
  - Inscription par email (Gmail, iCloud, Outlook, Yahoo, etc.).
  - Validation par code de confirmation OTP à 6 chiffres avec compte à rebours de 60 secondes.
  - Assistant de création de profil en 7 étapes fluides (Nom complet, 23 provinces du Tchad, numéro de téléphone, choix de confidentialité strict, Série, photo de profil facultative avec avatar de secours, récapitulatif).
- **Groupes Communautaires Officiels** :
  - **BAC TCHAD 2027 — Série A4** (Littéraire)
  - **BAC TCHAD 2027 — Série D** (Scientifique)
  - **BAC TCHAD 2027 — Série C** (Scientifique Mathématiques & Physique)
  - Capacité de verrouillage en lecture seule par le Super Admin (« Groupe fermé »).
- **Messagerie Temps Réel & Médias Riches** :
  - Discussions instantanées avec bulles stylisées et indicateurs de distribution.
  - **Réponses ciblées** (Quote reply).
  - **Réactions Emoji** (`❤️`, `😂`, `👍`, `😮`, `😢`, `🔥`, `👏`) avec compteurs dynamiques.
  - **Photos en qualité Standard ou HD** avec compression intelligente côté client.
  - **Partage de Vidéos** avec lecteur intégré et contrôle de taille.
  - **Documents Scolaires** (PDF, DOCX, PPTX, XLSX, TXT, ZIP) avec cartes interactives et téléchargement direct.
  - **Notes Vocales Modernes** : Enregistrement micro Web Audio API, forme d'onde animée, écoute avant envoi, annulation et lecteur audio personnalisé (vitesse 1x, 1.5x, 2x).
- **Messagerie Privée & Demandes de Contact** :
  - Système de demandes préalables : aucune discussion directe sans acceptation réciproque.
  - Protection absolue des numéros privés (RLS côté PostgreSQL et masquage API).
  - Possibilité de bloquer ou de signaler tout utilisateur.
- **Panneau Super Administrateur Sécurisé** :
  - Compte Super Admin unique avec badge officiel bleu vérifié.
  - Numéro de téléphone strictement masqué.
  - Tableau de bord avec indicateurs réels (inscrits par série, actifs, messages, fichiers, signalements).
  - Contrôle d'ouverture / fermeture des groupes en lecture seule en 1 clic.
  - Gestion des membres, exclusion de groupe, suspension et réactivation de comptes.
  - Espace de publication d'annonces officielles (diffusées à tous ou par série).
  - Journal d'audit d'administration immuable.
- **Optimisation pour Connexions Faibles (2G / 3G)** :
  - Mode Réseau Faible activable : compression maximale, priorité aux messages texte, téléchargement manuel des médias.
  - Cache Service Worker pour accès hors ligne aux messages déjà synchronisés.

---

## 🛠️ Stack Technologique

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend & Base de données** : Supabase (PostgreSQL, Authentification OTP, Realtime WebSockets, Storage Buckets).
- **Sécurité** : Row Level Security (RLS) sur 100% des tables, Vues SQL anonymisées (`public_profiles`), rate-limiting.
- **PWA** : Web App Manifest, Service Worker (`sw.js`), Web Push Notifications standard (VAPID).

---

## 🚀 Installation & Lancement Local

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18+ ou v20+ LTS installé.
- npm, pnpm ou yarn.

### 2. Cloner et installer les dépendances
```bash
cd C:\Users\HP\.gemini\antigravity\scratch\bac-tchad-2027
npm install
```

### 3. Configurer les variables d'environnement
Copiez `.env.example` vers `.env.local` et renseignez vos identifiants Supabase :
```bash
cp .env.example .env.local
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application est accessible sur : `http://localhost:3000`

---

## 🗄️ Initialisation de la Base de Données Supabase

1. Connectez-vous sur votre tableau de bord [Supabase](https://supabase.com/).
2. Ouvrez l'éditeur SQL (**SQL Editor**).
3. Exécutez le script complet de migration situé dans :
   `supabase/migrations/20270101000000_bac_tchad_init.sql`
4. Exécutez le script d'initialisation des groupes dans :
   `supabase/seed.sql`
5. Créez les 4 buckets de stockage dans **Storage** :
   - `avatars` (Public)
   - `chat-media` (Public / Contrôlé)
   - `chat-documents` (Contrôlé)
   - `chat-audio` (Contrôlé)

---

## 👑 Configuration du Super Administrateur Unique

Le rôle Super Admin est attribué de façon inviolable :
1. Créez votre compte sur l'application avec votre adresse email officielle.
2. Dans le tableau de bord Supabase, exécutez la requête SQL suivante pour vous élever au rang de Super Admin :
```sql
UPDATE public.profiles 
SET is_super_admin = TRUE 
WHERE email = 'admin.officiel@bactchad2027.td';
```
3. Dès cette validation, votre profil affichera le badge officiel bleu vérifié et vous aurez accès au panneau `/admin`.

---

## 📲 Guide d'Installation PWA

### Sur Android (Chrome)
1. Ouvrez `https://votre-domaine.com` dans Google Chrome.
2. La bannière **« Installer BAC TCHAD 2027 »** apparaît automatiquement en haut de l'écran.
3. Cliquez sur **Installer**. L'application s'ajoute à votre écran d'accueil avec son icône.

### Sur iPhone / iPad (Safari iOS)
1. Ouvrez `https://votre-domaine.com` dans Safari.
2. Appuyez sur le bouton **Partager** (icône rectangle avec flèche vers le haut au centre en bas).
3. Faites défiler vers le bas et touchez **« Sur l'écran d'accueil »**.
4. Touchez **Ajouter** en haut à droite.

---

## 🧪 Tests Unitaires et de Sécurité

Pour exécuter la suite de tests automatisés :
```bash
npm test
```
Les tests vérifient la conformité des 23 provinces, les 3 séries, le masquage strict des numéros privés et le verrouillage des groupes fermés.
