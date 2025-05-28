"use client";
import React from "react";
import CardComponent from "./CardComponent";
import { Task, Event, CommonDecision, Project, Essential } from "./types";
import { Button, TextField, Box, CircularProgress, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import styles from "./DecisionHelper.module.css";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { useTaskListClient } from "./hooks/useTaskListClient";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CompletionDialog from "@/lib/components/CompletionDialog";
import IsolatedTextField from "@/lib/components/IsolatedTextField";

export default function TaskListClient({ initialTasks = [], initialProjects = [] }: { initialTasks: Task[]; initialProjects: Project[] }) {
  const {
    tasks,
    projects,
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
    notification,
    projectFilter,
    completionDialogOpen,
    completionDescription,
    completingTaskId,
    handleAddTaskCard,
    handleFormChange,
    handleDebouncedFormChange,
    handleProjectChange,
    handleEditProjectChange,
    handleEditFormChange,
    handleDebouncedEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleComplete,
    handleDecision,
    displayedTasks,
    handleAddTag,
    handleTagChange,
    handleProjectFilterChange,
    handleCompletionSave,
    handleCompletionCancel,
    setShowForm,
    setNewTask,
    setEditingId,
    setEditedTask,
    setTagFilter,
    setStatusFilter,
    setEditedTaskTags,
    setAddTagInputValue,
    setNewTagInput,
    setNotification,
    setCompletionDescription,
  } = useTaskListClient({ initialTasks, initialProjects });

  const handleCloseNotification = () => {
    setNotification(null);
  };

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
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="project-filter-label">Project</InputLabel>
          <Select labelId="project-filter-label" id="project-filter" value={projectFilter} label="Project" onChange={(e) => handleProjectFilterChange(e.target.value === "" ? "All" : (e.target.value as string))}>
            <MenuItem value="All">All</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
      </Box>
      <Button variant="contained" color="primary" onClick={handleAddTaskCard} sx={{ mb: 2 }}>
        Add Task
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.formBox}>
          <IsolatedTextField name="name" label="Task name" value={newTask.name} onDebouncedChange={handleDebouncedFormChange("name")} fullWidth margin="normal" required />
          <FormControlLabel control={<Checkbox name="is_completed" checked={newTask.is_completed} onChange={handleFormChange} />} label="Completed" />

          {/* Project Selection Dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="project-select-label">Associated Project (Optional)</InputLabel>
            <Select labelId="project-select-label" id="project-select" value={newTask.projectId || ""} label="Associated Project (Optional)" onChange={(e) => handleProjectChange(e.target.value === "" ? undefined : (e.target.value as string))}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                  setNewTask({ ...newTask, tags: newTask.tags.filter((t: string) => t !== tag) });
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
        {displayedTasks.map((task: Task) => {
          return editingId === task.id ? (
            <Box component="form" onSubmit={handleEditFormSubmit} key={task.id} className={styles.formBox}>
              <IsolatedTextField name="name" label="Edit Task name" value={editedTask?.name || ""} onDebouncedChange={handleDebouncedEditFormChange("name")} fullWidth margin="normal" required />
              <FormControlLabel control={<Checkbox name="is_completed" checked={editedTask?.is_completed || false} onChange={handleEditFormChange} />} label="Completed" />

              <FormControl fullWidth margin="normal">
                <InputLabel id="edit-project-select-label">Associated Project (Optional)</InputLabel>
                <Select labelId="edit-project-select-label" id="edit-project-select" value={editedTask?.projectId || ""} label="Associated Project (Optional)" onChange={(e) => handleEditProjectChange(e.target.value === "" ? undefined : (e.target.value as string))}>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                id="edit-tags-autocomplete"
                options={availableTags}
                multiple
                value={editedTaskTags}
                onChange={(_event, newValue: string[]) => {
                  setEditedTaskTags(newValue);
                }}
                freeSolo
                renderTags={(value: readonly string[], getTagProps) => value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />)}
                renderInput={(params) => <TextField {...params} label="Tags" placeholder="Select Tags" margin="normal" fullWidth />}
                sx={{ mt: 2, mb: 1 }}
              />

              <Box className={styles.formButtonsBox}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Update"}
                </Button>
                <Button type="button" variant="outlined" onClick={() => setEditingId(null)} disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <CardComponent
              key={task.id}
              item={task}
              decision={taskDecisions[task.id!] || undefined}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit as (item: Event | CommonDecision | Task | Project | Essential) => void}
              onDelete={handleDelete}
              onDecision={handleDecision}
              type="task"
              projects={projects}
            />
          );
        })}
      </Box>
      <Snackbar open={!!notification} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert onClose={handleCloseNotification} severity={notification?.type || "info"} sx={{ width: "100%" }}>
          {notification?.message}
        </Alert>
      </Snackbar>

      <CompletionDialog open={completionDialogOpen} onClose={handleCompletionCancel} onSave={handleCompletionSave} title="Complete Task" value={completionDescription} loading={loading} />
    </Box>
  );
}
