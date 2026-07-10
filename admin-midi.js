"use strict";

(function () {
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
              'type="button"' +
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
              '<option value="facil">Fácil</option>' +
              '<option value="media">Media</option>' +
              '<option value="dificil">Difícil</option>' +
              '<option value="experto">Experto</option>' +
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
              '<option value="clasica">Clásica</option>' +
              '<option value="pop">Pop</option>' +
              '<option value="kdrama">K-Drama</option>' +
              '<option value="peliculas">Películas</option>' +
              '<option value="videojuegos">Videojuegos</option>' +
              '<option value="anime">Anime</option>' +
              '<option value="otra">Otra</option>' +
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

            '<button ' +
              'id="submitMidiButton" ' +
              'class="primary-button" ' +
              'type="submit"' +
            '>' +
              'Subir a GitHub' +
            '</button>' +

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
              'La interfaz funciona. Después conectaremos la lista ' +
              'con la carpeta <strong>midis</strong> de GitHub.' +
            '</p>' +
          '</div>' +

        '</div>' +

      '</div>';

    configureMidiInterface();

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

    openButton.addEventListener("click", function () {
      uploadPanel.classList.remove("hidden");

      uploadPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });

    closeButton.addEventListener("click", function () {
      uploadPanel.classList.add("hidden");
      uploadForm.reset();
      resetFileInformation();
      clearMessage(formMessage);
    });

    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];

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

      clearMessage(formMessage);
    });

    uploadForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const file = fileInput.files[0];

      if (!file) {
        showMessage(
          formMessage,
          "Debes seleccionar un archivo MIDI.",
          "error"
        );
        return;
      }

      showMessage(
        formMessage,
        "Formulario comprobado correctamente. Todavía no se ha subido el archivo a GitHub.",
        "success"
      );
    });
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
