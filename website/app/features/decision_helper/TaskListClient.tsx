"use client";
import React from "react";
import CardComponent from "./CardComponent";
import { Task, Event, CommonDecision } from "./types";
import { Button, TextField, Box, CircularProgress, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import styles from "./DecisionHelper.module.css";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { useTaskListClientState } from "./states/TaskListClientState";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function TaskListClient({ initialTasks = [] }: { initialTasks: Task[] }) {
  const {
    tasks,
    showForm,
    newTask,
    editingId,
    editedTask,
    loading,
    taskDecisions,
    tagFilter,
    statusFilter,
    availableTags,
    editedTaskTags,
    addTagInputValue,
    newTagInput,
    handleAddTaskCard,
    handleFormChange,
    handleEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleComplete,
    handleDecision,
    displayedTasks,
    handleAddTag,
    handleTagChange,
    setShowForm,
    setNewTask,
    setEditingId,
    setEditedTask,
    setTagFilter,
    setStatusFilter,
    setEditedTaskTags,
    setAddTagInputValue,
    setNewTagInput,
    notification,
    setNotification,
  } = useTaskListClientState({ initialTasks });

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <Box className={styles.listContainer}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="tag-filter-label">Tags</InputLabel>
          <Select labelId="tag-filter-label" id="tag-filter" value={tagFilter} label="Tags" onChange={(e) => setTagFilter(e.target.value as string)}>
            <MenuItem value="All">All</MenuItem>
            {availableTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select labelId="status-filter-label" id="status-filter" value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as "All" | "Completed" | "Not Completed")}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Not Completed">Not Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Button variant="contained" color="primary" onClick={handleAddTaskCard} sx={{ mb: 2 }}>
        Add Task
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.formBox}>
          <TextField name="name" label="Task name" value={newTask.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <FormControlLabel control={<Checkbox name="is_completed" checked={newTask.is_completed} onChange={handleFormChange} />} label="Completed" />
          <Autocomplete
            id="add-tags-autocomplete"
            options={availableTags}
            onChange={(_event, newValue: string | null) => {
              if (newValue && !newTask.tags.includes(newValue)) {
                setNewTask({ ...newTask, tags: [...newTask.tags, newValue] });
                setNewTagInput("");
              }
            }}
            freeSolo
            onInputChange={(_event, newInputValue) => {
              setNewTagInput(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add a Tag"
                value={newTagInput}
                onChange={(event) => setNewTagInput(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mt: 2, mb: 1 }}
          />
          <Button variant="outlined" onClick={handleAddTag} disabled={!newTagInput.trim()} sx={{ mt: 2, mb: 1, ml: 1 }}>
            Add Tag
          </Button>
          <Box sx={{ mb: 2 }}>
            {newTask.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => {
                  setNewTask((prev) => ({
                    ...prev,
                    tags: prev.tags.filter((t) => t !== tag),
                  }));
                }}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          <Box className={styles.formButtonsBox}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
            <Button type="button" variant="outlined" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
      <Box className={styles.cardsColumnContainer}>
        {displayedTasks.map((task: Task) =>
          editingId === task.id ? (
            <Box component="form" onSubmit={handleEditFormSubmit} key={task.id} className={styles.formBox}>
              <TextField name="name" label="Edit Task name" value={editedTask?.name || ""} onChange={handleEditFormChange} fullWidth margin="normal" required />
              <FormControlLabel control={<Checkbox name="is_completed" checked={editedTask?.is_completed || false} onChange={handleEditFormChange} />} label="Completed" />
              <Autocomplete
                multiple
                id="edit-tags-autocomplete"
                options={availableTags}
                value={editedTaskTags}
                onChange={(_event, newValue) => setEditedTaskTags(newValue)}
                freeSolo
                renderInput={(params) => <TextField {...params} label="Edit Tags" placeholder="Add a Tag" margin="normal" fullWidth />}
                sx={{ mt: 2, mb: 1 }}
              />
              <Box className={styles.formButtonsBox}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Update"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setEditingId(null);
                    setEditedTask(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <CardComponent key={task.id} item={task} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} onDecision={handleDecision} decision={taskDecisions[task.id]} />
          )
        )}
      </Box>
      {notification && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleCloseNotification}>
          <Alert onClose={handleCloseNotification} severity={notification.type || undefined} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
