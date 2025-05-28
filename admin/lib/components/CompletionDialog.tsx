"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from "@mui/material";

interface CompletionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  value: string;
  loading?: boolean;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  saveButtonText?: string;
  disabled?: boolean;
}

export default function CompletionDialog({ open, onClose, onSave, title, value, loading = false, label = "Complete Description", placeholder = "Enter completion details...", multiline = true, rows = 4, saveButtonText = "Save", disabled = false }: CompletionDialogProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state with prop when dialog opens or value changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value, open]);

  const handleSave = () => {
    onSave(localValue);
  };

  const handleClose = () => {
    setLocalValue(value); // Reset to original value on cancel
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label={label} fullWidth variant="outlined" value={localValue} onChange={(e) => setLocalValue(e.target.value)} placeholder={placeholder} multiline={multiline} rows={multiline ? rows : undefined} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={disabled || loading}>
          {loading ? <CircularProgress size={20} /> : saveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
