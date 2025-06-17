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

// GET /api/recipes/:id - Get a single recipe by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM recipes WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching recipe by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/recipes - Add a new recipe
router.post("/", async (req, res) => {
  const { user_id, title, description, ingredients, instructions, image_url } = req.body;

  // Basic validation
  if (!user_id || !title || !ingredients || !instructions) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.query(
      `INSERT INTO recipes (user_id, title, description, ingredients, instructions, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, title, description, ingredients, instructions, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/recipes/:id - Update an existing recipe
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, ingredients, instructions, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE recipes 
       SET title = $1, description = $2, ingredients = $3, instructions = $4, image_url = $5 
       WHERE id = $6 
       RETURNING *`,
      [title, description, ingredients, instructions, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;

