import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'exam_results.json');

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Routes
app.post("/api/submit", (req, res) => {
  try {
    const data = req.body;
    const results = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    results.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(results, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/admin/results", (req, res) => {
  const { username, password } = req.body;
  // Hardcoded admin credentials for prototype
  if (username !== "admin" || password !== "admin1234") {
    return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است." });
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
