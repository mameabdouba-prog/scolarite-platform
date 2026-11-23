// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const Dossier = require('../models/Dossier');
// Importe une dépendance via require
const Piece = require('../models/Piece');
// Importe une dépendance via require
const HistoriqueAction = require('../models/HistoriqueAction');
// Importe une dépendance via require
const Etudiant = require('../models/Etudiant');
// Importe une dépendance via require
const dossierService = require('../services/dossierService');
// Importe une dépendance via require
const authService = require('../services/authService');
// Importe une dépendance via require
const downloadService = require('../services/downloadService');
// Importe une dépendance via require
const db = require('../config/database');
// Importe une dépendance via require
const { renderPage } = require('../utils/render');
// Importe une dépendance via require
const { respondWithError } = require('../utils/http');
// Importe une dépendance via require
const AppError = require('../utils/AppError');
// Importe une dépendance via require
const { currentAcademicYear } = require('../utils/helpers');
// Importe une dépendance via require
const { DOCUMENT_TYPES } = require('../config/uploads');
// Importe une dépendance via require
const { FILIERES, NIVEAUX } = require('../config/academic');

// Déclare une fonction
async function dashboard(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const etudiant = await Etudiant.findById(req.session.user.id);
    // Déclare une variable
    const dossier = await Dossier.findLatestForStudent(req.session.user.id);
    // Déclare une variable
    const pieces = dossier ? await Piece.listByDossier(dossier.id) : [];
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'student/dashboard', {
      // Exécute une instruction
      title: 'Mon tableau de bord',
      // Exécute une instruction
      etudiant,
      // Exécute une instruction
      dossier,
      // Exécute une instruction
      pieces,
      // Exécute une instruction
      documentTypes: DOCUMENT_TYPES,
      // Exécute une instruction
      anneeCourante: currentAcademicYear(),
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
async function showProfile(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const etudiant = await Etudiant.findById(req.session.user.id);
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'student/profile', {
      // Exécute une instruction
      title: 'Mon profil',
      // Exécute une instruction
      etudiant,
      // Exécute une instruction
      values: etudiant,
      // Exécute une instruction
      filieres: FILIERES,
      // Exécute une instruction
      niveaux: NIVEAUX,
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
async function updateProfile(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const updated = await authService.updateStudentProfile(req.session.user.id, req.body);
    // Exécute une instruction
    req.session.user.nom = updated.nom;
    // Exécute une instruction
    req.session.user.prenom = updated.prenom;
    // Exécute une instruction
    req.session.user.email = updated.email;
    // Exécute une instruction
    req.flash('success', 'Vos informations personnelles ont été mises à jour.');
    // Retourne une valeur ou termine la fonction
    return res.redirect('/etudiant/profil');
  // Ferme un bloc ou objet
  } catch (error) {
    // Condition: exécute le bloc si la condition est vraie
    if (error instanceof AppError) {
      // Retourne une valeur ou termine la fonction
      return res.status(error.status).render('student/profile', {
        // Exécute une instruction
        user: req.session.user,
        // Exécute une instruction
        csrfToken: req.csrfToken(),
        // Exécute une instruction
        flash: { success: [], error: [{ message: error.message }], info: [] },
        // Exécute une instruction
        title: 'Mon profil',
        // Exécute une instruction
        etudiant: await Etudiant.findById(req.session.user.id),
        // Exécute une instruction
        values: req.body,
        // Exécute une instruction
        filieres: FILIERES,
        // Exécute une instruction
        niveaux: NIVEAUX,
      // Ferme un bloc/appel de fonction
      });
    // Ferme un bloc, objet ou appel
    }
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
    const dossiers = await db.query(
      // Exécute une instruction
      `SELECT d.*,
         (SELECT COUNT(*) FROM pieces p WHERE p.dossier_id = d.id) AS nb_pieces
       FROM dossiers d WHERE d.etudiant_id = :etudiantId
       ORDER BY d.created_at DESC, d.id DESC`,
      // Commentaire: suite de commentaire bloc
      { etudiantId: req.session.user.id },
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    return renderPage(res, 'student/dossiers', { title: 'Mes dossiers', dossiers });
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    return next(error);
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
function showNewDossier(req, res) {
  // Commentaire: suite de commentaire bloc
  return renderPage(res, 'student/dossier-new', {
    // Commentaire: suite de commentaire bloc
    title: 'Nouvelle inscription',
    // Commentaire: suite de commentaire bloc
    values: {
      // Commentaire: suite de commentaire bloc
      anneeUniversitaire: req.query.annee || currentAcademicYear(),
      // Commentaire: suite de commentaire bloc
      filiere: '',
      // Commentaire: suite de commentaire bloc
      niveau: '',
    // Commentaire: suite de commentaire bloc
    },
    // Commentaire: suite de commentaire bloc
    filieres: FILIERES,
    // Commentaire: suite de commentaire bloc
    niveaux: NIVEAUX,
  // Commentaire: suite de commentaire bloc
  });
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function createDossier(req, res, next) {
  // Commentaire: suite de commentaire bloc
  try {
    // Commentaire: suite de commentaire bloc
    const dossier = await dossierService.createDossier(req.session.user.id, req.body);
    // Commentaire: suite de commentaire bloc
    req.flash('success', `Votre dossier ${dossier.reference_dossier} a été soumis.`);
    // Commentaire: suite de commentaire bloc
    return res.redirect(`/etudiant/dossiers/${dossier.id}`);
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    return respondWithError(req, res, error, '/etudiant/inscription');
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function showDossier(req, res, next) {
  // Commentaire: suite de commentaire bloc
  try {
    // Commentaire: suite de commentaire bloc
    const dossier = await Dossier.findById(req.params.id);
    // Commentaire: suite de commentaire bloc
    if (!dossier || Number(dossier.etudiant_id) !== Number(req.session.user.id)) {
      // Commentaire: suite de commentaire bloc
      return next(new AppError('Dossier introuvable ou inaccessible.', 404, 'DOSSIER_NOT_FOUND'));
    // Commentaire: suite de commentaire bloc
    }
    // Commentaire: suite de commentaire bloc
    const [pieces, historique] = await Promise.all([
      // Commentaire: suite de commentaire bloc
      Piece.listByDossier(dossier.id),
      // Commentaire: suite de commentaire bloc
      HistoriqueAction.listByEntity('DOSSIER', dossier.id),
    // Commentaire: suite de commentaire bloc
    ]);
    // Commentaire: suite de commentaire bloc
    return renderPage(res, 'student/dossier-detail', {
      // Commentaire: suite de commentaire bloc
      title: `Dossier ${dossier.reference_dossier}`,
      // Commentaire: suite de commentaire bloc
      dossier,
      // Commentaire: suite de commentaire bloc
      pieces,
      // Commentaire: suite de commentaire bloc
      historique,
      // Commentaire: suite de commentaire bloc
      documentTypes: DOCUMENT_TYPES,
      // Commentaire: suite de commentaire bloc
      csrfParam: encodeURIComponent(req.csrfToken()),
    // Commentaire: suite de commentaire bloc
    });
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    return next(error);
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function uploadPiece(req, res, next) {
  // Commentaire: suite de commentaire bloc
  try {
    // Commentaire: suite de commentaire bloc
    const piece = await dossierService.addPiece(
      // Commentaire: suite de commentaire bloc
      req.params.id,
      // Commentaire: suite de commentaire bloc
      req.file,
      // Commentaire: suite de commentaire bloc
      req.body.type,
      // Commentaire: suite de commentaire bloc
      { utilisateurType: 'ETUDIANT', utilisateurId: req.session.user.id },
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    req.flash('success', `Pièce « ${DOCUMENT_TYPES[piece.type]} » déposée avec succès.`);
    // Commentaire: suite de commentaire bloc
    return res.redirect(`/etudiant/dossiers/${req.params.id}`);
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    return respondWithError(req, res, error, `/etudiant/dossiers/${req.params.id}`);
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function downloadPiece(req, res, next) {
  // Commentaire: suite de commentaire bloc
  try {
    // Commentaire: suite de commentaire bloc
    const piece = await Piece.findById(req.params.id);
    // Commentaire: suite de commentaire bloc
    if (!piece || Number(piece.etudiant_id) !== Number(req.session.user.id)) {
      // Commentaire: suite de commentaire bloc
      return next(new AppError('Pièce introuvable ou inaccessible.', 404, 'PIECE_NOT_FOUND'));
    // Commentaire: suite de commentaire bloc
    }
    // Commentaire: suite de commentaire bloc
    return await downloadService.sendPiece(res, piece);
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    return next(error);
  // Commentaire: suite de commentaire bloc
  }
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function downloadAttestation(req, res, next) {
  // Commentaire: suite de commentaire bloc
  try {
    // Commentaire: suite de commentaire bloc
    const dossier = await Dossier.findById(req.params.id);
    // Commentaire: suite de commentaire bloc
    if (!dossier || Number(dossier.etudiant_id) !== Number(req.session.user.id)) {
      // Commentaire: suite de commentaire bloc
      return next(new AppError('Dossier introuvable ou inaccessible.', 404, 'DOSSIER_NOT_FOUND'));
    // Commentaire: suite de commentaire bloc
    }
    // Commentaire: suite de commentaire bloc
    if (dossier.etat !== 'VALIDE') {
      // Commentaire: suite de commentaire bloc
      return next(new AppError('L’attestation n’est disponible que pour un dossier validé.', 409, 'DOSSIER_NOT_VALIDATED'));
    // Commentaire: suite de commentaire bloc
    }
    // Commentaire: suite de commentaire bloc
    return await downloadService.sendAttestation(res, dossier);
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
  showProfile,
  // Commentaire: suite de commentaire bloc
  updateProfile,
  // Commentaire: suite de commentaire bloc
  listDossiers,
  // Commentaire: suite de commentaire bloc
  showNewDossier,
  // Commentaire: suite de commentaire bloc
  createDossier,
  // Commentaire: suite de commentaire bloc
  showDossier,
  // Commentaire: suite de commentaire bloc
  uploadPiece,
  // Commentaire: suite de commentaire bloc
  downloadPiece,
  // Commentaire: suite de commentaire bloc
  downloadAttestation,
// Commentaire: suite de commentaire bloc
};
