"use client";
import { useState } from "react";
import EventCard from "./EventCard";
import { Event } from "./types/types_components";
import { Button, TextField, Box, Container, CircularProgress } from "@mui/material";

export default function EventListClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", date: "" });
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

  const handleEdit = (id: string | number) => {
    console.log(`Edit event with ID: ${id}`); // Placeholder for edit functionality
    // You can expand this to open a form or update the event
  };

  const handleUpdate = async (updatedEvent: Event) => {
    try {
      const response = await fetch(`/api/events?id=${updatedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: updatedEvent.name, date: updatedEvent.date }),
      });
      if (response.ok) {
        const updatedFromServer = await response.json(); // Get the updated event from server if needed
        setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event)));
      } else {
        console.error("Failed to update event:", await response.json());
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleAddCard = () => setShowForm(true);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) return;
    setLoading(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    if (res.ok) {
      const added = await res.json();
      setEvents((prev: any) => [...prev, added]);
      setNewEvent({ name: "", date: "" });
      setShowForm(false);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
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
        {events.map((event: Event) => (
          <EventCard key={event.id} event={event} decision={decisions[event.id]} onDecision={handleDecision} onEdit={() => handleEdit(event.id)} onDelete={() => handleDelete(event.id)} onUpdate={handleUpdate} />
        ))}
      </Box>
    </Container>
  );
}
