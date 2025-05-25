"use client";
import React from "react";
import { Box, Button, TextField, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import CardComponent from "./CardComponent";
import { Project, Task } from "./types";
import styles from "./DecisionHelper.module.css";
import { useProjectList } from "./hooks/useProjectList";
import CompletionDialog from "@/lib/components/CompletionDialog";

export default function ProjectListClient({ initialProjects = [] }: { initialProjects: Project[] }) {
  const {
    projects,
    showForm,
    newProject,
    editingId,
    editedProject,
    loading,
    statusFilter,
    sortOrder,
    hidePastDates,
    completionDialogOpen,
    completionDescription,
    completingProjectId,
    handleAddCard,
    handleFormChange,
    handleEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleComplete,
    handleCompletionSave,
    handleCompletionCancel,
    setShowForm,
    setEditingId,
    setStatusFilter,
    setSortOrder,
    setHidePastDates,
    setCompletionDescription,
  } = useProjectList({
    initialProjects,
  });

  return (
    <Box className={styles.listContainer}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select labelId="status-filter-label" id="status-filter" value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as "All" | "Completed" | "Not Completed")}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Not Completed">Not Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-order-label">Order</InputLabel>
          <Select labelId="sort-order-label" id="sort-order" value={sortOrder} label="Order" onChange={(e) => setSortOrder(e.target.value as "Ascending" | "Descending")}>
            <MenuItem value="Ascending">Ascending</MenuItem>
            <MenuItem value="Descending">Descending</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel control={<Checkbox checked={hidePastDates} onChange={(e) => setHidePastDates(e.target.checked)} />} label="Hide past dates" />
      </Box>

      <Button variant="contained" color="primary" onClick={handleAddCard} sx={{ mb: 2 }}>
        Add Project
      </Button>

      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.formBox}>
          <TextField name="name" label="Project Name" value={newProject.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField name="description" label="Description" value={newProject.description} onChange={handleFormChange} fullWidth margin="normal" required multiline rows={4} />
          <TextField name="dueDate" label="Due Date" type="date" value={newProject.dueDate} onChange={handleFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
          <FormControlLabel control={<Checkbox name="is_completed" checked={newProject.is_completed || false} onChange={handleFormChange} />} label="Completed" />
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
                <FormControlLabel control={<Checkbox name="is_completed" checked={editedProject?.is_completed || false} onChange={handleEditFormChange} />} label="Completed" />
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
              <CardComponent key={`${project.id}-${project.dueDate}`} item={project} onEdit={() => handleEdit(project as Project)} onDelete={handleDelete} onToggleComplete={handleToggleComplete as (item: Project | Task) => void} className={styles.projectCardItem} type="project" />
            )
          )
        )}
      </Box>

      <CompletionDialog open={completionDialogOpen} onClose={handleCompletionCancel} onSave={handleCompletionSave} title="Complete Project" value={completionDescription} loading={loading} />
    </Box>
  );
}
