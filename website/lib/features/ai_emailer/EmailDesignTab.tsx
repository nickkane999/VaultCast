"use client";

import React, { useEffect } from "react";
import { Box, Stepper, Step, StepLabel, Button, Typography, Alert } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchTemplatesThunk, fetchDesignsThunk, clearSelectedTemplate, setSelectedTemplate } from "@/store/aiEmailerSlice";
import TemplateGallery from "./TemplateGallery";
import DesignCustomizer from "./DesignCustomizer";

const steps = ["Choose Template", "Customize Design", "Preview & Save"];

export default function EmailDesignTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { templates, selectedTemplate, designLoading, designError } = useSelector((state: RootState) => state.aiEmailer);

  const [activeStep, setActiveStep] = React.useState(0);

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

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {designError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {designError}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>{renderStepContent(activeStep)}</Box>

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
    </Box>
  );
}
