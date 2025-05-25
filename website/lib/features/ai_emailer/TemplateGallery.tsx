"use client";

import React from "react";
import { Box, Card, CardContent, CardMedia, Typography, Grid, Chip, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from "@mui/material";
import { Palette, CheckCircle } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setSelectedTemplate, setSelectedCategory, clearSelectedTemplate } from "@/store/aiEmailerSlice";
import type { EmailTemplate } from "@/store/aiEmailerSlice";

interface TemplateGalleryProps {
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
}

export default function TemplateGallery({ templates, loading, error }: TemplateGalleryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTemplate, selectedCategory } = useSelector((state: RootState) => state.aiEmailer);

  const filteredTemplates = templates.filter((template) => selectedCategory === "all" || template.category === selectedCategory);

  const handleTemplateSelect = (template: EmailTemplate) => {
    dispatch(setSelectedTemplate(template));
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setSelectedCategory(category as any));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      marketing: "#6366f1",
      newsletter: "#2563eb",
      promotional: "#e74c3c",
      announcement: "#2c3e50",
      transactional: "#059669",
    };
    return colors[category] || "#6b7280";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Palette color="primary" />
          Choose a Template
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select value={selectedCategory} label="Category" onChange={(e) => handleCategoryChange(e.target.value)}>
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="newsletter">Newsletter</MenuItem>
            <MenuItem value="promotional">Promotional</MenuItem>
            <MenuItem value="announcement">Announcement</MenuItem>
            <MenuItem value="transactional">Transactional</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid component="div" key={template.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: selectedTemplate?.id === template.id ? 2 : 1,
                borderColor: selectedTemplate?.id === template.id ? "primary.main" : "divider",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
                position: "relative",
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              {selectedTemplate?.id === template.id && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    backgroundColor: "primary.main",
                    borderRadius: "50%",
                    p: 0.5,
                  }}
                >
                  <CheckCircle sx={{ color: "white", fontSize: 20 }} />
                </Box>
              )}

              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  background: `linear-gradient(135deg, ${getCategoryColor(template.category)}22 0%, ${getCategoryColor(template.category)}44 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "90%",
                    height: "90%",
                    backgroundColor: "white",
                    borderRadius: 1,
                    boxShadow: 2,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "30%",
                      background: `linear-gradient(135deg, ${getCategoryColor(template.category)} 0%, ${getCategoryColor(template.category)}dd 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "white", fontWeight: "bold" }}>
                      {template.name}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, flexGrow: 1 }}>
                    <Box sx={{ height: 4, backgroundColor: "#f0f0f0", mb: 1, borderRadius: 1 }} />
                    <Box sx={{ height: 4, backgroundColor: "#f0f0f0", mb: 1, borderRadius: 1, width: "80%" }} />
                    <Box sx={{ height: 4, backgroundColor: "#f0f0f0", mb: 1, borderRadius: 1, width: "60%" }} />
                  </Box>
                </Box>
              </CardMedia>

              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.category}
                    size="small"
                    sx={{
                      backgroundColor: getCategoryColor(template.category),
                      color: "white",
                      textTransform: "capitalize",
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Perfect for {template.category} campaigns with modern design and responsive layout.
                </Typography>

                <Button
                  variant={selectedTemplate?.id === template.id ? "contained" : "outlined"}
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                >
                  {selectedTemplate?.id === template.id ? "Selected" : "Select Template"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No templates found for this category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try selecting a different category or check back later for new templates.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
