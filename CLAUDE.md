# Guide d'utilisation Supabase - Projet DIARRABA

Ce document explique comment configurer et utiliser Supabase pour le projet Diarraba.

## 1. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet avec vos identifiants Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anonyme
```

## 2. Initialisation de la Base de Données

Pour configurer la structure de la base de données, copiez et exécutez le contenu du fichier `docs/schema.sql` dans l'éditeur SQL de votre tableau de bord Supabase.

### Étapes :
1. Allez sur [Supabase Dashboard](https://app.supabase.com/).
2. Sélectionnez votre projet.
3. Cliquez sur **SQL Editor** dans la barre latérale gauche.
4. Cliquez sur **New Query**.
5. Collez le contenu de `docs/schema.sql`.
6. Cliquez sur **Run**.

## 3. Structure des Tables

Le projet utilise les tables principales suivantes :
- `managers` : Profils administrateurs.
- `clients` : Gestion du portefeuille client.
- `fournisseurs` : Réseau de partenaires.
- `volailles` : Inventaire des types de volailles et stocks.
- `couveuses` : Parc d'équipement et disponibilité.
- `reservations` : Commandes et locations.
- `paiements` : Suivi des transactions financières.
- `factures` : Documents comptables.
- `notifications` : Alertes et rappels système.
- `audit_logs` : Historique complet des actions.

## 4. Requetes Utiles pour la Maintenance

### Créer un premier manager
```sql
INSERT INTO managers (nom, email, telephone, mot_de_passe) 
VALUES ('Administrateur', 'admin@volaille.com', '+221XXXXXXXXX', 'mot_de_passe_en_clair_ou_hash');
```

### Vérifier le stock bas
```sql
SELECT type, quantite_disponible 
FROM volailles 
WHERE quantite_disponible < 50;
```

### Voir les revenus mensuels
```sql
SELECT date_trunc('month', date_paiement) as mois, sum(montant) as total
FROM paiements
WHERE statut = 'Completed'
GROUP BY mois
ORDER BY mois DESC;
```

## 5. Automatisation (Triggers)

Le schéma SQL inclut des triggers automatiques pour :
1. **Mise à jour des factures** : Le montant payé et le restant sont recalculés après chaque insertion dans la table `paiements`.
2. **Calcul des prix** : Le `prix_total` des réservations est automatiquement mis à jour selon les articles ajoutés.
3. **Audit** : Toutes les modifications (INSERT, UPDATE, DELETE) sur les tables clés sont enregistrées dans `audit_logs`.

## 6. Types TypeScript

Si vous modifiez le schéma, n'oubliez pas de mettre à jour `src/types/database.ts` pour maintenir la sécurité du typage dans l'application.
