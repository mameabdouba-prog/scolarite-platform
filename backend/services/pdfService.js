// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const PDFDocument = require('pdfkit');
// Importe une dépendance via require
const { formatDate } = require('../utils/helpers');

// Déclare une variable
const NIGHT = '#101F38';
// Déclare une variable
const ROYAL = '#1D4ED8';
// Déclare une variable
const GOLD = '#B48A2B';
// Déclare une variable
const GREY = '#5B6472';

// Déclare une fonction
function generateAttestation(dossier) {
  // Condition: exécute le bloc si la condition est vraie
  if (!dossier || dossier.etat !== 'VALIDE') {
    // Retourne une valeur ou termine la fonction
    return Promise.reject(new Error('Attestation disponible uniquement pour un dossier validé.'));
  // Ferme un bloc, objet ou appel
  }

  // Retourne une valeur ou termine la fonction
  return new Promise((resolve, reject) => {
    // Déclare une variable
    const doc = new PDFDocument({
      // Exécute une instruction
      size: 'A4',
      // Exécute une instruction
      margin: 56,
      // Exécute une instruction
      info: {
        // Exécute une instruction
        Title: `Attestation d'inscription - ${dossier.reference_dossier}`,
        // Exécute une instruction
        Author: 'Université du Saloum',
        // Exécute une instruction
        Subject: 'Attestation d’inscription',
      // Ferme un bloc ou objet
      },
    // Ferme un bloc/appel de fonction
    });
    // Déclare une variable
    const chunks = [];
    // Exécute une instruction
    doc.on('data', (chunk) => chunks.push(chunk));
    // Exécute une instruction
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    // Exécute une instruction
    doc.on('error', reject);

    // Exécute une instruction
    doc.rect(0, 0, doc.page.width, 10).fill(NIGHT);
    // Exécute une instruction
    doc.rect(0, 10, doc.page.width, 3).fill(GOLD);

    // Exécute une instruction
    doc.moveDown(1.2);
    // Exécute une instruction
    doc.font('Helvetica-Bold').fontSize(20).fillColor(NIGHT)
      // Exécute une instruction
      .text('UNIVERSITE DU SALOUM', { align: 'center' });
    // Exécute une instruction
    doc.font('Helvetica').fontSize(10).fillColor(GREY)
      // Exécute une instruction
      .text('Service de la scolarite', { align: 'center' });

    // Exécute une instruction
    doc.moveDown(1.5);
    // Exécute une instruction
    doc.font('Helvetica-Bold').fontSize(16).fillColor(ROYAL)
      // Exécute une instruction
      .text('ATTESTATION D’INSCRIPTION', { align: 'center' });
    // Exécute une instruction
    doc.moveTo(190, doc.y + 8).lineTo(doc.page.width - 190, doc.y + 8).strokeColor(GOLD).lineWidth(1).stroke();

    // Exécute une instruction
    doc.moveDown(2);
    // Exécute une instruction
    doc.font('Helvetica').fontSize(11).fillColor('#1F2937')
      // Exécute une instruction
      .text(`Nous attestons que l’étudiant(e) ${dossier.prenom} ${dossier.nom},`);
    // Exécute une instruction
    doc.text(`numéro étudiant ${dossier.numero_etudiant}, est inscrit(e) pour l’année universitaire ${dossier.annee_universitaire},`);
    // Exécute une instruction
    doc.text(`dans la filière ${dossier.filiere}, au niveau ${dossier.niveau}.`);

    // Exécute une instruction
    doc.moveDown(1.5);
    // Déclare une variable
    const left = 56;
    // Déclare une variable
    const labelWidth = 150;
    // Déclare une variable
    const rows = [
      // Exécute une instruction
      ['Numéro étudiant', dossier.numero_etudiant],
      // Exécute une instruction
      ['Nom', dossier.nom],
      // Exécute une instruction
      ['Prénom', dossier.prenom],
      // Exécute une instruction
      ['Filière', dossier.filiere],
      // Exécute une instruction
      ['Niveau', dossier.niveau],
      // Exécute une instruction
      ['Année universitaire', dossier.annee_universitaire],
      // Exécute une instruction
      ['Date de validation', formatDate(dossier.date_traitement)],
      // Exécute une instruction
      ['Référence du dossier', dossier.reference_dossier],
    // Ferme un bloc, objet ou appel
    ];
    // Exécute une instruction
    rows.forEach(([label, value]) => {
      // Déclare une variable
      const y = doc.y;
      // Exécute une instruction
      doc.font('Helvetica-Bold').fontSize(10).fillColor(NIGHT).text(`${label} :`, left, y, { width: labelWidth });
      // Exécute une instruction
      doc.font('Helvetica').fontSize(10).fillColor('#1F2937').text(String(value || '—'), left + labelWidth, y, {
        // Exécute une instruction
        width: doc.page.width - left * 2 - labelWidth,
      // Ferme un bloc/appel de fonction
      });
      // Exécute une instruction
      doc.moveDown(0.55);
    // Ferme un bloc/appel de fonction
    });

    // Exécute une instruction
    doc.moveDown(1.8);
    // Exécute une instruction
    doc.font('Helvetica-Bold').fontSize(11).fillColor(NIGHT)
      // Exécute une instruction
      .text('Mention officielle : dossier validé par le service de la scolarité.', { align: 'center' });
    // Exécute une instruction
    doc.font('Helvetica').fontSize(9).fillColor(GREY)
      // Exécute une instruction
      .text('Document généré électroniquement par l’application SCOLARITÉ.', { align: 'center' });

    // Exécute une instruction
    doc.moveTo(56, doc.page.height - 90).lineTo(doc.page.width - 56, doc.page.height - 90)
      // Exécute une instruction
      .strokeColor('#D7DCE4').stroke();
    // Exécute une instruction
    doc.font('Helvetica').fontSize(9).fillColor(GREY)
      // Exécute une instruction
      .text(`Édité le ${formatDate(new Date())}  •  Référence ${dossier.reference_dossier}`, 56, doc.page.height - 78, {
        // Exécute une instruction
        width: doc.page.width - 112,
        // Exécute une instruction
        align: 'center',
      // Ferme un bloc/appel de fonction
      });

    // Exécute une instruction
    doc.end();
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { generateAttestation };
