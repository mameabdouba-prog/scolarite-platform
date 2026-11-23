// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const Dossier = require('../models/Dossier');
// Importe une dépendance via require
const Piece = require('../models/Piece');
// Importe une dépendance via require
const HistoriqueAction = require('../models/HistoriqueAction');
// Importe une dépendance via require
const storage = require('./storageService');
// Importe une dépendance via require
const { withTransaction } = require('./transactionService');
// Importe une dépendance via require
const AppError = require('../utils/AppError');
// Importe une dépendance via require
const { DOCUMENT_TYPES } = require('../config/uploads');

// Déclare une fonction
async function createDossier(etudiantId, { anneeUniversitaire, filiere, niveau }) {
  // Déclare une variable
  const existing = await Dossier.findByStudentAndYear(etudiantId, anneeUniversitaire);
  // Condition: exécute le bloc si la condition est vraie
  if (existing) {
    // Lève une erreur/exception
    throw new AppError(
      // Exécute une instruction
      `Vous avez déjà un dossier pour l’année ${anneeUniversitaire}.`,
      // Exécute une instruction
      409,
      // Exécute une instruction
      'DOSSIER_EXISTS',
    // Ferme un bloc, objet ou appel
    );
  // Ferme un bloc, objet ou appel
  }

  // Déclare une variable
  const dossierId = await withTransaction(async (connection) => {
    // Déclare une variable
    const reference = Dossier.generateReference();
    // Exécute une instruction
    const [result] = await connection.execute(
      // Exécute une instruction
      `INSERT INTO dossiers (etudiant_id, annee_universitaire, filiere, niveau, etat, reference_dossier, date_soumission)
       VALUES (?, ?, ?, ?, 'EN_ATTENTE', ?, NOW())`,
      // Commentaire: contenu de template literal
      [etudiantId, anneeUniversitaire, filiere, niveau, reference],
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    await HistoriqueAction.record({
      // Commentaire: suite de commentaire bloc
      connection,
      // Commentaire: suite de commentaire bloc
      entityType: 'DOSSIER',
      // Commentaire: suite de commentaire bloc
      entityId: result.insertId,
      // Commentaire: suite de commentaire bloc
      action: 'DOSSIER_SOUMIS',
      // Commentaire: suite de commentaire bloc
      utilisateurType: 'ETUDIANT',
      // Commentaire: suite de commentaire bloc
      utilisateurId: etudiantId,
      // Commentaire: suite de commentaire bloc
      description: `Soumission du dossier ${reference} pour ${anneeUniversitaire}`,
    // Commentaire: suite de commentaire bloc
    });
    // Commentaire: suite de commentaire bloc
    return result.insertId;
  // Commentaire: suite de commentaire bloc
  });
  // Commentaire: suite de commentaire bloc
  return Dossier.findById(dossierId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function decideDossier(dossierId, { etat, commentaire, utilisateurType, utilisateurId }) {
  // Commentaire: suite de commentaire bloc
  const dossier = await Dossier.findById(dossierId);
  // Commentaire: suite de commentaire bloc
  if (!dossier) throw new AppError('Dossier introuvable.', 404, 'DOSSIER_NOT_FOUND');
  // Commentaire: suite de commentaire bloc
  if (dossier.etat !== 'EN_ATTENTE') {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Ce dossier a déjà été traité.', 409, 'DOSSIER_ALREADY_PROCESSED');
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  if (!['VALIDE', 'REJETE'].includes(etat)) {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Décision invalide.', 400, 'INVALID_DECISION');
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  if (etat === 'REJETE' && !commentaire) {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Un commentaire est obligatoire pour rejeter un dossier.', 400, 'COMMENTAIRE_REQUIS');
  // Commentaire: suite de commentaire bloc
  }

  // Commentaire: suite de commentaire bloc
  await withTransaction(async (connection) => {
    // Commentaire: suite de commentaire bloc
    await connection.execute(
      // Commentaire: suite de commentaire bloc
      `UPDATE dossiers SET etat = ?, commentaire = ?, date_traitement = NOW() WHERE id = ?`,
      // Commentaire: suite de commentaire bloc
      [etat, etat === 'REJETE' ? commentaire : (commentaire || null), dossierId],
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    await HistoriqueAction.record({
      // Commentaire: suite de commentaire bloc
      connection,
      // Commentaire: suite de commentaire bloc
      entityType: 'DOSSIER',
      // Commentaire: suite de commentaire bloc
      entityId: dossierId,
      // Commentaire: suite de commentaire bloc
      action: etat === 'VALIDE' ? 'DOSSIER_VALIDE' : 'DOSSIER_REJETE',
      // Commentaire: suite de commentaire bloc
      utilisateurType,
      // Commentaire: suite de commentaire bloc
      utilisateurId,
      // Commentaire: suite de commentaire bloc
      description: `${etat === 'VALIDE' ? 'Validation' : 'Rejet'} du dossier ${dossier.reference_dossier}`,
    // Commentaire: suite de commentaire bloc
    });
  // Commentaire: suite de commentaire bloc
  });
  // Commentaire: suite de commentaire bloc
  return Dossier.findById(dossierId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function addPiece(dossierId, file, type, { utilisateurType, utilisateurId }) {
  // Commentaire: suite de commentaire bloc
  const dossier = await Dossier.findById(dossierId);
  // Commentaire: suite de commentaire bloc
  if (!dossier) throw new AppError('Dossier introuvable.', 404, 'DOSSIER_NOT_FOUND');
  // Commentaire: suite de commentaire bloc
  if (dossier.etat !== 'EN_ATTENTE') {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Les pièces ne peuvent plus être déposées sur un dossier traité.', 409, 'DOSSIER_CLOSED');
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  if (!DOCUMENT_TYPES[type]) throw new AppError('Type de pièce invalide.', 400, 'INVALID_TYPE');

  // Commentaire: suite de commentaire bloc
  const existing = await Piece.listByDossier(dossierId);
  // Commentaire: suite de commentaire bloc
  if (existing.some((piece) => piece.type === type)) {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Cette pièce a déjà été déposée pour ce dossier.', 409, 'PIECE_EXISTS');
  // Commentaire: suite de commentaire bloc
  }

  // Commentaire: suite de commentaire bloc
  const stored = await storage.save(file);
  // Commentaire: suite de commentaire bloc
  try {
    // Commentaire: suite de commentaire bloc
    const pieceId = await withTransaction(async (connection) => {
      // Commentaire: suite de commentaire bloc
      const [result] = await connection.execute(
        // Commentaire: suite de commentaire bloc
        `INSERT INTO pieces (dossier_id, type, nom_original, nom_stockage, taille, emplacement)
         VALUES (?, ?, ?, ?, ?, ?)`,
        // Commentaire: suite de commentaire bloc
        [dossierId, type, stored.nomOriginal, stored.key, stored.taille, stored.emplacement],
      // Commentaire: suite de commentaire bloc
      );
      // Commentaire: suite de commentaire bloc
      await HistoriqueAction.record({
        // Commentaire: suite de commentaire bloc
        connection,
        // Commentaire: suite de commentaire bloc
        entityType: 'DOSSIER',
        // Commentaire: suite de commentaire bloc
        entityId: dossierId,
        // Commentaire: suite de commentaire bloc
        action: 'PIECE_DEPOSEE',
        // Commentaire: suite de commentaire bloc
        utilisateurType,
        // Commentaire: suite de commentaire bloc
        utilisateurId,
        // Commentaire: suite de commentaire bloc
        description: `Dépôt de la pièce ${DOCUMENT_TYPES[type]} (${stored.key})`,
      // Commentaire: suite de commentaire bloc
      });
      // Commentaire: suite de commentaire bloc
      return result.insertId;
    // Commentaire: suite de commentaire bloc
    });
    // Commentaire: suite de commentaire bloc
    return Piece.findById(pieceId);
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    await storage.delete(stored.key).catch(() => {});
    // Commentaire: suite de commentaire bloc
    throw error;
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function getStats() {
  // Commentaire: suite de commentaire bloc
  const [parEtat, parFiliere, parNiveau, parAnnee] = await Promise.all([
    // Commentaire: suite de commentaire bloc
    Dossier.countByEtat(),
    // Commentaire: suite de commentaire bloc
    Dossier.countByFiliere(),
    // Commentaire: suite de commentaire bloc
    Dossier.countByNiveau(),
    // Commentaire: suite de commentaire bloc
    Dossier.countByAnnee(),
  // Commentaire: suite de commentaire bloc
  ]);
  // Commentaire: suite de commentaire bloc
  return { parEtat, parFiliere, parNiveau, parAnnee };
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = { createDossier, decideDossier, addPiece, getStats };
