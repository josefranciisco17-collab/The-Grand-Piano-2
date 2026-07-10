"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const githubToken = defineSecret("GITHUB_TOKEN");

const GITHUB_OWNER = "josefranciisco17-collab";
const GITHUB_REPO = "The-Grand-Piano-2";
const GITHUB_BRANCH = "main";
const MIDI_DIRECTORY = "midis";

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${githubToken.value()}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

exports.uploadMidi = onRequest(
  {
    secrets: [githubToken],
    cors: true,
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB"
  },
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

      const extension = String(fileName)
        .split(".")
        .pop()
        .toLowerCase();

      if (extension !== "mid" && extension !== "midi") {
        return res.status(400).json({
          success: false,
          message: "El archivo debe tener extensión .mid o .midi."
        });
      }

      const safeFileName = String(fileName)
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

      const githubPath = `${MIDI_DIRECTORY}/${safeFileName}`;
      const encodedPath = githubPath
        .split("/")
        .map(encodeURIComponent)
        .join("/");

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

      return res.status(200).json({
        success: true,
        message: "MIDI subido correctamente a GitHub.",
        file: {
          name: safeFileName,
          path: githubPath,
          url: githubData.content?.html_url || "",
          downloadUrl: githubData.content?.download_url || "",
          songName: songName || "",
          artist: artist || "",
          difficulty: difficulty || "",
          category: category || "",
          price: Number(price || 0),
          active: Boolean(active)
        }
      });
    } catch (error) {
      console.error("Error uploadMidi:", error);

      return res.status(500).json({
        success: false,
        message: "Ocurrió un error interno al subir el MIDI."
      });
    }
  }
);

exports.listMidis = onRequest(
  {
    secrets: [githubToken],
    cors: true,
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB"
  },
  async (req, res) => {
    try {
      if (req.method !== "GET") {
        return res.status(405).json({
          success: false,
          message: "Método no permitido."
        });
      }

      const encodedDirectory = encodeURIComponent(MIDI_DIRECTORY);

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

      const files = githubData
        .filter((item) => {
          if (item.type !== "file") {
            return false;
          }

          const lowerName = String(item.name || "").toLowerCase();

          return (
            lowerName.endsWith(".mid") ||
            lowerName.endsWith(".midi")
          );
        })
        .map((item) => ({
          name: item.name,
          path: item.path,
          size: Number(item.size || 0),
          sha: item.sha,
          downloadUrl: item.download_url || "",
          githubUrl: item.html_url || ""
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, "es", {
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
        message: "Ocurrió un error interno al cargar la biblioteca."
      });
    }
  }
);
