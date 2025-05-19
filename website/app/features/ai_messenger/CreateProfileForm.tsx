"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Paper, Typography, Autocomplete, Chip } from "@mui/material";

interface CreateProfileFormProps {
  availableFiles: string[];
  onProfileAdded: (profile: { name: string; systemPrompt: string; files: string[] }) => void;
}

export default function CreateProfileForm({ availableFiles, onProfileAdded }: CreateProfileFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");
  const [newFiles, setNewFiles] = useState<string[]>([]);

  const handleAddProfile = () => {
    if (newProfileName && newSystemPrompt) {
      // Call the prop function to add the profile to the parent state
      onProfileAdded({
        name: newProfileName,
        systemPrompt: newSystemPrompt,
        files: newFiles,
      });

      // Clear the form and hide it
      setNewProfileName("");
      setNewSystemPrompt("");
      setNewFiles([]);
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Button variant="contained" onClick={() => setShowForm(true)}>
          Add New Profile
        </Button>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Create Profile
      </Typography>
      <TextField label="Profile Name" fullWidth margin="normal" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} />
      <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={newSystemPrompt} onChange={(e) => setNewSystemPrompt(e.target.value)} />
      {/* File selection using Autocomplete */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Attached Files:</Typography>
        <Autocomplete
          multiple
          id="files-autocomplete"
          options={availableFiles}
          getOptionLabel={(option) => option}
          value={newFiles}
          onChange={(event, newValue) => {
            setNewFiles(newValue);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" label="Select Files" placeholder="Choose files" />}
          renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />)}
        />
      </Box>
      <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={handleAddProfile}>
        Create Profile
      </Button>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </Paper>
  );
}
