const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/recipes - Get all recipes
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM recipes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

