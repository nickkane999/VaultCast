"use client";

import React from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Rating, Chip } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { VideoCardProps } from "./types";

export default function VideoCard({ video, onEditClick, onCardClick }: VideoCardProps) {
  const hasInformation = !!(video.title && video.description && video.score !== undefined && video.release_date);
  const hasTrailer = !!video.trailer_url;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getYear = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return null;
    }
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.trailer_url) {
      window.open(video.trailer_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: hasInformation ? "pointer" : "default",
        "&:hover": hasInformation
          ? {
              boxShadow: 4,
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out",
            }
          : {},
      }}
      onClick={hasInformation ? onCardClick : undefined}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {video.title || video.filename}
        </Typography>

        {hasInformation ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Rating value={video.score || 0} readOnly max={10} size="small" />
              <Typography variant="body2" color="text.secondary">
                {video.score}/10
              </Typography>
            </Box>

            {video.release_date && <Chip label={getYear(video.release_date)} size="small" sx={{ mb: 1 }} />}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: "60px",
              }}
            >
              {video.description}
            </Typography>

            {video.release_date && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Released: {formatDate(video.release_date)}
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Filename: {video.filename}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No information available for this video.
            </Typography>
          </>
        )}
      </CardContent>

      <CardActions sx={{ flexDirection: "column", gap: 1, alignItems: "stretch" }}>
        {hasTrailer && (
          <Button size="small" variant="contained" color="secondary" startIcon={<PlayArrow />} onClick={handleTrailerClick} fullWidth>
            Watch Trailer
          </Button>
        )}
        <Button
          size="small"
          variant={hasInformation ? "outlined" : "contained"}
          onClick={(e) => {
            e.stopPropagation();
            onEditClick();
          }}
          fullWidth
        >
          {hasInformation ? "Edit Information" : "Add Information"}
        </Button>
      </CardActions>
    </Card>
  );
}
