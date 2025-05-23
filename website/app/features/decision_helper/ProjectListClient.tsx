"use client";
import React from "react";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import CardComponent from "./CardComponent";
import { Project } from "./types";
import styles from "./DecisionHelper.module.css";
import { useProjectList } from "./hooks/useProjectList";

export default function ProjectListClient({ initialProjects = [] }: { initialProjects: Project[] }) {
  const { projects, showForm, newProject, editingId, editedProject, loading, handleAddCard, handleFormChange, handleEditFormChange, handleFormSubmit, handleEditFormSubmit, handleDelete, handleEdit, setShowForm, setEditingId } = useProjectList({
    initialProjects,
  });

  return (
    <Box className={styles.listContainer}>
      <Button variant="contained" color="primary" onClick={handleAddCard} sx={{ mb: 2 }}>
        Add Project
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.formBox}>
          <TextField name="name" label="Project Name" value={newProject.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField name="description" label="Description" value={newProject.description} onChange={handleFormChange} fullWidth margin="normal" required multiline rows={4} />
          <TextField name="dueDate" label="Due Date" type="date" value={newProject.dueDate} onChange={handleFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
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
      <Box className={styles.cardsColumnContainer}>
        {loading ? (
          <CircularProgress />
        ) : (
          projects.map((project: Project) =>
            editingId === project.id ? (
              <Box component="form" key={project.id} onSubmit={handleEditFormSubmit} className={styles.formBox}>
                <TextField name="name" label="Edit Project Name" value={editedProject?.name || ""} onChange={handleEditFormChange} fullWidth margin="normal" required />
                <TextField name="description" label="Edit Description" value={editedProject?.description || ""} onChange={handleEditFormChange} fullWidth margin="normal" required multiline rows={4} />
                <TextField name="dueDate" label="Edit Due Date" type="date" value={editedProject?.dueDate || ""} onChange={handleEditFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
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
              <CardComponent key={`${project.id}-${project.dueDate}`} item={project} onEdit={() => handleEdit(project)} onDelete={handleDelete} className={styles.projectCardItem} type="project" />
            )
          )
        )}
      </Box>
    </Box>
  );
}
