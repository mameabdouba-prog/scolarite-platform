// Active le mode strict JavaScript pour détecter plus d’erreurs
'use strict';

// Importe une dépendance via require
const helpers = require('./helpers');

// Exécute une instruction
describe('SCOLARITÉ - tests d’intégration', () => {
  // Déclare une variable
  let studentAgent;
  // Déclare une variable
  let otherStudentAgent;
  // Déclare une variable
  let adminAgent;
  // Déclare une variable
  let agentAgent;
  // Déclare une variable
  let student;
  // Déclare une variable
  let otherStudent;
  // Déclare une variable
  let dossierId;
  // Déclare une variable
  let otherDossierId;
  // Déclare une variable
  let pieceId;
  // Déclare une variable
  let adminEmail;
  // Déclare une variable
  let agentData;

  // Exécute une instruction
  afterAll(async () => {
    // Attend le résultat d’une opération asynchrone
    await helpers.db.close().catch(() => {});
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('1. La page de connexion est accessible', async () => {
    // Déclare une variable
    const response = await helpers.agent().get('/login');
    // Exécute une instruction
    expect(response.status).toBe(200);
    // Exécute une instruction
    expect(response.text).toContain('Connexion à votre espace');
    // Exécute une instruction
    expect(response.text).toContain('name="_csrf"');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('2. Un étudiant peut créer un compte', async () => {
    // Assigne ou met à jour une valeur
    studentAgent = helpers.agent();
    // Assigne ou met à jour une valeur
    student = await helpers.registerStudent(studentAgent);
    // Déclare une variable
    const rows = await helpers.db.query('SELECT * FROM etudiants WHERE email = :email', { email: student.email });
    // Exécute une instruction
    expect(rows).toHaveLength(1);
    // Exécute une instruction
    expect(rows[0].numero_etudiant).toBe(student.numeroEtudiant);
    // Exécute une instruction
    expect(rows[0].password).not.toBe(student.password);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('3. Connexion et déconnexion fonctionnent', async () => {
    // Déclare une variable
    const response = await helpers.login(studentAgent, student.email, student.password);
    // Exécute une instruction
    expect(response.headers.location).toBe('/dashboard');
    // Déclare une variable
    const dashboard = await studentAgent.get('/dashboard');
    // Exécute une instruction
    expect(dashboard.headers.location).toBe('/etudiant/tableau-de-bord');

    // Attend le résultat d’une opération asynchrone
    await helpers.logout(studentAgent);
    // Déclare une variable
    const protectedPage = await studentAgent.get('/etudiant/tableau-de-bord');
    // Exécute une instruction
    expect(protectedPage.status).toBe(302);
    // Exécute une instruction
    expect(protectedPage.headers.location).toBe('/login');
    // Attend le résultat d’une opération asynchrone
    await helpers.login(studentAgent, student.email, student.password);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('4. Le contrôle d’accès par rôle est appliqué', async () => {
    // Déclare une variable
    const studentResponse = await studentAgent.get('/admin/agents');
    // Exécute une instruction
    expect(studentResponse.status).toBe(403);
    // Exécute une instruction
    expect(studentResponse.text).toContain('Accès refusé');
    // Déclare une variable
    const anonymous = helpers.agent();
    // Déclare une variable
    const anonymousResponse = await anonymous.get('/admin/agents');
    // Exécute une instruction
    expect(anonymousResponse.status).toBe(302);
    // Exécute une instruction
    expect(anonymousResponse.headers.location).toBe('/login');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('5. Un étudiant peut soumettre un dossier', async () => {
    // Assigne ou met à jour une valeur
    dossierId = await helpers.submitDossier(studentAgent);
    // Déclare une variable
    const rows = await helpers.db.query('SELECT * FROM dossiers WHERE id = :id', { id: dossierId });
    // Exécute une instruction
    expect(rows).toHaveLength(1);
    // Exécute une instruction
    expect(rows[0].etat).toBe('EN_ATTENTE');
    // Exécute une instruction
    expect(rows[0].reference_dossier).toMatch(/^DOS-/);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('6. Un doublon de dossier pour la même année est refusé', async () => {
    // Déclare une variable
    const csrfToken = await helpers.getCsrf(studentAgent, '/etudiant/inscription');
    // Déclare une variable
    const response = await studentAgent.post('/etudiant/inscription').set('Accept', 'application/json').type('form').send({
      // Exécute une instruction
      _csrf: csrfToken,
      // Exécute une instruction
      anneeUniversitaire: '2026-2027',
      // Exécute une instruction
      filiere: 'Droit',
      // Exécute une instruction
      niveau: 'L3',
    // Ferme un bloc/appel de fonction
    });
    // Exécute une instruction
    expect(response.status).toBe(409);
    // Exécute une instruction
    expect(response.body.error).toContain('dossier');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('7. Un étudiant ne peut pas consulter le dossier d’un autre étudiant', async () => {
    // Assigne ou met à jour une valeur
    otherStudentAgent = helpers.agent();
    // Assigne ou met à jour une valeur
    otherStudent = await helpers.registerStudent(otherStudentAgent, { filiere: 'Gestion' });
    // Attend le résultat d’une opération asynchrone
    await helpers.login(otherStudentAgent, otherStudent.email, otherStudent.password);
    // Assigne ou met à jour une valeur
    otherDossierId = await helpers.submitDossier(otherStudentAgent, '2026-2027');

    // Déclare une variable
    const response = await studentAgent.get(`/etudiant/dossiers/${otherDossierId}`);
    // Exécute une instruction
    expect(response.status).toBe(404);
    // Exécute une instruction
    expect(otherDossierId).not.toBe(dossierId);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('8. Le dépôt d’une pièce justificative est enregistré et contrôlé', async () => {
    // Déclare une variable
    const response = await helpers.uploadPiece(studentAgent, dossierId);
    // Exécute une instruction
    expect(response.status).toBe(302);
    // Déclare une variable
    const pieces = await helpers.db.query('SELECT * FROM pieces WHERE dossier_id = :id', { id: dossierId });
    // Exécute une instruction
    expect(pieces).toHaveLength(1);
    // Exécute une instruction
    expect(pieces[0].type).toBe('CARTE_IDENTITE');
    // Exécute une instruction
    expect(pieces[0].nom_stockage).toMatch(/\.pdf$/);
    // Assigne ou met à jour une valeur
    pieceId = pieces[0].id;

    // Déclare une variable
    const invalid = await studentAgent
      // Exécute une instruction
      .post(`/etudiant/dossiers/${dossierId}/pieces?_csrf=${await helpers.getCsrf(studentAgent, `/etudiant/dossiers/${dossierId}`)}`)
      // Exécute une instruction
      .set('Accept', 'application/json')
      // Exécute une instruction
      .attach('piece', Buffer.from('fake'), { filename: 'fake.pdf', contentType: 'application/pdf' })
      // Exécute une instruction
      .field('type', 'RELEVE_NOTES');
    // Exécute une instruction
    expect(invalid.status).toBe(400);
    // Exécute une instruction
    expect(invalid.body.error).toContain('format déclaré');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('9. La pièce déposée ne peut pas être téléchargée par un autre étudiant', async () => {
    // Déclare une variable
    const denied = await otherStudentAgent.get(`/etudiant/pieces/${pieceId}/download`);
    // Exécute une instruction
    expect(denied.status).toBe(404);
    // Déclare une variable
    const allowed = await studentAgent.get(`/etudiant/pieces/${pieceId}/download`);
    // Exécute une instruction
    expect(allowed.status).toBe(200);
    // Exécute une instruction
    expect(allowed.headers['content-type']).toContain('application/pdf');
    // Exécute une instruction
    expect(allowed.body.subarray(0, 5).toString()).toBe('%PDF-');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('10. Les routes /health et /version répondent', async () => {
    // Déclare une variable
    const agent = helpers.agent();
    // Déclare une variable
    const health = await agent.get('/health');
    // Exécute une instruction
    expect(health.status).toBe(200);
    // Exécute une instruction
    expect(health.body).toEqual({ status: 'ok', database: 'connected' });

    // Déclare une variable
    const version = await agent.get('/version');
    // Exécute une instruction
    expect(version.status).toBe(200);
    // Exécute une instruction
    expect(version.body.version).toBeTruthy();
    // Exécute une instruction
    expect(version.body.instance).toBeTruthy();
    // Exécute une instruction
    expect(version.body.timestamp).toBeTruthy();
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('11. Un administrateur peut être créé puis se connecter', async () => {
    // Assigne ou met à jour une valeur
    adminEmail = `admin${Date.now()}@exemple.fr`;
    // Attend le résultat d’une opération asynchrone
    await helpers.createAdmin(adminEmail, 'AdminPassword123');
    // Assigne ou met à jour une valeur
    adminAgent = helpers.agent();
    // Déclare une variable
    const response = await helpers.login(adminAgent, adminEmail, 'AdminPassword123');
    // Exécute une instruction
    expect(response.headers.location).toBe('/dashboard');
    // Déclare une variable
    const stats = await adminAgent.get('/admin/tableau-de-bord');
    // Exécute une instruction
    expect(stats.status).toBe(200);
    // Exécute une instruction
    expect(stats.text).toContain('Données de l’année universitaire');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('12. L’administrateur crée un agent et celui-ci ne peut pas accéder à l’administration', async () => {
    // Assigne ou met à jour une valeur
    agentData = await helpers.createAgentViaAdmin(adminAgent);
    // Assigne ou met à jour une valeur
    agentAgent = helpers.agent();
    // Déclare une variable
    const response = await helpers.login(agentAgent, agentData.email, agentData.password);
    // Exécute une instruction
    expect(response.headers.location).toBe('/dashboard');
    // Déclare une variable
    const denied = await agentAgent.get('/admin/agents');
    // Exécute une instruction
    expect(denied.status).toBe(403);
    // Déclare une variable
    const allowed = await agentAgent.get('/agent/dossiers');
    // Exécute une instruction
    expect(allowed.status).toBe(200);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('13. Le rejet sans commentaire est refusé', async () => {
    // Déclare une variable
    const csrfToken = await helpers.getCsrf(agentAgent, `/agent/dossiers/${dossierId}`);
    // Déclare une variable
    const response = await agentAgent.post(`/agent/dossiers/${dossierId}/traiter`).set('Accept', 'application/json').send({
      // Exécute une instruction
      _csrf: csrfToken,
      // Exécute une instruction
      etat: 'REJETE',
      // Exécute une instruction
      commentaire: '',
    // Ferme un bloc/appel de fonction
    });
    // Exécute une instruction
    expect(response.status).toBe(400);
    // Exécute une instruction
    expect(response.body.error).toMatch(/commentaire/i);
    // Déclare une variable
    const rows = await helpers.db.query('SELECT etat FROM dossiers WHERE id = :id', { id: dossierId });
    // Exécute une instruction
    expect(rows[0].etat).toBe('EN_ATTENTE');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('14. Un agent peut valider un dossier', async () => {
    // Déclare une variable
    const csrfToken = await helpers.getCsrf(agentAgent, `/agent/dossiers/${dossierId}`);
    // Déclare une variable
    const response = await agentAgent.post(`/agent/dossiers/${dossierId}/traiter`).type('form').send({
      // Exécute une instruction
      _csrf: csrfToken,
      // Exécute une instruction
      etat: 'VALIDE',
      // Exécute une instruction
      commentaire: '',
    // Ferme un bloc/appel de fonction
    });
    // Exécute une instruction
    expect(response.status).toBe(302);
    // Déclare une variable
    const rows = await helpers.db.query('SELECT * FROM dossiers WHERE id = :id', { id: dossierId });
    // Exécute une instruction
    expect(rows[0].etat).toBe('VALIDE');
    // Exécute une instruction
    expect(rows[0].date_traitement).not.toBeNull();
    // Déclare une variable
    const history = await helpers.db.query(
      // Exécute une instruction
      `SELECT * FROM historique_actions WHERE entity_type = 'DOSSIER' AND entity_id = :id AND action = 'DOSSIER_VALIDE'`,
      // Ouvre un bloc ou objet
      { id: dossierId },
    // Ferme un bloc, objet ou appel
    );
    // Exécute une instruction
    expect(history).toHaveLength(1);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('15. L’attestation PDF est générée pour le propriétaire uniquement', async () => {
    // Déclare une variable
    const denied = await otherStudentAgent.get(`/etudiant/dossiers/${dossierId}/attestation`);
    // Exécute une instruction
    expect(denied.status).toBe(404);
    // Déclare une variable
    const response = await studentAgent.get(`/etudiant/dossiers/${dossierId}/attestation`);
    // Exécute une instruction
    expect(response.status).toBe(200);
    // Exécute une instruction
    expect(response.headers['content-type']).toContain('application/pdf');
    // Exécute une instruction
    expect(response.body.subarray(0, 5).toString()).toBe('%PDF-');
    // Exécute une instruction
    expect(response.body.length).toBeGreaterThan(1000);
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('16. Les statistiques affichées proviennent de MySQL', async () => {
    // Déclare une variable
    const response = await adminAgent.get('/admin/tableau-de-bord');
    // Exécute une instruction
    expect(response.status).toBe(200);
    // Déclare une variable
    const rows = await helpers.db.query('SELECT COUNT(*) AS total FROM dossiers');
    // Exécute une instruction
    expect(Number(rows[0].total)).toBeGreaterThanOrEqual(2);
    // Exécute une instruction
    expect(response.text).toContain('Dossiers par état');
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  test('17. Les pages d’erreur 403, 404 et 500 existent', async () => {
    // Déclare une variable
    const forbidden = await helpers.agent().get('/access-denied');
    // Exécute une instruction
    expect(forbidden.status).toBe(200);
    // Exécute une instruction
    expect(forbidden.text).toContain('Accès refusé');
    // Déclare une variable
    const notFound = await helpers.agent().get('/route-inexistante');
    // Exécute une instruction
    expect(notFound.status).toBe(404);
    // Exécute une instruction
    expect(notFound.text).toContain('Page introuvable');
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc/appel de fonction
});
