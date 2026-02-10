import express from "express";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js"; // ✅ ADD THIS
import uploadRoutes from "./routes/upload.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Basic CORS for development
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Static asset directories
const publicDir = path.join(__dirname, "public");
const reactDistDir = path.join(__dirname, "frontend", "dist");

// Legacy static routes (keep them working)
app.use("/scanner", express.static(path.join(__dirname, "scanner")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/participant", express.static(path.join(__dirname, "participant")));

// Simple debug route for static paths
app.get("/_staticpath", (req, res) => {
  const staticDir = path.join(__dirname, "scanner");
  const indexExists = fs.existsSync(path.join(staticDir, "index.html"));
  res.json({ staticDir, indexExists });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/qr", qrRoutes);

// Serve React app if built, otherwise fall back to old landing page
if (fs.existsSync(reactDistDir)) {
  app.use(express.static(reactDistDir));
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/scanner") ||
      req.path.startsWith("/admin") ||
      req.path.startsWith("/participant") ||
      req.path.startsWith("/_staticpath")
    ) {
      return next();
    }
    res.sendFile(path.join(reactDistDir, "index.html"));
  });
} else if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

export default app;
