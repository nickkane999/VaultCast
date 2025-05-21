import { useState, useEffect } from "react";
import { Event, CommonDecision, Task } from "../types";

interface UseEventListClientStateProps {
  initialEvents: Event[];
}

export function useEventListClientState({ initialEvents }: UseEventListClientStateProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState<{ name: string; date: string; startTime?: string; endTime?: string; type: string; attended?: boolean }>({ name: "", date: "", startTime: "", endTime: "", type: "calendar" });
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
      setEditingId(item.id);
      const eventToEdit: Event = {
        id: item.id,
        name: item.name,
        type: (item as Event).type,
        date: (item as Event).date,
        startTime: (item as Event).startTime,
        endTime: (item as Event).endTime,
        attended: (item as Event).attended ?? false,
      };
      setEditedEvent(eventToEdit);
    } else {
      console.warn(`Edit called for non-event type: ${item.type}`);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedEvent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events?id=${editedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editedEvent, type: "calendar" }),
      });
      const updatedEvent = await res.json();
      setEvents((prev) => prev.map((event) => (event.id === editedEvent.id ? updatedEvent : event)));
      setEditingId(null);
      setEditedEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setLoading(false);
  };

  const handleAddCard = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setNewEvent({ name: "", date: `${year}-${month}-${day}`, startTime: "", endTime: "", type: "calendar" });
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value, type: "calendar" });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) {
      console.error("New event is missing name or date.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newEvent, type: "calendar", attended: newEvent.attended ?? false }),
      });
      const addedEvent = await res.json();
      setEvents((prev) => [...prev, addedEvent]);
      setNewEvent({ name: "", date: "", type: "calendar", startTime: "", endTime: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding event:", error);
      setLoading(false);
    }
  };

  const getFilteredAndSortedEvents = () => {
    const now = new Date();
    const todayLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = events.filter((event) => {
      if (event.type !== "calendar") return false;
      const [year, month, day] = (event as Event).date.split("-").map(Number);
      const eventDateLocalMidnight = new Date(year, month - 1, day);

      if (hidePastDates) {
        if (eventDateLocalMidnight.getTime() < todayLocalMidnight.getTime()) {
          return false;
        }
      }

      switch (dateFilter) {
        case "All":
          return true;
        case "Current Year":
          return eventDateLocalMidnight.getFullYear() === now.getFullYear();
        case "Current Month":
          return eventDateLocalMidnight.getFullYear() === now.getFullYear() && eventDateLocalMidnight.getMonth() === now.getMonth();
        case "Current Week":
          const startOfWeek = new Date(todayLocalMidnight);
          startOfWeek.setDate(todayLocalMidnight.getDate() - todayLocalMidnight.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          return eventDateLocalMidnight.getTime() >= startOfWeek.getTime() && eventDateLocalMidnight.getTime() <= endOfWeek.getTime();
        case "Today":
          return eventDateLocalMidnight.getTime() === todayLocalMidnight.getTime();
        default:
          return true;
      }
    });

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date((a as Event).date);
      const dateB = new Date((b as Event).date);

      if (sortOrder === "Ascending") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    return sorted;
  };

  const displayedEvents = getFilteredAndSortedEvents();

  return {
    events,
    decisions,
    showForm,
    newEvent,
    editingId,
    editedEvent,
    loading,
    dateFilter,
    sortOrder,
    hidePastDates,
    handleDecision,
    handleDelete,
    handleEdit,
    handleEditFormChange,
    handleEditFormSubmit,
    handleAddCard,
    handleFormChange,
    handleFormSubmit,
    setDateFilter,
    setSortOrder,
    setHidePastDates,
    setShowForm,
    setEditingId,
    setEditedEvent,
    displayedEvents,
  };
}
