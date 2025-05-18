const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost"; // Only bind to localhost by default

// Enhanced security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// CORS configuration - only allow the Next.js frontend
app.use(
  cors({
    origin: process.env.NEXT_APP_URL || "http://localhost:3000",
    methods: ["GET"],
    optionsSuccessStatus: 200,
  })
);

// Serve static files from different directories
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/files", express.static(path.join(__dirname, "files")));

// Video streaming route with enhanced security
app.get("/videos/:filename", (req, res) => {
  // Sanitize filename to prevent directory traversal
  const filename = path.basename(req.params.filename);
  const videoPath = path.join(__dirname, "media", "videos", filename);

  console.log(`Attempting to stream video: ${videoPath}`);

  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    console.log(`Video not found at path: ${videoPath}`);
    return res.status(404).json({ error: "Video not found" });
  }

  // Basic file type verification
  if (!filename.toLowerCase().endsWith(".mp4")) {
    return res.status(400).json({ error: "Invalid file type" });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
      return res.status(416).send("Requested range not satisfiable");
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Content server running at http://${HOST}:${PORT}`);
  console.log(`Videos directory: ${path.join(__dirname, "media", "videos")}`);
  console.log(`CORS enabled for: ${process.env.NEXT_APP_URL || "http://localhost:3000"}`);
});
