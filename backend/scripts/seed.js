// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Charge un module
require('dotenv').config();
// Importe une dépendance via require
const bcrypt = require('bcrypt');
// Importe une dépendance via require
const PDFDocument = require('pdfkit');
// Importe une dépendance via require
const db = require('../config/database');
// Importe une dépendance via require
const storage = require('../services/storageService');
// Importe une dépendance via require
const Piece = require('../models/Piece');
// Importe une dépendance via require
const { DOCUMENT_TYPES } = require('../config/uploads');
// Importe une dépendance via require
const { FILIERES, NIVEAUX } = require('../config/academic');
// Importe une dépendance via require
const { currentAcademicYear } = require('../utils/helpers');

// Déclare une variable
const NB_ETUDIANTS = 500;
// Déclare une variable
const NB_AGENTS = 3;
// Déclare une variable
const DEMO_EMAIL = 'etudiant.demo@scolarite.local';
// Déclare une variable
const DEMO_NUMERO = 'UDS2026001';

// Déclare une variable
const FICTIVE_JPEG_BASE64 = [
  // Exécute une instruction
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a',
  // Exécute une instruction
  'HBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPDs0NDT/wAALCAABAAEBAREA/8QAFAABAQAAAAAAAA',
  // Exécute une instruction
  'AAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQE',
  // Exécute une instruction
  'CAQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8QAFBEB',
  // Exécute une instruction
  'AAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwEAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAA',
  // Exécute une instruction
  'AAAAAAP/aAAgBAgEBPwEAAAAAAAAAAAAAAAAAAAA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPw',
  // Exécute une instruction
  'EAAAAAAAAAAAAAAAAAAAA/9k=',
// Exécute une instruction
].join('');

// Déclare une fonction
async function tinyPdfBuffer() {
  // Retourne une valeur ou termine la fonction
  return new Promise((resolve, reject) => {
    // Déclare une variable
    const doc = new PDFDocument({ size: 'A5', margin: 40, info: { Title: 'Pièce fictive - démonstration' } });
    // Déclare une variable
    const chunks = [];
    // Exécute une instruction
    doc.on('data', (chunk) => chunks.push(chunk));
    // Exécute une instruction
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    // Exécute une instruction
    doc.on('error', reject);
    // Exécute une instruction
    doc.font('Helvetica-Bold').fontSize(14).text('UNIVERSITE DU SALOUM');
    // Exécute une instruction
    doc.moveDown().font('Helvetica').fontSize(10)
      // Exécute une instruction
      .text('Document fictif de demonstration. Aucune valeur administrative.');
    // Exécute une instruction
    doc.end();
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function fill(template, value) {
  // Retourne une valeur ou termine la fonction
  return String(template).replace('{N}', String(value).padStart(3, '0'));
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
async function main() {
  // Déclare une variable
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  // Condition: exécute le bloc si la condition est vraie
  if (!demoPassword) {
    // Lève une erreur/exception
    throw new Error('Définissez SEED_DEMO_PASSWORD dans .env avant de générer les données de démonstration.');
  // Ferme un bloc, objet ou appel
  }
  // Déclare une variable
  const passwordHash = await bcrypt.hash(demoPassword, 10);
  // Déclare une variable
  const annee = currentAcademicYear();
  // Déclare une variable
  const pdfBuffer = await tinyPdfBuffer();
  // Déclare une variable
  const jpegBuffer = Buffer.from(FICTIVE_JPEG_BASE64, 'base64');

  // Déclare une variable
  const etudiants = [];
  // Boucle: répète le bloc pour chaque élément/itération
  for (let i = 1; i <= NB_ETUDIANTS; i += 1) {
    // Déclare une variable
    const isDemo = i === 1;
    // Exécute une instruction
    etudiants.push({
      // Exécute une instruction
      numero: isDemo ? DEMO_NUMERO : `UDS${String(2026000 + i)}`,
      // Exécute une instruction
      nom: isDemo ? 'Demo' : `Nom${fill('{N}', i)}`,
      // Exécute une instruction
      prenom: isDemo ? 'Etudiant' : `Prenom${fill('{N}', i)}`,
      // Exécute une instruction
      email: isDemo ? DEMO_EMAIL : `etudiant${fill('{N}', i)}@demo.scolarite.local`,
      // Exécute une instruction
      filiere: FILIERES[i % FILIERES.length],
      // Exécute une instruction
      niveau: NIVEAUX[i % NIVEAUX.length],
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc, objet ou appel
  }

  // Déclare une variable
  const agents = [
    // Ouvre un bloc ou objet
    { nom: 'Agent', prenom: 'Demo', email: 'agent.demo@scolarite.local' },
    // Ouvre un bloc ou objet
    { nom: 'Diop', prenom: 'Fatou', email: 'agent.diop@scolarite.local' },
    // Ouvre un bloc ou objet
    { nom: 'Ndiaye', prenom: 'Moussa', email: 'agent.ndiaye@scolarite.local' },
  // Ferme un bloc, objet ou appel
  ];

  // Déclare une variable
  const connection = await db.getConnection();
  // Début d’un bloc avec gestion d’erreur
  try {
    // Attend le résultat d’une opération asynchrone
    await connection.beginTransaction();
    // Boucle: répète le bloc pour chaque élément/itération
    for (const e of etudiants) {
      // Attend le résultat d’une opération asynchrone
      await connection.execute(
        // Exécute une instruction
        `INSERT INTO etudiants (numero_etudiant, nom, prenom, email, password, filiere, niveau, actif)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE nom = VALUES(nom), prenom = VALUES(prenom), filiere = VALUES(filiere), niveau = VALUES(niveau), actif = 1`,
        // Commentaire: suite de commentaire bloc
        [e.numero, e.nom, e.prenom, e.email, passwordHash, e.filiere, e.niveau],
      // Commentaire: suite de commentaire bloc
      );
    // Commentaire: suite de commentaire bloc
    }
    // Commentaire: suite de commentaire bloc
    for (const a of agents) {
      // Commentaire: suite de commentaire bloc
      await connection.execute(
        // Commentaire: suite de commentaire bloc
        `INSERT INTO agents (nom, prenom, email, password, actif)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE nom = VALUES(nom), prenom = VALUES(prenom), actif = 1`,
        // Commentaire: suite de commentaire bloc
        [a.nom, a.prenom, a.email, passwordHash],
      // Commentaire: suite de commentaire bloc
      );
    // Commentaire: suite de commentaire bloc
    }
    // Commentaire: suite de commentaire bloc
    await connection.commit();
  // Commentaire: suite de commentaire bloc
  } catch (error) {
    // Commentaire: suite de commentaire bloc
    await connection.rollback();
    // Commentaire: suite de commentaire bloc
    throw error;
  // Commentaire: suite de commentaire bloc
  } finally {
    // Commentaire: suite de commentaire bloc
    connection.release();
  // Commentaire: suite de commentaire bloc
  }

  // Commentaire: suite de commentaire bloc
  const etudiantRows = await db.query(
    // Commentaire: suite de commentaire bloc
    'SELECT id, email FROM etudiants WHERE email IN (?, ?, ?)',
    // Commentaire: suite de commentaire bloc
    etudiants.slice(0, 3).map((e) => e.email),
  // Commentaire: suite de commentaire bloc
  );
  // Commentaire: suite de commentaire bloc
  const idByEmail = new Map(etudiantRows.map((row) => [row.email, row.id]));
  // Commentaire: suite de commentaire bloc
  const allEtudiants = await db.query('SELECT id, email FROM etudiants ORDER BY id ASC');
  // Commentaire: suite de commentaire bloc
  const demoEtudiantId = idByEmail.get(DEMO_EMAIL);

  // Commentaire: suite de commentaire bloc
  const dossierIds = [];
  // Commentaire: suite de commentaire bloc
  for (const etudiant of allEtudiants) {
    // Commentaire: suite de commentaire bloc
    const index = Number(etudiant.id);
    // Commentaire: suite de commentaire bloc
    const etat = Number(etudiant.id) === Number(demoEtudiantId) ? 'VALIDE' : ['VALIDE', 'EN_ATTENTE', 'REJETE'][index % 3];
    // Commentaire: suite de commentaire bloc
    const commentaire = etat === 'REJETE' ? 'Dossier incomplet : pièces justificatives à vérifier.' : null;
    // Commentaire: suite de commentaire bloc
    const [result] = await db.pool.execute(
      // Commentaire: suite de commentaire bloc
      `INSERT INTO dossiers
         (etudiant_id, annee_universitaire, filiere, niveau, etat, commentaire, reference_dossier, date_soumission, date_traitement)
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?)
       ON DUPLICATE KEY UPDATE etat = VALUES(etat), commentaire = VALUES(commentaire), filiere = VALUES(filiere), niveau = VALUES(niveau)`,
      // Commentaire: suite de commentaire bloc
      [
        // Commentaire: suite de commentaire bloc
        etudiant.id,
        // Commentaire: suite de commentaire bloc
        annee,
        // Commentaire: suite de commentaire bloc
        FILIERES[index % FILIERES.length],
        // Commentaire: suite de commentaire bloc
        NIVEAUX[index % NIVEAUX.length],
        // Commentaire: suite de commentaire bloc
        etat,
        // Commentaire: suite de commentaire bloc
        commentaire,
        // Commentaire: suite de commentaire bloc
        `DEMO-${annee}-${String(index).padStart(5, '0')}`,
        // Commentaire: suite de commentaire bloc
        index % 30,
        // Commentaire: suite de commentaire bloc
        etat === 'EN_ATTENTE' ? null : new Date(),
      // Commentaire: suite de commentaire bloc
      ],
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    const rows = await db.query(
      // Commentaire: suite de commentaire bloc
      'SELECT id FROM dossiers WHERE etudiant_id = :etudiantId AND annee_universitaire = :annee',
      // Commentaire: suite de commentaire bloc
      { etudiantId: etudiant.id, annee },
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    const dossierId = result.insertId || rows[0]?.id;
    // Commentaire: suite de commentaire bloc
    dossierIds.push(dossierId);

    // Commentaire: suite de commentaire bloc
    const historyCount = await db.query(
      // Commentaire: suite de commentaire bloc
      `SELECT COUNT(*) AS total FROM historique_actions
       WHERE entity_type = 'DOSSIER' AND entity_id = :id AND action = 'DOSSIER_SOUMIS'`,
      // Commentaire: suite de commentaire bloc
      { id: dossierId },
    // Commentaire: suite de commentaire bloc
    );
    // Commentaire: suite de commentaire bloc
    if (Number(historyCount[0].total) === 0) {
      // Commentaire: suite de commentaire bloc
      await db.query(
        // Commentaire: suite de commentaire bloc
        `INSERT INTO historique_actions (entity_type, entity_id, action, utilisateur_type, utilisateur_id, description)
         VALUES ('DOSSIER', :id, 'DOSSIER_SOUMIS', 'ETUDIANT', :etudiantId, 'Soumission via jeu de données de démonstration')`,
        // Commentaire: suite de commentaire bloc
        { id: dossierId, etudiantId: etudiant.id },
      // Commentaire: suite de commentaire bloc
      );
    // Commentaire: suite de commentaire bloc
    }
  // Commentaire: suite de commentaire bloc
  }

  // Commentaire: suite de commentaire bloc
  let piecesCreees = 0;
  // Commentaire: suite de commentaire bloc
  const types = Object.keys(DOCUMENT_TYPES);
  // Commentaire: suite de commentaire bloc
  for (let i = 0; i < dossierIds.length; i += 1) {
    // Commentaire: suite de commentaire bloc
    const dossierId = dossierIds[i];
    // Commentaire: suite de commentaire bloc
    const existing = await Piece.listByDossier(dossierId);
    // Commentaire: suite de commentaire bloc
    const expectedCount = i < 20 ? types.length : (i % 2 === 0 ? 2 : 1);
    // Commentaire: suite de commentaire bloc
    if (existing.length >= expectedCount) continue;

    // Commentaire: suite de commentaire bloc
    for (const type of types.slice(0, expectedCount)) {
      // Commentaire: suite de commentaire bloc
      if (existing.some((piece) => piece.type === type)) continue;
      // Commentaire: suite de commentaire bloc
      const isPdf = type !== 'PHOTO_IDENTITE';
      // Commentaire: suite de commentaire bloc
      const stored = await storage.save({
        // Commentaire: suite de commentaire bloc
        buffer: isPdf ? pdfBuffer : jpegBuffer,
        // Commentaire: suite de commentaire bloc
        mimetype: isPdf ? 'application/pdf' : 'image/jpeg',
        // Commentaire: suite de commentaire bloc
        originalname: `document-${type.toLowerCase()}.${isPdf ? 'pdf' : 'jpg'}`,
        // Commentaire: suite de commentaire bloc
        size: isPdf ? pdfBuffer.length : jpegBuffer.length,
      // Commentaire: suite de commentaire bloc
      });
      // Commentaire: suite de commentaire bloc
      await Piece.create({
        // Commentaire: suite de commentaire bloc
        dossierId,
        // Commentaire: suite de commentaire bloc
        type,
        // Commentaire: suite de commentaire bloc
        nomOriginal: stored.nomOriginal,
        // Commentaire: suite de commentaire bloc
        nomStockage: stored.key,
        // Commentaire: suite de commentaire bloc
        taille: stored.taille,
        // Commentaire: suite de commentaire bloc
        emplacement: stored.emplacement,
      // Commentaire: suite de commentaire bloc
      });
      // Commentaire: suite de commentaire bloc
      piecesCreees += 1;
    // Commentaire: suite de commentaire bloc
    }
  // Commentaire: suite de commentaire bloc
  }

  // Commentaire: suite de commentaire bloc
  console.log(`Jeu de démonstration prêt : ${allEtudiants.length} étudiants, ${agents.length} agents, ${dossierIds.length} dossiers, ${piecesCreees} nouvelles pièces.`);
  // Commentaire: suite de commentaire bloc
  console.log(`Année universitaire utilisée : ${annee}`);
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
main().then(() => db.close()).catch(async (error) => {
  // Commentaire: suite de commentaire bloc
  console.error('Échec du remplissage :', error.message);
  // Commentaire: suite de commentaire bloc
  await db.close().catch(() => {});
  // Commentaire: suite de commentaire bloc
  process.exitCode = 1;
// Commentaire: suite de commentaire bloc
});
