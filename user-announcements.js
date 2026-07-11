import { auth, db } from "./firebase-config.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let unsubscribeGlobal = null;
let unsubscribePrivate = null;


}

function createAnnouncementWindow() {
  if (document.getElementById("announcementOverlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "announcementOverlay";

  overlay.innerHTML = `
    <div id="announcementWindow">
      <button id="closeAnnouncementBtn" type="button">✕</button>

      <h2 id="announcementTitle"></h2>

      <p id="announcementMessage"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeButton =
    document.getElementById("closeAnnouncementBtn");

  closeButton.addEventListener("click", () => {
    const storageKey = overlay.dataset.storageKey;

    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }

    overlay.style.display = "none";
  });
}



function showAnnouncement(title, message, announcementId) {
  createAnnouncementWindow();


const storageKey = `seenAnnouncement_${announcementId}`;

if (localStorage.getItem(storageKey)) {
  return;
}

  const overlay =
    document.getElementById("announcementOverlay");

  const titleElement =
    document.getElementById("announcementTitle");

  const messageElement =
    document.getElementById("announcementMessage");

  titleElement.textContent =
    title || "Anuncio";

  messageElement.textContent =
    message || "";
overlay.dataset.storageKey = storageKey;
  overlay.style.display = "flex";
}


onAuthStateChanged(auth, (user) => {

  if (!user) {
    return;
  }

  if (unsubscribeGlobal) {
    unsubscribeGlobal();
  }

  if (unsubscribePrivate) {
    unsubscribePrivate();
  }

  const globalRef =
    doc(db, "announcements", "global");

  unsubscribeGlobal = onSnapshot(
    globalRef,
    (snapshot) => {

      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data();

      if (data.active === false) {
        return;
      }

showAnnouncement(
    data.title,
    data.message,
    `global_${data.createdAt?.seconds || Date.now()}`
);
    }
  );

  const privateRef = doc(
    db,
    "users",
    user.uid,
    "privateAnnouncement",
    "current"
  );

  unsubscribePrivate = onSnapshot(
    privateRef,
    (snapshot) => {

      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data();

      if (data.active === false) {
        return;
      }

showAnnouncement(
  data.title,
  data.message,
  `private_${user.uid}_${data.createdAt?.seconds || Date.now()}`
);
    }
  );

});


const announcementStyles = document.createElement("style");

announcementStyles.textContent = `
#announcementOverlay{
  position:fixed;
  inset:0;
  z-index:99999;
  display:none;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:rgba(0,0,0,.72);
  backdrop-filter:blur(5px);
}

#announcementWindow{
  position:relative;
  width:100%;
  max-width:420px;
  padding:30px 24px 26px;
  border-radius:26px;
  text-align:center;
  color:#fff;
  background:
    linear-gradient(
      180deg,
      rgba(38,38,38,.98),
      rgba(10,10,10,.98)
    );
  border:1px solid rgba(212,175,55,.55);
  box-shadow:
    0 0 35px rgba(212,175,55,.25),
    0 20px 60px rgba(0,0,0,.65);
}

#closeAnnouncementBtn{
  position:absolute;
  top:12px;
  right:14px;
  width:36px;
  height:36px;
  border:none;
  border-radius:50%;
  background:rgba(255,255,255,.10);
  color:#fff;
  font-size:20px;
  cursor:pointer;
}

#announcementTitle{
  margin:10px 35px 16px;
  color:#d4af37;
  font-size:27px;
  line-height:1.2;
}

#announcementMessage{
  margin:0;
  color:#ededed;
  font-size:17px;
  line-height:1.6;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}
`;

document.head.appendChild(announcementStyles);
