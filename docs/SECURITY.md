# Architecture de Sécurité — BAC TCHAD 2027

La plateforme **BAC TCHAD 2027** applique les principes de défense en profondeur (*Zero Trust Architecture*). Le frontend n'est jamais considéré comme la source de vérité.

## 1. Protection Stricte de la Vie Privée (Numéro de Téléphone)
- **Le Problème** : Beaucoup d'applications cachent le numéro en CSS tout en l'envoyant dans le JSON de l'API. Tout utilisateur inspectant le réseau pourrait alors récupérer les numéros privés des candidats.
- **La Solution BAC TCHAD 2027** : 
  - La politique RLS et la vue PostgreSQL `public_profiles` ne renvoient la valeur de la colonne `phone` que si `phone_privacy = 'public'` ou si l'utilisateur consulte son propre profil ou si la requête émane du Super Admin.
  - Dans tous les autres cas, la valeur `NULL` est renvoyée par le moteur de base de données. Il est mathématiquement impossible d'exfiltrer un numéro privé via l'API.

## 2. Row Level Security (RLS) PostgreSQL
- Chaque table possède des politiques d'isolation par `auth.uid()`.
- Un utilisateur ne peut pas lire les messages d'un groupe s'il n'en est pas membre.
- Un utilisateur ne peut pas lire ou insérer de message dans une discussion privée s'il ne fait pas partie des 2 participants autorisés.
- L'insertion dans `group_messages` est bloquée au niveau de la politique RLS dès que `groups.is_closed = true`.

## 3. Sécurité du Super Administrateur Unique
- Aucun bouton public ne permet de s'attribuer le rôle admin.
- La colonne `is_super_admin` est protégée par une politique `UPDATE` qui interdit à un utilisateur standard de modifier son propre statut d'administrateur.
- Le numéro du Super Admin est toujours masqué dans les groupes et sur son profil.

## 4. Prévention des Abus et Modération
- **Système de Demandes** : Un membre inconnu ne peut pas saturer la boîte privée d'un autre sans acceptation préalable.
- **Blocage Réciproque** : Lorsqu'un utilisateur est bloqué, la contrainte d'exclusion empêche toute création de demande ou de message.
- **Audit Logs** : Chaque action administrative (fermeture de groupe, exclusion, suspension) est journalisée dans `admin_logs` avec date, auteur et motif.
