"use client";
import { useState } from "react";
import CardComponent from "./CardComponent";
import { Event, CommonDecision } from "./types/types_components";
import { Button, TextField, Box, CircularProgress } from "@mui/material";

export default function EventListClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", date: "" });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setDecisions((prev) => ({ ...prev, [id]: randomNum }));
  };

  const handleDelete = async (id: string | number) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEvents((prev) => prev.filter((event) => event.id !== id));
      } else {
        console.error("Failed to delete event:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEdit = (item: Event | CommonDecision) => {
    if (item.type === "calendar") {
      console.log(`Edit event with ID: ${item.id}`);
      setEditingId(item.id);
      setEditedEvent(item as Event);
    } else {
      console.error("Invalid item type for edit");
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, [e.target.name]: e.target.value });
    }
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedEvent || !editedEvent.name || !editedEvent.date) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedEvent.name, date: editedEvent.date, type: "calendar" }),
      });
      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents((prev) => prev.map((event) => (event.id === editingId ? updatedEvent : event)));
        setEditingId(null);
        setEditedEvent(null);
      } else {
        console.error("Failed to update event:", await response.json());
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setLoading(false);
  };

  const handleAddCard = () => setShowForm(true);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) return;
    setLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEvent.name, date: newEvent.date, type: "calendar" }),
      });
      if (response.ok) {
        const addedEvent = await response.json();
        setEvents((prev) => [...prev, addedEvent]);
        setNewEvent({ name: "", date: "" });
        setShowForm(false);
      } else {
        console.error("Failed to add event:", await response.json());
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
    setLoading(false);
  };

  return (
    <Box width="100%">
      <Button variant="contained" color="primary" onClick={handleAddCard} sx={{ mb: 2 }}>
        Add card
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} sx={{ width: "100%", p: 2, borderRadius: 2, boxShadow: 2, mb: 2 }}>
          <TextField name="name" label="Event name" value={newEvent.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField name="date" label="Event date" type="date" value={newEvent.date} onChange={handleFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
            <Button type="button" variant="outlined" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {events.map((event: Event) =>
          editingId === event.id ? (
            <Box component="form" onSubmit={handleEditFormSubmit} key={event.id} sx={{ width: "100%", p: 2, borderRadius: 2, boxShadow: 2, mb: 2 }}>
              <TextField name="name" label="Edit Event name" value={editedEvent?.name || ""} onChange={handleEditFormChange} fullWidth margin="normal" required />
              <TextField name="date" label="Event date" type="date" value={editedEvent?.date || ""} onChange={handleEditFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Update"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setEditingId(null);
                    setEditedEvent(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <CardComponent key={event.id} item={event} decision={decisions[event.id]} onDecision={handleDecision} onEdit={handleEdit} onDelete={handleDelete} />
          )
        )}
      </Box>
    </Box>
  );
}
