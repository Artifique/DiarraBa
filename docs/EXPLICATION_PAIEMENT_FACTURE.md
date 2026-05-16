# Fonctionnement des Paiements et des Factures

Ce document explique la relation technique entre les réservations, les paiements et les factures dans le projet Tonomi.

## 1. Processus de Création
Lorsqu'une réservation est créée (via `reservationService.create`), plusieurs entités sont générées simultanément :
- La **Réservation** elle-même.
- Les **Détails** (volailles et/ou couveuses).
- Une **Facture** (initialement au statut 'Brouillon').
- Une **Livraison** (initialement planifiée).

### Pourquoi rien ne semble se passer dans la page Facture ?
Si vous ne voyez pas de factures, cela peut être dû à :
1. **Désynchronisation des noms de champs :** Une erreur a été corrigée dans le code front-end (`factures/page.tsx`) où le champ `prix_total` était utilisé au lieu de `montant_total` (le nom réel dans la base de données).
2. **Création manuelle vs automatique :** Les factures sont créées uniquement lors de la création d'une *nouvelle* réservation via le service. Les anciennes données insérées directement en SQL sans facture associée ne s'afficheront pas.

## 2. Lien Paiement -> Facture (Triggers SQL)
Le projet utilise un trigger PostgreSQL (`trigger_update_facture_paiement`) défini dans `schema.sql`.

**Fonctionnement :**
1. Un manager enregistre un **Paiement** lié à une réservation.
2. Le trigger s'exécute automatiquement après l'insertion.
3. Il recalcule la somme de tous les paiements pour cette réservation.
4. Il met à jour les champs suivants dans la table `factures` :
   - `montant_paye` : Somme totale des paiements effectués.
   - `montant_restant` : `montant_total - montant_paye`.
   - `statut` : Passe à 'Partielle' si un paiement existe, ou 'Payee' si le solde est nul.

## 3. Améliorations suggérées pour schema.sql
Pour garantir que les factures reflètent toujours la réalité, voici les recommandations :
- **Trigger de mise à jour du montant total :** Actuellement, si vous ajoutez ou supprimez des articles d'une réservation après sa création, le `montant_total` de la facture n'est pas automatiquement mis à jour. Il serait judicieux d'ajouter un trigger sur `reservations` (quand `prix_total` change) pour répercuter le changement sur `factures.montant_total`.
- **Génération automatique de facture :** Ajouter un trigger `AFTER INSERT ON reservations` pour créer la facture côté base de données plutôt que côté application, pour plus de robustesse.
