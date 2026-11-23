// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const crypto = require('node:crypto');
// Exécute une instruction
const {
  // Exécute une instruction
  S3Client,
  // Exécute une instruction
  PutObjectCommand,
  // Exécute une instruction
  GetObjectCommand,
  // Exécute une instruction
  DeleteObjectCommand,
// Ferme un bloc ou objet
} = require('@aws-sdk/client-s3');
// Importe une dépendance via require
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// Importe une dépendance via require
const { extensionFor, validateFileSignature, safeOriginalName } = require('../config/uploads');
// Importe une dépendance via require
const AppError = require('../utils/AppError');

// Déclare une classe
class S3StorageService {
  // Exécute une instruction
  constructor() {
    // Condition: exécute le bloc si la condition est vraie
    if (!process.env.AWS_REGION || !process.env.AWS_S3_BUCKET) {
      // Lève une erreur/exception
      throw new Error('AWS_REGION et AWS_S3_BUCKET sont requis pour le stockage S3.');
    // Ferme un bloc, objet ou appel
    }
    // Exécute une instruction
    this.bucket = process.env.AWS_S3_BUCKET;
    // Exécute une instruction
    this.client = new S3Client({
      // Exécute une instruction
      region: process.env.AWS_REGION,
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async save(file) {
    // Déclare une variable
    const extension = extensionFor(file.mimetype);
    // Condition: exécute le bloc si la condition est vraie
    if (!extension || !validateFileSignature(file.buffer, file.mimetype)) {
      // Lève une erreur/exception
      throw new AppError('Le contenu du fichier ne correspond pas au format déclaré.', 400);
    // Ferme un bloc, objet ou appel
    }
    // Déclare une variable
    const now = new Date();
    // Déclare une variable
    const key = [
      // Exécute une instruction
      String(now.getFullYear()),
      // Exécute une instruction
      String(now.getMonth() + 1).padStart(2, '0'),
      // Exécute une instruction
      `${crypto.randomUUID()}.${extension}`,
    // Exécute une instruction
    ].join('/');

    // Attend le résultat d’une opération asynchrone
    await this.client.send(new PutObjectCommand({
      // Exécute une instruction
      Bucket: this.bucket,
      // Exécute une instruction
      Key: key,
      // Exécute une instruction
      Body: file.buffer,
      // Exécute une instruction
      ContentType: file.mimetype,
      // Exécute une instruction
      ServerSideEncryption: 'AES256',
      // Exécute une instruction
      Metadata: { original: encodeURIComponent(safeOriginalName(file.originalname)) },
    // Ferme un bloc ou objet
    }));

    // Retourne une valeur ou termine la fonction
    return {
      // Exécute une instruction
      key,
      // Exécute une instruction
      emplacement: `s3://${this.bucket}/${key}`,
      // Exécute une instruction
      nomOriginal: safeOriginalName(file.originalname),
      // Exécute une instruction
      taille: file.size ?? file.buffer.length,
    // Ferme un bloc, objet ou appel
    };
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async read(key) {
    // Déclare une variable
    const response = await this.client.send(new GetObjectCommand({
      // Exécute une instruction
      Bucket: this.bucket,
      // Exécute une instruction
      Key: key,
    // Ferme un bloc ou objet
    }));
    // Retourne une valeur ou termine la fonction
    return Buffer.from(await response.Body.transformToByteArray());
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async delete(key) {
    // Attend le résultat d’une opération asynchrone
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  async getUrl(key) {
    // Retourne une valeur ou termine la fonction
    return getSignedUrl(this.client, new GetObjectCommand({
      // Exécute une instruction
      Bucket: this.bucket,
      // Exécute une instruction
      Key: key,
    // Ferme un bloc ou objet
    }), { expiresIn: 300 });
  // Ferme un bloc, objet ou appel
  }
// Ferme un bloc, objet ou appel
}

// Exporte des fonctions/objets du module
module.exports = S3StorageService;
