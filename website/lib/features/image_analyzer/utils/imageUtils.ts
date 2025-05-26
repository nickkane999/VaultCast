export const validateImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some((ext) => lowercaseUrl.includes(ext)) || lowercaseUrl.includes("image") || lowercaseUrl.includes("img");
  } catch {
    return false;
  }
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxWidth / height);

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to compress image"));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const isValidImageType = (type: string): boolean => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml"];
  return validTypes.includes(type);
};

export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const extractImageMetadata = (file: File) => {
  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
  };
};
