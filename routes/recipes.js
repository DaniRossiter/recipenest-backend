const express = require("express");
const router = express.Router();

// GET /api/recipes - Get all recipes
router.get("/", (req, res) => {
  res.json({ message: "All recipes will be returned here." });
});

module.exports = router;
