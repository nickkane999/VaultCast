const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: process.env.NEXT_APP_URL || "http://localhost:3000",
    methods: ["GET"],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

// Serve static files from different directories
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/files", express.static(path.join(__dirname, "files")));

// Video streaming route
app.get("/videos/:filename", (req, res) => {
  const videoPath = path.join(__dirname, "media", "videos", req.params.filename);
  console.log(`Attempting to stream video: ${videoPath}`);

  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    console.log(`Video not found at path: ${videoPath}`);
    return res.status(404).json({ error: "Video not found" });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Basic route for testing
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Content server running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.NEXT_APP_URL || "http://localhost:3000"}`);
  console.log(`Videos directory: ${path.join(__dirname, "media", "videos")}`);
});
