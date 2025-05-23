"use client";

import React from "react";
import { Box, TextField, Button, Stack, Typography, Autocomplete, Chip, Card, CardContent } from "@mui/material";
import { MessageProfile } from "./types";
import styles from "./AiMessenger.module.css";

interface ProfileFormProps {
  initialProfile?: MessageProfile | null;
  onSubmit: (profileData: { name: string; systemPrompt: string; files: string[] }) => void;
  availableFiles: string[];
  mode: "create" | "edit";
  onCancel?: () => void;
  name: string;
  systemPrompt: string;
  selectedFiles: string[];
  onNameChange: (name: string) => void;
  onSystemPromptChange: (prompt: string) => void;
  onSelectedFilesChange: (files: string[]) => void;
}

export default function ProfileForm({ initialProfile, onSubmit, availableFiles, mode, onCancel, name, systemPrompt, selectedFiles, onNameChange, onSystemPromptChange, onSelectedFilesChange }: ProfileFormProps) {
  const handleInternalSave = () => {
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
    <Card sx={{ mb: 4 }} className={styles.cardContainer}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {formTitle}
        </Typography>
        <TextField label="Profile Name" fullWidth margin="normal" value={name} onChange={(e) => onNameChange(e.target.value)} />
        <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={systemPrompt} onChange={(e) => onSystemPromptChange(e.target.value)} />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Attached Files:</Typography>
          <Autocomplete
            multiple
            id={`files-autocomplete-${initialProfile?.id || "new"}-${mode}`}
            options={availableFiles}
            getOptionLabel={(option) => option}
            value={selectedFiles}
            onChange={(event, newValue) => {
              onSelectedFilesChange(newValue);
            }}
            renderInput={(params) => <TextField {...params} variant="outlined" label="Select Files" placeholder="Choose files" />}
            renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />)}
          />
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }} className={styles.formButtonsBox}>
          <Button variant="contained" onClick={handleInternalSave}>
            {submitButtonText}
          </Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
