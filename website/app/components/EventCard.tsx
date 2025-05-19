import { useState } from "react";
import { Card, CardContent, Typography, Button, IconButton, Box, TextField, CircularProgress } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { EventCardProps } from "./types/types_components";

export default function EventCard({ event, decision, onDecision, onEdit, onDelete, onUpdate }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState({ name: event.name, date: event.date, id: event.id });
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" } as const;
    return date.toLocaleDateString("en-US", options);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEvent({ ...editedEvent, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedEvent.name || !editedEvent.date) return;
    setLoading(true);
    await onUpdate(editedEvent); // This will trigger the update in the parent component
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <>
      {isEditing ? (
        <Box component="form" onSubmit={handleFormSubmit} sx={{ width: "100%", p: 2, borderRadius: 2, boxShadow: 2, mb: 2 }}>
          <TextField name="name" label="Event name" value={editedEvent.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField name="date" label="Event date" type="date" value={editedEvent.date} onChange={handleFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save Changes"}
            </Button>
            <Button type="button" variant="outlined" onClick={() => setIsEditing(false)} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Card variant="outlined" sx={{ width: "100%", borderRadius: 2, boxShadow: 2, p: 2, position: "relative" }}>
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <IconButton onClick={handleEditClick} aria-label="Edit" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete()} aria-label="Delete" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" component="div">
              {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(event.date)}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => onDecision(event.id)}>
              Make decision
            </Button>
            {decision && (
              <Typography variant="body1" color="primary" fontWeight="bold">
                Decision: {decision}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
