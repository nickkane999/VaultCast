"use client";

import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Paper, Typography, Autocomplete, Chip, Stack } from "@mui/material";
import { MessageProfile } from "./types";
import styles from "./AiMessenger.module.css"; // Import styles

interface ProfileFormProps {
  initialProfile?: MessageProfile; // Optional initial data for editing
  mode: "create" | "edit";
  availableFiles: string[];
  onSubmit: (profileData: { name: string; systemPrompt: string; files: string[] }) => void;
  onCancel: () => void;
}

export default function ProfileForm({ initialProfile, mode, availableFiles, onSubmit, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [systemPrompt, setSystemPrompt] = useState(initialProfile?.systemPrompt || "");
  const [selectedFiles, setSelectedFiles] = useState<string[]>(initialProfile?.files || []);

  // Update form state if initialProfile changes (for editing different profiles)
  useEffect(() => {
    setName(initialProfile?.name || "");
    setSystemPrompt(initialProfile?.systemPrompt || "");
    setSelectedFiles(initialProfile?.files || []);
  }, [initialProfile]);

  const handleSave = () => {
    if (name && systemPrompt) {
      onSubmit({
        name: name,
        systemPrompt: systemPrompt,
        files: selectedFiles,
      });
    }
  };

  const formTitle = mode === "create" ? "Create Profile" : "Edit Profile";
  const submitButtonText = mode === "create" ? "Add Profile" : "Save Changes";

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }} className={styles.formPaper}>
      {" "}
      {/* Apply formPaper style */}
      <Typography variant="h6" gutterBottom>
        {formTitle}
      </Typography>
      <TextField label="Profile Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
      {/* File selection using Autocomplete */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Attached Files:</Typography>
        <Autocomplete
          multiple
          id="files-autocomplete"
          options={availableFiles}
          getOptionLabel={(option) => option}
          value={selectedFiles}
          onChange={(event, newValue) => {
            setSelectedFiles(newValue);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" label="Select Files" placeholder="Choose files" />}
          renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />)}
        />
      </Box>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} className={styles.formButtonsBox}>
        {" "}
        {/* Apply formButtonsBox style */}
        <Button variant="contained" onClick={handleSave}>
          {submitButtonText}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
