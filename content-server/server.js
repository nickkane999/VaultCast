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

// Add JSON parsing middleware
app.use(express.json());

// Serve static files from different directories
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/files", express.static(path.join(__dirname, "files")));

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(str) {
  return /^[a-f\d]{24}$/i.test(str);
}

// Helper function to get video filename from database by ID
async function getVideoFilenameById(videoId) {
  try {
    const response = await fetch(`${process.env.NEXT_APP_URL || "http://localhost:3000"}/api/videos/${videoId}`);
    if (!response.ok) {
      return null;
    }
    const videoRecord = await response.json();
    return videoRecord.filename;
  } catch (error) {
    console.error("Error fetching video filename from database:", error);
    return null;
  }
}

// Video streaming route with enhanced security (handles both filenames and ObjectIds)
app.get("/videos/:filename", async (req, res) => {
  try {
    let actualFilename = req.params.filename;
    console.log(`Original filename parameter: ${actualFilename}`);

    // Check if the filename is actually a MongoDB ObjectId
    if (isValidObjectId(actualFilename)) {
      console.log(`Detected ObjectId: ${actualFilename}, looking up actual filename...`);

      // Get the actual filename from the database
      const filenameFromDb = await getVideoFilenameById(actualFilename);

      if (!filenameFromDb) {
        console.log(`No video record found for ObjectId: ${actualFilename}`);
        return res.status(404).json({ error: "Video record not found" });
      }

      actualFilename = filenameFromDb;
      console.log(`Found actual filename: ${actualFilename}`);
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(actualFilename);
    const videoPath = path.join(__dirname, "media", "videos", sanitizedFilename);

    console.log(`Attempting to stream video: ${videoPath}`);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.log(`Video file not found at path: ${videoPath}`);
      return res.status(404).json({ error: "Video file not found" });
    }

    // Basic file type verification
    const validExtensions = [".mp4", ".avi", ".mov", ".mkv"];
    const fileExtension = path.extname(sanitizedFilename).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
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
        "Content-Type": `video/${fileExtension.slice(1)}`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": `video/${fileExtension.slice(1)}`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoint to list files in media/ai_messenger directory
app.get("/api/files/ai_messenger", (req, res) => {
  const targetDir = path.join(__dirname, "media", "ai_messenger");

  fs.readdir(targetDir, (err, files) => {
    if (err) {
      console.error("Error listing files in", targetDir, ":", err);
      // Send a more generic error in production for security
      return res.status(500).json({ error: "Unable to list files" });
    }

    // Filter out directories if necessary, here we assume all are files or we want to include all entries
    // For now, just return the list of names
    res.json({ files: files });
  });
});

// New endpoint to list video files in media/videos directory
app.get("/api/files/videos", (req, res) => {
  const targetDir = path.join(__dirname, "media", "videos");

  fs.readdir(targetDir, (err, files) => {
    if (err) {
      console.error("Error listing video files in", targetDir, ":", err);
      return res.status(500).json({ error: "Unable to list video files" });
    }

    const videoFiles = files.filter((file) => file.toLowerCase().endsWith(".mp4") || file.toLowerCase().endsWith(".avi") || file.toLowerCase().endsWith(".mov") || file.toLowerCase().endsWith(".mkv"));

    res.json({ files: videoFiles });
  });
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
