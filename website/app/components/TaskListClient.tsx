"use client";
import { useState, useEffect } from "react";
import CardComponent from "./CardComponent";
import { Task, Event, CommonDecision } from "./types/types_components";
import { Button, TextField, Box, CircularProgress, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import styles from "./DecisionHelper.module.css";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

interface TaskFormState {
  name: string;
  is_completed: boolean;
  tags: string[];
}

export default function TaskListClient({ initialTasks = [] }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState<TaskFormState>({ name: "", is_completed: false, tags: [] });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskDecisions, setTaskDecisions] = useState<Record<string, number>>({});

  const [tagFilter, setTagFilter] = useState<string>("All");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editedTaskTags, setEditedTaskTags] = useState<string[]>([]);
  const [addTagInputValue, setAddTagInputValue] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Note: Tasks will use the same handleDecision as other types if needed,
  // but the primary task-specific action is marking as completed.

  const handleAddTaskCard = () => {
    // Reset newEvent state with default date and empty tags array
    setNewTask({ name: "", is_completed: false, tags: [] });
    setAddTagInputValue("");
    setNewTagInput("");
    setShowForm(true);
  };

  // Function to collect unique tags from tasks
  const collectUniqueTags = (currentTasks: Task[]) => {
    const tags = new Set<string>();
    currentTasks.forEach((task) => {
      if (task.tags) {
        task.tags.forEach((tag) => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  };

  // Initial collection of tags and update on tasks change
  useEffect(() => {
    collectUniqueTags(tasks);
  }, [tasks]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Do not handle tags here, Autocomplete handles it directly
    if (name !== "tags") {
      setNewTask({ ...newTask, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (editedTask && name !== "tags") {
      setEditedTask({ ...editedTask, [name]: type === "checkbox" ? checked : value } as Task);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name) return;
    setLoading(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTask.name,
          type: "task",
          is_completed: newTask.is_completed,
          tags: newTask.tags,
        }),
      });
      if (response.ok) {
        const addedTask = await response.json();
        setTasks((prev) => [...prev, addedTask]);
        setNewTask({ name: "", is_completed: false, tags: [] });
        setShowForm(false);
      } else {
        console.error("Failed to add task:", await response.json());
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTask || !editedTask.name) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedTask.name,
          type: "task",
          is_completed: editedTask.is_completed,
          tags: editedTaskTags,
        }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) => prev.map((task) => (task.id === editingId ? updatedTask : task)));
        setEditingId(null);
        setEditedTask(null);
      } else {
        console.error("Failed to update task:", await response.json());
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } else {
        console.error("Failed to delete task:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (item: Event | CommonDecision | Task) => {
    // Ensure we only process Task items here
    if (item.type === "task") {
      setEditingId(item.id);
      setEditedTask(item as Task);
      setEditedTaskTags((item as Task).tags || []);
    } else {
      console.error("Attempted to edit a non-task item in TaskListClient");
    }
  };

  const handleToggleComplete = async (item: Task) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events?id=${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !item.is_completed, type: "task", name: item.name }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) => prev.map((task) => (task.id === item.id ? updatedTask : task)));
      } else {
        console.error("Failed to update task completion status:", await response.json());
      }
    } catch (error) {
      console.error("Error updating task completion status:", error);
    }
    setLoading(false);
  };

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTaskDecisions((prev) => ({ ...prev, [id]: randomNum }));
  };

  const getFilteredAndSortedTasks = () => {
    const filtered = tasks.filter((task) => {
      if (tagFilter === "All") return true;
      if (!task.tags) return false;
      return task.tags.includes(tagFilter);
    });
    // No sorting implemented yet for tasks, just return filtered
    return filtered;
  };

  const displayedTasks = getFilteredAndSortedTasks();

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    setNewTask({ ...newTask, tags: [...newTask.tags, newTagInput.trim()] });
    setNewTagInput("");
    setAddTagInputValue("");
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
        {" "}
        {/* Tasks will likely be in a column layout */}
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
    </Box>
  );
}
