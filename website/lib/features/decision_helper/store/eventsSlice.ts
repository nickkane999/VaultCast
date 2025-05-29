import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Event } from "../types";

interface EventFormState {
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  attended?: boolean;
}

interface EventsState {
  calendarEvents: Event[];
  loading: boolean;
  error: string | null;
  eventShowForm: boolean;
  newEvent: EventFormState;
  editingEventId: string | number | null;
  editedEvent: Event | null;
  eventDecisions: Record<string, number>;
  dateFilter: string;
  sortOrder: "Ascending" | "Descending";
  hidePastDates: boolean;
}

const initialState: EventsState = {
  calendarEvents: [],
  loading: false,
  error: null,
  eventShowForm: false,
  newEvent: { name: "", date: "", startTime: "", endTime: "", attended: false },
  editingEventId: null,
  editedEvent: null,
  eventDecisions: {},
  dateFilter: "Current Month",
  sortOrder: "Ascending",
  hidePastDates: true,
};

export const fetchCalendarEvents = createAsyncThunk<
  Event[],
  void,
  {
    rejectValue: string;
  }
>("events/fetchCalendarEvents", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/events");
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch calendar events");
    }
    const data = await response.json();
    return data as Event[];
  } catch (error: any) {
    console.error("Error fetching calendar events:", error);
    return rejectWithValue(error.message || "Failed to fetch calendar events");
  }
});

export const createEvent = createAsyncThunk<
  Event,
  Omit<Event, "id">,
  {
    rejectValue: string;
  }
>("events/createEvent", async (eventData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/decision_helper/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to create event");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error creating event:", error);
    return rejectWithValue(error.message || "Failed to create event");
  }
});

export const updateEventThunk = createAsyncThunk<
  Event,
  Event,
  {
    rejectValue: string;
  }
>("events/updateEvent", async (eventData, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/decision_helper/events?id=${eventData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to update event");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error updating event:", error);
    return rejectWithValue(error.message || "Failed to update event");
  }
});

export const deleteEventThunk = createAsyncThunk<
  string | number,
  string | number,
  {
    rejectValue: string;
  }
>("events/deleteEvent", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/decision_helper/events?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to delete event");
    }
    return id;
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return rejectWithValue(error.message || "Failed to delete event");
  }
});

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setCalendarEvents: (state, action: PayloadAction<Event[]>) => {
      state.calendarEvents = action.payload;
    },
    clearEventsError: (state) => {
      state.error = null;
    },
    setEventShowForm: (state, action: PayloadAction<boolean>) => {
      state.eventShowForm = action.payload;
    },
    setNewEvent: (state, action: PayloadAction<EventFormState>) => {
      state.newEvent = action.payload;
    },
    updateNewEvent: (state, action: PayloadAction<Partial<EventFormState>>) => {
      state.newEvent = { ...state.newEvent, ...action.payload };
    },
    setEditingEventId: (state, action: PayloadAction<string | number | null>) => {
      state.editingEventId = action.payload;
    },
    setEditedEvent: (state, action: PayloadAction<Event | null>) => {
      state.editedEvent = action.payload;
    },
    updateEditedEvent: (state, action: PayloadAction<Partial<Event>>) => {
      if (state.editedEvent) {
        state.editedEvent = { ...state.editedEvent, ...action.payload };
      }
    },
    setEventDecision: (state, action: PayloadAction<{ id: string; value: number }>) => {
      state.eventDecisions[action.payload.id] = action.payload.value;
    },
    setDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"Ascending" | "Descending">) => {
      state.sortOrder = action.payload;
    },
    setHidePastDates: (state, action: PayloadAction<boolean>) => {
      state.hidePastDates = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.calendarEvents = action.payload;
        state.loading = false;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch calendar events";
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.calendarEvents.push(action.payload);
        state.eventShowForm = false;
        state.newEvent = { name: "", date: "", startTime: "", endTime: "", attended: false };
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload || "Failed to create event";
      })
      .addCase(updateEventThunk.fulfilled, (state, action: PayloadAction<Event>) => {
        const index = state.calendarEvents.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.calendarEvents[index] = action.payload;
        }
        state.editingEventId = null;
        state.editedEvent = null;
      })
      .addCase(updateEventThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to update event";
      })
      .addCase(deleteEventThunk.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.calendarEvents = state.calendarEvents.filter((event) => event.id !== action.payload);
      })
      .addCase(deleteEventThunk.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete event";
      });
  },
});

export const { setCalendarEvents, clearEventsError, setEventShowForm, setNewEvent, updateNewEvent, setEditingEventId, setEditedEvent, updateEditedEvent, setEventDecision, setDateFilter, setSortOrder, setHidePastDates } = eventsSlice.actions;

export type { EventsState, EventFormState };
export default eventsSlice.reducer;
