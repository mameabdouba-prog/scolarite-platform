// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Charge un module
require('dotenv').config();
// Importe une dépendance via require
const readline = require('node:readline/promises');
// Importe une dépendance via require
const { stdin, stdout } = require('node:process');
// Importe une dépendance via require
const bcrypt = require('bcrypt');
// Importe une dépendance via require
const db = require('../config/database');
// Importe une dépendance via require
const Administrateur = require('../models/Administrateur');
// Importe une dépendance via require
const HistoriqueAction = require('../models/HistoriqueAction');
// Importe une dépendance via require
const { withTransaction } = require('../services/transactionService');

// Déclare une fonction
function argValue(name) {
  // Déclare une variable
  const index = process.argv.indexOf(`--${name}`);
  // Retourne une valeur ou termine la fonction
  return index >= 0 ? process.argv[index + 1] : null;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function isValidEmail(email) {
  // Retourne une valeur ou termine la fonction
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function main() {
  // Déclare une variable
  let nom = argValue('nom');
  // Déclare une variable
  let prenom = argValue('prenom');
  // Déclare une variable
  let email = argValue('email');
  // Déclare une variable
  let password = argValue('password') || process.env.ADMIN_PASSWORD || '';
  // Déclare une variable
  const rl = readline.createInterface({ input: stdin, output: stdout });

  // Début d’un bloc avec gestion d’erreur
  try {
    // Condition: exécute le bloc si la condition est vraie
    if (!nom) nom = await rl.question('Nom : ');
    // Condition: exécute le bloc si la condition est vraie
    if (!prenom) prenom = await rl.question('Prénom : ');
    // Condition: exécute le bloc si la condition est vraie
    if (!email) email = await rl.question('E-mail : ');
    // Condition: exécute le bloc si la condition est vraie
    if (!password) password = await rl.question('Mot de passe : ');
  // Ferme un bloc ou objet
  } finally {
    // Exécute une instruction
    rl.close();
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (!nom || !prenom || !isValidEmail(email)) {
    // Lève une erreur/exception
    throw new Error('Nom, prénom et e-mail valide sont requis.');
  // Ferme un bloc, objet ou appel
  }
  // Condition: exécute le bloc si la condition est vraie
  if (!password || password.length < 12) {
    // Lève une erreur/exception
    throw new Error('Le mot de passe doit contenir au moins 12 caractères.');
  // Ferme un bloc, objet ou appel
  }
  // Condition: exécute le bloc si la condition est vraie
  if (await Administrateur.findByEmail(email)) {
    // Lève une erreur/exception
    throw new Error('Un administrateur existe déjà avec cette adresse e-mail.');
  // Ferme un bloc, objet ou appel
  }
  // Condition: exécute le bloc si la condition est vraie
  if (await db.query('SELECT 1 FROM agents WHERE email = :email', { email }).then((rows) => rows.length > 0)) {
    // Lève une erreur/exception
    throw new Error('Cette adresse e-mail est déjà utilisée par un agent.');
  // Ferme un bloc, objet ou appel
  }

  // Déclare une variable
  const passwordHash = await bcrypt.hash(password, 12);
  // Déclare une variable
  const adminId = await withTransaction(async (connection) => {
    // Exécute une instruction
    const [result] = await connection.execute(
      // Exécute une instruction
      'INSERT INTO administrateurs (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
      // Exécute une instruction
      [nom, prenom, email, passwordHash],
    // Ferme un bloc, objet ou appel
    );
    // Attend le résultat d’une opération asynchrone
    await HistoriqueAction.record({
      // Exécute une instruction
      connection,
      // Exécute une instruction
      entityType: 'ADMINISTRATEUR',
      // Exécute une instruction
      entityId: result.insertId,
      // Exécute une instruction
      action: 'ADMIN_CREE',
      // Exécute une instruction
      utilisateurType: 'SYSTEME',
      // Exécute une instruction
      description: 'Création du compte administrateur via script sécurisé',
    // Ferme un bloc/appel de fonction
    });
    // Retourne une valeur ou termine la fonction
    return result.insertId;
  // Ferme un bloc/appel de fonction
  });
  // Déclare une variable
  const admin = await Administrateur.findById(adminId);

  // Exécute une instruction
  console.log(`Administrateur ${admin.email} créé avec succès (id ${admin.id}).`);
// Ferme un bloc, objet ou appel
}

// Exécute une instruction
main().then(() => db.close()).catch(async (error) => {
  // Exécute une instruction
  console.error('Échec de la création :', error.message);
  // Attend le résultat d’une opération asynchrone
  await db.close().catch(() => {});
  // Exécute une instruction
  process.exitCode = 1;
// Ferme un bloc/appel de fonction
});
