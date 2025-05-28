import { useCallback, useRef } from "react";

export const useImageUpload = (onImageUpload: (imageData: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const validateImageFile = useCallback((file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
    }

    if (file.size > maxSize) {
      throw new Error("Image file size must be less than 10MB");
    }

    return true;
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        validateImageFile(file);
        const base64Data = await convertFileToBase64(file);
        onImageUpload(base64Data);
      } catch (error) {
        throw error;
      }
    },
    [validateImageFile, convertFileToBase64, onImageUpload]
  );

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        await handleFileUpload(imageFile);
      } else {
        throw new Error("No image file found in dropped items");
      }
    },
    [handleFileUpload]
  );

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));

      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          await handleFileUpload(file);
        }
      }
    },
    [handleFileUpload]
  );

  const handleUrlUpload = useCallback(
    async (imageUrl: string) => {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch image from URL");
        }

        const blob = await response.blob();
        const file = new File([blob], "image", { type: blob.type });
        await handleFileUpload(file);
      } catch (error) {
        throw new Error("Failed to load image from URL. Please check the URL and try again.");
      }
    },
    [handleFileUpload]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    handleFileInputChange,
    handleDrop,
    handlePaste,
    handleUrlUpload,
    triggerFileInput,
  };
};
