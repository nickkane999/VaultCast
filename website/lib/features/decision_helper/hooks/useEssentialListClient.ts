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
    dateFilter,
    setDateFilter,
    sortOrder,
    setSortOrder,
    hidePastDates,
    setHidePastDates,
  } = useEssentialList();

  // Use filtered essentials from the hook if available, otherwise filter initial data
  const dataToDisplay = essentials.length > 0 ? essentials : applyFiltersToInitialData(initialEssentials, dateFilter, sortOrder, hidePastDates);

  function applyFiltersToInitialData(data: Essential[], dateFilter: string, sortOrder: "Ascending" | "Descending", hidePastDates: boolean): Essential[] {
    // Create a deep copy to ensure we can modify the array
    let filtered = data.map((item) => ({ ...item }));

    // Apply Hide Past Dates filter
    if (hidePastDates) {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      filtered = filtered.filter((essential) => {
        if (!essential.due_date) return true;
        const dueDate = new Date(essential.due_date);
        dueDate.setHours(23, 59, 59, 999);
        return dueDate >= now;
      });
    }

    // Apply Date Filter
    if (dateFilter !== "All") {
      const now = new Date();
      const filterYear = now.getFullYear();
      const filterMonth = now.getMonth();
      const filterDay = now.getDate();

      filtered = filtered.filter((essential) => {
        if (!essential.due_date) return false;

        const dueDate = new Date(essential.due_date);
        const dueYear = dueDate.getFullYear();
        const dueMonth = dueDate.getMonth();
        const dueDay = dueDate.getDate();

        switch (dateFilter) {
          case "Current Year":
            return dueYear === filterYear;
          case "Current Month":
            return dueYear === filterYear && dueMonth === filterMonth;
          case "Current Week":
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
            endOfWeek.setHours(23, 59, 59, 999);
            const dueDateTime = new Date(essential.due_date);
            return dueDateTime >= startOfWeek && dueDateTime <= endOfWeek;
          case "Today":
            return dueYear === filterYear && dueMonth === filterMonth && dueDay === filterDay;
          default:
            return true;
        }
      });
    }

    // Apply Sort Order - create new sorted array instead of modifying in place
    const sortedFiltered = [...filtered].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;

      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();

      return sortOrder === "Ascending" ? dateA - dateB : dateB - dateA;
    });

    return sortedFiltered;
  }

  const handleAddEssential = () => {
    handleShowForm(true);
  };

  const handleSaveEssential = async () => {
    if (editingEssentialId && editedEssential) {
      // Update existing essential
      await handleUpdateEssential(editingEssentialId, editedEssential);
    } else {
      // Create new essential
      await handleCreateEssential();
    }
    // After saving (either update or create), close the form and reset editing state
    handleCancelForm();
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
    handleSetEditingEssential,
    handleUpdateEditedEssential,
    handleEssentialDecision,
    dateFilter,
    setDateFilter,
    sortOrder,
    setSortOrder,
    hidePastDates,
    setHidePastDates,
  };
};
