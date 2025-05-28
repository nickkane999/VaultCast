import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Image Analysis Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    services: {
      tensorflow: process.env.ENABLE_TENSORFLOW_MODELS === "true",
      openai: !!process.env.OPENAI_API_KEY,
      googleVision: !!process.env.GOOGLE_VISION_API_KEY,
      awsRekognition: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    },
  });
});

router.get("/detailed", (req: Request, res: Response) => {
  res.json({
    success: true,
    server: {
      name: "Image Analysis Server",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 3003,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    services: {
      tensorflow: {
        enabled: process.env.ENABLE_TENSORFLOW_MODELS === "true",
        modelCacheDir: process.env.MODEL_CACHE_DIR || "./models",
      },
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        googleVision: !!process.env.GOOGLE_VISION_API_KEY,
        awsRekognition: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      },
    },
    limits: {
      maxFileSize: process.env.MAX_FILE_SIZE || "10MB",
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || ["image/jpeg", "image/png", "image/webp", "image/gif"],
      rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS || "15 minutes",
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || "100",
      },
    },
  });
});

export default router;
