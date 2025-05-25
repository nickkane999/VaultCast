"use client";

import React, { useState } from "react";
import { Box, TextField, Typography, Grid, Button, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Edit, Preview, Save, Palette, ExpandMore, Image, Link, Title, Description } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setDesignCustomizations, generatePreviewThunk, saveDesignThunk, setShowPreview } from "@/store/aiEmailerSlice";
import type { EmailTemplate } from "@/store/aiEmailerSlice";

interface DesignCustomizerProps {
  template: EmailTemplate;
}

export default function DesignCustomizer({ template }: DesignCustomizerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { designCustomizations, previewHtml, designLoading, designError, showPreview } = useSelector((state: RootState) => state.aiEmailer);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");

  const handleFieldChange = (field: string, value: string) => {
    dispatch(setDesignCustomizations({ [field]: value }));
  };

  const handlePreview = () => {
    dispatch(
      generatePreviewThunk({
        templateId: template.id,
        customizations: designCustomizations,
      })
    );
    dispatch(setShowPreview(true));
  };

  const handleSave = async () => {
    if (!designName.trim()) return;

    try {
      await dispatch(
        saveDesignThunk({
          name: designName,
          templateId: template.id,
          customizations: designCustomizations,
        })
      ).unwrap();

      setSaveDialogOpen(false);
      setDesignName("");
    } catch (error) {
      console.error("Failed to save design:", error);
    }
  };

  const getFieldIcon = (field: string) => {
    const icons: Record<string, React.ReactNode> = {
      title: <Title />,
      subtitle: <Description />,
      content: <Description />,
      buttonText: <Link />,
      buttonUrl: <Link />,
      logoUrl: <Image />,
      footerText: <Description />,
      primaryColor: <Palette />,
      secondaryColor: <Palette />,
    };
    return icons[field] || <Edit />;
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      title: "Email Title",
      subtitle: "Subtitle",
      content: "Main Content",
      buttonText: "Button Text",
      buttonUrl: "Button URL",
      logoUrl: "Logo URL",
      footerText: "Footer Text",
      primaryColor: "Primary Color",
      secondaryColor: "Secondary Color",
    };
    return labels[field] || field;
  };

  const getFieldType = (field: string) => {
    if (field.includes("Color")) return "color";
    if (field.includes("Url")) return "url";
    if (field === "content") return "multiline";
    return "text";
  };

  const renderField = (field: string, value: string) => {
    const fieldType = getFieldType(field);
    const isMultiline = fieldType === "multiline";
    const isColor = fieldType === "color";

    return (
      <Grid item xs={12} sm={isColor ? 6 : 12} key={field}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {getFieldIcon(field)}
          <Typography variant="subtitle2">{getFieldLabel(field)}</Typography>
        </Box>

        {isColor ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField type="color" value={value || "#000000"} onChange={(e) => handleFieldChange(field, e.target.value)} sx={{ width: 60 }} size="small" />
            <TextField value={value || ""} onChange={(e) => handleFieldChange(field, e.target.value)} placeholder="#000000" size="small" fullWidth />
          </Box>
        ) : (
          <TextField fullWidth multiline={isMultiline} rows={isMultiline ? 4 : 1} value={value || ""} onChange={(e) => handleFieldChange(field, e.target.value)} placeholder={`Enter ${getFieldLabel(field).toLowerCase()}`} type={fieldType === "url" ? "url" : "text"} size="small" />
        )}
      </Grid>
    );
  };

  const contentFields = ["title", "subtitle", "content"];
  const actionFields = ["buttonText", "buttonUrl"];
  const brandingFields = ["logoUrl", "footerText"];
  const colorFields = ["primaryColor", "secondaryColor"];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Edit color="primary" />
          Customize Design
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<Preview />} onClick={handlePreview} disabled={designLoading}>
            Preview
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={() => setSaveDialogOpen(true)} disabled={designLoading}>
            Save Design
          </Button>
        </Box>
      </Box>

      {designError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {designError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Content</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {contentFields.map((field) => template.customizableFields[field as keyof typeof template.customizableFields] !== undefined && renderField(field, designCustomizations[field as keyof typeof designCustomizations] || ""))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Call to Action</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {actionFields.map((field) => template.customizableFields[field as keyof typeof template.customizableFields] !== undefined && renderField(field, designCustomizations[field as keyof typeof designCustomizations] || ""))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Branding</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {brandingFields.map((field) => template.customizableFields[field as keyof typeof template.customizableFields] !== undefined && renderField(field, designCustomizations[field as keyof typeof designCustomizations] || ""))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Colors</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {colorFields.map((field) => template.customizableFields[field as keyof typeof template.customizableFields] !== undefined && renderField(field, designCustomizations[field as keyof typeof designCustomizations] || ""))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "fit-content", minHeight: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Live Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {designLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : previewHtml ? (
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    overflow: "hidden",
                    maxHeight: 600,
                    overflowY: "auto",
                  }}
                >
                  <iframe
                    srcDoc={previewHtml}
                    style={{
                      width: "100%",
                      height: "500px",
                      border: "none",
                      transform: "scale(0.8)",
                      transformOrigin: "top left",
                      width: "125%",
                      height: "625px",
                    }}
                    title="Email Preview"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 300,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                    border: "2px dashed #ddd",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Click "Preview" to see your customized email
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Email Design</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Design Name" fullWidth variant="outlined" value={designName} onChange={(e) => setDesignName(e.target.value)} placeholder="Enter a name for your design" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!designName.trim() || designLoading}>
            {designLoading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
