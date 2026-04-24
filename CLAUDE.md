
-- ============================================================================
-- CORRECTIF POUR L'ERREUR DE PAIEMENT (CONTRAINTE MÉTHODE)
-- ============================================================================

-- 1. Supprimer l'ancienne contrainte de méthode
ALTER TABLE paiements DROP CONSTRAINT IF EXISTS paiements_methode_check;

-- 2. Ajouter la nouvelle contrainte incluant les méthodes courantes
-- J'ai ajouté 'Orange Money', 'Mobile Money', 'Wave', 'Espece' (sans s) au cas où.
ALTER TABLE paiements ADD CONSTRAINT paiements_methode_check 
CHECK (methode IN (
    'Especes', 
    'Espece',
    'Cheque', 
    'Virement', 
    'Carte', 
    'Orange Money', 
    'Mobile Money', 
    'Wave', 
    'Moov Money',
    'Autre'
));

-- 3. (Optionnel) Si vous avez aussi une erreur sur le statut, voici comment le corriger :
ALTER TABLE paiements DROP CONSTRAINT IF EXISTS paiements_statut_check;
ALTER TABLE paiements ADD CONSTRAINT paiements_statut_check 
CHECK (statut IN ('Pending', 'Completed', 'Failed', 'En attente', 'Terminé', 'Échoué'));
