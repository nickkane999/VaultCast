"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, CardActions, Button, Chip, TextField, Stack, Autocomplete } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { MessageProfile } from "./types";
import styles from "./AiMessenger.module.css";

interface MessengerProfileCardProps {
  profile: MessageProfile;
  onUpdate: (profileId: string, updatedData: { name: string; systemPrompt: string; files: string[] }) => Promise<void>;
  onDelete: (profileId: string) => void;
  availableFiles: string[];
}

export default function MessengerProfileCard({ profile, onUpdate, onDelete, availableFiles }: MessengerProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedSystemPrompt, setEditedSystemPrompt] = useState(profile.systemPrompt);
  const [editedFiles, setEditedFiles] = useState<string[]>(profile.files || []);

  useEffect(() => {
    setEditedName(profile.name);
    setEditedSystemPrompt(profile.systemPrompt);
    setEditedFiles(profile.files || []);
  }, [profile]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (editedName && editedSystemPrompt) {
      await onUpdate(profile.id, {
        name: editedName,
        systemPrompt: editedSystemPrompt,
        files: editedFiles,
      });
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setEditedName(profile.name);
    setEditedSystemPrompt(profile.systemPrompt);
    setEditedFiles(profile.files || []);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(profile.id);
  };

  return (
    <Card sx={{ width: "100%" }} className={styles.cardContainer}>
      <Box className={styles.cardActionsTopRight}>
        {!isEditing && (
          <>
            <IconButton onClick={handleEditClick} aria-label="edit" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDeleteClick} aria-label="delete" size="small">
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>
      <CardContent>
        {isEditing ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Edit Profile
            </Typography>
            <TextField label="Profile Name" fullWidth margin="normal" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={editedSystemPrompt} onChange={(e) => setEditedSystemPrompt(e.target.value)} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Attached Files:</Typography>
              <Autocomplete
                multiple
                id={`files-autocomplete-${profile.id}`}
                options={availableFiles}
                getOptionLabel={(option) => option}
                value={editedFiles}
                onChange={(event, newValue) => {
                  setEditedFiles(newValue);
                }}
                renderInput={(params) => <TextField {...params} variant="outlined" label="Select Files" placeholder="Choose files" />}
                renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />)}
              />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }} className={styles.formButtonsBox}>
              <Button variant="contained" onClick={handleSaveClick}>
                Save
              </Button>
              <Button variant="outlined" onClick={handleCancelClick}>
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6">{profile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              System Prompt: {profile.systemPrompt}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Files: {(profile.files || []).join(", ")}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Ask a Question (Placeholder):</Typography>
              <TextField label="Your Question" fullWidth margin="normal" disabled />
              <Button variant="outlined" sx={{ mt: 1 }} disabled>
                Send
              </Button>
              <Box sx={{ mt: 2, border: "1px dashed grey", p: 2 }}>
                <Typography variant="body2">AI Response Area</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
