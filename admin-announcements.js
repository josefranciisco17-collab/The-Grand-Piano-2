import { db } from "./firebase-config.js";

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let registeredUsers = [];

document.addEventListener("click", async (event) => {
  const announcementsCard = event.target.closest(
    '.admin-card[data-section="announcements"]'
  );

  if (!announcementsCard) {
    return;
  }

  setTimeout(() => {
    prepareAnnouncementsSection();
  }, 100);
});

async function prepareAnnouncementsSection() {
  const contentSection =
    document.getElementById("contentSection");

  if (!contentSection) {
    return;
  }

  contentSection.innerHTML = `
    <div class="section-header">
<p class="section-label">Comunicación</p>
      <h2>📢 Anuncios</h2>
      <p>
        Envía un mensaje general o un aviso privado.
      </p>
    </div>

    <section class="settings-form">

      <h3>📣 Anuncio general</h3>

      <label for="globalAnnouncementTitle">
        Título
      </label>

      <input
        id="globalAnnouncementTitle"
        type="text"
        placeholder="Ejemplo: Nueva actualización"
        maxlength="80"
      >

      <label for="globalAnnouncementMessage">
        Mensaje
      </label>

      <textarea
        id="globalAnnouncementMessage"
        placeholder="Escribe el mensaje para todos los jugadores"
        maxlength="500"
        rows="6"
      ></textarea>

      <button
        id="publishGlobalAnnouncement"
        class="primary-button"
        type="button"
      >
        📣 Publicar para todos
      </button>

      <p
      id="globalAnnouncementStatus"
      class="form-message"
      hidden
      ></p>



      <h3>🔒 Anuncio privado</h3>

      <label for="privateAnnouncementUser">
        Usuario
      </label>

      <select id="privateAnnouncementUser">
        <option value="">
          Cargando correos registrados...
        </option>
      </select>

      <label for="privateAnnouncementTitle">
        Título
      </label>

      <input
        id="privateAnnouncementTitle"
        type="text"
        placeholder="Ejemplo: Aviso para tu cuenta"
        maxlength="80"
      >

      <label for="privateAnnouncementMessage">
        Mensaje
      </label>

      <textarea
        id="privateAnnouncementMessage"
        placeholder="Escribe el mensaje privado"
        maxlength="500"
        rows="6"
      ></textarea>

      <button
        id="sendPrivateAnnouncement"
        class="primary-button"
        type="button"
      >
        🔒 Enviar anuncio privado
      </button>

       <p
       id="privateAnnouncementStatus"
       class="form-message"
       hidden
       ></p>

    </section>
  `;

  await loadRegisteredUsers();
  connectAnnouncementButtons();
}

async function loadRegisteredUsers() {
  const select =
    document.getElementById("privateAnnouncementUser");

  if (!select) {
    return;
  }

  try {
    const usersSnapshot = await getDocs(
      collection(db, "users")
    );

    registeredUsers = usersSnapshot.docs
      .map((userDoc) => ({
        uid: userDoc.id,
        email: userDoc.data().email || "",
        name:
          userDoc.data().customName ||
          userDoc.data().name ||
          "Jugador"
      }))
      .filter((user) => user.email);

    registeredUsers.sort((a, b) =>
      a.email.localeCompare(b.email)
    );

    if (registeredUsers.length === 0) {
      select.innerHTML = `
        <option value="">
          No hay correos registrados
        </option>
      `;
      return;
    }

    select.innerHTML = `
      <option value="">
        Selecciona un correo
      </option>
    `;

    registeredUsers.forEach((user) => {
      const option = document.createElement("option");

      option.value = user.uid;
      option.textContent =
        `${user.email} — ${user.name}`;

      select.appendChild(option);
    });

  } catch (error) {
    console.error(
      "Error al cargar usuarios:",
      error
    );

    select.innerHTML = `
      <option value="">
        Error al cargar correos
      </option>
    `;
  }
}

function connectAnnouncementButtons() {
  const globalButton =
    document.getElementById(
      "publishGlobalAnnouncement"
    );

  const privateButton =
    document.getElementById(
      "sendPrivateAnnouncement"
    );

  globalButton?.addEventListener(
    "click",
    publishGlobalAnnouncement
  );

  privateButton?.addEventListener(
    "click",
    publishPrivateAnnouncement
  );
}

async function publishGlobalAnnouncement() {
  const title =
    document
      .getElementById("globalAnnouncementTitle")
      .value
      .trim();

  const message =
    document
      .getElementById("globalAnnouncementMessage")
      .value
      .trim();

  const status =
    document.getElementById(
      "globalAnnouncementStatus"
    );

  if (!title || !message) {
    showStatus(
      status,
      "Completa el título y el mensaje.",
      "error"
    );
    return;
  }

  try {
    await setDoc(
      doc(db, "announcements", "global"),
      {
        title,
        message,
        active: true,
        createdAt: serverTimestamp()
      }
    );

    showStatus(
      status,
      "Anuncio general publicado.",
      "success"
    );

    document.getElementById(
      "globalAnnouncementTitle"
    ).value = "";

    document.getElementById(
      "globalAnnouncementMessage"
    ).value = "";

  } catch (error) {
    console.error(
      "Error al publicar anuncio general:",
      error
    );

    showStatus(
      status,
      "No fue posible publicar el anuncio.",
      "error"
    );
  }
}

async function publishPrivateAnnouncement() {
  const userUid =
    document.getElementById(
      "privateAnnouncementUser"
    ).value;

  const title =
    document
      .getElementById("privateAnnouncementTitle")
      .value
      .trim();

  const message =
    document
      .getElementById("privateAnnouncementMessage")
      .value
      .trim();

  const status =
    document.getElementById(
      "privateAnnouncementStatus"
    );

  if (!userUid || !title || !message) {
    showStatus(
      status,
      "Selecciona un usuario y completa el mensaje.",
      "error"
    );
    return;
  }

  const selectedUser =
    registeredUsers.find(
      (user) => user.uid === userUid
    );

  try {
    await setDoc(
      doc(
        db,
        "users",
        userUid,
        "privateAnnouncement",
        "current"
      ),
      {
        title,
        message,
        active: true,
        recipientEmail:
          selectedUser?.email || "",
        createdAt: serverTimestamp()
      }
    );

    showStatus(
      status,
      "Anuncio privado enviado.",
      "success"
    );

    document.getElementById(
      "privateAnnouncementTitle"
    ).value = "";

    document.getElementById(
      "privateAnnouncementMessage"
    ).value = "";

  } catch (error) {
    console.error(
      "Error al enviar anuncio privado:",
      error
    );

    showStatus(
      status,
      "No fue posible enviar el anuncio.",
      "error"
    );
  }
}

function showStatus(element, message, type) {
  if (!element) {
    return;
  }
  element.hidden = false;
  element.textContent = message;
  element.className =
    `form-message ${type}`;
}
