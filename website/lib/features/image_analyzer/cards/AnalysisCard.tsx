"use client";

import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Chip, IconButton, Box, Collapse, Avatar, Tooltip, Button } from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Share, Download, Visibility, AccessTime, Psychology } from "@mui/icons-material";
import { ImageAnalysisResult } from "../types";

interface AnalysisCardProps {
  result: ImageAnalysisResult;
  onDelete: (id: string) => void;
  onShare?: (result: ImageAnalysisResult) => void;
  compact?: boolean;
}

export default function AnalysisCard({ result, onDelete, onShare, compact = false }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [imageExpanded, setImageExpanded] = useState(false);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      animals: "#4caf50",
      celebrities: "#ff9800",
      movies_tv: "#9c27b0",
      objects: "#2196f3",
      locations: "#f44336",
      food: "#ff5722",
      art: "#795548",
      general: "#607d8b",
    };
    return colors[category] || "#607d8b";
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      animals: "🐾",
      celebrities: "⭐",
      movies_tv: "🎬",
      objects: "📦",
      locations: "📍",
      food: "🍽️",
      art: "🎨",
      general: "🔍",
    };
    return icons[category] || "🔍";
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.href = result.imageData;
    element.download = `analysis_${result.id}.jpg`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
        border: `2px solid ${getCategoryColor(result.category)}20`,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: getCategoryColor(result.category),
              width: 40,
              height: 40,
            }}
          >
            {getCategoryIcon(result.category)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3">
              {result.category.charAt(0).toUpperCase() + result.category.slice(1)} Analysis
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(result.timestamp)}
              </Typography>
            </Box>
          </Box>
          <Chip icon={<Psychology />} label="AI Analysis" size="small" color="primary" variant="outlined" />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box
            sx={{
              position: "relative",
              cursor: "pointer",
              borderRadius: 2,
              overflow: "hidden",
              flexShrink: 0,
            }}
            onClick={() => setImageExpanded(!imageExpanded)}
          >
            <img
              src={result.imageData}
              alt="Analyzed"
              style={{
                width: imageExpanded ? "200px" : "80px",
                height: imageExpanded ? "200px" : "80px",
                objectFit: "cover",
                transition: "all 0.3s ease",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "rgba(0,0,0,0.6)",
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <Visibility sx={{ fontSize: 16, color: "white" }} />
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" gutterBottom>
              Question:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: expanded ? "none" : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 1,
              }}
            >
              {result.prompt}
            </Typography>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Analysis Result:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              {result.result}
            </Typography>

            {result.metadata && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Details:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {result.metadata.imageType && <Chip label={`${result.metadata.imageType.toUpperCase()}`} size="small" variant="outlined" />}
                  {result.metadata.imageSize && <Chip label={result.metadata.imageSize} size="small" variant="outlined" />}
                  {result.metadata.processingTime && <Chip label={`${(result.metadata.processingTime / 1000).toFixed(1)}s`} size="small" variant="outlined" />}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Box>
          <Tooltip title={expanded ? "Show less" : "Show more"}>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download image">
            <IconButton onClick={handleDownload} size="small">
              <Download />
            </IconButton>
          </Tooltip>
          {onShare && (
            <Tooltip title="Share result">
              <IconButton onClick={() => onShare(result)} size="small">
                <Share />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Tooltip title="Delete analysis">
          <IconButton onClick={() => onDelete(result.id)} size="small" color="error">
            <Delete />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
