"use client";

import React from "react";
import { Box, Typography, Card, CardContent, CardActions, Button, Chip, TextField, Stack, Autocomplete } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { MessengerProfileCardProps } from "./types";
import styles from "./AiMessenger.module.css";

export default function MessengerProfileCard({
  profile,
  onEditClick,
  onDeleteClick,
  onSendClick,
  availableFiles,
  isEditing,
  editedName,
  editedSystemPrompt,
  editedFiles,
  onNameChange,
  onSystemPromptChange,
  onFilesChange,
  onSaveClick,
  onCancelClick,
  question,
  onQuestionChange,
  aiResponse,
  loading = false,
}: MessengerProfileCardProps) {
  return (
    <Card sx={{ width: "100%", mt: 3 }} className={styles.cardContainer}>
      <Box className={styles.cardActionsTopRight}>
        {!isEditing && (
          <>
            <IconButton onClick={onEditClick} aria-label="edit" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={onDeleteClick} aria-label="delete" size="small">
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>
      <CardContent>
        {isEditing ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Edit Profile: {profile.name}
            </Typography>
            <TextField label="Profile Name" fullWidth margin="normal" value={editedName} onChange={(e) => onNameChange(e.target.value)} />
            <TextField label="System Prompt" fullWidth margin="normal" multiline rows={4} value={editedSystemPrompt} onChange={(e) => onSystemPromptChange(e.target.value)} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Attached Files:</Typography>
              <Autocomplete
                multiple
                id={`files-autocomplete-${profile.id}`}
                options={availableFiles}
                getOptionLabel={(option) => option}
                value={editedFiles}
                onChange={(event, newValue) => {
                  onFilesChange(newValue);
                }}
                renderInput={(params) => <TextField {...params} variant="outlined" label="Select Files" placeholder="Choose files" />}
                renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />)}
              />
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }} className={styles.formButtonsBox}>
              <Button variant="contained" onClick={onSaveClick}>
                Save
              </Button>
              <Button variant="outlined" onClick={onCancelClick}>
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
              <Typography variant="subtitle1">Ask a Question:</Typography>
              <TextField
                label="Your Question"
                fullWidth
                margin="normal"
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && question.trim()) {
                    e.preventDefault();
                    onSendClick(question);
                  }
                }}
                multiline
                rows={2}
              />
              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  onSendClick(question);
                }}
                disabled={!question.trim() || loading}
                type="button"
              >
                {" "}
                {loading ? "Sending..." : "Send"}{" "}
              </Button>
              <Box sx={{ mt: 2, border: "1px dashed grey", p: 2 }}>
                {" "}
                <Typography variant="body2">AI Response:</Typography>{" "}
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {" "}
                  {loading && !aiResponse ? "Thinking..." : aiResponse || "Ask a question to get started!"}{" "}
                </Typography>{" "}
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
