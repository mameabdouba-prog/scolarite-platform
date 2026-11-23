// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Déclare une fonction
function currentAcademicYear(date = new Date()) {
  // Déclare une variable
  const year = date.getFullYear();
  // Déclare une variable
  const month = date.getMonth() + 1;
  // Retourne une valeur ou termine la fonction
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function formatDate(value) {
  // Condition: exécute le bloc si la condition est vraie
  if (!value) return '—';
  // Déclare une variable
  const date = value instanceof Date ? value : new Date(value);
  // Condition: exécute le bloc si la condition est vraie
  if (Number.isNaN(date.getTime())) return '—';
  // Retourne une valeur ou termine la fonction
  return new Intl.DateTimeFormat('fr-FR', {
    // Exécute une instruction
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  // Ferme un bloc ou objet
  }).format(date);
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function formatBytes(bytes) {
  // Déclare une variable
  const size = Number(bytes || 0);
  // Condition: exécute le bloc si la condition est vraie
  if (size < 1024) return `${size} o`;
  // Condition: exécute le bloc si la condition est vraie
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  // Retourne une valeur ou termine la fonction
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function escapeHtml(value) {
  // Retourne une valeur ou termine la fonction
  return String(value ?? '')
    // Exécute une instruction
    .replaceAll('&', '&amp;')
    // Exécute une instruction
    .replaceAll('<', '&lt;')
    // Exécute une instruction
    .replaceAll('>', '&gt;')
    // Exécute une instruction
    .replaceAll('"', '&quot;')
    // Exécute une instruction
    .replaceAll("'", '&#39;');
// Ferme un bloc, objet ou appel
}

// Déclare une fonction
function normalizePagination(query, defaultLimit = 10) {
  // Déclare une variable
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  // Déclare une variable
  const limitRaw = Number.parseInt(query.limit, 10) || defaultLimit;
  // Déclare une variable
  const limit = Math.min(100, Math.max(5, limitRaw));
  // Retourne une valeur ou termine la fonction
  return { page, limit, offset: (page - 1) * limit };
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = {
  // Exécute une instruction
  currentAcademicYear,
  // Exécute une instruction
  formatDate,
  // Exécute une instruction
  formatBytes,
  // Exécute une instruction
  escapeHtml,
  // Exécute une instruction
  normalizePagination,
// Ferme un bloc, objet ou appel
};
