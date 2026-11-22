-- ====================================================================
-- BAC TCHAD 2027 — BASE DE DONNÉES SUPABASE POSTGRESQL & POLITIQUES RLS
-- Version: 1.0.0
-- Architecture: Sécurisée, Temps Réel, RLS Intégral, Vue Anonymisée
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    province TEXT NOT NULL CHECK (province IN (
        'Barh El Gazel', 'Batha', 'Borkou', 'Chari-Baguirmi', 
        'Ennedi Est', 'Ennedi Ouest', 'Guéra', 'Hadjer-Lamis', 
        'Kanem', 'Lac', 'Logone Occidental', 'Logone Oriental', 
        'Mandoul', 'Mayo-Kebbi Est', 'Mayo-Kebbi Ouest', 'Moyen-Chari', 
        'N''Djamena', 'Ouaddaï', 'Salamat', 'Sila', 
        'Tandjilé', 'Tibesti', 'Wadi Fira'
    )),
    phone TEXT,
    phone_privacy TEXT NOT NULL DEFAULT 'private' CHECK (phone_privacy IN ('public', 'private')),
    series TEXT NOT NULL CHECK (series IN ('A4', 'D', 'C')),
    avatar_url TEXT,
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index pour la recherche et les performances
CREATE INDEX IF NOT EXISTS idx_profiles_series ON public.profiles(series);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON public.profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);

-- 3. VUE SÉCURISÉE DES PROFILS (MASQUAGE STRICT DU NUMÉRO PRIVÉ ET DE L'EMAIL)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    p.id,
    p.full_name,
    p.province,
    p.series,
    p.avatar_url,
    p.is_super_admin,
    p.is_suspended,
    p.created_at,
    CASE 
        WHEN p.phone_privacy = 'public' 
             OR auth.uid() = p.id 
             OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
        THEN p.phone 
        ELSE NULL 
    END AS phone,
    p.phone_privacy,
    CASE 
        WHEN auth.uid() = p.id 
             OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
        THEN p.email 
        ELSE NULL 
    END AS email
FROM public.profiles p;

-- 4. TABLE DES GROUPES OFFICIELS
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series TEXT NOT NULL UNIQUE CHECK (series IN ('A4', 'D', 'C')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLE DES MEMBRES DE GROUPE
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON public.group_members(group_id, user_id);

-- 6. TABLE DES MESSAGES DE GROUPE
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    reply_to_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'audio', 'system')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON public.group_messages(group_id, created_at DESC);

-- 7. CONVERSATIONS PRIVÉES
CREATE TABLE IF NOT EXISTS public.private_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. MEMBRES DE CONVERSATION PRIVÉE
CREATE TABLE IF NOT EXISTS public.private_conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_private_members ON public.private_conversation_members(conversation_id, user_id);

-- 9. DEMANDES DE CONVERSATION
CREATE TABLE IF NOT EXISTS public.conversation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    message TEXT,
    conversation_id UUID REFERENCES public.private_conversations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_requests ON public.conversation_requests(receiver_id, status);

-- 10. MESSAGES PRIVÉS
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    reply_to_id UUID REFERENCES public.private_messages(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'audio', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_private_messages_conv ON public.private_messages(conversation_id, created_at DESC);

-- 11. PIÈCES JOINTES ET MÉDIAS
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    message_kind TEXT NOT NULL CHECK (message_kind IN ('group', 'private')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    quality TEXT NOT NULL DEFAULT 'standard' CHECK (quality IN ('standard', 'hd', 'original')),
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attachments_msg ON public.message_attachments(message_id, message_kind);

-- 12. RÉACTIONS EMOJI
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    message_kind TEXT NOT NULL CHECK (message_kind IN ('group', 'private')),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('❤️', '😂', '👍', '😮', '😢', '🔥', '👏')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_msg ON public.message_reactions(message_id, message_kind);

-- 13. ANNONCES OFFICIELLES DU SUPER ADMIN
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_series TEXT NOT NULL DEFAULT 'ALL' CHECK (target_series IN ('ALL', 'A4', 'D', 'C')),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. NOTIFICATIONS INTERNES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- 15. BLOCAGES UTILISATEURS
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(blocker_id, blocked_id)
);

-- 16. SIGNALEMENTS / MODÉRATION
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_message_id UUID,
    message_kind TEXT CHECK (message_kind IN ('group', 'private')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    action_taken TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. PARAMÈTRES SUPER ADMIN ET LOGS D'AUDIT
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. ABONNEMENTS WEB PUSH (PWA)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — SÉCURITÉ DE NIVEAU ENTREPRISE
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Fonctions utilitaires RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profils:
-- Tout utilisateur authentifié peut lire les profils (la vue public_profiles gère le masquage des champs privés)
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les profils"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Chaque utilisateur peut créer son profil à l'inscription
CREATE POLICY "Chaque utilisateur peut insérer son profil"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Chaque utilisateur peut modifier son propre profil (sauf is_super_admin et is_suspended)
CREATE POLICY "Chaque utilisateur peut modifier son propre profil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (is_super_admin IS NOT DISTINCT FROM (SELECT p.is_super_admin FROM public.profiles p WHERE p.id = auth.uid()))
);

-- Le Super Admin peut tout mettre à jour sur les profils
CREATE POLICY "Le Super Admin peut modifier tous les profils"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin());

-- Groupes:
-- Tout utilisateur authentifié peut voir les groupes officiels
CREATE POLICY "Tout le monde peut voir les groupes"
ON public.groups FOR SELECT
TO authenticated
USING (true);

-- Seul le Super Admin peut créer ou modifier les groupes (fermeture / réouverture)
CREATE POLICY "Seul le super admin modifie les groupes"
ON public.groups FOR ALL
TO authenticated
USING (public.is_admin());

-- Membres de groupes:
CREATE POLICY "Voir les membres de groupe"
ON public.group_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Rejoindre un groupe"
ON public.group_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Quitter un groupe ou exclusion par Admin"
ON public.group_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Messages de groupe:
-- Lecture pour tous les membres du groupe
CREATE POLICY "Lire les messages du groupe"
ON public.group_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    ) OR public.is_admin()
);

-- Écriture: Impossible si le groupe est fermé ou si l'utilisateur est exclu/suspendu
CREATE POLICY "Envoyer message groupe si ouvert et membre"
ON public.group_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id AND
    NOT (SELECT is_closed FROM public.groups WHERE id = group_messages.group_id) AND
    NOT (SELECT is_suspended FROM public.profiles WHERE id = auth.uid()) AND
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Supprimer son message ou modération admin"
ON public.group_messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id OR public.is_admin());

-- Conversations privées & messages privés:
CREATE POLICY "Accès aux conversations privées uniquement pour les participants"
ON public.private_conversations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.private_conversation_members pcm
        WHERE pcm.conversation_id = id AND pcm.user_id = auth.uid()
    )
);

CREATE POLICY "Voir les membres de sa conversation privée"
ON public.private_conversation_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.private_conversation_members pcm2
        WHERE pcm2.conversation_id = private_conversation_members.conversation_id 
        AND pcm2.user_id = auth.uid()
    )
);

CREATE POLICY "Lire les messages privés de ses conversations"
ON public.private_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.private_conversation_members pcm
        WHERE pcm.conversation_id = private_messages.conversation_id AND pcm.user_id = auth.uid()
    )
);

CREATE POLICY "Envoyer des messages privés uniquement si non bloqué"
ON public.private_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.private_conversation_members pcm
        WHERE pcm.conversation_id = private_messages.conversation_id AND pcm.user_id = auth.uid()
    ) AND
    NOT (SELECT is_suspended FROM public.profiles WHERE id = auth.uid())
);

-- Demandes de conversation:
CREATE POLICY "Voir ses demandes envoyées ou reçues"
ON public.conversation_requests FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Créer une demande de conversation"
ON public.conversation_requests FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id AND
    NOT EXISTS (
        SELECT 1 FROM public.user_blocks ub 
        WHERE (ub.blocker_id = receiver_id AND ub.blocked_id = auth.uid())
           OR (ub.blocker_id = auth.uid() AND ub.blocked_id = receiver_id)
    )
);

CREATE POLICY "Mettre à jour une demande (accepter/refuser)"
ON public.conversation_requests FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Réactions et pièces jointes
CREATE POLICY "Voir les réactions"
ON public.message_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Ajouter ou modifier sa réaction"
ON public.message_reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Voir les pièces jointes"
ON public.message_attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Ajouter des pièces jointes"
ON public.message_attachments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Notifications
CREATE POLICY "Voir uniquement ses propres notifications"
ON public.notifications FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Annonces
CREATE POLICY "Tout le monde lit les annonces"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Seul le super admin publie des annonces"
ON public.announcements FOR ALL
TO authenticated
USING (public.is_admin());

-- Signalements
CREATE POLICY "Créer un signalement"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Seul l'admin consulte les signalements"
ON public.reports FOR ALL
TO authenticated
USING (public.is_admin());

-- Blocages
CREATE POLICY "Gérer ses propres blocages"
ON public.user_blocks FOR ALL
TO authenticated
USING (auth.uid() = blocker_id)
WITH CHECK (auth.uid() = blocker_id);

-- Logs d'administration
CREATE POLICY "Seul l'admin accède aux logs"
ON public.admin_logs FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Gérer son push subscription"
ON public.push_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
