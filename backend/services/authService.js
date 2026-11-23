// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const bcrypt = require('bcrypt');
// Importe une dépendance via require
const Etudiant = require('../models/Etudiant');
// Importe une dépendance via require
const Agent = require('../models/Agent');
// Importe une dépendance via require
const Administrateur = require('../models/Administrateur');
// Importe une dépendance via require
const HistoriqueAction = require('../models/HistoriqueAction');
// Importe une dépendance via require
const { withTransaction } = require('./transactionService');
// Importe une dépendance via require
const AppError = require('../utils/AppError');

// Déclare une fonction
async function authenticate(email, password) {
  // Exécute une instruction
  const [etudiant, agent, administrateur] = await Promise.all([
    // Exécute une instruction
    Etudiant.findByEmail(email),
    // Exécute une instruction
    Agent.findByEmail(email),
    // Exécute une instruction
    Administrateur.findByEmail(email),
  // Exécute une instruction
  ]);

  // Déclare une variable
  const candidates = [
    // Ouvre un bloc ou objet
    { user: etudiant, role: 'ETUDIANT' },
    // Ouvre un bloc ou objet
    { user: agent, role: 'AGENT' },
    // Ouvre un bloc ou objet
    { user: administrateur, role: 'ADMINISTRATEUR' },
  // Ferme un bloc, objet ou appel
  ];

  // Boucle: répète le bloc pour chaque élément/itération
  for (const candidate of candidates) {
    // Condition: exécute le bloc si la condition est vraie
    if (!candidate.user || candidate.user.actif === 0) continue;
    // Déclare une variable
    const valid = await bcrypt.compare(password, candidate.user.password);
    // Condition: exécute le bloc si la condition est vraie
    if (valid) return { user: candidate.user, role: candidate.role };
  // Ferme un bloc, objet ou appel
  }
  // Retourne une valeur ou termine la fonction
  return null;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function registerStudent(data) {
  // Exécute une instruction
  const [byEmail, byNumero] = await Promise.all([
    // Exécute une instruction
    Etudiant.findByEmail(data.email),
    // Exécute une instruction
    Etudiant.findByNumero(data.numeroEtudiant),
  // Exécute une instruction
  ]);
  // Condition: exécute le bloc si la condition est vraie
  if (byEmail) throw new AppError('Cette adresse e-mail est déjà utilisée.', 409, 'EMAIL_EXISTS');
  // Condition: exécute le bloc si la condition est vraie
  if (byNumero) throw new AppError('Ce numéro étudiant est déjà utilisé.', 409, 'NUMERO_EXISTS');

  // Déclare une variable
  const passwordHash = await bcrypt.hash(data.password, 12);
  // Déclare une variable
  const etudiantId = await withTransaction(async (connection) => {
    // Exécute une instruction
    const [result] = await connection.execute(
      // Exécute une instruction
      `INSERT INTO etudiants (numero_etudiant, nom, prenom, email, password, filiere, niveau)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      // Commentaire: contenu de template literal
      [data.numeroEtudiant, data.nom, data.prenom, data.email, passwordHash, data.filiere, data.niveau],
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    await HistoriqueAction.record({
      // Commentaire: suite de commentaire bloc
      connection,
      // Commentaire: suite de commentaire bloc
      entityType: 'ETUDIANT',
      // Commentaire: suite de commentaire bloc
      entityId: result.insertId,
      // Commentaire: suite de commentaire bloc
      action: 'COMPTE_CREE',
      // Commentaire: suite de commentaire bloc
      utilisateurType: 'ETUDIANT',
      // Commentaire: suite de commentaire bloc
      utilisateurId: result.insertId,
      // Commentaire: suite de commentaire bloc
      description: 'Création du compte étudiant',
    // Commentaire: suite de commentaire bloc
    });
    // Commentaire: suite de commentaire bloc
    return result.insertId;
  // Commentaire: suite de commentaire bloc
  });
  // Commentaire: suite de commentaire bloc
  return Etudiant.findById(etudiantId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function updateStudentProfile(id, data) {
  // Commentaire: suite de commentaire bloc
  const existing = await Etudiant.findByEmail(data.email);
  // Commentaire: suite de commentaire bloc
  if (existing && Number(existing.id) !== Number(id)) {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Cette adresse e-mail est déjà utilisée.', 409, 'EMAIL_EXISTS');
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  return Etudiant.updateProfile(id, data);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function createAgent(data, adminId) {
  // Commentaire: suite de commentaire bloc
  if (await Agent.findByEmail(data.email)) {
    // Commentaire: suite de commentaire bloc
    throw new AppError('Cette adresse e-mail est déjà utilisée par un agent.', 409, 'EMAIL_EXISTS');
  // Commentaire: suite de commentaire bloc
  }
  // Commentaire: suite de commentaire bloc
  const passwordHash = await bcrypt.hash(data.password, 12);
  // Commentaire: suite de commentaire bloc
  const agentId = await withTransaction(async (connection) => {
    // Commentaire: suite de commentaire bloc
    const [result] = await connection.execute(
      // Commentaire: suite de commentaire bloc
      'INSERT INTO agents (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
      // Commentaire: suite de commentaire bloc
      [data.nom, data.prenom, data.email, passwordHash],
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    await HistoriqueAction.record({
      // Commentaire: suite de commentaire bloc
      connection,
      // Commentaire: suite de commentaire bloc
      entityType: 'AGENT',
      // Commentaire: suite de commentaire bloc
      entityId: result.insertId,
      // Commentaire: suite de commentaire bloc
      action: 'AGENT_CREE',
      // Commentaire: suite de commentaire bloc
      utilisateurType: 'ADMINISTRATEUR',
      // Commentaire: suite de commentaire bloc
      utilisateurId: adminId,
      // Commentaire: suite de commentaire bloc
      description: `Création du compte agent ${data.email}`,
    // Commentaire: suite de commentaire bloc
    });
    // Commentaire: suite de commentaire bloc
    return result.insertId;
  // Commentaire: suite de commentaire bloc
  });
  // Commentaire: suite de commentaire bloc
  return Agent.findById(agentId);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function setAgentActif(id, actif, adminId) {
  // Commentaire: suite de commentaire bloc
  const agent = await Agent.findById(id);
  // Commentaire: suite de commentaire bloc
  if (!agent) throw new AppError('Agent introuvable.', 404, 'AGENT_NOT_FOUND');
  // Commentaire: suite de commentaire bloc
  await withTransaction(async (connection) => {
    // Commentaire: suite de commentaire bloc
    await connection.execute('UPDATE agents SET actif = ? WHERE id = ?', [actif ? 1 : 0, id]);
    // Commentaire: suite de commentaire bloc
    await HistoriqueAction.record({
      // Commentaire: suite de commentaire bloc
      connection,
      // Commentaire: suite de commentaire bloc
      entityType: 'AGENT',
      // Commentaire: suite de commentaire bloc
      entityId: id,
      // Commentaire: suite de commentaire bloc
      action: actif ? 'AGENT_ACTIVE' : 'AGENT_DESACTIVE',
      // Commentaire: suite de commentaire bloc
      utilisateurType: 'ADMINISTRATEUR',
      // Commentaire: suite de commentaire bloc
      utilisateurId: adminId,
      // Commentaire: suite de commentaire bloc
      description: `${actif ? 'Activation' : 'Désactivation'} du compte agent ${agent.email}`,
    // Commentaire: suite de commentaire bloc
    });
  // Commentaire: suite de commentaire bloc
  });
  // Commentaire: suite de commentaire bloc
  return Agent.findById(id);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = {
  // Commentaire: suite de commentaire bloc
  authenticate,
  // Commentaire: suite de commentaire bloc
  registerStudent,
  // Commentaire: suite de commentaire bloc
  updateStudentProfile,
  // Commentaire: suite de commentaire bloc
  createAgent,
  // Commentaire: suite de commentaire bloc
  setAgentActif,
// Commentaire: suite de commentaire bloc
};
