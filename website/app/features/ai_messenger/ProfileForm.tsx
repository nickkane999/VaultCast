"use client";

import React from "react";
import { Box, TextField, Button, Stack, Typography, Autocomplete, Chip, Card, CardContent } from "@mui/material";
import { MessageProfile } from "./types";
import { useProfileFormState } from "./states/ProfileFormState";
import styles from "./AiMessenger.module.css";

interface ProfileFormProps {
  initialProfile?: MessageProfile | null;
  onSubmit: (profileData: { name: string; systemPrompt: string; files: string[] }) => void;
  availableFiles: string[];
  mode: "create" | "edit";
  onCancel?: () => void;
}

export default function ProfileForm({ initialProfile, onSubmit, availableFiles, mode, onCancel }: ProfileFormProps) {
  const { name, setName, systemPrompt, setSystemPrompt, selectedFiles, setSelectedFiles, handleSave } = useProfileFormState({ initialProfile, onSubmit });

  const formTitle = mode === "create" ? "Create Profile" : "Edit Profile";
  const submitButtonText = mode === "create" ? "Add Profile" : "Save Changes";

  return (
    <Card sx={{ mb: 4 }} className={styles.cardContainer}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {formTitle}
        </Typography>
        <TextField label="Profile Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Attached Files:</Typography>
          <Autocomplete
            multiple
            id={`files-autocomplete-${initialProfile?.id || "new"}`}
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
          <Button variant="contained" onClick={handleSave}>
            {submitButtonText}
          </Button>
          {mode === "create" && onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
