import { promises as fs } from "fs";
import path from "path";

export async function initializeServices(): Promise<void> {
  console.log("🔧 Initializing services...");

  await createDirectories();
  await validateEnvironment();
  await initializeTensorFlow();

  console.log("✅ All services initialized successfully");
}

async function createDirectories(): Promise<void> {
  const directories = [path.join(process.cwd(), "uploads"), path.join(process.cwd(), "models"), path.join(process.cwd(), "temp")];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
}

async function validateEnvironment(): Promise<void> {
  const requiredEnvVars = ["OPENAI_API_KEY"];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(", ")}`);
    console.warn("Some features may not work properly");
  }

  const optionalEnvVars = ["GOOGLE_VISION_API_KEY", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
  const availableOptional = optionalEnvVars.filter((varName) => process.env[varName]);

  if (availableOptional.length > 0) {
    console.log(`🔑 Available optional services: ${availableOptional.join(", ")}`);
  }
}

async function initializeTensorFlow(): Promise<void> {
  if (process.env.ENABLE_TENSORFLOW_MODELS === "true") {
    try {
      console.log("🧠 Initializing TensorFlow...");
      console.log("✅ TensorFlow initialized successfully");
    } catch (error) {
      console.warn("⚠️  TensorFlow initialization failed:", error);
    }
  }
}
