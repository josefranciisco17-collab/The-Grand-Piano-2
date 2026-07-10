"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const githubToken = defineSecret("GITHUB_TOKEN");

const GITHUB_OWNER = "josefranciisco17-collab";
const GITHUB_REPO = "The-Grand-Piano-2";
const GITHUB_BRANCH = "main";
const MIDI_DIRECTORY = "midis";
const CATALOG_PATH = `${MIDI_DIRECTORY}/catalog.json`;

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${githubToken.value()}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

function encodeGithubPath(path) {
  return String(path)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

function isMidiFile(fileName) {
  const extension = String(fileName || "")
    .split(".")
    .pop()
    .toLowerCase();

  return extension === "mid" || extension === "midi";
}

async function readCatalog() {
  const encodedPath = encodeGithubPath(CATALOG_PATH);
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
    {
      method: "GET",
      headers: githubHeaders()
    }
  );

  if (response.status === 404) {
    return {
      sha: null,
      entries: {}
    };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo leer el catálogo MIDI.");
  }

  let entries = {};

  try {
    const decoded = Buffer.from(
      String(data.content || "").replace(/\n/g, ""),
      "base64"
    ).toString("utf8");

    const parsed = JSON.parse(decoded);
    entries = parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Catálogo MIDI inválido:", error);
    entries = {};
  }

  return {
    sha: data.sha || null,
    entries
  };
}

async function writeCatalog(entries, sha, message) {
  const encodedPath = encodeGithubPath(CATALOG_PATH);
  const body = {
    message,
    content: Buffer.from(
      JSON.stringify(entries, null, 2) + "\n",
      "utf8"
    ).toString("base64"),
    branch: GITHUB_BRANCH
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`,
    {
      method: "PUT",
      headers: githubHeaders(),
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el catálogo MIDI.");
  }

  return data;
}

function normalizeMetadata(body, current = {}) {
  const price = Number(body.price ?? current.price ?? 0);

  return {
    songName: String(body.songName ?? current.songName ?? "").trim(),
    artist: String(body.artist ?? current.artist ?? "").trim(),
    difficulty: String(
      body.difficulty ?? current.difficulty ?? ""
    ).trim(),
    category: String(body.category ?? current.category ?? "").trim(),
    price: Number.isFinite(price) && price >= 0
      ? Math.floor(price)
      : 0,
    active: Boolean(body.active ?? current.active ?? true),
    updatedAt: new Date().toISOString(),
    uploadedAt: current.uploadedAt || new Date().toISOString()
  };
}

const commonOptions = {
  secrets: [githubToken],
  cors: true,
  region: "us-central1",
  timeoutSeconds: 60,
  memory: "256MiB"
};

exports.uploadMidi = onRequest(
  commonOptions,
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Método no permitido."
        });
      }

      const {
        fileName,
        fileBase64,
        songName,
        artist,
        difficulty,
        category,
        price,
        active
      } = req.body || {};

      if (!fileName || !fileBase64) {
        return res.status(400).json({
          success: false,
          message: "Falta el archivo MIDI."
        });
      }

      if (!isMidiFile(fileName)) {
        return res.status(400).json({
          success: false,
          message: "El archivo debe tener extensión .mid o .midi."
        });
      }

      const safeFileName = sanitizeFileName(fileName);
      const githubPath = `${MIDI_DIRECTORY}/${safeFileName}`;
      const encodedPath = encodeGithubPath(githubPath);

      const githubResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`,
        {
          method: "PUT",
          headers: githubHeaders(),
          body: JSON.stringify({
            message: `Agregar MIDI: ${songName || safeFileName}`,
            content: fileBase64,
            branch: GITHUB_BRANCH
          })
        }
      );

      const githubData = await githubResponse.json();

      if (!githubResponse.ok) {
        console.error("Error de GitHub al subir:", githubData);

        return res.status(githubResponse.status).json({
          success: false,
          message:
            githubData.message ||
            "GitHub rechazó la subida del archivo."
        });
      }

      const catalog = await readCatalog();
      const metadata = normalizeMetadata({
        songName,
        artist,
        difficulty,
        category,
        price,
        active
      });

      catalog.entries[safeFileName] = metadata;

      await writeCatalog(
        catalog.entries,
        catalog.sha,
        `Actualizar catálogo: ${songName || safeFileName}`
      );

      return res.status(200).json({
        success: true,
        message: "MIDI subido correctamente a GitHub.",
        file: {
          name: safeFileName,
          path: githubPath,
          sha: githubData.content?.sha || "",
          size: 0,
          downloadUrl: githubData.content?.download_url || "",
          githubUrl: githubData.content?.html_url || "",
          ...metadata
        }
      });
    } catch (error) {
      console.error("Error uploadMidi:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Ocurrió un error interno al subir el MIDI."
      });
    }
  }
);

exports.listMidis = onRequest(
  {
    ...commonOptions,
    timeoutSeconds: 30
  },
  async (req, res) => {
    try {
      if (req.method !== "GET") {
        return res.status(405).json({
          success: false,
          message: "Método no permitido."
        });
      }

      const encodedDirectory = encodeGithubPath(MIDI_DIRECTORY);

      const githubResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedDirectory}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
        {
          method: "GET",
          headers: githubHeaders()
        }
      );

      const githubData = await githubResponse.json();

      if (!githubResponse.ok) {
        console.error("Error de GitHub al listar:", githubData);

        return res.status(githubResponse.status).json({
          success: false,
          message:
            githubData.message ||
            "GitHub rechazó la consulta de la biblioteca."
        });
      }

      if (!Array.isArray(githubData)) {
        return res.status(500).json({
          success: false,
          message: "GitHub devolvió una respuesta inesperada."
        });
      }

      const catalog = await readCatalog();

      const files = githubData
        .filter((item) => item.type === "file" && isMidiFile(item.name))
        .map((item) => {
          const metadata = catalog.entries[item.name] || {};

          return {
            name: item.name,
            path: item.path,
            size: Number(item.size || 0),
            sha: item.sha,
            downloadUrl: item.download_url || "",
            githubUrl: item.html_url || "",
            songName: metadata.songName || item.name.replace(/\.(mid|midi)$/i, ""),
            artist: metadata.artist || "",
            difficulty: metadata.difficulty || "",
            category: metadata.category || "",
            price: Number(metadata.price || 0),
            active:
              typeof metadata.active === "boolean"
                ? metadata.active
                : true,
            uploadedAt: metadata.uploadedAt || "",
            updatedAt: metadata.updatedAt || ""
          };
        })
        .sort((a, b) =>
          a.songName.localeCompare(b.songName, "es", {
            sensitivity: "base"
          })
        );

      return res.status(200).json({
        success: true,
        count: files.length,
        files
      });
    } catch (error) {
      console.error("Error listMidis:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Ocurrió un error interno al cargar la biblioteca."
      });
    }
  }
);

exports.updateMidi = onRequest(
  commonOptions,
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Método no permitido."
        });
      }

      const {
        fileName,
        songName,
        artist,
        difficulty,
        category,
        price,
        active
      } = req.body || {};

      if (!fileName || !isMidiFile(fileName)) {
        return res.status(400).json({
          success: false,
          message: "Nombre de archivo MIDI inválido."
        });
      }

      if (!songName || !artist || !difficulty || !category) {
        return res.status(400).json({
          success: false,
          message: "Completa todos los campos obligatorios."
        });
      }

      const safeFileName = sanitizeFileName(fileName);
      const catalog = await readCatalog();
      const current = catalog.entries[safeFileName] || {};
      const metadata = normalizeMetadata(
        {
          songName,
          artist,
          difficulty,
          category,
          price,
          active
        },
        current
      );

      catalog.entries[safeFileName] = metadata;

      await writeCatalog(
        catalog.entries,
        catalog.sha,
        `Editar información MIDI: ${songName}`
      );

      return res.status(200).json({
        success: true,
        message: "Información del MIDI actualizada correctamente.",
        file: {
          name: safeFileName,
          ...metadata
        }
      });
    } catch (error) {
      console.error("Error updateMidi:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Ocurrió un error al actualizar el MIDI."
      });
    }
  }
);

exports.deleteMidi = onRequest(
  commonOptions,
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Método no permitido."
        });
      }

      const { fileName } = req.body || {};

      if (!fileName || !isMidiFile(fileName)) {
        return res.status(400).json({
          success: false,
          message: "Nombre de archivo MIDI inválido."
        });
      }

      const safeFileName = sanitizeFileName(fileName);
      const githubPath = `${MIDI_DIRECTORY}/${safeFileName}`;
      const encodedPath = encodeGithubPath(githubPath);

      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
        {
          method: "GET",
          headers: githubHeaders()
        }
      );

      const fileData = await getResponse.json();

      if (!getResponse.ok) {
        return res.status(getResponse.status).json({
          success: false,
          message:
            fileData.message ||
            "No se encontró el archivo MIDI en GitHub."
        });
      }

      const deleteResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodedPath}`,
        {
          method: "DELETE",
          headers: githubHeaders(),
          body: JSON.stringify({
            message: `Eliminar MIDI: ${safeFileName}`,
            sha: fileData.sha,
            branch: GITHUB_BRANCH
          })
        }
      );

      const deleteData = await deleteResponse.json();

      if (!deleteResponse.ok) {
        return res.status(deleteResponse.status).json({
          success: false,
          message:
            deleteData.message ||
            "GitHub rechazó la eliminación del archivo."
        });
      }

      const catalog = await readCatalog();

      if (Object.prototype.hasOwnProperty.call(
        catalog.entries,
        safeFileName
      )) {
        delete catalog.entries[safeFileName];

        await writeCatalog(
          catalog.entries,
          catalog.sha,
          `Eliminar del catálogo: ${safeFileName}`
        );
      }

      return res.status(200).json({
        success: true,
        message: "MIDI eliminado correctamente de GitHub.",
        fileName: safeFileName
      });
    } catch (error) {
      console.error("Error deleteMidi:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Ocurrió un error al eliminar el MIDI."
      });
    }
  }
);
