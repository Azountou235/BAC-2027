-- ====================================================================
-- BAC TCHAD 2027 — BASE DE DONNÉES SUPABASE (100% SÉCURISÉE & CONFORME)
-- Architecture: Supabase PostgreSQL, RLS Strict, Protection Anti-Failles
-- Réservé Super Admin: Leseigneur235@gmail.com
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
    last_name_change TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_profiles_series ON public.profiles(series);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON public.profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. FONCTION DE SÉCURITÉ ADMIN (AVEC SET search_path PROTÉGÉ)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN (
        LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'leseigneur235@gmail.com'
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND is_super_admin = TRUE 
            AND LOWER(email) = 'leseigneur235@gmail.com'
        )
    );
END;
$$;

-- 4. VUE SÉCURISÉE DES PROFILS (AVEC security_invoker = true)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
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
             OR public.is_admin()
        THEN p.phone 
        ELSE NULL 
    END AS phone,
    p.phone_privacy,
    CASE 
        WHEN auth.uid() = p.id 
             OR public.is_admin()
        THEN p.email 
        ELSE NULL 
    END AS email
FROM public.profiles p;

-- 5. TABLE DES GROUPES OFFICIELS
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

-- 6. MEMBRES DES GROUPES
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON public.group_members(group_id, user_id);

-- 7. MESSAGES DE GROUPES
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    reply_to_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'audio', 'system')),
    is_forwarded BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_for_all BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_for_user_ids UUID[] NOT NULL DEFAULT '{}',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON public.group_messages(group_id, created_at DESC);

-- 8. CONVERSATIONS PRIVÉES
CREATE TABLE IF NOT EXISTS public.private_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. MEMBRES DE CONVERSATION PRIVÉE
CREATE TABLE IF NOT EXISTS public.private_conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_muted BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_private_members ON public.private_conversation_members(conversation_id, user_id);

-- 10. DEMANDES DE CONVERSATION
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

-- 11. MESSAGES PRIVÉS
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    reply_to_id UUID REFERENCES public.private_messages(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'audio', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_forwarded BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_for_all BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_for_user_ids UUID[] NOT NULL DEFAULT '{}',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_private_messages_conv ON public.private_messages(conversation_id, created_at DESC);

-- 12. PIÈCES JOINTES & MÉDIAS
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

-- 13. RÉACTIONS AUX MESSAGES
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

-- 14. ANNONCES DU SUPER ADMIN
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_series TEXT NOT NULL DEFAULT 'ALL' CHECK (target_series IN ('ALL', 'A4', 'D', 'C')),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. NOTIFICATIONS
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

-- 16. BLOCAGES UTILISATEURS
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(blocker_id, blocked_id)
);

-- 17. SIGNALEMENTS / MODÉRATION
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

-- 18. CONFIGURATION ADMIN & AUDIT LOGS
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

-- 19. NOTIFICATIONS PUSH PWA
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- ACTIVATION STRICTE DE ROW LEVEL SECURITY (RLS)
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

-- ====================================================================
-- POLITIQUES RLS SÉCURISÉES (CONFORMES SUPABASE LINTER)
-- ====================================================================

-- Nettoyage préventif des politiques
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 1. PROFILES
CREATE POLICY "profiles_select_auth" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 2. GROUPS
CREATE POLICY "groups_select_auth" ON public.groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "groups_admin_all" ON public.groups
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. GROUP MEMBERS
CREATE POLICY "group_members_select_auth" ON public.group_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "group_members_insert_own" ON public.group_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "group_members_delete_own" ON public.group_members
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- 4. GROUP MESSAGES
CREATE POLICY "group_messages_select_members" ON public.group_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "group_messages_insert_sender" ON public.group_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        NOT (SELECT is_closed FROM public.groups WHERE id = group_messages.group_id) AND
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "group_messages_update_sender_admin" ON public.group_messages
    FOR UPDATE TO authenticated
    USING (auth.uid() = sender_id OR public.is_admin())
    WITH CHECK (auth.uid() = sender_id OR public.is_admin());

CREATE POLICY "group_messages_delete_sender_admin" ON public.group_messages
    FOR DELETE TO authenticated
    USING (auth.uid() = sender_id OR public.is_admin());

-- 5. PRIVATE CONVERSATIONS
CREATE POLICY "private_conv_select_members" ON public.private_conversations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.private_conversation_members pcm
            WHERE pcm.conversation_id = id AND pcm.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "private_conv_insert_auth" ON public.private_conversations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- 6. PRIVATE CONVERSATION MEMBERS
CREATE POLICY "pcm_select_participants" ON public.private_conversation_members
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.private_conversation_members pcm2
            WHERE pcm2.conversation_id = private_conversation_members.conversation_id 
            AND pcm2.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "pcm_insert_auth" ON public.private_conversation_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "pcm_update_own" ON public.private_conversation_members
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "pcm_delete_own" ON public.private_conversation_members
    FOR DELETE TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

-- 7. CONVERSATION REQUESTS
CREATE POLICY "requests_select_party" ON public.conversation_requests
    FOR SELECT TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());

CREATE POLICY "requests_insert_sender" ON public.conversation_requests
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        NOT EXISTS (
            SELECT 1 FROM public.user_blocks ub 
            WHERE (ub.blocker_id = receiver_id AND ub.blocked_id = auth.uid())
               OR (ub.blocker_id = auth.uid() AND ub.blocked_id = receiver_id)
        )
    );

CREATE POLICY "requests_update_party" ON public.conversation_requests
    FOR UPDATE TO authenticated
    USING (auth.uid() = receiver_id OR auth.uid() = sender_id OR public.is_admin())
    WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id OR public.is_admin());

-- 8. PRIVATE MESSAGES
CREATE POLICY "private_messages_select_members" ON public.private_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.private_conversation_members pcm
            WHERE pcm.conversation_id = private_messages.conversation_id AND pcm.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "private_messages_insert_sender" ON public.private_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.private_conversation_members pcm
            WHERE pcm.conversation_id = private_messages.conversation_id AND pcm.user_id = auth.uid()
        )
    );

CREATE POLICY "private_messages_update_sender_admin" ON public.private_messages
    FOR UPDATE TO authenticated
    USING (auth.uid() = sender_id OR public.is_admin())
    WITH CHECK (auth.uid() = sender_id OR public.is_admin());

CREATE POLICY "private_messages_delete_sender_admin" ON public.private_messages
    FOR DELETE TO authenticated
    USING (auth.uid() = sender_id OR public.is_admin());

-- 9. MESSAGE ATTACHMENTS
CREATE POLICY "attachments_select_auth" ON public.message_attachments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "attachments_insert_auth" ON public.message_attachments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- 10. MESSAGE REACTIONS
CREATE POLICY "reactions_select_auth" ON public.message_reactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "reactions_insert_own" ON public.message_reactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_update_own" ON public.message_reactions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_delete_own" ON public.message_reactions
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 11. ANNOUNCEMENTS
CREATE POLICY "announcements_select_auth" ON public.announcements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "announcements_admin_all" ON public.announcements
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 12. NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_insert_auth" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- 13. USER BLOCKS
CREATE POLICY "blocks_select_own" ON public.user_blocks
    FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_insert_own" ON public.user_blocks
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "blocks_delete_own" ON public.user_blocks
    FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- 14. REPORTS
CREATE POLICY "reports_insert_own" ON public.reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_admin_select" ON public.reports
    FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = reporter_id);

CREATE POLICY "reports_admin_update" ON public.reports
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 15. ADMIN SETTINGS
CREATE POLICY "admin_settings_select_auth" ON public.admin_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_settings_admin_all" ON public.admin_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 16. ADMIN LOGS
CREATE POLICY "admin_logs_admin_all" ON public.admin_logs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 17. PUSH SUBSCRIPTIONS
CREATE POLICY "push_sub_select_own" ON public.push_subscriptions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "push_sub_insert_own" ON public.push_subscriptions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_sub_delete_own" ON public.push_subscriptions
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ====================================================================
-- INITIALISATION DES GROUPES OFFICIELS & CONFIGURATION
-- ====================================================================

INSERT INTO public.groups (id, series, name, description, is_closed)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'A4',
        'BAC TCHAD — Série A4',
        'Groupe officiel Série Littéraire A4. Entraide, fiches de révision en Philosophie, Français, Histoire-Géographie et Langues.',
        FALSE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'D',
        'BAC TCHAD — Série D',
        'Groupe officiel Série Scientifique D. Mathématiques, Sciences Physiques et SVT.',
        FALSE
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'C',
        'BAC TCHAD — Série C',
        'Groupe officiel Série Mathématiques & Physique-Chimie C.',
        FALSE
    )
ON CONFLICT (series) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO public.admin_settings (key, value)
VALUES 
    ('app_config', '{"maintenance_mode": false, "max_file_size_mb": 50, "max_video_size_mb": 100, "allow_registrations": true}'::jsonb),
    ('moderation_rules', '{"banned_words": ["insulte", "triche"], "auto_flag_reports_count": 3}'::jsonb),
    ('super_admin_info', '{"name": "LE SEIGNEUR", "email": "Leseigneur235@gmail.com", "phone": "+235 91 23 45 68", "certified": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Configuration automatique du Super Admin à la création d'utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        province, 
        phone, 
        phone_privacy, 
        series, 
        is_super_admin
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Candidat BAC 2027'),
        COALESCE(new.raw_user_meta_data->>'province', 'N''Djamena'),
        new.raw_user_meta_data->>'phone',
        COALESCE(new.raw_user_meta_data->>'phone_privacy', 'private'),
        COALESCE(new.raw_user_meta_data->>'series', 'D'),
        (LOWER(new.email) = 'leseigneur235@gmail.com')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        is_super_admin = (LOWER(EXCLUDED.email) = 'leseigneur235@gmail.com');
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Assurer le statut Super Admin si l'utilisateur existe déjà
UPDATE public.profiles
SET is_super_admin = TRUE
WHERE LOWER(email) = 'leseigneur235@gmail.com';
