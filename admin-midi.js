"use strict";

(function () {
  const UPLOAD_MIDI_URL =
    "https://us-central1-piano-deluxe-premium.cloudfunctions.net/uploadMidi";

  const LIST_MIDIS_URL =
    "https://us-central1-piano-deluxe-premium.cloudfunctions.net/listMidis";

  let loadedMidis = [];

  const midiButton = document.querySelector(
    '.admin-card[data-section="midis"]'
  );

  const contentSection =
    document.getElementById("contentSection");

  if (!midiButton || !contentSection) {
    console.error(
      "No se pudo iniciar la Biblioteca MIDI."
    );
    return;
  }

  midiButton.addEventListener("click", function () {
    renderMidiLibrary();
  });

  function renderMidiLibrary() {
    contentSection.innerHTML =
      '<div class="midi-section">' +

        '<div class="section-header">' +
          '<p class="section-label">Administración musical</p>' +
          '<h2>Biblioteca MIDI</h2>' +
          '<p>' +
            'Administra los archivos MIDI guardados en la carpeta ' +
            '<strong>midis</strong> de GitHub.' +
          '</p>' +
        '</div>' +

        '<div class="midi-toolbar">' +

          '<div class="midi-search-box">' +
            '<span>🔍</span>' +
            '<input ' +
              'id="midiSearchInput" ' +
              'type="search" ' +
              'placeholder="Buscar archivo MIDI" ' +
              'autocomplete="off"' +
            '>' +
          '</div>' +

          '<button ' +
            'id="openMidiFormButton" ' +
            'class="primary-button midi-add-button" ' +
            'type="button"' +
          '>' +
            '＋ Agregar nuevo MIDI' +
          '</button>' +

        '</div>' +

        '<div id="midiUploadPanel" class="midi-upload-panel hidden">' +

          '<div class="midi-panel-heading">' +

            '<div>' +
              '<p class="section-label">Nuevo archivo</p>' +
              '<h3>Agregar canción MIDI</h3>' +
            '</div>' +

            '<button ' +
              'id="closeMidiFormButton" ' +
              'class="icon-close-button" ' +
              'type="button" ' +
              'aria-label="Cerrar formulario"' +
            '>' +
              '✕' +
            '</button>' +

          '</div>' +

          '<form id="midiUploadForm" class="midi-form">' +

            '<label for="midiSongName">' +
              'Nombre de la canción' +
            '</label>' +

            '<input ' +
              'id="midiSongName" ' +
              'name="songName" ' +
              'type="text" ' +
              'placeholder="Ejemplo: River Flows in You" ' +
              'maxlength="100" ' +
              'required' +
            '>' +

            '<label for="midiArtist">' +
              'Artista' +
            '</label>' +

            '<input ' +
              'id="midiArtist" ' +
              'name="artist" ' +
              'type="text" ' +
              'placeholder="Ejemplo: Yiruma" ' +
              'maxlength="100" ' +
              'required' +
            '>' +

            '<label for="midiDifficulty">' +
              'Dificultad' +
            '</label>' +

            '<select ' +
              'id="midiDifficulty" ' +
              'name="difficulty" ' +
              'required' +
            '>' +
              '<option value="">Selecciona una dificultad</option>' +
              '<option value="Fácil">Fácil</option>' +
              '<option value="Media">Media</option>' +
              '<option value="Difícil">Difícil</option>' +
              '<option value="Experto">Experto</option>' +
            '</select>' +

            '<label for="midiCategory">' +
              'Categoría' +
            '</label>' +

            '<select ' +
              'id="midiCategory" ' +
              'name="category" ' +
              'required' +
            '>' +
              '<option value="">Selecciona una categoría</option>' +
              '<option value="Clásica">Clásica</option>' +
              '<option value="Pop">Pop</option>' +
              '<option value="K-Drama">K-Drama</option>' +
              '<option value="Películas">Películas</option>' +
              '<option value="Videojuegos">Videojuegos</option>' +
              '<option value="Anime">Anime</option>' +
              '<option value="Otra">Otra</option>' +
            '</select>' +

            '<label for="midiPrice">' +
              'Precio en monedas' +
            '</label>' +

            '<input ' +
              'id="midiPrice" ' +
              'name="price" ' +
              'type="number" ' +
              'min="0" ' +
              'max="1000000" ' +
              'step="1" ' +
              'value="0" ' +
              'required' +
            '>' +

            '<label for="midiFileInput">' +
              'Archivo MIDI' +
            '</label>' +

            '<div class="midi-file-picker">' +

              '<input ' +
                'id="midiFileInput" ' +
                'name="midiFile" ' +
                'type="file" ' +
                'accept=".mid,.midi,audio/midi,audio/x-midi" ' +
                'required' +
              '>' +

              '<div id="selectedMidiInfo" class="selected-midi-info">' +
                '<span class="selected-midi-icon">🎹</span>' +
                '<div>' +
                  '<strong>Ningún archivo seleccionado</strong>' +
                  '<small>Formatos permitidos: .mid y .midi</small>' +
                '</div>' +
              '</div>' +

            '</div>' +

            '<label class="midi-checkbox-row">' +
              '<input ' +
                'id="midiActive" ' +
                'name="active" ' +
                'type="checkbox" ' +
                'checked' +
              '>' +
              '<span>Publicar la canción inmediatamente</span>' +
            '</label>' +

            '<div id="midiPreviewCard" class="midi-preview-card hidden"></div>' +

            '<div class="midi-form-actions">' +

              '<button ' +
                'id="cancelMidiButton" ' +
                'class="secondary-button" ' +
                'type="button"' +
              '>' +
                'Cancelar' +
              '</button>' +

              '<button ' +
                'id="submitMidiButton" ' +
                'class="primary-button" ' +
                'type="submit"' +
              '>' +
                'Revisar información' +
              '</button>' +

            '</div>' +

            '<p id="midiFormMessage" class="form-message"></p>' +

          '</form>' +

        '</div>' +

        '<div class="midi-list-header">' +
          '<div>' +
            '<h3>Archivos disponibles</h3>' +
            '<p id="midiCountText">0 archivos MIDI</p>' +
          '</div>' +
        '</div>' +

        '<div id="midiList" class="midi-list">' +

          '<div class="midi-empty-state">' +
            '<span>🎼</span>' +
            '<h3>Biblioteca preparada</h3>' +
            '<p>' +
              'Los archivos que subas correctamente aparecerán aquí. ' +
              '' +
            '</p>' +
          '</div>' +

        '</div>' +

      '</div>';

    configureMidiInterface();
    loadMidiLibrary();

    contentSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function configureMidiInterface() {
    const openButton =
      document.getElementById("openMidiFormButton");

    const closeButton =
      document.getElementById("closeMidiFormButton");

    const cancelButton =
      document.getElementById("cancelMidiButton");

    const uploadPanel =
      document.getElementById("midiUploadPanel");

    const uploadForm =
      document.getElementById("midiUploadForm");

    const fileInput =
      document.getElementById("midiFileInput");

    const selectedMidiInfo =
      document.getElementById("selectedMidiInfo");

    const formMessage =
      document.getElementById("midiFormMessage");

    const previewCard =
      document.getElementById("midiPreviewCard");

    const submitButton =
      document.getElementById("submitMidiButton");

    const searchInput =
      document.getElementById("midiSearchInput");

    let readyToUpload = false;

    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim().toLowerCase();

      const filteredMidis = loadedMidis.filter(function (midi) {
        return midi.name.toLowerCase().includes(query);
      });

      renderMidiFiles(filteredMidis);
    });

    openButton.addEventListener("click", function () {
      uploadPanel.classList.remove("hidden");

      uploadPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    closeButton.addEventListener("click", function () {
      closeMidiForm();
    });

    cancelButton.addEventListener("click", function () {
      closeMidiForm();
    });

    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];

      clearMessage(formMessage);
      previewCard.classList.add("hidden");
      previewCard.innerHTML = "";
      readyToUpload = false;
      submitButton.textContent = "Revisar información";
      submitButton.disabled = false;

      if (!file) {
        resetFileInformation();
        return;
      }

      const extension =
        file.name.split(".").pop().toLowerCase();

      if (
        extension !== "mid" &&
        extension !== "midi"
      ) {
        fileInput.value = "";
        resetFileInformation();

        showMessage(
          formMessage,
          "Selecciona un archivo válido .mid o .midi.",
          "error"
        );

        return;
      }

      selectedMidiInfo.innerHTML =
        '<span class="selected-midi-icon">✅</span>' +
        '<div>' +
          '<strong>' +
            escapeHtml(file.name) +
          '</strong>' +
          '<small>' +
            formatFileSize(file.size) +
          '</small>' +
        '</div>';
    });

    uploadForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const songName =
        document.getElementById("midiSongName").value.trim();

      const artist =
        document.getElementById("midiArtist").value.trim();

      const difficulty =
        document.getElementById("midiDifficulty").value;

      const category =
        document.getElementById("midiCategory").value;

      const priceValue =
        document.getElementById("midiPrice").value;

      const active =
        document.getElementById("midiActive").checked;

      const file =
        fileInput.files[0];

      if (
        !songName ||
        !artist ||
        !difficulty ||
        !category ||
        priceValue === ""
      ) {
        showMessage(
          formMessage,
          "Completa todos los campos obligatorios.",
          "error"
        );

        return;
      }

      if (!file) {
        showMessage(
          formMessage,
          "Debes seleccionar un archivo MIDI.",
          "error"
        );

        return;
      }

      const price = Number(priceValue);

      if (
        !Number.isInteger(price) ||
        price < 0
      ) {
        showMessage(
          formMessage,
          "El precio debe ser un número entero mayor o igual a cero.",
          "error"
        );

        return;
      }


previewCard.innerHTML =
  '<p class="section-label">Vista previa</p>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">🎵</div>' +
    '<div class="midi-preview-text">' +
      '<span>Canción</span>' +
      '<strong>' + escapeHtml(songName) + '</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">👤</div>' +
    '<div class="midi-preview-text">' +
      '<span>Artista</span>' +
      '<strong>' + escapeHtml(artist) + '</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">⭐</div>' +
    '<div class="midi-preview-text">' +
      '<span>Dificultad</span>' +
      '<strong>' + escapeHtml(difficulty) + '</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">📂</div>' +
    '<div class="midi-preview-text">' +
      '<span>Categoría</span>' +
      '<strong>' + escapeHtml(category) + '</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">🪙</div>' +
    '<div class="midi-preview-text">' +
      '<span>Precio</span>' +
      '<strong>' + price + ' monedas</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">📄</div>' +
    '<div class="midi-preview-text">' +
      '<span>Archivo</span>' +
      '<strong>' + escapeHtml(file.name) + '</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">💾</div>' +
    '<div class="midi-preview-text">' +
      '<span>Tamaño</span>' +
      '<strong>' + formatFileSize(file.size) + '</strong>' +
    '</div>' +
  '</div>' +

  '<div class="midi-preview-row">' +
    '<div class="midi-preview-icon">🌍</div>' +
    '<div class="midi-preview-text">' +
      '<span>Estado</span>' +
      '<strong>' +
        (active ? "Publicada" : "Oculta") +
      '</strong>' +
    '</div>' +
  '</div>';




      previewCard.classList.remove("hidden");

      if (!readyToUpload) {
        readyToUpload = true;
        submitButton.textContent = "Subir MIDI a GitHub";

        showMessage(
          formMessage,
          "Información validada. Revisa los datos y pulsa “Subir MIDI a GitHub”.",
          "success"
        );

        previewCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Subiendo MIDI...";
      cancelButton.disabled = true;
      closeButton.disabled = true;

      showMessage(
        formMessage,
        "Subiendo el archivo a GitHub. No cierres esta pantalla.",
        "success"
      );

      try {
        const fileBase64 = await readFileAsBase64(file);

        const response = await fetch(UPLOAD_MIDI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: fileBase64,
            songName: songName,
            artist: artist,
            difficulty: difficulty,
            category: category,
            price: price,
            active: active
          })
        });

        let result = {};

        try {
          result = await response.json();
        } catch (jsonError) {
          throw new Error(
            "La función respondió, pero no devolvió información válida."
          );
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
            "No fue posible subir el archivo a GitHub."
          );
        }

        showMessage(
          formMessage,
          result.message || "MIDI subido correctamente a GitHub.",
          "success"
        );

        submitButton.textContent = "MIDI subido correctamente";
        await loadMidiLibrary();

        uploadForm.reset();
        resetFileInformation();
        readyToUpload = false;

        setTimeout(function () {
          previewCard.classList.add("hidden");
          previewCard.innerHTML = "";
          submitButton.textContent = "Revisar información";
          submitButton.disabled = false;
          cancelButton.disabled = false;
          closeButton.disabled = false;
        }, 1800);
      } catch (error) {
        console.error("Error al subir el MIDI:", error);

        showMessage(
          formMessage,
          error.message ||
          "Ocurrió un error al subir el MIDI.",
          "error"
        );

        submitButton.textContent = "Intentar subir nuevamente";
        submitButton.disabled = false;
        cancelButton.disabled = false;
        closeButton.disabled = false;
        readyToUpload = true;
      }
    });

    function closeMidiForm() {
      uploadPanel.classList.add("hidden");
      uploadForm.reset();
      resetFileInformation();
      clearMessage(formMessage);
      previewCard.classList.add("hidden");
      previewCard.innerHTML = "";
      readyToUpload = false;
      submitButton.textContent = "Revisar información";
      submitButton.disabled = false;
      cancelButton.disabled = false;
      closeButton.disabled = false;
    }
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();

      reader.onload = function () {
        const result = String(reader.result || "");
        const commaIndex = result.indexOf(",");

        if (commaIndex === -1) {
          reject(new Error("No se pudo convertir el archivo MIDI."));
          return;
        }

        resolve(result.slice(commaIndex + 1));
      };

      reader.onerror = function () {
        reject(new Error("No se pudo leer el archivo MIDI."));
      };

      reader.readAsDataURL(file);
    });
  }

  async function loadMidiLibrary() {
    const midiList = document.getElementById("midiList");
    const countText = document.getElementById("midiCountText");

    if (!midiList || !countText) {
      return;
    }

    midiList.innerHTML =
      '<div class="midi-empty-state">' +
        '<span>⏳</span>' +
        '<h3>Cargando biblioteca</h3>' +
        '<p>Consultando la carpeta <strong>midis</strong> de GitHub.</p>' +
      '</div>';

    try {
      const response = await fetch(LIST_MIDIS_URL, {
        method: "GET",
        cache: "no-store"
      });

      let result = {};

      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error(
          "La función de biblioteca no devolvió información válida."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "No fue posible cargar la Biblioteca MIDI."
        );
      }

      loadedMidis = Array.isArray(result.files)
        ? result.files
        : [];

      countText.textContent =
        loadedMidis.length +
        (loadedMidis.length === 1
          ? " archivo MIDI"
          : " archivos MIDI");

      const searchInput =
        document.getElementById("midiSearchInput");

      const query = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

      const visibleMidis = query
        ? loadedMidis.filter(function (midi) {
            return midi.name.toLowerCase().includes(query);
          })
        : loadedMidis;

      renderMidiFiles(visibleMidis);
    } catch (error) {
      console.error("Error al cargar los MIDI:", error);

      loadedMidis = [];
      countText.textContent = "No se pudo cargar";

      midiList.innerHTML =
        '<div class="midi-empty-state">' +
          '<span>⚠️</span>' +
          '<h3>No se pudo cargar la biblioteca</h3>' +
          '<p>' + escapeHtml(error.message) + '</p>' +
          '<button id="retryMidiListButton" ' +
            'class="secondary-button" type="button">' +
            'Intentar nuevamente' +
          '</button>' +
        '</div>';

      const retryButton =
        document.getElementById("retryMidiListButton");

      if (retryButton) {
        retryButton.addEventListener("click", loadMidiLibrary);
      }
    }
  }

  function renderMidiFiles(files) {
    const midiList = document.getElementById("midiList");

    if (!midiList) {
      return;
    }

    if (!files.length) {
      midiList.innerHTML =
        '<div class="midi-empty-state">' +
          '<span>🎼</span>' +
          '<h3>Sin archivos MIDI</h3>' +
          '<p>No hay resultados disponibles para mostrar.</p>' +
        '</div>';
      return;
    }

    midiList.innerHTML = files.map(function (midi) {
      return (
        '<article class="midi-item-card">' +
          '<div class="midi-item-top">' +
            '<div class="midi-item-icon">🎹</div>' +
            '<div class="midi-item-information">' +
              '<h4>' + escapeHtml(midi.name) + '</h4>' +
              '<p>' +
                formatFileSize(Number(midi.size || 0)) +
                ' · Disponible en GitHub' +
              '</p>' +
            '</div>' +
            '<span class="midi-item-status">Disponible</span>' +
          '</div>' +
          '<div class="midi-item-actions">' +
            '<a class="midi-action-button" ' +
              'href="' + escapeHtml(midi.downloadUrl) + '" ' +
              'target="_blank" rel="noopener noreferrer" download>' +
              'Descargar' +
            '</a>' +
            '<a class="midi-action-button" ' +
              'href="' + escapeHtml(midi.githubUrl) + '" ' +
              'target="_blank" rel="noopener noreferrer">' +
              'Ver en GitHub' +
            '</a>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function resetFileInformation() {
    const selectedMidiInfo =
      document.getElementById("selectedMidiInfo");

    if (!selectedMidiInfo) {
      return;
    }

    selectedMidiInfo.innerHTML =
      '<span class="selected-midi-icon">🎹</span>' +
      '<div>' +
        '<strong>Ningún archivo seleccionado</strong>' +
        '<small>Formatos permitidos: .mid y .midi</small>' +
      '</div>';
  }

  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-message " + type;
  }

  function clearMessage(element) {
    element.textContent = "";
    element.className = "form-message";
  }

  function formatFileSize(bytes) {
    if (bytes === 0) {
      return "0 bytes";
    }

    const units = ["bytes", "KB", "MB", "GB"];

    const unitIndex = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    const size =
      bytes / Math.pow(1024, unitIndex);

    const decimals =
      unitIndex === 0 ? 0 : 2;

    return (
      size.toFixed(decimals) +
      " " +
      units[unitIndex]
    );
  }

  function escapeHtml(value) {
    const element =
      document.createElement("div");

    element.textContent = value;

    return element.innerHTML;
  }
})();
