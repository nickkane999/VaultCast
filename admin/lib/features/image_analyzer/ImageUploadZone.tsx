"use client";

import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { CloudUpload, Image as ImageIcon, Link as LinkIcon, ContentPaste, Close } from "@mui/icons-material";
import IsolatedTextField from "@/lib/components/IsolatedTextField";
import { useImageUpload } from "./hooks/useImageUpload";

interface ImageUploadZoneProps {
  onImageUpload: (imageData: string) => void;
  currentImage: string | null;
}

export default function ImageUploadZone({ onImageUpload, currentImage }: ImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const { fileInputRef, handleFileInputChange, handleDrop, handlePaste, handleUrlUpload, triggerFileInput } = useImageUpload(onImageUpload);

  useEffect(() => {
    const handleGlobalPaste = async (event: ClipboardEvent) => {
      try {
        await handlePaste(event);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to paste image");
      }
    };

    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [handlePaste]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDropEvent = async (event: React.DragEvent) => {
    setIsDragOver(false);
    try {
      await handleDrop(event);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    }
  };

  const handleFileInputChangeEvent = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await handleFileInputChange(event);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;

    try {
      await handleUrlUpload(imageUrl);
      setUrlDialogOpen(false);
      setImageUrl("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image from URL");
    }
  };

  const clearError = () => setError(null);

  return (
    <Box>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChangeEvent} style={{ display: "none" }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {currentImage ? (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            textAlign: "center",
            position: "relative",
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={() => onImageUpload("")}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            <Close />
          </IconButton>
          <img
            src={currentImage}
            alt="Uploaded"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Image ready for analysis
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={isDragOver ? 6 : 2}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropEvent}
          sx={{
            p: 4,
            textAlign: "center",
            border: isDragOver ? "2px dashed #1976d2" : "2px dashed #ccc",
            borderRadius: 2,
            bgcolor: isDragOver ? "action.hover" : "background.paper",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#1976d2",
              bgcolor: "action.hover",
            },
          }}
          onClick={triggerFileInput}
        >
          <CloudUpload sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload an Image
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Drag and drop an image here, or click to browse
          </Typography>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
            >
              Browse Files
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setUrlDialogOpen(true);
              }}
            >
              From URL
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentPaste />}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Paste (Ctrl+V)
            </Button>
          </Box>

          <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary" }}>
            Supports JPEG, PNG, GIF, WebP (max 10MB)
          </Typography>
        </Paper>
      )}

      <Dialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Load Image from URL</DialogTitle>
        <DialogContent>
          <IsolatedTextField fullWidth label="Image URL" value={imageUrl} onDebouncedChange={setImageUrl} placeholder="https://example.com/image.jpg" sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUrlDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUrlSubmit} variant="contained" disabled={!imageUrl.trim()}>
            Load Image
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
