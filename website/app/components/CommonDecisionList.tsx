import { useState } from "react";
import { Box, Button, Card, CardContent, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import CardComponent from "./CardComponent";
import { CommonDecision } from "./types/types_components";

export default function CommonDecisionList({ initialDecisions = [] }: { initialDecisions: CommonDecision[] }) {
  const [decisions, setDecisions] = useState<CommonDecision[]>(initialDecisions);
  const [showForm, setShowForm] = useState(false);
  const [newDecision, setNewDecision] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | number | null>(null); // For editing state
  const [editedDecision, setEditedDecision] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [commonDecisionResults, setCommonDecisionResults] = useState<Record<string, number>>({});

  const handleAddCard = () => setShowForm(true);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDecision({ ...newDecision, [e.target.name]: e.target.value });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDecision({ ...editedDecision, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.name) return;
    setLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDecision.name, type: "common_decision" }),
      });
      if (response.ok) {
        const addedDecision = await response.json();
        setDecisions((prev) => [...prev, { id: addedDecision.id, name: addedDecision.name, type: "common_decision" }]);
        setNewDecision({ name: "" });
        setShowForm(false);
      } else {
        const errorData = await response.json();
        console.error("Failed to add decision:", errorData); // Log the full error response for debugging
        alert(`Error: ${errorData.error || "Unknown error"}`); // Show an alert to the user with the error message
      }
    } catch (error) {
      console.error("Error adding decision:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedDecision.name) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedDecision.name, type: "common_decision" }),
      });
      if (response.ok) {
        const updatedDecision = await response.json();
        setDecisions((prev) => prev.map((decision) => (decision.id === editingId ? { ...decision, name: updatedDecision.name } : decision)));
        setEditingId(null);
        setEditedDecision({ name: "" });
      } else {
        const errorData = await response.json();
        console.error("Failed to update decision:", errorData);
        alert(`Error: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating decision:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDecisions((prev) => prev.filter((decision) => decision.id !== id));
      } else {
        const errorData = await response.json();
        console.error("Failed to delete decision:", errorData);
        alert(`Error: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting decision:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleEdit = (id: string | number, name: string) => {
    setEditingId(id);
    setEditedDecision({ name });
  };

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setCommonDecisionResults((prev) => ({ ...prev, [id]: randomNum }));
  };

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={handleAddCard} sx={{ mb: 2 }}>
        Add card
      </Button>
      {showForm && (
        <Box component="form" onSubmit={handleFormSubmit} sx={{ width: "100%", p: 2, borderRadius: 2, boxShadow: 2, mb: 2 }}>
          <TextField name="name" label="Decision name" value={newDecision.name} onChange={handleFormChange} fullWidth margin="normal" required />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outlined" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {decisions.map((decision: CommonDecision) =>
          editingId === decision.id ? (
            <Box component="form" key={decision.id} onSubmit={handleEditFormSubmit} sx={{ width: "100%", p: 2, borderRadius: 2, boxShadow: 2, mb: 2 }}>
              <TextField name="name" label="Edit Decision name" value={editedDecision.name} onChange={handleEditFormChange} fullWidth margin="normal" required />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? "Saving..." : "Update"}
                </Button>
                <Button type="button" variant="outlined" onClick={() => setEditingId(null)} disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <CardComponent key={decision.id} item={decision} onEdit={() => handleEdit(decision.id, decision.name)} onDelete={handleDelete} onDecision={handleDecision} decision={commonDecisionResults[decision.id]} />
          )
        )}
      </Box>
    </Box>
  );
}
