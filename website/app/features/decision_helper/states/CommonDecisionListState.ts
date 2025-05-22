import { useState } from "react";
import { CommonDecision } from "../types";
import { addDecision, updateDecision, deleteDecision } from "../queries/decision_queries";

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
      const addedDecision = await addDecision(newDecision.name);
      setDecisions((prev) => [...prev, { id: addedDecision.id, name: addedDecision.name, type: "common_decision" }]);
      setNewDecision({ name: "" });
      setShowForm(false);
    } catch (error: any) {
      console.error("Error adding decision:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedDecision.name || editingId === null) return;
    setLoading(true);
    try {
      const updatedDecision = await updateDecision(editingId, editedDecision.name);
      setDecisions((prev) => prev.map((decision) => (decision.id === editingId ? { ...decision, name: updatedDecision.name } : decision)));
      setEditingId(null);
      setEditedDecision({ name: "" });
    } catch (error: any) {
      console.error("Error updating decision:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteDecision(id);
      setDecisions((prev) => prev.filter((decision) => decision.id !== id));
    } catch (error: any) {
      console.error("Error deleting decision:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
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
