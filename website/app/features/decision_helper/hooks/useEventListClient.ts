import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setEventShowForm, setNewEvent, updateNewEvent, setEditingEventId, setEditedEvent, updateEditedEvent, setEventDecision, setDateFilter, setSortOrder, setHidePastDates, createEvent, updateEventThunk, deleteEventThunk } from "@/store/decision_helper";
import { Event, CommonDecision, Task } from "../types";
import { getFilteredAndSortedEvents } from "../util/event_filter";

interface UseEventListClientProps {
  initialEvents: Event[];
}

export const useEventListClient = ({ initialEvents }: UseEventListClientProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { calendarEvents, eventShowForm, newEvent, editingEventId, editedEvent, eventDecisions, dateFilter, sortOrder, hidePastDates, loading } = useSelector((state: RootState) => state.decisionHelper.events);

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    dispatch(setEventDecision({ id: id.toString(), value: randomNum }));
  };

  const handleDelete = async (id: string | number) => {
    dispatch(deleteEventThunk(id));
  };

  const handleEdit = (item: Event | CommonDecision | Task) => {
    dispatch(setEditingEventId(item.id));
    const eventToEdit: Event = {
      id: item.id,
      name: item.name,
      date: (item as Event).date,
      startTime: (item as Event).startTime,
      endTime: (item as Event).endTime,
      attended: (item as Event).attended ?? false,
    };
    dispatch(setEditedEvent(eventToEdit));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateEditedEvent({ [name]: value }));
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedEvent) return;

    dispatch(updateEventThunk(editedEvent));
  };

  const handleAddCard = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dispatch(
      setNewEvent({
        name: "",
        date: `${year}-${month}-${day}`,
        startTime: "",
        endTime: "",
        attended: false,
      })
    );
    dispatch(setEventShowForm(true));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    dispatch(updateNewEvent({ [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date) {
      console.error("New event is missing name or date.");
      return;
    }

    dispatch(createEvent(newEvent));
  };

  const displayedEvents = getFilteredAndSortedEvents(calendarEvents, dateFilter, sortOrder, hidePastDates);

  return {
    events: calendarEvents,
    decisions: eventDecisions,
    showForm: eventShowForm,
    newEvent,
    editingId: editingEventId,
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
    setDateFilter: (filter: string) => dispatch(setDateFilter(filter)),
    setSortOrder: (order: "Ascending" | "Descending") => dispatch(setSortOrder(order)),
    setHidePastDates: (hide: boolean) => dispatch(setHidePastDates(hide)),
    setShowForm: (show: boolean) => dispatch(setEventShowForm(show)),
    setEditingId: (id: string | number | null) => dispatch(setEditingEventId(id)),
    setEditedEvent: (event: Event | null) => dispatch(setEditedEvent(event)),
    displayedEvents,
  };
};
