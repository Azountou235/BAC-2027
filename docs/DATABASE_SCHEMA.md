# Schéma de Base de Données — BAC TCHAD 2027

L'architecture de la base de données est normalisée sous PostgreSQL hébergé sur Supabase, avec activation intégrale de Row Level Security (RLS) sur chaque table.

## 1. Table `profiles`
Stocke l'identité complète de chaque candidat.
- `id` (UUID, PK, référence `auth.users(id)` ON DELETE CASCADE)
- `email` (TEXT, NOT NULL)
- `full_name` (TEXT, NOT NULL)
- `province` (TEXT, NOT NULL, contrainte sur les 23 provinces)
- `phone` (TEXT, optionnel)
- `phone_privacy` (TEXT, NOT NULL, défaut `'private'`, `'private'` | `'public'`)
- `series` (TEXT, NOT NULL, `'A4'` | `'D'` | `'C'`)
- `avatar_url` (TEXT, optionnel)
- `is_super_admin` (BOOLEAN, NOT NULL, défaut FALSE)
- `is_suspended` (BOOLEAN, NOT NULL, défaut FALSE)
- `created_at`, `updated_at` (TIMESTAMPTZ)

## 2. Vue Sécurisée `public_profiles`
Garantit que le frontend ne peut JAMAIS obtenir le numéro privé ou l'email d'un utilisateur non autorisé :
```sql
SELECT 
    id, full_name, province, series, avatar_url, is_super_admin, is_suspended, created_at,
    CASE 
        WHEN phone_privacy = 'public' OR auth.uid() = id OR public.is_admin() 
        THEN phone ELSE NULL 
    END AS phone,
    phone_privacy
FROM public.profiles;
```

## 3. Table `groups`
Groupes communautaires officiels des 3 séries.
- `id` (UUID, PK)
- `series` (TEXT, UNIQUE, `'A4'` | `'D'` | `'C'`)
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `is_closed` (BOOLEAN, NOT NULL, défaut FALSE — Si TRUE, le groupe passe en lecture seule)

## 4. Table `group_messages`
Messages échangés dans les groupes de série.
- `id` (UUID, PK)
- `group_id` (UUID, FK `groups(id)`)
- `sender_id` (UUID, FK `profiles(id)`)
- `content` (TEXT)
- `reply_to_id` (UUID, FK `group_messages(id)`)
- `message_type` (`text`, `image`, `video`, `document`, `audio`, `system`)
- `is_deleted` (BOOLEAN, défaut FALSE)
- `created_at` (TIMESTAMPTZ)

## 5. Table `private_conversations` & `private_messages`
Messagerie privée bilatérale accessible uniquement après acceptation de la demande.

## 6. Table `conversation_requests`
Demandes de mise en relation :
- `sender_id`, `receiver_id`
- `status` (`pending`, `accepted`, `rejected`, `blocked`)

## 7. Table `message_reactions`
Réactions emoji (`❤️`, `😂`, `👍`, `😮`, `😢`, `🔥`, `👏`) avec contrainte d'unicité `(message_id, user_id)`.

## 8. Table `admin_logs`
Historique d'audit immuable des décisions du Superviseur National (Fermeture de groupe, suspension de candidat, etc.).
