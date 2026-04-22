-- ============================================================================
-- SCHÉMA SQL - APPLICATION DE GESTION DE VOLAILLE
-- ============================================================================
-- Base de données pour la gestion des volailles, couveuses, clients et fournisseurs
-- ============================================================================

-- ============================================================================
-- 1. TABLE MANAGER (Gérant)
-- ============================================================================
CREATE TABLE managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 2. TABLE FOURNISSEUR
-- ============================================================================
CREATE TABLE fournisseurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    adresse TEXT,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solde DECIMAL(15, 2) DEFAULT 0.00,
    actif BOOLEAN DEFAULT TRUE,
    notes TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TABLE CLIENT
-- ============================================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    adresse TEXT,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solde DECIMAL(15, 2) DEFAULT 0.00,
    actif BOOLEAN DEFAULT TRUE,
    notes TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. TABLE VOLAILLE
-- ============================================================================
CREATE TABLE volailles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fournisseur_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Poussin', 'Canard', 'Oua', 'Pintade', 'PouletChair', 'Poule', 'Dinde', 'Pigeon', 'Autre')),
    quantite_disponible INTEGER NOT NULL DEFAULT 0,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 5. TABLE COUVEUSE
-- ============================================================================
CREATE TABLE couveuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fournisseur_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE CASCADE,
    modele VARCHAR(255) NOT NULL,
    capacite INTEGER NOT NULL,
    prix_location_par_jour DECIMAL(10, 2) NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disponible BOOLEAN DEFAULT TRUE,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 6. TABLE RESERVATION
-- ============================================================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_livraison_prevue DATE NOT NULL,
    prix_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    statut_reservation VARCHAR(50) NOT NULL DEFAULT 'EnAttente' CHECK (statut_reservation IN ('EnAttente', 'Confirmee', 'Livree', 'Annulee')),
    type_paiement VARCHAR(50) NOT NULL CHECK (type_paiement IN ('Tranche', 'Totalite')),
    notes TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prix_total_positif CHECK (prix_total >= 0)
);

-- ============================================================================
-- 7. TABLE RESERVATION_VOLAILLE (Détails des volailles réservées)
-- ============================================================================
CREATE TABLE reservation_volailles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    volaille_id UUID NOT NULL REFERENCES volailles(id) ON DELETE RESTRICT,
    quantite INTEGER NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(15, 2) NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quantite_positive CHECK (quantite > 0),
    CONSTRAINT sous_total_positif CHECK (sous_total >= 0)
);

-- ============================================================================
-- 8. TABLE RESERVATION_COUVEUSE (Détails des couveuses réservées)
-- ============================================================================
CREATE TABLE reservation_couveuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    couveuse_id UUID NOT NULL REFERENCES couveuses(id) ON DELETE RESTRICT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    duree_jours INTEGER NOT NULL,
    prix_total DECIMAL(15, 2) NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT date_coherence CHECK (date_fin >= date_debut),
    CONSTRAINT prix_positif CHECK (prix_total >= 0)
);

-- ============================================================================
-- 9. TABLE PAIEMENT
-- ============================================================================
CREATE TABLE paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    montant DECIMAL(15, 2) NOT NULL,
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    methode VARCHAR(50) NOT NULL CHECK (methode IN ('Especes', 'Cheque', 'Virement', 'Carte', 'Autre')),
    statut VARCHAR(50) NOT NULL DEFAULT 'Completed' CHECK (statut IN ('Pending', 'Completed', 'Failed')),
    reference VARCHAR(255),
    notes TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT montant_positif CHECK (montant > 0)
);

-- ============================================================================
-- 10. TABLE LIVRAISON
-- ============================================================================
CREATE TABLE livraisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE CASCADE,
    date_livraison TIMESTAMP,
    lieu VARCHAR(255) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'Planifiee' CHECK (statut IN ('Planifiee', 'EnCours', 'Livree', 'Retardee', 'Annulee')),
    notes TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. TABLE FACTURE
-- ============================================================================
CREATE TABLE factures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE CASCADE,
    numero VARCHAR(50) UNIQUE NOT NULL,
    date_facture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(15, 2) NOT NULL,
    montant_paye DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    montant_restant DECIMAL(15, 2) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'Brouillon' CHECK (statut IN ('Brouillon', 'Emise', 'Payee', 'Partielle')),
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT montants_positifs CHECK (montant_total >= 0 AND montant_paye >= 0 AND montant_restant >= 0)
);

-- ============================================================================
-- 12. TABLE NOTIFICATION
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID REFERENCES managers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Reservation', 'Paiement', 'Livraison', 'Alerte', 'Autre')),
    message TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lue BOOLEAN DEFAULT FALSE,
    CONSTRAINT au_moins_un_utilisateur CHECK (
        (manager_id IS NOT NULL) OR (client_id IS NOT NULL) OR (fournisseur_id IS NOT NULL)
    )
);

-- ============================================================================
-- 13. TABLE AUDIT (Historique des actions)
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID REFERENCES managers(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entite VARCHAR(100) NOT NULL,
    entite_id UUID,
    ancienne_valeur TEXT,
    nouvelle_valeur TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adresse_ip VARCHAR(45),
    user_agent TEXT
);

-- ============================================================================
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- ============================================================================

-- Index sur les clés étrangères
CREATE INDEX idx_volailles_fournisseur ON volailles(fournisseur_id);
CREATE INDEX idx_couveuses_fournisseur ON couveuses(fournisseur_id);
CREATE INDEX idx_reservations_client ON reservations(client_id);
CREATE INDEX idx_reservation_volailles_reservation ON reservation_volailles(reservation_id);
CREATE INDEX idx_reservation_volailles_volaille ON reservation_volailles(volaille_id);
CREATE INDEX idx_reservation_couveuses_reservation ON reservation_couveuses(reservation_id);
CREATE INDEX idx_reservation_couveuses_couveuse ON reservation_couveuses(couveuse_id);
CREATE INDEX idx_paiements_reservation ON paiements(reservation_id);
CREATE INDEX idx_livraisons_reservation ON livraisons(reservation_id);
CREATE INDEX idx_factures_reservation ON factures(reservation_id);

-- Index sur les statuts et dates
CREATE INDEX idx_reservations_statut ON reservations(statut_reservation);
CREATE INDEX idx_reservations_date_livraison ON reservations(date_livraison_prevue);
CREATE INDEX idx_paiements_date ON paiements(date_paiement);
CREATE INDEX idx_livraisons_statut ON livraisons(statut);
CREATE INDEX idx_factures_statut ON factures(statut);
CREATE INDEX idx_notifications_lue ON notifications(lue);

-- Index pour recherche
CREATE INDEX idx_fournisseurs_nom ON fournisseurs(nom);
CREATE INDEX idx_clients_nom ON clients(nom);
CREATE INDEX idx_volailles_type ON volailles(type);

-- ============================================================================
-- VUE POUR LES STATISTIQUES
-- ============================================================================

-- Vue : Résumé des réservations par statut
CREATE VIEW v_reservations_par_statut AS
SELECT 
    statut_reservation,
    COUNT(*) as nombre_reservations,
    SUM(prix_total) as montant_total
FROM reservations
GROUP BY statut_reservation;

-- Vue : Détails des paiements par réservation
CREATE VIEW v_paiements_par_reservation AS
SELECT 
    r.id as reservation_id,
    c.nom as client_nom,
    r.prix_total,
    COALESCE(SUM(p.montant), 0) as montant_paye,
    r.prix_total - COALESCE(SUM(p.montant), 0) as montant_restant,
    CASE 
        WHEN COALESCE(SUM(p.montant), 0) = 0 THEN 'Non payée'
        WHEN COALESCE(SUM(p.montant), 0) < r.prix_total THEN 'Partiellement payée'
        ELSE 'Payée'
    END as statut_paiement
FROM reservations r
LEFT JOIN clients c ON r.client_id = c.id
LEFT JOIN paiements p ON r.id = p.reservation_id
GROUP BY r.id, c.nom, r.prix_total;

-- Vue : Disponibilité des couveuses
CREATE VIEW v_couveuses_disponibilite AS
SELECT 
    c.id,
    c.modele,
    c.capacite,
    c.prix_location_par_jour,
    c.disponible,
    COUNT(rc.id) as reservations_actives
FROM couveuses c
LEFT JOIN reservation_couveuses rc ON c.id = rc.couveuse_id
LEFT JOIN reservations r ON rc.reservation_id = r.id
WHERE r.statut_reservation IN ('EnAttente', 'Confirmee') OR r.id IS NULL
GROUP BY c.id, c.modele, c.capacite, c.prix_location_par_jour, c.disponible;

-- Vue : Inventaire des volailles
CREATE VIEW v_inventaire_volailles AS
SELECT 
    v.id,
    v.type,
    f.nom as fournisseur_nom,
    v.quantite_disponible,
    v.prix_unitaire,
    v.quantite_disponible * v.prix_unitaire as valeur_stock
FROM volailles v
JOIN fournisseurs f ON v.fournisseur_id = f.id
WHERE v.actif = TRUE
ORDER BY v.type, f.nom;

-- ============================================================================
-- TRIGGERS POUR L'INTÉGRITÉ DES DONNÉES
-- ============================================================================

-- Trigger : Mettre à jour le montant_restant de la facture après un paiement
CREATE OR REPLACE FUNCTION update_facture_montant_restant()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE factures
    SET 
        montant_paye = (
            SELECT COALESCE(SUM(montant), 0)
            FROM paiements
            WHERE reservation_id = NEW.reservation_id
        ),
        montant_restant = montant_total - (
            SELECT COALESCE(SUM(montant), 0)
            FROM paiements
            WHERE reservation_id = NEW.reservation_id
        ),
        statut = CASE 
            WHEN montant_total - (
                SELECT COALESCE(SUM(montant), 0)
                FROM paiements
                WHERE reservation_id = NEW.reservation_id
            ) = 0 THEN 'Payee'
            WHEN (
                SELECT COALESCE(SUM(montant), 0)
                FROM paiements
                WHERE reservation_id = NEW.reservation_id
            ) > 0 THEN 'Partielle'
            ELSE 'Brouillon'
        END
    WHERE reservation_id = NEW.reservation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_facture_paiement
AFTER INSERT OR UPDATE ON paiements
FOR EACH ROW
EXECUTE FUNCTION update_facture_montant_restant();

-- Trigger : Calculer le sous_total de reservation_volailles
CREATE OR REPLACE FUNCTION calculate_reservation_volaille_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sous_total := NEW.quantite * NEW.prix_unitaire;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_reservation_volaille_subtotal
BEFORE INSERT OR UPDATE ON reservation_volailles
FOR EACH ROW
EXECUTE FUNCTION calculate_reservation_volaille_subtotal();

-- Trigger : Calculer la durée et le prix des couveuses réservées
CREATE OR REPLACE FUNCTION calculate_couveuse_duration_and_price()
RETURNS TRIGGER AS $$
BEGIN
    NEW.duree_jours := NEW.date_fin - NEW.date_debut + 1;
    NEW.prix_total := NEW.duree_jours * (
        SELECT prix_location_par_jour
        FROM couveuses
        WHERE id = NEW.couveuse_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_couveuse_duration_and_price
BEFORE INSERT OR UPDATE ON reservation_couveuses
FOR EACH ROW
EXECUTE FUNCTION calculate_couveuse_duration_and_price();

-- Trigger : Calculer le prix total de la réservation
CREATE OR REPLACE FUNCTION calculate_reservation_total_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reservations
    SET prix_total = (
        COALESCE((SELECT SUM(sous_total) FROM reservation_volailles WHERE reservation_id = NEW.reservation_id), 0) +
        COALESCE((SELECT SUM(prix_total) FROM reservation_couveuses WHERE reservation_id = NEW.reservation_id), 0)
    )
    WHERE id = NEW.reservation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_reservation_total_price_volaille
AFTER INSERT OR UPDATE ON reservation_volailles
FOR EACH ROW
EXECUTE FUNCTION calculate_reservation_total_price();

CREATE TRIGGER trigger_calculate_reservation_total_price_couveuse
AFTER INSERT OR UPDATE ON reservation_couveuses
FOR EACH ROW
EXECUTE FUNCTION calculate_reservation_total_price();

-- Trigger : Enregistrer les modifications dans l'audit
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        action,
        entite,
        entite_id,
        ancienne_valeur,
        nouvelle_valeur
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger d'audit aux tables principales
CREATE TRIGGER trigger_audit_reservations
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER trigger_audit_paiements
AFTER INSERT OR UPDATE OR DELETE ON paiements
FOR EACH ROW
EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER trigger_audit_livraisons
AFTER INSERT OR UPDATE OR DELETE ON livraisons
FOR EACH ROW
EXECUTE FUNCTION log_audit_changes();

-- ============================================================================
-- DONNÉES D'EXEMPLE (OPTIONNEL)
-- ============================================================================

-- Insérer un manager
INSERT INTO managers (nom, email, telephone, mot_de_passe) VALUES
('Admin Volaille', 'admin@volaille.com', '+212612345678', 'hashed_password_here');

-- Insérer des fournisseurs
INSERT INTO fournisseurs (nom, telephone, email, adresse) VALUES
('Ferme Nationale', '+212612345678', 'ferme@national.com', 'Marrakech, Maroc'),
('Élevage Premium', '+212623456789', 'premium@elevage.com', 'Casablanca, Maroc'),
('Volailles du Sud', '+212634567890', 'sud@volailles.com', 'Agadir, Maroc');

-- Insérer des clients
INSERT INTO clients (nom, telephone, email, adresse) VALUES
('Ahmed Bennani', '+212612111111', 'ahmed@email.com', 'Rabat, Maroc'),
('Fatima Alaoui', '+212612222222', 'fatima@email.com', 'Fès, Maroc'),
('Mohammed Karim', '+212612333333', 'mohammed@email.com', 'Tangier, Maroc');

-- Insérer des volailles
INSERT INTO volailles (fournisseur_id, type, quantite_disponible, prix_unitaire, description) VALUES
((SELECT id FROM fournisseurs LIMIT 1), 'Poussin', 500, 15.00, 'Poussins de qualité premium'),
((SELECT id FROM fournisseurs LIMIT 1), 'Poulet de Chair', 300, 45.00, 'Poulets de chair prêts à la vente'),
((SELECT id FROM fournisseurs OFFSET 1 LIMIT 1), 'Canard', 200, 35.00, 'Canards de race locale'),
((SELECT id FROM fournisseurs OFFSET 2 LIMIT 1), 'Pintade', 150, 50.00, 'Pintades fermières');

-- Insérer des couveuses
INSERT INTO couveuses (fournisseur_id, modele, capacite, prix_location_par_jour, description) VALUES
((SELECT id FROM fournisseurs LIMIT 1), 'Couveuse Automatique 1000', 1000, 50.00, 'Couveuse automatique haute capacité'),
((SELECT id FROM fournisseurs OFFSET 1 LIMIT 1), 'Couveuse Semi-Auto 500', 500, 30.00, 'Couveuse semi-automatique'),
((SELECT id FROM fournisseurs OFFSET 2 LIMIT 1), 'Couveuse Manuelle 200', 200, 15.00, 'Couveuse manuelle compacte');

-- ============================================================================
-- FIN DU SCHÉMA SQL
-- ============================================================================
