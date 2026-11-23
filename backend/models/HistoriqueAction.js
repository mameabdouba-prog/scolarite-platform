// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const db = require('../config/database');

// Déclare une fonction
async function record({
  // Exécute une instruction
  entityType,
  // Exécute une instruction
  entityId,
  // Exécute une instruction
  action,
  // Exécute une instruction
  utilisateurType,
  // Assigne ou met à jour une valeur
  utilisateurId = null,
  // Exécute une instruction
  description,
  // Assigne ou met à jour une valeur
  connection = null,
// Ferme un bloc ou objet
}) {
  // Déclare une variable
  const executor = connection || db.pool;
  // Attend le résultat d’une opération asynchrone
  await executor.execute(
    // Exécute une instruction
    `INSERT INTO historique_actions
       (entity_type, entity_id, action, utilisateur_type, utilisateur_id, description)
     VALUES (:entityType, :entityId, :action, :utilisateurType, :utilisateurId, :description)`,
    // Commentaire: suite de commentaire bloc
    { entityType, entityId, action, utilisateurType, utilisateurId, description },
  // Commentaire: suite de commentaire bloc
  );
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
async function listByEntity(entityType, entityId) {
  // Commentaire: suite de commentaire bloc
  return db.query(
    // Commentaire: suite de commentaire bloc
    `SELECT * FROM historique_actions
     WHERE entity_type = :entityType AND entity_id = :entityId
     ORDER BY created_at DESC, id DESC`,
    // Commentaire: suite de commentaire bloc
    { entityType, entityId },
  // Commentaire: suite de commentaire bloc
  );
// Commentaire: suite de commentaire bloc
}

// Commentaire: suite de commentaire bloc
module.exports = { record, listByEntity };
