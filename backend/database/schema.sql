-- Commentaire SQL existant
-- Schéma MySQL 8 de l'application SCOLARITÉ
-- Commentaire SQL existant
-- Universite du Saloum (projet de demonstration)

-- Configure une variable/option SQL
SET NAMES utf8mb4;
-- Configure une variable/option SQL
SET FOREIGN_KEY_CHECKS = 0;

-- Crée une table
CREATE TABLE IF NOT EXISTS etudiants (
  -- Instruction/colonne SQL
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Instruction/colonne SQL
  numero_etudiant VARCHAR(30) NOT NULL,
  -- Instruction/colonne SQL
  nom VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  prenom VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  email VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  password VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  filiere VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  niveau VARCHAR(60) NOT NULL,
  -- Instruction/colonne SQL
  actif TINYINT(1) NOT NULL DEFAULT 1,
  -- Instruction/colonne SQL
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Instruction/colonne SQL
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Définit la clé primaire
  PRIMARY KEY (id),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_etudiants_numero (numero_etudiant),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_etudiants_email (email),
  -- Crée un index
  KEY idx_etudiants_filiere (filiere),
  -- Crée un index
  KEY idx_etudiants_niveau (niveau)
-- Fin de définition de table/instruction
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crée une table
CREATE TABLE IF NOT EXISTS agents (
  -- Instruction/colonne SQL
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Instruction/colonne SQL
  nom VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  prenom VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  email VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  password VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  actif TINYINT(1) NOT NULL DEFAULT 1,
  -- Instruction/colonne SQL
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Instruction/colonne SQL
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Définit la clé primaire
  PRIMARY KEY (id),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_agents_email (email)
-- Fin de définition de table/instruction
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crée une table
CREATE TABLE IF NOT EXISTS administrateurs (
  -- Instruction/colonne SQL
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Instruction/colonne SQL
  nom VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  prenom VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  email VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  password VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  actif TINYINT(1) NOT NULL DEFAULT 1,
  -- Instruction/colonne SQL
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Instruction/colonne SQL
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Définit la clé primaire
  PRIMARY KEY (id),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_administrateurs_email (email)
-- Fin de définition de table/instruction
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crée une table
CREATE TABLE IF NOT EXISTS dossiers (
  -- Instruction/colonne SQL
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Instruction/colonne SQL
  etudiant_id BIGINT UNSIGNED NOT NULL,
  -- Instruction/colonne SQL
  annee_universitaire VARCHAR(9) NOT NULL,
  -- Instruction/colonne SQL
  filiere VARCHAR(120) NOT NULL,
  -- Instruction/colonne SQL
  niveau VARCHAR(60) NOT NULL,
  -- Instruction/colonne SQL
  etat ENUM('EN_ATTENTE', 'VALIDE', 'REJETE') NOT NULL DEFAULT 'EN_ATTENTE',
  -- Instruction/colonne SQL
  commentaire TEXT NULL,
  -- Instruction/colonne SQL
  reference_dossier VARCHAR(40) NOT NULL,
  -- Instruction/colonne SQL
  date_soumission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Instruction/colonne SQL
  date_traitement DATETIME NULL,
  -- Instruction/colonne SQL
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Instruction/colonne SQL
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Définit la clé primaire
  PRIMARY KEY (id),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_dossiers_reference (reference_dossier),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_dossiers_etudiant_annee (etudiant_id, annee_universitaire),
  -- Crée un index
  KEY idx_dossiers_etat (etat),
  -- Crée un index
  KEY idx_dossiers_filiere (filiere),
  -- Crée un index
  KEY idx_dossiers_niveau (niveau),
  -- Crée un index
  KEY idx_dossiers_annee (annee_universitaire),
  -- Ajoute une contrainte
  CONSTRAINT fk_dossiers_etudiant FOREIGN KEY (etudiant_id)
    -- Instruction/colonne SQL
    REFERENCES etudiants (id) ON DELETE CASCADE ON UPDATE CASCADE
-- Fin de définition de table/instruction
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crée une table
CREATE TABLE IF NOT EXISTS pieces (
  -- Instruction/colonne SQL
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Instruction/colonne SQL
  dossier_id BIGINT UNSIGNED NOT NULL,
  -- Instruction/colonne SQL
  type ENUM('CARTE_IDENTITE', 'RELEVE_NOTES', 'PHOTO_IDENTITE', 'RECUE_PAIEMENT') NOT NULL,
  -- Instruction/colonne SQL
  nom_original VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  nom_stockage VARCHAR(255) NOT NULL,
  -- Instruction/colonne SQL
  taille BIGINT UNSIGNED NOT NULL,
  -- Instruction/colonne SQL
  emplacement VARCHAR(1024) NOT NULL,
  -- Instruction/colonne SQL
  date_depot DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Définit la clé primaire
  PRIMARY KEY (id),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_pieces_nom_stockage (nom_stockage),
  -- Ajoute une contrainte d’unicité
  UNIQUE KEY uq_pieces_dossier_type (dossier_id, type),
  -- Crée un index
  KEY idx_pieces_dossier (dossier_id),
  -- Ajoute une contrainte
  CONSTRAINT fk_pieces_dossier FOREIGN KEY (dossier_id)
    -- Instruction/colonne SQL
    REFERENCES dossiers (id) ON DELETE CASCADE ON UPDATE CASCADE
-- Fin de définition de table/instruction
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crée une table
CREATE TABLE IF NOT EXISTS historique_actions (
  -- Instruction/colonne SQL
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Instruction/colonne SQL
  entity_type VARCHAR(50) NOT NULL,
  -- Instruction/colonne SQL
  entity_id BIGINT UNSIGNED NOT NULL,
  -- Instruction/colonne SQL
  action VARCHAR(80) NOT NULL,
  -- Instruction/colonne SQL
  utilisateur_type VARCHAR(30) NOT NULL,
  -- Instruction/colonne SQL
  utilisateur_id BIGINT UNSIGNED NULL,
  -- Instruction/colonne SQL
  description VARCHAR(1000) NOT NULL,
  -- Instruction/colonne SQL
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Définit la clé primaire
  PRIMARY KEY (id),
  -- Crée un index
  KEY idx_historique_entity (entity_type, entity_id),
  -- Crée un index
  KEY idx_historique_created (created_at)
-- Fin de définition de table/instruction
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configure une variable/option SQL
SET FOREIGN_KEY_CHECKS = 1;
