// Import dependencies
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const recipeRoutes = require("./routes/recipes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to RecipeNest API");
});

app.use("/api/recipes", recipeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

