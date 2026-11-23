// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const Dossier = require('../models/Dossier');
// Importe une dépendance via require
const Piece = require('../models/Piece');
// Importe une dépendance via require
const HistoriqueAction = require('../models/HistoriqueAction');
// Importe une dépendance via require
const dossierService = require('../services/dossierService');
// Importe une dépendance via require
const downloadService = require('../services/downloadService');
// Importe une dépendance via require
const { renderPage } = require('../utils/render');
// Importe une dépendance via require
const { respondWithError } = require('../utils/http');
// Importe une dépendance via require
const { normalizePagination } = require('../utils/helpers');
// Importe une dépendance via require
const AppError = require('../utils/AppError');
// Importe une dépendance via require
const { ETATS, FILIERES, NIVEAUX } = require('../config/academic');
// Importe une dépendance via require
const { DOCUMENT_TYPES } = require('../config/uploads');
// Importe une dépendance via require
const db = require('../config/database');

// Déclare une fonction
async function dashboard(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const stats = await dossierService.getStats();
    // Déclare une variable
    const enAttente = stats.parEtat.find((row) => row.etat === 'EN_ATTENTE')?.total || 0;
    // Déclare une variable
    const traites = stats.parEtat.reduce((sum, row) => (
      // Exécute une instruction
      row.etat === 'EN_ATTENTE' ? sum : sum + Number(row.total)
    // Exécute une instruction
    ), 0);
    // Exécute une instruction
    const [recents, total] = await Promise.all([
      // Exécute une instruction
      Dossier.list({}, 5, 0),
      // Exécute une instruction
      Dossier.count({}),
    // Exécute une instruction
    ]);
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'agent/dashboard', {
      // Exécute une instruction
      title: 'Tableau de bord agent',
      // Exécute une instruction
      stats,
      // Exécute une instruction
      enAttente,
      // Exécute une instruction
      traites,
      // Exécute une instruction
      total,
      // Exécute une instruction
      recents,
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function listDossiers(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const filters = {
      // Exécute une instruction
      etat: String(req.query.etat || '').trim(),
      // Exécute une instruction
      filiere: String(req.query.filiere || '').trim(),
      // Exécute une instruction
      niveau: String(req.query.niveau || '').trim(),
      // Exécute une instruction
      search: String(req.query.search || '').trim(),
    // Ferme un bloc, objet ou appel
    };
    // Exécute une instruction
    const { page, limit, offset } = normalizePagination(req.query);
    // Exécute une instruction
    const [dossiers, total, facets] = await Promise.all([
      // Exécute une instruction
      Dossier.list(filters, limit, offset),
      // Exécute une instruction
      Dossier.count(filters),
      // Exécute une instruction
      Dossier.distinctFilters(),
    // Exécute une instruction
    ]);
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'agent/dossiers', {
      // Exécute une instruction
      title: 'Gestion des dossiers',
      // Exécute une instruction
      dossiers,
      // Exécute une instruction
      filters,
      // Exécute une instruction
      facets: {
        // Exécute une instruction
        filieres: facets.filieres.length ? facets.filieres : FILIERES,
        // Exécute une instruction
        niveaux: facets.niveaux.length ? facets.niveaux : NIVEAUX,
        // Exécute une instruction
        etats: ETATS,
      // Ferme un bloc ou objet
      },
      // Exécute une instruction
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function showDossier(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const dossier = await Dossier.findById(req.params.id);
    // Condition: exécute le bloc si la condition est vraie
    if (!dossier) return next(new AppError('Dossier introuvable.', 404, 'DOSSIER_NOT_FOUND'));
    // Exécute une instruction
    const [pieces, historique] = await Promise.all([
      // Exécute une instruction
      Piece.listByDossier(dossier.id),
      // Exécute une instruction
      HistoriqueAction.listByEntity('DOSSIER', dossier.id),
    // Exécute une instruction
    ]);
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'agent/dossier-detail', {
      // Exécute une instruction
      title: `Dossier ${dossier.reference_dossier}`,
      // Exécute une instruction
      dossier,
      // Exécute une instruction
      pieces,
      // Exécute une instruction
      historique,
      // Exécute une instruction
      documentTypes: DOCUMENT_TYPES,
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function processDossier(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const utilisateurType = req.session.user.role === 'AGENT' ? 'AGENT' : 'ADMINISTRATEUR';
    // Déclare une variable
    const dossier = await dossierService.decideDossier(req.params.id, {
      // Exécute une instruction
      etat: req.body.etat,
      // Exécute une instruction
      commentaire: req.body.commentaire,
      // Exécute une instruction
      utilisateurType,
      // Exécute une instruction
      utilisateurId: req.session.user.id,
    // Ferme un bloc/appel de fonction
    });
    // Exécute une instruction
    req.flash('success', `Dossier ${dossier.reference_dossier} ${dossier.etat === 'VALIDE' ? 'validé' : 'rejeté'}.`);
    // Retourne une valeur ou termine la fonction
    return res.redirect(`/agent/dossiers/${dossier.id}`);
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return respondWithError(req, res, error, `/agent/dossiers/${req.params.id}`);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function downloadPiece(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const piece = await Piece.findById(req.params.id);
    // Condition: exécute le bloc si la condition est vraie
    if (!piece) return next(new AppError('Pièce introuvable.', 404, 'PIECE_NOT_FOUND'));
    // Retourne une valeur ou termine la fonction
    return await downloadService.sendPiece(res, piece);
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function downloadAttestation(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const dossier = await Dossier.findById(req.params.id);
    // Condition: exécute le bloc si la condition est vraie
    if (!dossier) return next(new AppError('Dossier introuvable.', 404, 'DOSSIER_NOT_FOUND'));
    // Condition: exécute le bloc si la condition est vraie
    if (dossier.etat !== 'VALIDE') {
      // Retourne une valeur ou termine la fonction
      return next(new AppError('L’attestation n’est disponible que pour un dossier validé.', 409, 'DOSSIER_NOT_VALIDATED'));
    // Ferme un bloc, objet ou appel
    }
    // Retourne une valeur ou termine la fonction
    return await downloadService.sendAttestation(res, dossier);
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function recentActivity(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const actions = await db.query(
      // Exécute une instruction
      `SELECT h.*, d.reference_dossier
       FROM historique_actions h
       LEFT JOIN dossiers d ON d.id = h.entity_id AND h.entity_type = 'DOSSIER'
       ORDER BY h.created_at DESC, h.id DESC LIMIT 50`,
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    return renderPage(res, 'agent/historique', { title: 'Historique des actions', actions });
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    return next(error);
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = {
  // Commentaire: suite de commentaire bloc
  dashboard,
  // Commentaire: suite de commentaire bloc
  listDossiers,
  // Commentaire: suite de commentaire bloc
  showDossier,
  // Commentaire: suite de commentaire bloc
  processDossier,
  // Commentaire: suite de commentaire bloc
  downloadPiece,
  // Commentaire: suite de commentaire bloc
  downloadAttestation,
  // Commentaire: suite de commentaire bloc
  recentActivity,
// Commentaire: suite de commentaire bloc
};
