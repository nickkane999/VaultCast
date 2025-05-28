import React from "react";
import { Box, Typography, CircularProgress, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { useEssentialListClient } from "./hooks/useEssentialListClient";
import CardComponent from "./CardComponent";
import EssentialForm from "./EssentialForm";
import { Essential } from "./types";
import styles from "./DecisionHelper.module.css";

interface EssentialListClientProps {
  initialEssentials: Essential[];
}

export default function EssentialListClient({ initialEssentials }: EssentialListClientProps) {
  const {
    dataToDisplay,
    loading,
    error,
    showForm,
    newEssential,
    editingEssentialId,
    editedEssential,
    essentialDecisions,
    handleAddEssential,
    handleSaveEssential,
    handleCancelForm,
    handleEditEssential,
    handleDeleteClick,
    handleDecision,
    handleCompleteEssential,
    handleUpdateNewEssential,
    handleUpdateEditedEssential,
    dateFilter,
    setDateFilter,
    sortOrder,
    setSortOrder,
    hidePastDates,
    setHidePastDates,
  } = useEssentialListClient({ initialEssentials });

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (name === "completed_times" || name === "interval") {
      parsedValue = parseInt(value) || 0;
    }

    handleUpdateEditedEssential({ [name]: parsedValue });
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveEssential();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box className={styles.essentialContainer}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", justifyContent: "center" }}>
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
      <Button variant="contained" onClick={handleAddEssential}>
        Add Essential
      </Button>

      {showForm && !editingEssentialId && <EssentialForm essential={newEssential} onEssentialChange={handleUpdateNewEssential} onSave={handleSaveEssential} onCancel={handleCancelForm} />}

      {(!dataToDisplay || dataToDisplay.length === 0) && !showForm ? (
        <Typography>No essential items found.</Typography>
      ) : (
        dataToDisplay.map((essential) => {
          const isEditing = editingEssentialId === essential.id;

          if (isEditing) {
            return (
              <Box component="form" onSubmit={handleEditFormSubmit} key={`edit-${essential.id}`} className={styles.formBox}>
                <TextField name="title" label="Edit Essential Title" value={editedEssential?.title || ""} onChange={handleEditFormChange} fullWidth margin="normal" required />
                <TextField name="description" label="Description" value={editedEssential?.description || ""} onChange={handleEditFormChange} fullWidth margin="normal" multiline rows={3} required />
                <TextField name="due_date" label="Due Date" type="date" value={editedEssential?.due_date || ""} onChange={handleEditFormChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
                <TextField name="interval" label="Interval (days)" type="number" value={editedEssential?.interval || 1} onChange={handleEditFormChange} fullWidth margin="normal" required inputProps={{ min: 1 }} />
                <TextField name="completed_times" label="Completed Times" type="number" value={editedEssential?.completed_times || 0} onChange={handleEditFormChange} fullWidth margin="normal" inputProps={{ min: 0 }} />
                <Box className={styles.formButtonsBox}>
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                  </Button>
                  <Button type="button" variant="outlined" onClick={handleCancelForm} disabled={loading}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            );
          }

          return (
            <Box key={essential.id} className={styles.essentialItemContainer}>
              <CardComponent item={essential} type="essential" onComplete={handleCompleteEssential} onDecision={handleDecision} decision={essentialDecisions[essential.id.toString()]} onEdit={() => handleEditEssential(essential)} onDelete={handleDeleteClick} />
            </Box>
          );
        })
      )}
    </Box>
  );
}
