import React from "react";
import { Box, Typography, CircularProgress, Button, TextField } from "@mui/material";
import { useEssentialListClient } from "./hooks/useEssentialListClient";
import CardComponent from "./CardComponent";
import EssentialForm from "./EssentialForm";
import { Essential } from "./types";
import styles from "./DecisionHelper.module.css";

interface EssentialListClientProps {
  initialEssentials: Essential[];
}

export default function EssentialListClient({ initialEssentials }: EssentialListClientProps) {
  const {
    dataToDisplay,
    loading,
    error,
    showForm,
    newEssential,
    editingEssentialId,
    editedEssential,
    essentialDecisions,
    handleAddEssential,
    handleSaveEssential,
    handleCancelForm,
    handleEditEssential,
    handleDeleteClick,
    handleDecision,
    handleCompleteEssential,
    handleUpdateNewEssential,
    handleUpdateEditedEssential,
  } = useEssentialListClient({ initialEssentials });

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (name === "completed_times" || name === "interval") {
      parsedValue = parseInt(value) || 0;
    }

    handleUpdateEditedEssential({ [name]: parsedValue });
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveEssential();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box className={styles.essentialContainer}>
      <Button variant="contained" onClick={handleAddEssential}>
        Add Essential
      </Button>

      {showForm && !editingEssentialId && <EssentialForm essential={newEssential} onEssentialChange={handleUpdateNewEssential} onSave={handleSaveEssential} onCancel={handleCancelForm} />}

      {(!dataToDisplay || dataToDisplay.length === 0) && !showForm ? (
        <Typography>No essential items found.</Typography>
      ) : (
        dataToDisplay.map((essential) => {
          const isEditing = editingEssentialId === essential.id;

          if (isEditing) {
            return (
              <Box component="form" onSubmit={handleEditFormSubmit} key={`edit-${essential.id}`} className={styles.formBox}>
                <TextField name="title" label="Edit Essential Title" value={editedEssential?.title || ""} onChange={handleEditFormChange} fullWidth margin="normal" required />
                <TextField name="description" label="Description" value={editedEssential?.description || ""} onChange={handleEditFormChange} fullWidth margin="normal" multiline rows={3} required />
                <TextField name="due_date" label="Due Date" type="date" value={editedEssential?.due_date || ""} onChange={handleEditFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
                <TextField name="interval" label="Interval (days)" type="number" value={editedEssential?.interval || 1} onChange={handleEditFormChange} fullWidth margin="normal" required inputProps={{ min: 1 }} />
                <TextField name="completed_times" label="Completed Times" type="number" value={editedEssential?.completed_times || 0} onChange={handleEditFormChange} fullWidth margin="normal" inputProps={{ min: 0 }} />
                <Box className={styles.formButtonsBox}>
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                  </Button>
                  <Button type="button" variant="outlined" onClick={handleCancelForm} disabled={loading}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            );
          }

          return (
            <Box key={essential.id} className={styles.essentialItemContainer}>
              <CardComponent item={essential} type="essential" onComplete={handleCompleteEssential} onDecision={handleDecision} decision={essentialDecisions[essential.id.toString()]} onEdit={() => handleEditEssential(essential)} onDelete={handleDeleteClick} />
            </Box>
          );
        })
      )}
    </Box>
  );
}
