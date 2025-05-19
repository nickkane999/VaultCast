"use client";
import { useState } from "react";
import CardComponent from "./CardComponent";
import { Event, CommonDecision, Task } from "./types/types_components";
import { Button, TextField, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import styles from "./DecisionHelper.module.css";

export default function EventListClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", date: "" });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  const [dateFilter, setDateFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">("Descending");
  const [hidePastDates, setHidePastDates] = useState<boolean>(true);

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

  const handleEdit = (item: Event | CommonDecision | Task) => {
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

  const handleAddCard = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    setNewEvent({ name: "", date: `${year}-${month}-${day}` });
    setShowForm(true);
  };

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

  const getFilteredAndSortedEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = events.filter((event) => {
      if (event.type !== "calendar") return false; // Only filter calendar events by date
      const eventDate = new Date((event as Event).date);

      // Hide past dates filter
      if (hidePastDates) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
        if (eventDate < today) {
          return false;
        }
      }

      switch (dateFilter) {
        case "All":
          return true;
        case "Current Year":
          return eventDate.getFullYear() === now.getFullYear();
        case "Current Month":
          return eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() === now.getMonth();
        case "Current Week":
          // This is a simplified check: within the last 7 days including today
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
          return eventDate >= sevenDaysAgo && eventDate <= today;
        case "Today":
          return eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() === today.getMonth() && eventDate.getDate() === today.getDate();
        default:
          return true;
      }
    });

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date((a as Event).date).getTime();
      const dateB = new Date((b as Event).date).getTime();
      if (sortOrder === "Ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return sorted;
  };

  const displayedEvents = getFilteredAndSortedEvents();

  return (
    <Box className={styles.listContainer}>
      <Box className={styles.filtersContainer} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="date-filter-label">Filter</InputLabel>
          <Select labelId="date-filter-label" id="date-filter" value={dateFilter} label="Filter" onChange={(e) => setDateFilter(e.target.value as string)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Current Year">Current Year</MenuItem>
            <MenuItem value="Current Month">Current Month</MenuItem>
            <MenuItem value="Current Week">Current Week</MenuItem>
            <MenuItem value="Today">Today</MenuItem>
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
        Add card
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.formBox}>
          <TextField name="name" label="Event name" value={newEvent.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField name="date" label="Event date" type="date" value={newEvent.date} onChange={handleFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
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
        {displayedEvents.map((event: Event) =>
          editingId === event.id ? (
            <Box component="form" onSubmit={handleEditFormSubmit} key={event.id} className={styles.formBox}>
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
