// Exécute une instruction
document.addEventListener('DOMContentLoaded', function () {
  // Déclare une variable
  const menuToggle = document.querySelector('[data-menu-toggle]');
  // Déclare une variable
  const menuClose = document.querySelector('[data-menu-close]');
  // Déclare une variable
  const sidebar = document.getElementById('sidebar');
  // Déclare une variable
  const main = document.querySelector('.main-area');
  // Déclare une variable
  let previousFocus = null;

  // Déclare une fonction
  function setMenu(open, restoreFocus = true) {
    // Exécute une instruction
    document.body.classList.toggle('nav-open', open);
    // Condition: exécute le bloc si la condition est vraie
    if (menuToggle) {
      // Exécute une instruction
      menuToggle.setAttribute('aria-expanded', String(open));
      // Exécute une instruction
      menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    // Ferme un bloc, objet ou appel
    }
    // Condition: exécute le bloc si la condition est vraie
    if (sidebar) {
      // Condition: exécute le bloc si la condition est vraie
      if (open) {
        // Assigne ou met à jour une valeur
        previousFocus = document.activeElement;
        // Exécute une instruction
        sidebar.setAttribute('role', 'dialog');
        // Exécute une instruction
        sidebar.setAttribute('aria-modal', 'true');
        // Condition: exécute le bloc si la condition est vraie
        if (main) main.inert = true;
        // Déclare une variable
        const first = sidebar.querySelector('.brand, .nav-link');
        // Condition: exécute le bloc si la condition est vraie
        if (first) first.focus();
      // Ferme un bloc ou objet
      } else {
        // Exécute une instruction
        sidebar.removeAttribute('role');
        // Exécute une instruction
        sidebar.removeAttribute('aria-modal');
        // Condition: exécute le bloc si la condition est vraie
        if (main) main.inert = false;
        // Condition: exécute le bloc si la condition est vraie
        if (restoreFocus && previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      // Ferme un bloc, objet ou appel
      }
    // Ferme un bloc, objet ou appel
    }
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (menuToggle) {
    // Exécute une instruction
    menuToggle.addEventListener('click', function () {
      // Exécute une instruction
      setMenu(!document.body.classList.contains('nav-open'));
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc, objet ou appel
  }

  // Condition: exécute le bloc si la condition est vraie
  if (menuClose) {
    // Exécute une instruction
    menuClose.addEventListener('click', function () {
      // Exécute une instruction
      setMenu(false);
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc, objet ou appel
  }

  // Exécute une instruction
  document.querySelectorAll('.nav-link').forEach(function (link) {
    // Exécute une instruction
    link.addEventListener('click', function () {
      // Exécute une instruction
      setMenu(false, false);
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  document.addEventListener('keydown', function (event) {
    // Condition: exécute le bloc si la condition est vraie
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      // Exécute une instruction
      setMenu(false);
      // Condition: exécute le bloc si la condition est vraie
      if (menuToggle) menuToggle.focus();
    // Ferme un bloc, objet ou appel
    }
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  window.addEventListener('resize', function () {
    // Condition: exécute le bloc si la condition est vraie
    if (window.innerWidth > 980 && document.body.classList.contains('nav-open')) {
      // Exécute une instruction
      setMenu(false, false);
    // Ferme un bloc, objet ou appel
    }
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  document.querySelectorAll('form').forEach(function (form) {
    // Déclare une variable
    const radios = Array.from(form.querySelectorAll('input[type="radio"][name="etat"]'));
    // Déclare une variable
    const comment = form.querySelector('textarea[name="commentaire"]');
    // Condition: exécute le bloc si la condition est vraie
    if (!radios.length || !comment) return;

    // Déclare une fonction
    function requiresComment() {
      // Retourne une valeur ou termine la fonction
      return Boolean(form.querySelector('input[name="etat"]:checked[data-requires-comment]'));
    // Ferme un bloc, objet ou appel
    }

    // Exécute une instruction
    radios.forEach(function (radio) {
      // Exécute une instruction
      radio.addEventListener('change', function () {
        // Exécute une instruction
        comment.required = requiresComment();
        // Condition: exécute le bloc si la condition est vraie
        if (comment.required) comment.focus();
      // Ferme un bloc/appel de fonction
      });
    // Ferme un bloc/appel de fonction
    });

    // Exécute une instruction
    form.addEventListener('submit', function (event) {
      // Exécute une instruction
      comment.required = requiresComment();
      // Condition: exécute le bloc si la condition est vraie
      if (comment.required && !comment.value.trim()) {
        // Exécute une instruction
        event.preventDefault();
        // Exécute une instruction
        comment.focus();
      // Ferme un bloc, objet ou appel
      }
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  document.querySelectorAll('[data-confirm-form]').forEach(function (form) {
    // Déclare une variable
    let box = form.querySelector('.inline-confirm');
    // Condition: exécute le bloc si la condition est vraie
    if (!box) {
      // Assigne ou met à jour une valeur
      box = document.createElement('div');
      // Exécute une instruction
      box.className = 'inline-confirm';
      // Exécute une instruction
      box.setAttribute('role', 'alert');
      // Exécute une instruction
      box.innerHTML = '<p></p><div class="inline-confirm-actions"><button class="btn btn-primary btn-sm" type="button" data-confirm-yes>Confirmer</button><button class="btn btn-secondary btn-sm" type="button" data-confirm-no>Annuler</button></div>';
      // Exécute une instruction
      form.appendChild(box);
    // Ferme un bloc, objet ou appel
    }
    // Déclare une variable
    const message = box.querySelector('p');
    // Déclare une variable
    const confirmButton = box.querySelector('[data-confirm-yes]');
    // Déclare une variable
    const cancelButton = box.querySelector('[data-confirm-no]');

    // Exécute une instruction
    form.addEventListener('submit', function (event) {
      // Condition: exécute le bloc si la condition est vraie
      if (form.dataset.confirmed === 'true') return;
      // Exécute une instruction
      event.preventDefault();
      // Déclare une variable
      const selected = form.querySelector('input[name="etat"]:checked');
      // Déclare une variable
      const detail = selected
        // Exécute une instruction
        ? (selected.value === 'VALIDE' ? 'Le dossier sera validé.' : 'Le dossier sera rejeté.')
        // Exécute une instruction
        : '';
      // Exécute une instruction
      message.textContent = detail
        // Exécute une instruction
        ? `${form.getAttribute('data-confirm-form')} ${detail}`
        // Exécute une instruction
        : form.getAttribute('data-confirm-form');
      // Exécute une instruction
      box.classList.add('is-visible');
      // Exécute une instruction
      confirmButton.focus();
    // Ferme un bloc/appel de fonction
    });

    // Exécute une instruction
    confirmButton.addEventListener('click', function () {
      // Exécute une instruction
      form.dataset.confirmed = 'true';
      // Exécute une instruction
      box.classList.remove('is-visible');
      // Condition: exécute le bloc si la condition est vraie
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      // Branche exécutée si aucune condition précédente n’est vraie
      else form.submit();
    // Ferme un bloc/appel de fonction
    });

    // Exécute une instruction
    cancelButton.addEventListener('click', function () {
      // Exécute une instruction
      form.dataset.confirmed = 'false';
      // Exécute une instruction
      box.classList.remove('is-visible');
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc/appel de fonction
  });

  // Exécute une instruction
  document.querySelectorAll('input[type="file"]').forEach(function (input) {
    // Déclare une variable
    const field = input.closest('.field') || input.parentElement;
    // Déclare une variable
    let error = field.querySelector('.field-error');
    // Condition: exécute le bloc si la condition est vraie
    if (!error && field) {
      // Assigne ou met à jour une valeur
      error = document.createElement('span');
      // Exécute une instruction
      error.className = 'field-error';
      // Exécute une instruction
      error.setAttribute('role', 'alert');
      // Exécute une instruction
      field.appendChild(error);
    // Ferme un bloc, objet ou appel
    }
    // Exécute une instruction
    input.addEventListener('change', function () {
      // Condition: exécute le bloc si la condition est vraie
      if (!error) return;
      // Exécute une instruction
      error.textContent = '';
      // Condition: exécute le bloc si la condition est vraie
      if (!input.files || !input.files.length) return;
      // Déclare une variable
      const file = input.files[0];
      // Déclare une variable
      const allowed = ['application/pdf', 'image/jpeg'];
      // Condition: exécute le bloc si la condition est vraie
      if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        // Exécute une instruction
        input.value = '';
        // Exécute une instruction
        error.textContent = 'Utilisez un fichier PDF ou JPG de 5 Mo maximum.';
      // Ferme un bloc, objet ou appel
      }
    // Ferme un bloc/appel de fonction
    });
  // Ferme un bloc/appel de fonction
  });
// Ferme un bloc/appel de fonction
});
