"use client";
import React from "react";
import CardComponent from "./CardComponent";
import { Event, CommonDecision, Task } from "./types";
import { Button, TextField, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Stack } from "@mui/material";
import styles from "./DecisionHelper.module.css";
import { useEventListClient } from "./hooks/useEventListClient";

export default function EventListClient({ initialEvents }: { initialEvents: Event[] }) {
  const {
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
  } = useEventListClient({ initialEvents });

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
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField name="startTime" label="Start Time" type="time" value={newEvent.startTime || ""} onChange={handleFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField name="endTime" label="End Time" type="time" value={newEvent.endTime || ""} onChange={handleFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          </Stack>
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
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <TextField name="startTime" label="Start Time" type="time" value={editedEvent?.startTime || ""} onChange={handleEditFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
                <TextField name="endTime" label="End Time" type="time" value={editedEvent?.endTime || ""} onChange={handleEditFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
              </Stack>
              {editedEvent?.attended !== undefined && <FormControlLabel control={<Checkbox checked={editedEvent.attended} onChange={(e) => handleEditFormChange({ target: { name: "attended", value: e.target.checked } } as any)} name="attended" />} label="Attended" />}
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
            <CardComponent key={event.id} item={event} decision={decisions[event.id]} onDecision={handleDecision} onEdit={handleEdit} onDelete={handleDelete} type="calendar" />
          )
        )}
      </Box>
    </Box>
  );
}
