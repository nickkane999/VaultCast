"use client";

import React, { useEffect, useState } from "react";
import { Box, Stepper, Step, StepLabel, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem, Snackbar } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchTemplatesThunk, fetchDesignsThunk, clearSelectedTemplate, setSelectedTemplate, setDesignMode, setSelectedDesignForUpdate, clearSelectedDesign } from "@/store/aiEmailerSlice";
import TemplateGallery from "./TemplateGallery";
import DesignCustomizer from "./DesignCustomizer";

const steps = ["Choose Template", "Customize Design", "Preview & Save"];

export default function EmailDesignTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { templates, designs, selectedTemplate, designLoading, designError, designMode, selectedDesignForUpdate } = useSelector((state: RootState) => state.aiEmailer);

  const [activeStep, setActiveStep] = React.useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Fetch templates and designs on component mount
    dispatch(fetchTemplatesThunk());
    dispatch(fetchDesignsThunk());
  }, [dispatch]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    dispatch(clearSelectedTemplate());
    dispatch(clearSelectedDesign());
    dispatch(setSelectedDesignForUpdate(null));
  };

  const handleDesignModeChange = (mode: "create" | "update") => {
    dispatch(setDesignMode(mode));
    if (mode === "create") {
      dispatch(setSelectedDesignForUpdate(null));
      dispatch(clearSelectedTemplate());
      setActiveStep(0);
    } else {
      dispatch(clearSelectedTemplate());
      setActiveStep(1);
    }
  };

  const handleDesignSelection = (designId: string) => {
    const design = designs.find((d) => d.id === designId);
    if (design) {
      dispatch(setSelectedDesignForUpdate(design));
    }
  };

  const handleUpdateSuccess = () => {
    setShowSuccessMessage(true);
  };

  const canProceedToNext = () => {
    switch (activeStep) {
      case 0:
        return !!selectedTemplate;
      case 1:
        return !!selectedTemplate;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    if (designMode === "update") {
      return selectedDesignForUpdate ? (
        <DesignCustomizer
          template={{
            id: selectedDesignForUpdate.templateId,
            name: "Selected Template",
            category: "marketing" as const,
            thumbnail: "",
            htmlContent: "",
            customizableFields: selectedDesignForUpdate.customizations,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          isUpdateMode={true}
          onUpdateSuccess={handleUpdateSuccess}
        />
      ) : (
        <Alert severity="warning">Please select a design to update.</Alert>
      );
    }

    switch (step) {
      case 0:
        return <TemplateGallery templates={templates} loading={designLoading} error={designError} />;
      case 1:
        return selectedTemplate ? <DesignCustomizer template={selectedTemplate} /> : <Alert severity="warning">Please select a template first.</Alert>;
      case 2:
        return (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Design Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your email design has been saved and is ready to use.
            </Typography>
            <Button variant="contained" onClick={handleReset}>
              Create Another Design
            </Button>
          </Box>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Email Design Studio
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create beautiful, professional email designs with our intuitive design tools.
        </Typography>

        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Design Mode</InputLabel>
            <Select value={designMode} label="Design Mode" onChange={(e) => handleDesignModeChange(e.target.value as "create" | "update")}>
              <MenuItem value="create">Create Design</MenuItem>
              <MenuItem value="update">Update Design</MenuItem>
            </Select>
          </FormControl>

          {designMode === "update" && (
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Select Design</InputLabel>
              <Select value={selectedDesignForUpdate?.id || ""} label="Select Design" onChange={(e) => handleDesignSelection(e.target.value)}>
                {designs.map((design) => (
                  <MenuItem key={design.id} value={design.id}>
                    {design.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {designMode === "create" && (
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Box>

      {designError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {designError}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>{renderStepContent(activeStep)}</Box>

      {designMode === "create" && (
        <Box sx={{ display: "flex", justifyContent: "space-between", pt: 2 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBack />}>
            Back
          </Button>

          <Box sx={{ flex: "1 1 auto" }} />

          {activeStep < steps.length - 1 && (
            <Button variant="contained" onClick={handleNext} disabled={!canProceedToNext()} endIcon={<ArrowForward />}>
              {activeStep === steps.length - 2 ? "Finish" : "Next"}
            </Button>
          )}
        </Box>
      )}

      <Snackbar open={showSuccessMessage} autoHideDuration={3000} onClose={() => setShowSuccessMessage(false)} message="Design updated successfully!" />
    </Box>
  );
}
