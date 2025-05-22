import React from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Alert } from "@mui/material";
import { useAIEmailerPageState } from "./states/AIEmailerPageState";

interface EmailFormProps extends ReturnType<typeof useAIEmailerPageState> {}

export default function EmailForm({
  requestType,
  emailTitle,
  question,
  aiResponse,
  loading,
  error,
  action,
  updateRequest,
  sendToEmail,
  handleRequestTypeChange,
  handleEmailTitleChange,
  handleQuestionChange,
  handleActionChange,
  handleUpdateRequestChange,
  handleSendToEmailChange,
  handleSubmit,
  handleSendEmail,
}: EmailFormProps) {
  return (
    <Box component="form" sx={{ mt: 3 }} noValidate autoComplete="off">
      <Typography variant="h6" gutterBottom>
        Email Actions
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="action-label">Action</InputLabel>
        <Select labelId="action-label" id="action-select" value={action} label="Action" onChange={(e) => handleActionChange(e.target.value as "Draft" | "Send" | "Update")}>
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Send">Send</MenuItem>
          <MenuItem value="Update">Update</MenuItem>
        </Select>
      </FormControl>

      {action === "Draft" && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="request-type-label">Request Type</InputLabel>
            <Select labelId="request-type-label" id="request-type-select" value={requestType} label="Request Type" onChange={(e) => handleRequestTypeChange(e.target.value as "Raw HTML" | "text")}>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="Raw HTML">Raw HTML</MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth label="Email Title" value={emailTitle} onChange={(e) => handleEmailTitleChange(e.target.value)} sx={{ mb: 2 }} />

          <TextField fullWidth label="Question" value={question} onChange={(e) => handleQuestionChange(e.target.value)} multiline rows={4} sx={{ mb: 2 }} />

          <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Generate"}
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
          <TextField fullWidth label="Send To Email Address" value={sendToEmail} onChange={(e) => handleSendToEmailChange(e.target.value)} sx={{ mb: 2 }} type="email" />
          <Button variant="contained" onClick={handleSendEmail} fullWidth disabled={loading || !sendToEmail} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : "Send Email"}
          </Button>
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
          <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: "4px", whiteSpace: "pre-wrap" }}>{aiResponse}</Box>
        </Box>
      )}
    </Box>
  );
}
