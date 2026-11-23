// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const Agent = require('../models/Agent');
// Importe une dépendance via require
const Etudiant = require('../models/Etudiant');
// Importe une dépendance via require
const authService = require('../services/authService');
// Importe une dépendance via require
const dossierService = require('../services/dossierService');
// Importe une dépendance via require
const { renderPage } = require('../utils/render');
// Importe une dépendance via require
const { respondWithError } = require('../utils/http');
// Importe une dépendance via require
const AppError = require('../utils/AppError');

// Déclare une fonction
async function dashboard(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Exécute une instruction
    const [stats, nbEtudiants, nbAgents, nbAgentsActifs] = await Promise.all([
      // Exécute une instruction
      dossierService.getStats(),
      // Exécute une instruction
      Etudiant.countAll(),
      // Exécute une instruction
      Agent.countAll(),
      // Exécute une instruction
      Agent.countActifs(),
    // Exécute une instruction
    ]);
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'admin/dashboard', {
      // Exécute une instruction
      title: 'Tableau de bord administrateur',
      // Exécute une instruction
      stats,
      // Exécute une instruction
      nbEtudiants,
      // Exécute une instruction
      nbAgents,
      // Exécute une instruction
      nbAgentsActifs,
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
async function listAgents(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const agents = await Agent.listAll();
    // Retourne une valeur ou termine la fonction
    return renderPage(res, 'admin/agents', { title: 'Gestion des agents', agents });
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return next(error);
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function showCreateAgent(req, res) {
  // Retourne une valeur ou termine la fonction
  return renderPage(res, 'admin/agent-new', { title: 'Créer un compte agent', values: {} });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function createAgent(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const agent = await authService.createAgent(req.body, req.session.user.id);
    // Exécute une instruction
    req.flash('success', `Compte agent ${agent.email} créé avec succès.`);
    // Retourne une valeur ou termine la fonction
    return res.redirect('/admin/agents');
  // Ferme un bloc ou objet
  } catch (error) {
    // Condition: exécute le bloc si la condition est vraie
    if (error instanceof AppError) {
      // Condition: exécute le bloc si la condition est vraie
      if (String(req.get('accept') || '').includes('application/json')) {
        // Retourne une valeur ou termine la fonction
        return res.status(error.status).json({ error: error.message, code: error.code });
      // Ferme un bloc, objet ou appel
      }
      // Retourne une valeur ou termine la fonction
      return res.status(error.status).render('admin/agent-new', {
        // Exécute une instruction
        user: req.session.user,
        // Exécute une instruction
        csrfToken: req.csrfToken(),
        // Exécute une instruction
        flash: { success: [], error: [{ message: error.message }], info: [] },
        // Exécute une instruction
        title: 'Créer un compte agent',
        // Exécute une instruction
        values: { ...req.body, password: '' },
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
async function toggleAgent(req, res, next) {
  // Début d’un bloc avec gestion d’erreur
  try {
    // Déclare une variable
    const agent = await authService.setAgentActif(
      // Exécute une instruction
      req.params.id,
      // Exécute une instruction
      req.body.actif === '1',
      // Exécute une instruction
      req.session.user.id,
    // Ferme un bloc, objet ou appel
    );
    // Exécute une instruction
    req.flash('success', `Compte agent ${agent.email} ${agent.actif ? 'activé' : 'désactivé'}.`);
    // Retourne une valeur ou termine la fonction
    return res.redirect('/admin/agents');
  // Ferme un bloc ou objet
  } catch (error) {
    // Retourne une valeur ou termine la fonction
    return respondWithError(req, res, error, '/admin/agents');
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { dashboard, listAgents, showCreateAgent, createAgent, toggleAgent };
