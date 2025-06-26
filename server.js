const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db"); // Import database connection

const app = express();

// Auto-create tables in the correct order
pool.query(`
  DO $$
  BEGIN
    -- USERS TABLE
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255)
      );
    ELSIF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username'
    ) THEN
      ALTER TABLE users ADD COLUMN username VARCHAR(255);
    END IF;

    -- RECIPES TABLE
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recipes') THEN
      CREATE TABLE recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        ingredients TEXT[],
        instructions TEXT[],
        imageUrl TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    ELSIF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'recipes' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE recipes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END
  $$;
`).then(() => {
  console.log("Tables verified and updated if needed");
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