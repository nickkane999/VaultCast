"use client";
import React from "react";
import { Box, Button, Card, CardContent, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import CardComponent from "./CardComponent";
import { CommonDecision } from "./types";
import styles from "./DecisionHelper.module.css";
import { useCommonDecisionListState } from "./states/CommonDecisionListState";

export default function CommonDecisionList({ initialDecisions = [] }: { initialDecisions: CommonDecision[] }) {
  const { decisions, showForm, newDecision, editingId, editedDecision, loading, commonDecisionResults, handleAddCard, handleFormChange, handleEditFormChange, handleFormSubmit, handleEditFormSubmit, handleDelete, handleEdit, handleDecision, setShowForm, setEditingId } = useCommonDecisionListState({
    initialDecisions,
  });

  return (
    <Box className={styles.listContainer}>
      <Button variant="contained" color="primary" onClick={handleAddCard} sx={{ mb: 2 }}>
        Add card
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.formBox}>
          <TextField name="name" label="Decision name" value={newDecision.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <Box className={styles.formButtonsBox}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outlined" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
      <Box className={styles.cardsRowContainer}>
        {decisions.map((decision: CommonDecision) =>
          editingId === decision.id ? (
            <Box component="form" key={decision.id} onSubmit={handleEditFormSubmit} className={styles.formBox}>
              <TextField name="name" label="Edit Decision name" value={editedDecision.name} onChange={handleEditFormChange} fullWidth margin="normal" required />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? "Saving..." : "Update"}
                </Button>
                <Button type="button" variant="outlined" onClick={() => setEditingId(null)} disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <CardComponent key={decision.id} item={decision} onEdit={() => handleEdit(decision.id, decision.name)} onDelete={handleDelete} onDecision={handleDecision} decision={commonDecisionResults[decision.id]} />
          )
        )}
      </Box>
    </Box>
  );
}
