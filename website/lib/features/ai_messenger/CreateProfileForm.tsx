"use client";

import React from "react";
import { Button, TextField, Stack, Box, Autocomplete, Chip } from "@mui/material";
import { useCreateProfileFormState } from "./states/CreateProfileFormState";

interface CreateProfileFormProps {
  onProfileAdded: (newProfile: { name: string; systemPrompt: string; files: string[] }) => void;
  availableFiles: string[];
}

export default function CreateProfileForm({ onProfileAdded, availableFiles }: CreateProfileFormProps) {
  const { showForm, setShowForm, newProfileName, setNewProfileName, newSystemPrompt, setNewSystemPrompt, newFiles, setNewFiles, handleAddProfile } = useCreateProfileFormState({ onProfileAdded });

  return (
    <Box sx={{ my: 4, textAlign: "center" }}>
      {!showForm && (
        <Button variant="contained" onClick={() => setShowForm(true)} sx={{ mb: 2 }}>
          Create New Profile
        </Button>
      )}

      {showForm && (
        <Box sx={{ mt: 2, p: 2, border: "1px dashed grey" }}>
          <TextField label="Profile Name" fullWidth margin="normal" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} />
          <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={newSystemPrompt} onChange={(e) => setNewSystemPrompt(e.target.value)} />
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              id="new-profile-files-autocomplete"
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
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleAddProfile}>
              Add Profile
            </Button>
            <Button variant="outlined" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
