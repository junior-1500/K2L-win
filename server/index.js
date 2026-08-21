require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_API_TOKEN;

app.use(express.json());

// Servir le site web
app.use(express.static(path.join(__dirname, "../public")));

// Fonction pour appeler Sportmonks
async function sportmonks(endpoint) {
  if (!SPORTMONKS_TOKEN) {
    throw new Error("SPORTMONKS_API_TOKEN n'est pas configuré.");
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  const url =
    `https://api.sportmonks.com/v3/football/${endpoint}` +
    `${separator}api_token=${encodeURIComponent(SPORTMONKS_TOKEN)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sportmonks ${response.status}: ${text}`);
  }

  return response.json();
}

// Vérification du serveur
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "K2L-WIN API fonctionne",
    sportmonks: Boolean(SPORTMONKS_TOKEN)
  });
});

// Matchs du jour
app.get("/api/fixtures/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const data = await sportmonks(
      `fixtures/date/${today}?include=participants`
    );

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Matchs d'une date précise
app.get("/api/fixtures", async (req, res) => {
  try {
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Le paramètre date est obligatoire. Exemple : ?date=2026-08-21"
      });
    }

    const data = await sportmonks(
      `fixtures/date/${encodeURIComponent(date)}?include=participants`
    );

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Matchs en direct
app.get("/api/livescores", async (req, res) => {
  try {
    const data = await sportmonks(
      "livescores?include=participants"
    );

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Toute autre route renvoie le site
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Démarrage
app.listen(PORT, () => {
  console.log(`K2L-WIN serveur démarré sur le port ${PORT}`);
});
