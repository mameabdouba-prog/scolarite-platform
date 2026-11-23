// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const { body, validationResult } = require('express-validator');
// Importe une dépendance via require
const { FILIERES, NIVEAUX, ETATS, isValidAcademicYear } = require('../config/academic');
// Importe une dépendance via require
const { DOCUMENT_TYPES } = require('../config/uploads');

// Déclare une fonction
const nomRule = (field, label) => body(field)
  // Exécute une instruction
  .trim().isLength({ min: 2, max: 120 }).withMessage(`${label} doit contenir entre 2 et 120 caractères.`)
  // Exécute une instruction
  .matches(/^[\p{L}\p{M} '\-]+$/u).withMessage(`${label} ne doit contenir que des lettres.`);

// Déclare une variable
const emailRule = body('email')
  // Exécute une instruction
  .trim().isEmail().withMessage('Adresse e-mail invalide.')
  // Exécute une instruction
  .normalizeEmail()
  // Exécute une instruction
  .isLength({ max: 255 });

// Déclare une variable
const passwordRule = body('password')
  // Exécute une instruction
  .isLength({ min: 8, max: 128 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
  // Exécute une instruction
  .matches(/[A-Za-z]/).withMessage('Le mot de passe doit contenir une lettre.')
  // Exécute une instruction
  .matches(/\d/).withMessage('Le mot de passe doit contenir un chiffre.');

// Déclare une variable
const register = [
  // Exécute une instruction
  body('numeroEtudiant').trim().matches(/^[A-Za-z0-9-]{3,30}$/)
    // Exécute une instruction
    .withMessage('Numéro étudiant invalide (3 à 30 caractères alphanumériques).'),
  // Exécute une instruction
  nomRule('nom', 'Le nom'),
  // Exécute une instruction
  nomRule('prenom', 'Le prénom'),
  // Exécute une instruction
  emailRule,
  // Exécute une instruction
  passwordRule,
  // Exécute une instruction
  body('filiere').isIn(FILIERES).withMessage('Filière invalide.'),
  // Exécute une instruction
  body('niveau').isIn(NIVEAUX).withMessage('Niveau invalide.'),
// Ferme un bloc, objet ou appel
];

// Déclare une variable
const login = [
  // Exécute une instruction
  emailRule,
  // Exécute une instruction
  body('password').notEmpty().withMessage('Mot de passe requis.'),
// Ferme un bloc, objet ou appel
];

// Déclare une variable
const profile = [
  // Exécute une instruction
  nomRule('nom', 'Le nom'),
  // Exécute une instruction
  nomRule('prenom', 'Le prénom'),
  // Exécute une instruction
  emailRule,
  // Exécute une instruction
  body('filiere').isIn(FILIERES).withMessage('Filière invalide.'),
  // Exécute une instruction
  body('niveau').isIn(NIVEAUX).withMessage('Niveau invalide.'),
// Ferme un bloc, objet ou appel
];

// Déclare une variable
const dossier = [
  // Exécute une instruction
  body('anneeUniversitaire').trim().custom(isValidAcademicYear)
    // Exécute une instruction
    .withMessage('Année universitaire invalide (exemple : 2026-2027).'),
  // Exécute une instruction
  body('filiere').isIn(FILIERES).withMessage('Filière invalide.'),
  // Exécute une instruction
  body('niveau').isIn(NIVEAUX).withMessage('Niveau invalide.'),
// Ferme un bloc, objet ou appel
];

// Déclare une variable
const uploadPiece = [
  // Exécute une instruction
  body('type').isIn(Object.keys(DOCUMENT_TYPES)).withMessage('Type de pièce invalide.'),
// Ferme un bloc, objet ou appel
];

// Déclare une variable
const decision = [
  // Exécute une instruction
  body('etat').isIn(['VALIDE', 'REJETE']).withMessage('Décision invalide.'),
  // Exécute une instruction
  body('commentaire').trim().isLength({ max: 1000 }).withMessage('Commentaire trop long.'),
// Ferme un bloc, objet ou appel
];

// Déclare une variable
const createAgent = [
  // Exécute une instruction
  nomRule('nom', 'Le nom'),
  // Exécute une instruction
  nomRule('prenom', 'Le prénom'),
  // Exécute une instruction
  emailRule,
  // Exécute une instruction
  passwordRule,
// Ferme un bloc, objet ou appel
];

// Déclare une fonction
function handle(req, res, next) {
  // Déclare une variable
  const errors = validationResult(req);
  // Condition: exécute le bloc si la condition est vraie
  if (errors.isEmpty()) return next();
  // Déclare une variable
  const messages = errors.array().map((error) => error.msg);
  // Condition: exécute le bloc si la condition est vraie
  if (String(req.get('accept') || '').includes('application/json')) {
    // Retourne une valeur ou termine la fonction
    return res.status(400).json({ errors: messages });
  // Ferme un bloc, objet ou appel
  }
  // Condition: exécute le bloc si la condition est vraie
  if (req.baseUrl + req.path === '/register') {
    // Retourne une valeur ou termine la fonction
    return res.status(400).render('auth/register', {
      // Exécute une instruction
      user: null,
      // Exécute une instruction
      csrfToken: req.csrfToken(),
      // Exécute une instruction
      flash: { success: [], error: [{ message: messages[0] }], info: [] },
      // Exécute une instruction
      title: 'Créer un compte étudiant',
      // Exécute une instruction
      values: { ...req.body, password: '' },
      // Exécute une instruction
      filieres: FILIERES,
      // Exécute une instruction
      niveaux: NIVEAUX,
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc, objet ou appel
  }
  // Exécute une instruction
  req.flash('error', messages[0]);
  // Retourne une valeur ou termine la fonction
  return res.redirect(req.get('referer') || '/');
// Ferme un bloc, objet ou appel
}

// Déclare une variable
const filters = [
  // Exécute une instruction
  body('etat').optional({ checkFalsy: true }).isIn(ETATS),
// Ferme un bloc, objet ou appel
];

// Exporte des fonctions/objets du module
module.exports = { register, login, profile, dossier, uploadPiece, decision, createAgent, handle, filters };
