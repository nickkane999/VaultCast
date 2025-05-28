export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ImageFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export function validateImageFile(file: ImageFile): ValidationResult {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || "10485760");
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!file.buffer || file.buffer.length === 0) {
    return { isValid: false, error: "File buffer is empty" };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
    };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (!isValidImageBuffer(file.buffer, file.mimetype)) {
    return { isValid: false, error: "Invalid image file format" };
  }

  return { isValid: true };
}

function isValidImageBuffer(buffer: Buffer, mimetype: string): boolean {
  const signatures: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    "image/gif": [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  };

  const fileSignatures = signatures[mimetype];
  if (!fileSignatures) return true;

  return fileSignatures.some((signature) => signature.every((byte, index) => buffer[index] === byte));
}

export function validateBase64Image(base64Data: string): ValidationResult {
  if (!base64Data.startsWith("data:image/")) {
    return { isValid: false, error: "Invalid base64 image format" };
  }

  try {
    const base64Content = base64Data.split(",")[1];
    const buffer = Buffer.from(base64Content, "base64");

    const mimeMatch = base64Data.match(/data:image\/([^;]+);/);
    const mimetype = mimeMatch ? `image/${mimeMatch[1]}` : "image/jpeg";

    return validateImageFile({
      buffer,
      originalname: "base64-image",
      mimetype,
      size: buffer.length,
    });
  } catch (error) {
    return { isValid: false, error: "Failed to decode base64 image" };
  }
}

export function validateImageUrl(url: string): ValidationResult {
  try {
    const urlObj = new URL(url);

    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return { isValid: false, error: "URL must use HTTP or HTTPS protocol" };
    }

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const hasImageExtension = imageExtensions.some((ext) => urlObj.pathname.toLowerCase().endsWith(ext));

    if (!hasImageExtension) {
      return { isValid: false, error: "URL does not appear to point to an image file" };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid URL format" };
  }
}
