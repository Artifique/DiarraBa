export type TableName = 
  | 'managers'
  | 'fournisseurs'
  | 'clients'
  | 'volailles'
  | 'couveuses'
  | 'reservations'
  | 'reservation_volailles'
  | 'reservation_couveuses'
  | 'paiements'
  | 'livraisons'
  | 'factures'
  | 'notifications'
  | 'audit_logs';

export interface Manager {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  date_creation: string;
  date_modification: string;
  actif: boolean;
}

export interface Fournisseur {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  date_inscription: string;
  solde: number;
  actif: boolean;
  notes: string | null;
  date_modification: string;
}

export interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  date_inscription: string;
  solde: number;
  actif: boolean;
  notes: string | null;
  date_modification: string;
}

export type VolailleType = 'Poussin' | 'Canard' | 'Oua' | 'Pintade' | 'PouletChair' | 'Poule' | 'Dinde' | 'Pigeon' | 'Autre';

export interface Volaille {
  id: string;
  fournisseur_id: string;
  type: VolailleType;
  quantite_disponible: number;
  prix_unitaire: number;
  date_ajout: string;
  date_modification: string;
  description: string | null;
  actif: boolean;
}

export interface Couveuse {
  id: string;
  fournisseur_id: string;
  modele: string;
  capacite: number;
  prix_location_par_jour: number;
  date_ajout: string;
  date_modification: string;
  disponible: boolean;
  description: string | null;
  actif: boolean;
}

export type StatutReservation = 'EnAttente' | 'Confirmee' | 'Livree' | 'Annulee';
export type TypePaiement = 'Tranche' | 'Totalite';

export interface Reservation {
  id: string;
  client_id: string;
  date_reservation: string;
  date_livraison_prevue: string;
  prix_total: number;
  statut_reservation: StatutReservation;
  type_paiement: TypePaiement;
  notes: string | null;
  date_modification: string;
}

export interface ReservationVolaille {
  id: string;
  reservation_id: string;
  volaille_id: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  date_ajout: string;
}

export interface ReservationCouveuse {
  id: string;
  reservation_id: string;
  couveuse_id: string;
  date_debut: string;
  date_fin: string;
  duree_jours: number;
  prix_total: number;
  date_ajout: string;
}

export type MethodePaiement = 'Especes' | 'Cheque' | 'Virement' | 'Carte' | 'Autre';
export type StatutPaiement = 'Pending' | 'Completed' | 'Failed';

export interface Paiement {
  id: string;
  reservation_id: string;
  montant: number;
  date_paiement: string;
  methode: MethodePaiement;
  statut: StatutPaiement;
  reference: string | null;
  notes: string | null;
  date_modification: string;
}

export type StatutLivraison = 'Planifiee' | 'EnCours' | 'Livree' | 'Retardee' | 'Annulee';

export interface Livraison {
  id: string;
  reservation_id: string;
  date_livraison: string | null;
  lieu: string;
  statut: StatutLivraison;
  notes: string | null;
  date_creation: string;
  date_modification: string;
}

export type StatutFacture = 'Brouillon' | 'Emise' | 'Payee' | 'Partielle';

export interface Facture {
  id: string;
  reservation_id: string;
  numero: string;
  date_facture: string;
  montant_total: number;
  montant_paye: number;
  montant_restant: number;
  statut: StatutFacture;
  date_modification: string;
}

export type NotificationType = 'Reservation' | 'Paiement' | 'Livraison' | 'Alerte' | 'Autre';

export interface Notification {
  id: string;
  manager_id: string | null;
  client_id: string | null;
  fournisseur_id: string | null;
  type: NotificationType;
  message: string;
  date_creation: string;
  lue: boolean;
}

export interface AuditLog {
  id: string;
  manager_id: string | null;
  client_id: string | null;
  fournisseur_id: string | null;
  action: string;
  entite: string;
  entite_id: string | null;
  ancienne_valeur: string | null;
  nouvelle_valeur: string | null;
  date_action: string;
  adresse_ip: string | null;
  user_agent: string | null;
}
