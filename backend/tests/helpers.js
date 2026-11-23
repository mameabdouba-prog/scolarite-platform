// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const request = require('supertest');
// Importe une dépendance via require
const bcrypt = require('bcrypt');
// Importe une dépendance via require
const PDFDocument = require('pdfkit');
// Importe une dépendance via require
const app = require('../app');
// Importe une dépendance via require
const db = require('../config/database');

// Déclare une variable
let sequence = 0;

// Déclare une fonction
function uniqueSuffix() {
  // Exécute une instruction
  sequence += 1;
  // Retourne une valeur ou termine la fonction
  return `${Date.now()}${sequence}`;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function getCsrf(agent, url = '/login') {
  // Déclare une variable
  const response = await agent.get(url).expect(200);
  // Déclare une variable
  const match = /name="_csrf" value="([^"]+)"/.exec(response.text);
  // Condition: exécute le bloc si la condition est vraie
  if (!match) throw new Error(`Jeton CSRF introuvable sur ${url}`);
  // Retourne une valeur ou termine la fonction
  return match[1];
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function registerStudent(agent, overrides = {}) {
  // Déclare une variable
  const suffix = uniqueSuffix();
  // Déclare une variable
  const student = {
    // Exécute une instruction
    numeroEtudiant: `T${suffix}`,
    // Exécute une instruction
    nom: 'Test',
    // Exécute une instruction
    prenom: 'Utilisateur',
    // Exécute une instruction
    email: `test${suffix}@exemple.fr`,
    // Exécute une instruction
    password: 'TestPassword123',
    // Exécute une instruction
    filiere: 'Informatique',
    // Exécute une instruction
    niveau: 'L1',
    // Exécute une instruction
    ...overrides,
  // Ferme un bloc, objet ou appel
  };
  // Déclare une variable
  const csrfToken = await getCsrf(agent, '/register');
  // Déclare une variable
  const response = await agent.post('/register').type('form').send({ ...student, _csrf: csrfToken });
  // Condition: exécute le bloc si la condition est vraie
  if (response.status !== 302) throw new Error(`Inscription échouée : ${response.status} ${response.text}`);
  // Retourne une valeur ou termine la fonction
  return student;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function login(agent, email, password) {
  // Déclare une variable
  const csrfToken = await getCsrf(agent, '/login');
  // Déclare une variable
  const response = await agent.post('/login').type('form').send({ _csrf: csrfToken, email, password });
  // Condition: exécute le bloc si la condition est vraie
  if (response.status !== 302) throw new Error(`Connexion échouée : ${response.status}`);
  // Retourne une valeur ou termine la fonction
  return response;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function logout(agent) {
  // Déclare une variable
  const csrfToken = await getCsrf(agent, '/etudiant/tableau-de-bord');
  // Retourne une valeur ou termine la fonction
  return agent.post('/logout').type('form').send({ _csrf: csrfToken });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function createAdmin(email, password) {
  // Déclare une variable
  const hash = await bcrypt.hash(password, 10);
  // Déclare une variable
  const result = await db.query(
    // Exécute une instruction
    'INSERT INTO administrateurs (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
    // Exécute une instruction
    ['Admin', 'Test', email, hash],
  // Ferme un bloc, objet ou appel
  );
  // Retourne une valeur ou termine la fonction
  return result.insertId;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function createAgentViaAdmin(adminAgent, overrides = {}) {
  // Déclare une variable
  const suffix = uniqueSuffix();
  // Déclare une variable
  const data = {
    // Exécute une instruction
    nom: 'Agent',
    // Exécute une instruction
    prenom: 'Test',
    // Exécute une instruction
    email: `agent${suffix}@exemple.fr`,
    // Exécute une instruction
    password: 'AgentPassword123',
    // Exécute une instruction
    ...overrides,
  // Ferme un bloc, objet ou appel
  };
  // Déclare une variable
  const csrfToken = await getCsrf(adminAgent, '/admin/agents/nouveau');
  // Déclare une variable
  const response = await adminAgent.post('/admin/agents').type('form').send({ ...data, _csrf: csrfToken });
  // Condition: exécute le bloc si la condition est vraie
  if (response.status !== 302) throw new Error(`Création d'agent échouée : ${response.status}`);
  // Retourne une valeur ou termine la fonction
  return data;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function tinyPdf() {
  // Retourne une valeur ou termine la fonction
  return new Promise((resolve, reject) => {
    // Déclare une variable
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    // Déclare une variable
    const chunks = [];
    // Exécute une instruction
    doc.on('data', (chunk) => chunks.push(chunk));
    // Exécute une instruction
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    // Exécute une instruction
    doc.on('error', reject);
    // Exécute une instruction
    doc.text('Piece justificative de test');
    // Exécute une instruction
    doc.end();
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function submitDossier(agent, year = '2026-2027') {
  // Déclare une variable
  const csrfToken = await getCsrf(agent, '/etudiant/inscription');
  // Déclare une variable
  const response = await agent.post('/etudiant/inscription').type('form').send({
    // Exécute une instruction
    _csrf: csrfToken,
    // Exécute une instruction
    anneeUniversitaire: year,
    // Exécute une instruction
    filiere: 'Informatique',
    // Exécute une instruction
    niveau: 'L2',
  // Ferme un bloc/appel de fonction
  });
  // Condition: exécute le bloc si la condition est vraie
  if (response.status !== 302) throw new Error(`Soumission échouée : ${response.status}`);
  // Déclare une variable
  const location = response.headers.location;
  // Déclare une variable
  const dossierId = Number(location.split('/').pop());
  // Retourne une valeur ou termine la fonction
  return dossierId;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function uploadPiece(agent, dossierId, type = 'CARTE_IDENTITE') {
  // Déclare une variable
  const csrfToken = await getCsrf(agent, `/etudiant/dossiers/${dossierId}`);
  // Retourne une valeur ou termine la fonction
  return agent
    // Exécute une instruction
    .post(`/etudiant/dossiers/${dossierId}/pieces?_csrf=${encodeURIComponent(csrfToken)}`)
    // Exécute une instruction
    .attach('piece', await tinyPdf(), { filename: 'piece.pdf', contentType: 'application/pdf' })
    // Exécute une instruction
    .field('type', type);
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = {
  // Exécute une instruction
  agent: () => request.agent(app),
  // Exécute une instruction
  app,
  // Exécute une instruction
  db,
  // Exécute une instruction
  getCsrf,
  // Exécute une instruction
  registerStudent,
  // Exécute une instruction
  login,
  // Exécute une instruction
  logout,
  // Exécute une instruction
  createAdmin,
  // Exécute une instruction
  createAgentViaAdmin,
  // Exécute une instruction
  tinyPdf,
  // Exécute une instruction
  submitDossier,
  // Exécute une instruction
  uploadPiece,
// Ferme un bloc, objet ou appel
};
