// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const path = require('node:path');
// Importe une dépendance via require
const dotenv = require('dotenv');

// Exécute une instruction
dotenv.config({ path: path.join(__dirname, '..', '.env.test'), override: true });
