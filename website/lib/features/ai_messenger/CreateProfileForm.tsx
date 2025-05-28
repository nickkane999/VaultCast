"use client";

import React from "react";
import { Button, TextField, Stack, Box, Autocomplete, Chip } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setShowCreateForm, updateEditForm, clearEditForm, createProfile } from "./store/aiMessengerSlice";

interface CreateProfileFormProps {
  onProfileAdded: (newProfile: { name: string; systemPrompt: string; files: string[] }) => void;
  availableFiles: string[];
}

export default function CreateProfileForm({ onProfileAdded, availableFiles }: CreateProfileFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showCreateForm, editForm, loading } = useSelector((state: RootState) => state.aiMessenger);

  const handleAddProfile = async () => {
    if (editForm.name.trim() && editForm.systemPrompt.trim()) {
      try {
        const resultAction = await dispatch(
          createProfile({
            name: editForm.name,
            systemPrompt: editForm.systemPrompt,
            files: editForm.files,
          })
        );

        if (createProfile.fulfilled.match(resultAction)) {
          onProfileAdded({
            name: editForm.name,
            systemPrompt: editForm.systemPrompt,
            files: editForm.files,
          });
          dispatch(clearEditForm());
        }
      } catch (error) {
        console.error("Error creating profile:", error);
      }
    }
  };

  return (
    <Box sx={{ my: 4, textAlign: "center" }}>
      {!showCreateForm && (
        <Button variant="contained" onClick={() => dispatch(setShowCreateForm(true))} sx={{ mb: 2 }}>
          Create New Profile
        </Button>
      )}

      {showCreateForm && (
        <Box sx={{ mt: 2, p: 2, border: "1px dashed grey" }}>
          <TextField label="Profile Name" fullWidth margin="normal" value={editForm.name} onChange={(e) => dispatch(updateEditForm({ name: e.target.value }))} />
          <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={editForm.systemPrompt} onChange={(e) => dispatch(updateEditForm({ systemPrompt: e.target.value }))} />
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              id="new-profile-files-autocomplete"
              options={availableFiles}
              getOptionLabel={(option) => option}
              value={editForm.files}
              onChange={(event, newValue) => {
                dispatch(updateEditForm({ files: newValue }));
              }}
              renderInput={(params) => <TextField {...params} variant="outlined" label="Select Files" placeholder="Choose files" />}
              renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />)}
            />
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleAddProfile} disabled={loading || !editForm.name.trim() || !editForm.systemPrompt.trim()}>
              {loading ? "Adding..." : "Add Profile"}
            </Button>
            <Button variant="outlined" onClick={() => dispatch(setShowCreateForm(false))}>
              Cancel
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
