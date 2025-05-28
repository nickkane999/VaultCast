import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { analyzeImage } from "../services/imageAnalysis";
import { validateImageFile } from "../utils/validation";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"),
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

router.post("/upload", upload.single("image"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    const validationResult = validateImageFile(req.file);
    if (!validationResult.isValid) {
      throw new AppError(validationResult.error || "Invalid image file", 400);
    }

    const { category, customPrompt, analysisTypes } = req.body;

    const result = await analyzeImage({
      imageBuffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      category: category || "general",
      customPrompt,
      analysisTypes: analysisTypes ? JSON.parse(analysisTypes) : ["openai"],
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/analyze-base64", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageData, category, customPrompt, analysisTypes } = req.body;

    if (!imageData) {
      throw new AppError("No image data provided", 400);
    }

    if (!imageData.startsWith("data:image/")) {
      throw new AppError("Invalid image data format", 400);
    }

    const base64Data = imageData.split(",")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");

    const mimeMatch = imageData.match(/data:image\/([^;]+);/);
    const mimetype = mimeMatch ? `image/${mimeMatch[1]}` : "image/jpeg";

    const result = await analyzeImage({
      imageBuffer,
      filename: "uploaded-image",
      mimetype,
      category: category || "general",
      customPrompt,
      analysisTypes: analysisTypes || ["openai"],
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/analyze-url", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, category, customPrompt, analysisTypes } = req.body;

    if (!imageUrl) {
      throw new AppError("No image URL provided", 400);
    }

    const result = await analyzeImage({
      imageUrl,
      category: category || "general",
      customPrompt,
      analysisTypes: analysisTypes || ["openai"],
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/categories", (req: Request, res: Response) => {
  const categories = [
    { id: "animals", name: "Animals", description: "Identify animals, breeds, and characteristics" },
    { id: "celebrities", name: "Celebrities", description: "Recognize famous people and public figures" },
    { id: "movies_tv", name: "Movies & TV", description: "Identify scenes from movies and TV shows" },
    { id: "objects", name: "Objects", description: "Recognize and describe objects and their uses" },
    { id: "locations", name: "Locations", description: "Identify places, landmarks, and geographical features" },
    { id: "food", name: "Food", description: "Identify dishes, ingredients, and cuisines" },
    { id: "art", name: "Art", description: "Analyze artistic styles, movements, and techniques" },
    { id: "general", name: "General", description: "Comprehensive analysis of any image content" },
  ];

  res.json({
    success: true,
    data: categories,
  });
});

router.get("/analysis-types", (req: Request, res: Response) => {
  const analysisTypes = [
    { id: "openai", name: "OpenAI Vision", description: "Advanced AI-powered image analysis" },
    { id: "tensorflow", name: "TensorFlow", description: "Local machine learning models" },
    { id: "google", name: "Google Vision", description: "Google Cloud Vision API" },
    { id: "aws", name: "AWS Rekognition", description: "Amazon Web Services image recognition" },
  ];

  res.json({
    success: true,
    data: analysisTypes,
  });
});

export default router;
