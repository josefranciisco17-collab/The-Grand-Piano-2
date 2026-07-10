import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const USERS_COLLECTION = "users";

let loadedPlayers = [];

document.addEventListener("DOMContentLoaded", () => {
  const playersCard = document.querySelector(
    '.admin-card[data-section="players"]'
  );

  if (!playersCard) {
    console.error("No se encontró la tarjeta de Jugadores.");
    return;
  }

  playersCard.addEventListener("click", () => {
    renderPlayersSection();
  });
});

function renderPlayersSection() {
  const contentSection = document.getElementById("contentSection");

  if (!contentSection) {
    return;
  }

  contentSection.innerHTML = `
    <div class="section-header">
      <p class="section-label">Administración</p>
      <h2>Jugadores</h2>
      <p>
        Consulta las cuentas registradas en The Grand Piano.
      </p>
    </div>

    <section class="players-summary-grid">
      <article class="players-summary-card">
        <span>👥</span>
        <div>
          <small>Total de jugadores</small>
          <strong id="playersTotal">0</strong>
        </div>
      </article>

      <article class="players-summary-card">
        <span>🟢</span>
        <div>
          <small>Jugadores activos</small>
          <strong id="playersActive">0</strong>
        </div>
      </article>

      <article class="players-summary-card">
        <span>🚫</span>
        <div>
          <small>Jugadores suspendidos</small>
          <strong id="playersSuspended">0</strong>
        </div>
      </article>
    </section>

    <section class="players-panel">
      <div class="players-panel-title">
        <span>🔎</span>

        <div>
          <h3>Buscar jugador</h3>
          <p>Busca por nombre, correo o UID.</p>
        </div>
      </div>

      <input
        id="playersSearchInput"
        class="players-search-input"
        type="search"
        placeholder="Buscar jugador..."
        autocomplete="off"
      >
    </section>

    <section class="players-panel">
      <div class="players-panel-title">
        <span>👤</span>

        <div>
          <h3>Cuentas registradas</h3>
          <p id="playersCountText">Cargando jugadores...</p>
        </div>
      </div>

      <div id="playersList" class="players-list">
        <div class="players-empty-state">
          <span>⏳</span>
          <h3>Cargando jugadores</h3>
          <p>Consultando la colección users de Firestore.</p>
        </div>
      </div>
    </section>
  `;

  const searchInput = document.getElementById(
    "playersSearchInput"
  );

  searchInput?.addEventListener("input", () => {
    filterPlayers(searchInput.value);
  });

onAuthStateChanged(auth, (user) => {

    if (!user) {

        const playersList = document.getElementById("playersList");
        const countText = document.getElementById("playersCountText");

        if (countText) {
            countText.textContent = "Sesión no iniciada";
        }

        if (playersList) {
            playersList.innerHTML = `
            <div class="players-empty-state">
                <span>🔐</span>
                <h3>Debes iniciar sesión</h3>
                <p>Inicia sesión antes de usar el módulo Jugadores.</p>
            </div>`;
        }

        return;
    }

    loadPlayersFromFirestore();

});

  contentSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function loadPlayersFromFirestore() {
  const playersList = document.getElementById("playersList");
  const countText = document.getElementById("playersCountText");

  if (!playersList || !countText) {
    return;
  }

  try {
    const snapshot = await getDocs(
      collection(db, USERS_COLLECTION)
    );

    loadedPlayers = snapshot.docs.map((documentSnapshot) => {
      const data = documentSnapshot.data() || {};

      return {
        uid: documentSnapshot.id,

        name:
          data.customName ||
          data.displayName ||
          data.name ||
          "Jugador sin nombre",

        email:
          data.email ||
          data.userEmail ||
          "Correo no guardado",

        photo:
          data.customPhoto ||
          data.photoURL ||
          "",

        coins: Number(
          data.coins ??
          data.monedas ??
          0
        ),

        level: Number(data.level ?? 1),

        experience: Number(
          data.experience ??
          data.xp ??
          0
        ),

        suspended: Boolean(
          data.suspended ??
          data.blocked ??
          false
        ),

        lastLogin: formatFirestoreDate(
          data.lastLogin ||
          data.lastSeen ||
          data.updatedAt
        )
      };
    });

    loadedPlayers.sort((a, b) => {
      return a.name.localeCompare(b.name, "es", {
        sensitivity: "base"
      });
    });

    updatePlayersSummary(loadedPlayers);
    renderPlayers(loadedPlayers);

    countText.textContent =
      loadedPlayers.length === 1
        ? "1 jugador registrado"
        : `${loadedPlayers.length} jugadores registrados`;

  } catch (error) {
    console.error("Error al cargar jugadores:", error);

    loadedPlayers = [];
    updatePlayersSummary([]);

    countText.textContent = "No se pudieron cargar";

    playersList.innerHTML = `
      <div class="players-empty-state">
        <span>⚠️</span>
        <h3>No se pudieron cargar los jugadores</h3>
        <p>${escapeHtml(error.message)}</p>

        <button
          id="retryPlayersButton"
          class="secondary-button"
          type="button"
        >
          Intentar nuevamente
        </button>
      </div>
    `;

    document
      .getElementById("retryPlayersButton")
      ?.addEventListener(
        "click",
        loadPlayersFromFirestore
      );
  }
}

function renderPlayers(players) {
  const playersList = document.getElementById("playersList");

  if (!playersList) {
    return;
  }

  if (!players.length) {
    playersList.innerHTML = `
      <div class="players-empty-state">
        <span>👥</span>
        <h3>No hay jugadores para mostrar</h3>
        <p>
          No existen documentos en la colección users
          o la búsqueda no encontró resultados.
        </p>
      </div>
    `;

    return;
  }

  playersList.innerHTML = players
    .map(createPlayerCard)
    .join("");
}

function createPlayerCard(player) {
  const statusClass = player.suspended
    ? "player-status-suspended"
    : "player-status-active";

  const statusText = player.suspended
    ? "Suspendido"
    : "Activo";

  const searchableText = [
    player.name,
    player.email,
    player.uid
  ]
    .join(" ")
    .toLowerCase();

  const avatarContent = player.photo
    ? `
      <img
        src="${escapeHtml(player.photo)}"
        alt="Foto de ${escapeHtml(player.name)}"
        loading="lazy"
      >
    `
    : "👤";

  return `
    <article
      class="player-card"
      data-search="${escapeHtml(searchableText)}"
    >
      <div class="player-card-header">
        <div class="player-avatar">
          ${avatarContent}
        </div>

        <div class="player-main-info">
          <h4>${escapeHtml(player.name)}</h4>
          <p>${escapeHtml(player.email)}</p>
          <small>UID: ${escapeHtml(player.uid)}</small>
        </div>

        <span class="${statusClass}">
          ${statusText}
        </span>
      </div>

      <div class="player-data-grid">
        <div>
          <small>Monedas</small>
          <strong>
            🪙 ${formatNumber(player.coins)}
          </strong>
        </div>

        <div>
          <small>Nivel</small>
          <strong>${formatNumber(player.level)}</strong>
        </div>

        <div>
          <small>Experiencia</small>
          <strong>${formatNumber(player.experience)}</strong>
        </div>

        <div>
          <small>Última actividad</small>
          <strong>${escapeHtml(player.lastLogin)}</strong>
        </div>
      </div>

      <div class="player-actions">
        <button
          type="button"
          data-player-action="edit"
          data-player-uid="${escapeHtml(player.uid)}"
        >
          ✏️ Editar jugador
        </button>

        <button
          type="button"
          data-player-action="coins"
          data-player-uid="${escapeHtml(player.uid)}"
        >
          🪙 Administrar monedas
        </button>

        <button
          type="button"
          data-player-action="status"
          data-player-uid="${escapeHtml(player.uid)}"
        >
          ${
            player.suspended
              ? "🔓 Reactivar jugador"
              : "🚫 Suspender jugador"
          }
        </button>
      </div>
    </article>
  `;
}

function filterPlayers(query) {
  const normalizedQuery = String(query || "")
    .trim()
    .toLowerCase();

  const filteredPlayers = normalizedQuery
    ? loadedPlayers.filter((player) => {
        const searchableText = [
          player.name,
          player.email,
          player.uid
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : loadedPlayers;

  renderPlayers(filteredPlayers);

  const countText = document.getElementById(
    "playersCountText"
  );

  if (countText) {
    countText.textContent = normalizedQuery
      ? `${filteredPlayers.length} resultados encontrados`
      : loadedPlayers.length === 1
        ? "1 jugador registrado"
        : `${loadedPlayers.length} jugadores registrados`;
  }
}

function updatePlayersSummary(players) {
  const totalElement = document.getElementById(
    "playersTotal"
  );

  const activeElement = document.getElementById(
    "playersActive"
  );

  const suspendedElement = document.getElementById(
    "playersSuspended"
  );

  const activePlayers = players.filter(
    (player) => !player.suspended
  ).length;

  const suspendedPlayers = players.filter(
    (player) => player.suspended
  ).length;

  if (totalElement) {
    totalElement.textContent = players.length;
  }

  if (activeElement) {
    activeElement.textContent = activePlayers;
  }

  if (suspendedElement) {
    suspendedElement.textContent = suspendedPlayers;
  }
}

function formatFirestoreDate(value) {
  if (!value) {
    return "Sin registro";
  }

  try {
    let date;

    if (typeof value.toDate === "function") {
      date = value.toDate();
    } else if (value.seconds) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return "Sin registro";
    }

    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Sin registro";
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
