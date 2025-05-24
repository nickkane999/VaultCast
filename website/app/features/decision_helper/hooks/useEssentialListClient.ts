import { useEssentialList } from "./useEssentialList";
import { Essential } from "../types";

interface UseEssentialListClientProps {
  initialEssentials: Essential[];
}

export const useEssentialListClient = ({ initialEssentials }: UseEssentialListClientProps) => {
  const {
    essentials,
    loading,
    error,
    showForm,
    newEssential,
    editingEssentialId,
    editedEssential,
    essentialDecisions,
    handleCompleteEssential,
    handleCreateEssential,
    handleUpdateEssential,
    handleDeleteEssential,
    handleShowForm,
    handleUpdateNewEssential,
    handleSetEditingEssential,
    handleUpdateEditedEssential,
    handleEssentialDecision,
  } = useEssentialList();

  // Use initial data on first render, then Redux state
  const dataToDisplay = essentials.length > 0 ? essentials : initialEssentials;

  const handleAddEssential = () => {
    handleShowForm(true);
  };

  const handleSaveEssential = () => {
    if (editingEssentialId && editedEssential) {
      // Update existing essential
      handleUpdateEssential(editingEssentialId, editedEssential);
    } else {
      // Create new essential
      handleCreateEssential();
    }
  };

  const handleCancelForm = () => {
    handleShowForm(false);
    handleSetEditingEssential(null);
  };

  const handleEditEssential = (essential: Essential) => {
    handleSetEditingEssential(essential.id);
    handleShowForm(true);
  };

  const handleDeleteClick = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this essential?")) {
      handleDeleteEssential(id);
    }
  };

  const handleDecision = (id: string | number) => {
    // Generate a random decision value (you can modify this logic as needed)
    const decision = Math.floor(Math.random() * 10) + 1;
    handleEssentialDecision(id.toString(), decision);
  };

  return {
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
  };
};
