import { useState } from "react";
import { CommonDecision } from "../types";

interface UseCommonDecisionListStateProps {
  initialDecisions: CommonDecision[];
}

export function useCommonDecisionListState({ initialDecisions }: UseCommonDecisionListStateProps) {
  const [decisions, setDecisions] = useState<CommonDecision[]>(initialDecisions);
  const [showForm, setShowForm] = useState(false);
  const [newDecision, setNewDecision] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | number | null>(null);
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
        console.error("Failed to add decision:", errorData);
        alert(`Error: ${errorData.error || "Unknown error"}`);
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

  return {
    decisions,
    showForm,
    newDecision,
    editingId,
    editedDecision,
    loading,
    commonDecisionResults,
    handleAddCard,
    handleFormChange,
    handleEditFormChange,
    handleFormSubmit,
    handleEditFormSubmit,
    handleDelete,
    handleEdit,
    handleDecision,
    setShowForm,
    setEditingId,
  };
}
