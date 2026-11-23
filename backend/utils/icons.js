// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Déclare une variable
const iconNames = {
  // Exécute une instruction
  dashboard: 'squares-four',
  // Exécute une instruction
  folder: 'folder-open',
  // Exécute une instruction
  file: 'file-text',
  // Exécute une instruction
  users: 'users-three',
  // Exécute une instruction
  shield: 'shield-check',
  // Exécute une instruction
  logout: 'sign-out',
  // Exécute une instruction
  login: 'sign-in',
  // Exécute une instruction
  'sign-in': 'sign-in',
  // Exécute une instruction
  plus: 'plus',
  // Exécute une instruction
  check: 'check',
  // Exécute une instruction
  x: 'x',
  // Exécute une instruction
  eye: 'eye',
  // Exécute une instruction
  download: 'download-simple',
  // Exécute une instruction
  upload: 'upload-simple',
  // Exécute une instruction
  filter: 'funnel',
  // Exécute une instruction
  search: 'magnifying-glass',
  // Exécute une instruction
  chart: 'chart-bar',
  // Exécute une instruction
  settings: 'gear',
  // Exécute une instruction
  'arrow-left': 'arrow-left',
  // Exécute une instruction
  'arrow-right': 'arrow-right',
  // Exécute une instruction
  alert: 'warning',
  // Exécute une instruction
  info: 'info',
  // Exécute une instruction
  key: 'key',
  // Exécute une instruction
  user: 'user',
  // Exécute une instruction
  calendar: 'calendar-blank',
  // Exécute une instruction
  lock: 'lock',
  // Exécute une instruction
  graduation: 'graduation-cap',
  // Exécute une instruction
  building: 'building',
  // Exécute une instruction
  refresh: 'arrows-clockwise',
  // Exécute une instruction
  mail: 'envelope',
  // Exécute une instruction
  clock: 'clock',
  // Exécute une instruction
  list: 'list',
  // Exécute une instruction
  'check-circle': 'check-circle',
  // Exécute une instruction
  'x-circle': 'x-circle',
  // Exécute une instruction
  'file-text': 'file-text',
  // Exécute une instruction
  'shield-check': 'shield-check',
  // Exécute une instruction
  'upload-simple': 'upload-simple',
  // Exécute une instruction
  'download-simple': 'download-simple',
  // Exécute une instruction
  'id-card': 'identification-card',
  // Exécute une instruction
  receipt: 'receipt',
  // Exécute une instruction
  books: 'books',
  // Exécute une instruction
  pie: 'chart-pie',
  // Exécute une instruction
  sliders: 'sliders-horizontal',
  // Exécute une instruction
  'caret-left': 'caret-left',
  // Exécute une instruction
  'caret-right': 'caret-right',
  // Exécute une instruction
  'caret-down': 'caret-down',
  // Exécute une instruction
  'map-pin': 'map-pin',
  // Exécute une instruction
  phone: 'phone',
// Ferme un bloc, objet ou appel
};

// Déclare une fonction
function icon(name, className = '') {
  // Déclare une variable
  const slug = iconNames[name] || iconNames.info;
  // Déclare une variable
  const extra = String(className || '').replace(/[^a-zA-Z0-9 _-]/g, '').trim();
  // Retourne une valeur ou termine la fonction
  return `<i class="ph ph-${slug} icon${extra ? ` ${extra}` : ''}" aria-hidden="true"></i>`;
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = { icon };
