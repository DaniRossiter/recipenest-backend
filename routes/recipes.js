const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

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

// GET /api/recipes/search
router.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM recipes 
       WHERE LOWER(title) LIKE LOWER($1) OR EXISTS (
         SELECT 1 FROM unnest(ingredients) AS ingredient 
         WHERE LOWER(ingredient) LIKE LOWER($1)
       )
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error searching recipes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/recipes/mine
router.get("/mine", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      "SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/recipes/:id
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

// POST /api/recipes
router.post("/", verifyToken, async (req, res) => {
  const { title, description, ingredients, instructions, image_url, servings } = req.body;
  const servingsInt = servings === "" ? null : parseInt(servings, 10);
  const user_id = req.user.userId;

  if (
    !user_id ||
    !title?.trim() ||
    !description?.trim() ||
    !Array.isArray(ingredients) || ingredients.length === 0 ||
    !Array.isArray(instructions) || instructions.length === 0
  ) {
    return res.status(400).json({
      error: "All fields (title, description, ingredients, instructions) are required."
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO recipes (user_id, title, description, ingredients, instructions, image_url, servings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, title, description, ingredients, instructions, image_url, servingsInt]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// PUT /api/recipes/:id
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, ingredients, instructions, imageUrl, servings } = req.body;
  const servingsInt = servings === "" ? null : parseInt(servings, 10);
  const image_url = imageUrl;
  const userId = req.user.userId;

  try {
    const recipeCheck = await db.query(
      "SELECT * FROM recipes WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (recipeCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not authorized to update this recipe" });
    }

    const result = await db.query(
      `UPDATE recipes 
       SET title = $1, description = $2, ingredients = $3, instructions = $4, image_url = $5, servings = $6
       WHERE id = $7
       RETURNING *`,
      [title, description, ingredients, instructions, image_url, servingsInt, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/recipes/:id
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const recipeCheck = await db.query(
      "SELECT * FROM recipes WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (recipeCheck.rows.length === 0) {
      return res.status(403).json({ error: "You are not authorized to delete this recipe" });
    }

    const result = await db.query("DELETE FROM recipes WHERE id = $1 RETURNING *", [id]);

    res.json({ message: "Recipe deleted successfully", deletedRecipe: result.rows[0] });
  } catch (err) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


