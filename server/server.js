const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["https://tazky.vercel.app", /\.vercel\.app$/],
    credentials: true,
  })
);
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(403).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
}

// ---------- AUTH ----------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const exists = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (exists.rows.length)
      return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email",
      [name, email, hashed]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- TASKS ----------
app.get("/tasks", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_email=$1 ORDER BY id DESC",
      [req.user.email]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

app.post("/tasks", verifyToken, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, completed, user_email) VALUES ($1,false,$2) RETURNING *",
      [title, req.user.email]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: "Error adding task" });
  }
});

app.patch("/tasks/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { completed, title } = req.body;

  try {
    let query = "";
    let values = [];

    if (title !== undefined) {
      // Update title (edit)
      query = "UPDATE tasks SET title=$1 WHERE id=$2 RETURNING *";
      values = [title, id];
    } else if (completed !== undefined) {
      // Update completion status
      query = "UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING *";
      values = [completed, id];
    } else {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const result = await pool.query(query, values);
    if (!result.rows.length)
      return res.status(404).json({ message: "Task not found" });

    res.json(result.rows[0]);
  } catch (e) {
    console.error("Error updating task:", e);
    res.status(500).json({ message: "Error updating task" });
  }
});

app.delete("/tasks/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted", deleted: result.rows[0] });
  } catch (e) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

app.get("/", (req, res) => res.send("Tazky API running"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected error" });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
