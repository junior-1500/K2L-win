require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

/**
 * Vérification du serveur
 */
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    app: "K2L-WIN v2",
    sportmonksConfigured: Boolean(SPORTMONKS_API_TOKEN)
  });
});

/**
 * Récupération des matchs à venir depuis Sportmonks
 */
app.get("/api/fixtures", async (req, res) => {
  if (!SPORTMONKS_API_TOKEN) {
    return res.status(500).json({
      success: false,
      error: "SPORTMONKS_API_TOKEN n'est pas configuré."
    });
  }

  try {
    const url =
      "https://api.sportmonks.com/v3/football/fixtures" +
      "?api_token=" +
      encodeURIComponent(SPORTMONKS_API_TOKEN) +
      "&include=participants;scores";

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();

      return res.status(response.status).json({
        success: false,
        error: "Erreur lors de la récupération des données Sportmonks.",
        details: text
      });
    }

    const data = await response.json();

    res.json({
      success: true,
      data: data.data || []
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Erreur serveur.",
      details: error.message
    });
  }
});

/**
 * Route principale
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`K2L-WIN v2 démarré sur le port ${PORT}`);
});
