import { useState, useEffect } from "react";
import { Event, CommonDecision, Task } from "../types";
import { deleteEvent, updateEvent, addEvent } from "../queries/event_queries";
import { getFilteredAndSortedEvents } from "../util/event_filter";

interface UseEventListClientStateProps {
  initialEvents: Event[];
}

export function useEventListClientState({ initialEvents }: UseEventListClientStateProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState<{ name: string; date: string; startTime?: string; endTime?: string; attended?: boolean }>({ name: "", date: "", startTime: "", endTime: "", attended: false });
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
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEdit = (item: Event | CommonDecision | Task) => {
    setEditingId(item.id);
    const eventToEdit: Event = {
      id: item.id,
      name: item.name,
      date: (item as Event).date,
      startTime: (item as Event).startTime,
      endTime: (item as Event).endTime,
      attended: (item as Event).attended ?? false,
    };
    setEditedEvent(eventToEdit);
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
      const updatedEvent = await updateEvent(editedEvent);
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
    setNewEvent({ name: "", date: `${year}-${month}-${day}`, startTime: "", endTime: "", attended: false });
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) {
      console.error("New event is missing name or date.");
      return;
    }
    setLoading(true);
    try {
      const addedEvent = await addEvent(newEvent);
      setEvents((prev) => [...prev, addedEvent]);
      setNewEvent({ name: "", date: "", startTime: "", endTime: "", attended: false });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding event:", error);
      setLoading(false);
    }
  };

  const displayedEvents = getFilteredAndSortedEvents(events, dateFilter, sortOrder, hidePastDates);

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
