const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db"); // Import database connection

const app = express();

// Auto-create tables in the correct order
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  );
`).then(() => {
  console.log("users table ready");

  return pool.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      ingredients TEXT[],
      instructions TEXT[],
      imageUrl TEXT
    );
  `);
}).then(() => {
  console.log("recipes table ready");

  // Add created_at column if it doesn't exist
  return pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'recipes' AND column_name = 'created_at'
      ) THEN
        ALTER TABLE recipes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      END IF;
    END
    $$;
  `);
}).then(() => {
  console.log("created_at column added (if missing)");
}).catch(err => {
  console.error("Error setting up database tables:", err);
});

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
const recipeRoutes = require("./routes/recipes");
const authRoutes = require("./routes/auth");

app.get("/", (req, res) => {
  res.send("Welcome to RecipeNest API");
});

app.use("/api/recipes", recipeRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;