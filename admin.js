"use strict";

/*
  Contraseña inicial del administrador.

  La contraseña solamente se usa si todavía no existe
  una contraseña personalizada guardada.
*/
const DEFAULT_ADMIN_PASSWORD = "Flor7272";

const PASSWORD_STORAGE_KEY = "grandPianoAdminPassword";
const SESSION_STORAGE_KEY = "grandPianoAdminSession";

const adminLogin = document.getElementById("adminLogin");
const adminApp = document.getElementById("adminApp");

const adminLoginForm =
  document.getElementById("adminLoginForm");

const adminPasswordInput =
  document.getElementById("adminPasswordInput");

const toggleLoginPassword =
  document.getElementById("toggleLoginPassword");

const loginMessage =
  document.getElementById("loginMessage");

const contentSection =
  document.getElementById("contentSection");

const logoutButton =
  document.getElementById("logoutButton");

const adminCards =
  document.querySelectorAll(".admin-card");


const sectionNames = {
  home: "Inicio",
  songs: "Canciones",
  midis: "Biblioteca MIDI",
  players: "Jugadores",
  economy: "Economía",
  announcements: "Anuncios",
  reports: "Reportes",
  settings: "Configuración"
};


/* OBTENER CONTRASEÑA ACTUAL */

function getAdminPassword() {
  return (
    localStorage.getItem(PASSWORD_STORAGE_KEY) ||
    DEFAULT_ADMIN_PASSWORD
  );
}


/* MOSTRAR PANEL */

function showAdminPanel() {
  adminLogin.classList.add("hidden");
  adminApp.classList.remove("hidden");

  sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    "active"
  );
}


/* MOSTRAR LOGIN */

function showAdminLogin() {
  adminApp.classList.add("hidden");
  adminLogin.classList.remove("hidden");

  adminPasswordInput.value = "";
  loginMessage.textContent = "";

  sessionStorage.removeItem(
    SESSION_STORAGE_KEY
  );
}


/* REVISAR SESIÓN */

function checkAdminSession() {
  const session =
    sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (session === "active") {
    showAdminPanel();
  } else {
    showAdminLogin();
  }
}


/* INICIAR SESIÓN */

adminLoginForm.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const enteredPassword =
      adminPasswordInput.value.trim();

    const currentPassword =
      getAdminPassword();

    if (!enteredPassword) {
      showLoginMessage(
        "Escribe la contraseña administrativa.",
        "error"
      );

      return;
    }

    if (enteredPassword !== currentPassword) {
      showLoginMessage(
        "La contraseña es incorrecta.",
        "error"
      );

      adminPasswordInput.select();

      return;
    }

    showLoginMessage(
      "Acceso autorizado.",
      "success"
    );

    window.setTimeout(() => {
      showAdminPanel();
    }, 400);
  }
);


/* MOSTRAR U OCULTAR CONTRASEÑA */

toggleLoginPassword.addEventListener(
  "click",
  () => {
    const isPassword =
      adminPasswordInput.type === "password";

    adminPasswordInput.type =
      isPassword ? "text" : "password";

    toggleLoginPassword.textContent =
      isPassword ? "🙈" : "👁️";
  }
);


/* MENSAJE DEL LOGIN */

function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className =
    `form-message ${type}`;
}


/* ABRIR SECCIONES */

adminCards.forEach((card) => {
  card.addEventListener("click", () => {
    const section = card.dataset.section;

    if (section === "settings") {
      renderSettingsSection();
      return;
    }

    const sectionName =
      sectionNames[section] || "Sección";

    contentSection.innerHTML = `
      <div class="empty-state">
        <span>🚧</span>

        <h2>${sectionName}</h2>

        <p>
          Esta sección está preparada y será construida
          en los siguientes pasos.
        </p>
      </div>
    `;

    scrollToContent();
  });
});


/* CONFIGURACIÓN Y SEGURIDAD */

function renderSettingsSection() {
  contentSection.innerHTML = `
    <div class="section-header">
      <p class="section-label">Configuración</p>
      <h2>Seguridad administrativa</h2>
      <p>
        Cambia la contraseña utilizada para entrar
        al Panel Admin.
      </p>
    </div>

    <form id="changePasswordForm" class="settings-form">

      <label for="currentPassword">
        Contraseña actual
      </label>

      <div class="password-field">

        <input
          id="currentPassword"
          type="password"
          placeholder="Escribe la contraseña actual"
          autocomplete="current-password"
          required
        >

        <button
          class="show-password-button"
          type="button"
          data-toggle-password="currentPassword"
        >
          👁️
        </button>

      </div>


      <label for="newPassword">
        Nueva contraseña
      </label>

      <div class="password-field">

        <input
          id="newPassword"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autocomplete="new-password"
          minlength="8"
          required
        >

        <button
          class="show-password-button"
          type="button"
          data-toggle-password="newPassword"
        >
          👁️
        </button>

      </div>


      <label for="confirmPassword">
        Confirmar nueva contraseña
      </label>

      <div class="password-field">

        <input
          id="confirmPassword"
          type="password"
          placeholder="Repite la nueva contraseña"
          autocomplete="new-password"
          minlength="8"
          required
        >

        <button
          class="show-password-button"
          type="button"
          data-toggle-password="confirmPassword"
        >
          👁️
        </button>

      </div>


      <div class="password-requirements">
        <strong>La nueva contraseña debe tener:</strong>

        <span>• Mínimo 8 caracteres</span>
        <span>• Una letra mayúscula</span>
        <span>• Una letra minúscula</span>
        <span>• Al menos un número</span>
      </div>


      <button class="primary-button" type="submit">
        Guardar nueva contraseña
      </button>

      <p
        id="passwordChangeMessage"
        class="form-message"
      ></p>

    </form>
  `;

  configurePasswordForm();
  scrollToContent();
}


/* CONFIGURAR FORMULARIO DE CONTRASEÑA */

function configurePasswordForm() {
  const changePasswordForm =
    document.getElementById("changePasswordForm");

  const currentPasswordInput =
    document.getElementById("currentPassword");

  const newPasswordInput =
    document.getElementById("newPassword");

  const confirmPasswordInput =
    document.getElementById("confirmPassword");

  const passwordChangeMessage =
    document.getElementById(
      "passwordChangeMessage"
    );

  const passwordToggleButtons =
    document.querySelectorAll(
      "[data-toggle-password]"
    );


  passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const inputId =
        button.dataset.togglePassword;

      const input =
        document.getElementById(inputId);

      const isPassword =
        input.type === "password";

      input.type =
        isPassword ? "text" : "password";

      button.textContent =
        isPassword ? "🙈" : "👁️";
    });
  });


  changePasswordForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const currentPassword =
        currentPasswordInput.value;

      const newPassword =
        newPasswordInput.value;

      const confirmPassword =
        confirmPasswordInput.value;


      if (
        currentPassword !== getAdminPassword()
      ) {
        showPasswordChangeMessage(
          passwordChangeMessage,
          "La contraseña actual es incorrecta.",
          "error"
        );

        return;
      }


      if (!isStrongPassword(newPassword)) {
        showPasswordChangeMessage(
          passwordChangeMessage,
          "La nueva contraseña no cumple los requisitos.",
          "error"
        );

        return;
      }


      if (newPassword !== confirmPassword) {
        showPasswordChangeMessage(
          passwordChangeMessage,
          "Las contraseñas nuevas no coinciden.",
          "error"
        );

        return;
      }


      if (newPassword === currentPassword) {
        showPasswordChangeMessage(
          passwordChangeMessage,
          "La nueva contraseña debe ser diferente.",
          "error"
        );

        return;
      }


      localStorage.setItem(
        PASSWORD_STORAGE_KEY,
        newPassword
      );


      showPasswordChangeMessage(
        passwordChangeMessage,
        "Contraseña actualizada correctamente.",
        "success"
      );


      changePasswordForm.reset();


      window.setTimeout(() => {
        alert(
          "La contraseña se cambió correctamente. Inicia sesión nuevamente."
        );

        showAdminLogin();
      }, 800);
    }
  );
}


/* VALIDAR CONTRASEÑA SEGURA */

function isStrongPassword(password) {
  const hasMinimumLength =
    password.length >= 8;

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasLowercase =
    /[a-z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  return (
    hasMinimumLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber
  );
}


/* MENSAJE DE CAMBIO DE CONTRASEÑA */

function showPasswordChangeMessage(
  element,
  message,
  type
) {
  element.textContent = message;
  element.className =
    `form-message ${type}`;
}


/* DESPLAZAR A CONTENIDO */

function scrollToContent() {
  contentSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* CERRAR SESIÓN */

logoutButton.addEventListener(
  "click",
  () => {
    const confirmed = window.confirm(
      "¿Deseas cerrar la sesión administrativa?"
    );

    if (!confirmed) {
      return;
    }

    showAdminLogin();
  }
);


/* INICIAR */

checkAdminSession();
