import React from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Alert, Autocomplete, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Divider } from "@mui/material";
import { ExpandMore, Palette, Edit } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import "@/store/aiEmailerSlice";
import { useEditAiResponse, useEmailFormHandlers } from "./useEmailForm";
import IsolatedTextField from "@/lib/components/IsolatedTextField";

export default function EmailForm() {
  // Memoized selectors for specific state pieces to prevent unnecessary re-renders
  const requestType = useSelector((state: RootState) => state.aiEmailer.requestType);
  const emailTitle = useSelector((state: RootState) => state.aiEmailer.emailTitle);
  const question = useSelector((state: RootState) => state.aiEmailer.question);
  const aiResponse = useSelector((state: RootState) => state.aiEmailer.aiResponse);
  const loading = useSelector((state: RootState) => state.aiEmailer.loading);
  const error = useSelector((state: RootState) => state.aiEmailer.error);
  const action = useSelector((state: RootState) => state.aiEmailer.action);
  const updateRequest = useSelector((state: RootState) => state.aiEmailer.updateRequest);
  const sendToEmail = useSelector((state: RootState) => state.aiEmailer.sendToEmail);
  const pastEmails = useSelector((state: RootState) => state.aiEmailer.pastEmails);
  const selectedPastEmail = useSelector((state: RootState) => state.aiEmailer.selectedPastEmail);
  const pastEmailsLoading = useSelector((state: RootState) => state.aiEmailer.pastEmailsLoading);
  const pastEmailsError = useSelector((state: RootState) => state.aiEmailer.pastEmailsError);
  const designs = useSelector((state: RootState) => state.aiEmailer.designs);
  const selectedDraftDesign = useSelector((state: RootState) => state.aiEmailer.selectedDraftDesign);
  const draftCustomizations = useSelector((state: RootState) => state.aiEmailer.draftCustomizations);
  const useDesignInDraft = useSelector((state: RootState) => state.aiEmailer.useDesignInDraft);
  const designLoading = useSelector((state: RootState) => state.aiEmailer.designLoading);
  const templates = useSelector((state: RootState) => state.aiEmailer.templates);
  const selectedHtmlTemplate = useSelector((state: RootState) => state.aiEmailer.selectedHtmlTemplate);
  const htmlDesignCustomizations = useSelector((state: RootState) => state.aiEmailer.htmlDesignCustomizations);
  const htmlDesignQuestion = useSelector((state: RootState) => state.aiEmailer.htmlDesignQuestion);
  const viewMode = useSelector((state: RootState) => state.aiEmailer.viewMode);
  const designOption = useSelector((state: RootState) => state.aiEmailer.designOption);

  const dispatch = useDispatch<AppDispatch>();

  const { isEditingResponse, editableAiResponse, handleEditClick, handleSaveEdit, handleCancelEdit, setEditableAiResponse } = useEditAiResponse({ aiResponse });
  const {
    handleRequestTypeChange,
    handleEmailTitleChange,
    handleDebouncedEmailTitleChange,
    handleQuestionChange,
    handleDebouncedQuestionChange,
    handleActionChange,
    handleUpdateRequestChange,
    handleSendToEmailChange,
    handlePastEmailChange,
    handleDraftDesignChange,
    handleDraftCustomizationChange,
    handleUseDesignToggle,
    handleHtmlTemplateChange,
    handleHtmlDesignCustomizationChange,
    handleHtmlDesignQuestionChange,
    handleViewModeChange,
    handleDesignOptionChange,
    handleSubmit,
    handleSubmitWithDesign,
    handleSubmitHtmlDesign,
    handleSendEmail,
    handleLoadEmail,
    handleDeleteEmail,
  } = useEmailFormHandlers();

  const formatEmailOption = (email: any) => {
    const date = new Date(email.timestamp).toLocaleDateString();
    const preview = email.response.substring(0, 50) + (email.response.length > 50 ? "..." : "");
    return `${email.emailTitle} (${date}) - ${preview}`;
  };

  const formatDesignOption = (design: any) => {
    const date = new Date(design.createdAt).toLocaleDateString();
    return `${design.name} (${date})`;
  };

  const formatTemplateOption = (template: any) => {
    return `${template.name} - ${template.category}`;
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

  const renderCustomizationField = (field: string, value: string) => {
    const fieldType = getFieldType(field);
    const isMultiline = fieldType === "multiline";
    const isColor = fieldType === "color";

    return (
      <Box key={field} sx={{ mb: 2 }}>
        {isColor ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField type="color" value={value || "#000000"} onChange={(e) => handleDraftCustomizationChange(field, e.target.value)} sx={{ width: 60 }} size="small" />
            <TextField value={value || ""} onChange={(e) => handleDraftCustomizationChange(field, e.target.value)} placeholder="#000000" size="small" fullWidth label={getFieldLabel(field)} />
          </Box>
        ) : (
          <TextField fullWidth multiline={isMultiline} rows={isMultiline ? 3 : 1} value={value || ""} onChange={(e) => handleDraftCustomizationChange(field, e.target.value)} label={getFieldLabel(field)} type={fieldType === "url" ? "url" : "text"} size="small" />
        )}
      </Box>
    );
  };

  const renderHtmlDesignCustomizationField = (field: string, value: string) => {
    const fieldType = getFieldType(field);
    const isMultiline = fieldType === "multiline";
    const isColor = fieldType === "color";

    return (
      <Box key={field} sx={{ mb: 2 }}>
        {isColor ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField type="color" value={value || "#000000"} onChange={(e) => handleHtmlDesignCustomizationChange(field, e.target.value)} sx={{ width: 60 }} size="small" />
            <TextField value={value || ""} onChange={(e) => handleHtmlDesignCustomizationChange(field, e.target.value)} placeholder="#000000" size="small" fullWidth label={getFieldLabel(field)} />
          </Box>
        ) : (
          <TextField fullWidth multiline={isMultiline} rows={isMultiline ? 3 : 1} value={value || ""} onChange={(e) => handleHtmlDesignCustomizationChange(field, e.target.value)} label={getFieldLabel(field)} type={fieldType === "url" ? "url" : "text"} size="small" />
        )}
      </Box>
    );
  };

  return (
    <Box component="form" sx={{ mt: 3 }} noValidate autoComplete="off">
      <Typography variant="h6" gutterBottom>
        Email Actions
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="action-label">Action</InputLabel>
        <Select labelId="action-label" id="action-select" value={action} label="Action" onChange={(e) => handleActionChange(e.target.value as "Draft" | "Send" | "Update" | "Load" | "Delete")}>
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Send">Send</MenuItem>
          <MenuItem value="Update">Update</MenuItem>
          <MenuItem value="Load">Load</MenuItem>
          <MenuItem value="Delete">Delete</MenuItem>
        </Select>
      </FormControl>

      {action === "Draft" && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="request-type-label">Request Type</InputLabel>
            <Select labelId="request-type-label" id="request-type-select" value={requestType} label="Request Type" onChange={(e) => handleRequestTypeChange(e.target.value as "Raw HTML" | "text" | "HTML Design")}>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="Raw HTML">Raw HTML</MenuItem>
              <MenuItem value="HTML Design">HTML Design</MenuItem>
            </Select>
          </FormControl>

          {/* Show Email Title and Question for non-HTML Design modes */}
          {requestType !== "HTML Design" && (
            <>
              <IsolatedTextField fullWidth label="Email Title" value={emailTitle} onDebouncedChange={handleDebouncedEmailTitleChange} sx={{ mb: 2 }} />

              <IsolatedTextField fullWidth label="Question" value={question} onDebouncedChange={handleDebouncedQuestionChange} multiline rows={4} sx={{ mb: 2 }} />
            </>
          )}

          {/* HTML Design Mode Interface */}
          {requestType === "HTML Design" && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Palette color="primary" />
                HTML Design Mode
              </Typography>

              {/* Design Option Selector */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="design-option-label">Design Option</InputLabel>
                <Select labelId="design-option-label" value={designOption} label="Design Option" onChange={(e) => handleDesignOptionChange(e.target.value as "Templates" | "Designs")}>
                  <MenuItem value="Templates">Templates</MenuItem>
                  <MenuItem value="Designs">Designs</MenuItem>
                </Select>
              </FormControl>

              {/* Templates Selection */}
              {designOption === "Templates" && (
                <Autocomplete
                  options={templates}
                  getOptionLabel={(option) => formatTemplateOption(option)}
                  loading={designLoading}
                  value={selectedHtmlTemplate}
                  onChange={(event, newValue) => {
                    handleHtmlTemplateChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Email Templates"
                      placeholder="Select a template for your email"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {designLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  sx={{ mb: 2 }}
                />
              )}

              {/* Designs Selection */}
              {designOption === "Designs" && (
                <Autocomplete
                  options={designs}
                  getOptionLabel={(option) => formatDesignOption(option)}
                  loading={designLoading}
                  value={selectedDraftDesign}
                  onChange={(event, newValue) => {
                    handleDraftDesignChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Saved Designs"
                      placeholder="Select a design for your email"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {designLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  sx={{ mb: 2 }}
                />
              )}

              {/* Customization Fields for Templates */}
              {designOption === "Templates" && selectedHtmlTemplate && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Edit fontSize="small" />
                    Customize Design Fields
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {Object.keys(selectedHtmlTemplate.customizableFields).map((field) => renderHtmlDesignCustomizationField(field, htmlDesignCustomizations[field as keyof typeof htmlDesignCustomizations] || ""))}
                </Box>
              )}

              {/* Customization Fields for Designs */}
              {designOption === "Designs" && selectedDraftDesign && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Edit fontSize="small" />
                    Customize Design Fields
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {Object.keys(selectedDraftDesign.customizations).map((field) => renderCustomizationField(field, draftCustomizations[field as keyof typeof draftCustomizations] || ""))}
                </Box>
              )}

              {/* Question Field - Always show for HTML Design */}
              {(selectedHtmlTemplate || selectedDraftDesign) && (
                <>
                  <TextField fullWidth label="Question" value={htmlDesignQuestion} onChange={(e) => handleHtmlDesignQuestionChange(e.target.value)} multiline rows={4} sx={{ mb: 2 }} placeholder="Describe what you want the AI to generate for this email..." />

                  {/* View Mode Toggle */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      View Mode:
                    </Typography>
                    <FormControl size="small">
                      <Select value={viewMode} onChange={(e) => handleViewModeChange(e.target.value as "Raw HTML" | "Preview")}>
                        <MenuItem value="Raw HTML">Raw HTML</MenuItem>
                        <MenuItem value="Preview">Preview</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </>
              )}
            </Box>
          )}

          <Button
            variant="contained"
            onClick={requestType === "HTML Design" ? handleSubmitHtmlDesign : useDesignInDraft ? handleSubmitWithDesign : handleSubmit}
            fullWidth
            disabled={loading || (requestType === "HTML Design" && !selectedHtmlTemplate && !selectedDraftDesign)}
            startIcon={requestType === "HTML Design" || useDesignInDraft ? <Palette /> : undefined}
          >
            {loading ? <CircularProgress size={24} /> : requestType === "HTML Design" ? "Generate HTML Design" : useDesignInDraft ? "Generate with Design" : "Generate"}
          </Button>
        </>
      )}

      {action === "Update" && aiResponse && (
        <>
          <TextField fullWidth label="Update Request" value={updateRequest} onChange={(e) => handleUpdateRequestChange(e.target.value)} multiline rows={4} sx={{ mb: 2 }} />
          <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </>
      )}

      {action === "Send" && aiResponse && (
        <>
          <IsolatedTextField fullWidth label="Email Subject" value={emailTitle} onDebouncedChange={handleDebouncedEmailTitleChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Send To Email Address" value={sendToEmail} onChange={(e) => handleSendToEmailChange(e.target.value)} sx={{ mb: 2 }} type="email" />
          <Button variant="contained" onClick={handleSendEmail} fullWidth disabled={loading || !sendToEmail || !emailTitle} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : "Send Email"}
          </Button>
        </>
      )}

      {action === "Load" && (
        <>
          {pastEmailsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pastEmailsError}
            </Alert>
          )}

          <Autocomplete
            options={pastEmails}
            getOptionLabel={(option) => formatEmailOption(option)}
            loading={pastEmailsLoading}
            value={selectedPastEmail}
            onChange={(event, newValue) => {
              handlePastEmailChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Past Emails"
                placeholder="Select an email to load"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {pastEmailsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={() => selectedPastEmail && handleLoadEmail(selectedPastEmail._id)} fullWidth disabled={loading || !selectedPastEmail}>
              {loading ? <CircularProgress size={20} /> : "Preview Email"}
            </Button>

            <Button variant="contained" color="error" onClick={() => selectedPastEmail && handleDeleteEmail(selectedPastEmail._id)} fullWidth disabled={loading || !selectedPastEmail}>
              {loading ? <CircularProgress size={20} /> : "Delete Email"}
            </Button>
          </Box>
        </>
      )}

      {action === "Delete" && (
        <>
          {pastEmailsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pastEmailsError}
            </Alert>
          )}

          <Autocomplete
            options={pastEmails}
            getOptionLabel={(option) => formatEmailOption(option)}
            loading={pastEmailsLoading}
            value={selectedPastEmail}
            onChange={(event, newValue) => {
              handlePastEmailChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Past Emails"
                placeholder="Select an email to delete"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {pastEmailsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={() => selectedPastEmail && handleLoadEmail(selectedPastEmail._id)} fullWidth disabled={loading || !selectedPastEmail}>
              {loading ? <CircularProgress size={20} /> : "Preview Email"}
            </Button>

            <Button variant="contained" color="error" onClick={() => selectedPastEmail && handleDeleteEmail(selectedPastEmail._id)} fullWidth disabled={loading || !selectedPastEmail}>
              {loading ? <CircularProgress size={20} /> : "Delete Email"}
            </Button>
          </Box>
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {aiResponse && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generated Email:
          </Typography>

          {/* View Mode Toggle for HTML Design */}
          {requestType === "HTML Design" && (
            <Box sx={{ mb: 2 }}>
              <FormControl size="small">
                <Select value={viewMode} onChange={(e) => handleViewModeChange(e.target.value as "Raw HTML" | "Preview")}>
                  <MenuItem value="Raw HTML">Raw HTML</MenuItem>
                  <MenuItem value="Preview">Preview</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {isEditingResponse ? (
            <>
              <TextField fullWidth label="Edit Generated Email" value={editableAiResponse} onChange={(e) => setEditableAiResponse(e.target.value)} multiline rows={10} sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="outlined" onClick={handleCancelEdit} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveEdit} disabled={loading}>
                  Save
                </Button>
              </Box>
            </>
          ) : (
            <>
              {requestType === "HTML Design" && viewMode === "Preview" ? (
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    overflow: "hidden",
                    maxHeight: 600,
                    overflowY: "auto",
                    mb: 2,
                  }}
                >
                  <iframe
                    srcDoc={aiResponse}
                    style={{
                      width: "125%",
                      height: "625px",
                      border: "none",
                      transform: "scale(0.8)",
                      transformOrigin: "top left",
                    }}
                    title="Email Preview"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    whiteSpace: "pre-wrap",
                    cursor: "pointer",
                    mb: 2,
                  }}
                  onClick={handleEditClick}
                >
                  {aiResponse}
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="outlined" onClick={handleEditClick} disabled={loading}>
                  Edit
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
