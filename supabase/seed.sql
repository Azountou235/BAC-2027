-- ====================================================================
-- BAC TCHAD 2027 — DONNÉES INITIALES DU SYSTÈME (SEED)
-- Groupes officiels, Super Admin LE SEIGNEUR et configuration
-- ====================================================================

-- 1. Insertion des trois groupes communautaires officiels
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

-- 2. Paramètres administratifs globaux
INSERT INTO public.admin_settings (key, value)
VALUES 
    ('app_config', '{"maintenance_mode": false, "max_file_size_mb": 50, "max_video_size_mb": 100, "allow_registrations": true}'::jsonb),
    ('moderation_rules', '{"banned_words": ["insulte", "triche"], "auto_flag_reports_count": 3}'::jsonb),
    ('super_admin_info', '{"name": "LE SEIGNEUR", "email": "Leseigneur235@gmail.com", "phone": "+235 91 23 45 68", "certified": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
