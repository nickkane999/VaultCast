import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchEssentials, completeEssential, createEssential, updateEssential, deleteEssential, setShowForm, setNewEssential, updateNewEssential, setEditingEssentialId, setEditedEssential, updateEditedEssential, setEssentialDecision, Essential } from "@/store/decision_helper";
import { useState } from "react";

export const useEssentialList = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Memoized selectors for specific state pieces to prevent unnecessary re-renders
  const essentials = useSelector((state: RootState) => state.decisionHelper.essentials.essentials);
  const loading = useSelector((state: RootState) => state.decisionHelper.essentials.loading);
  const error = useSelector((state: RootState) => state.decisionHelper.essentials.error);
  const showForm = useSelector((state: RootState) => state.decisionHelper.essentials.showForm);
  const newEssential = useSelector((state: RootState) => state.decisionHelper.essentials.newEssential);
  const editingEssentialId = useSelector((state: RootState) => state.decisionHelper.essentials.editingEssentialId);
  const editedEssential = useSelector((state: RootState) => state.decisionHelper.essentials.editedEssential);
  const essentialDecisions = useSelector((state: RootState) => state.decisionHelper.essentials.essentialDecisions);

  const [dateFilter, setDateFilter] = useState("Current Month");
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">("Ascending");
  const [hidePastDates, setHidePastDates] = useState(true);

  // Remove automatic fetching since parent component (useDecisionHelperPage) already fetches all data

  const handleCompleteEssential = (id: string | number) => {
    dispatch(completeEssential(id));
  };

  const handleCreateEssential = () => {
    dispatch(createEssential(newEssential));
  };

  const handleUpdateEssential = (id: string | number, essentialData: Partial<Essential>) => {
    dispatch(updateEssential({ id, essentialData }));
  };

  const handleDeleteEssential = (id: string | number) => {
    dispatch(deleteEssential(id));
  };

  const handleShowForm = (show: boolean) => {
    dispatch(setShowForm(show));
  };

  const handleSetNewEssential = (essential: Omit<Essential, "id">) => {
    dispatch(setNewEssential(essential));
  };

  const handleUpdateNewEssential = (partialEssential: Partial<Omit<Essential, "id">>) => {
    dispatch(updateNewEssential(partialEssential));
  };

  const handleSetEditingEssential = (id: string | number | null) => {
    dispatch(setEditingEssentialId(id));
    if (id) {
      const essential = essentials.find((e) => e.id === id);
      if (essential) {
        dispatch(setEditedEssential(essential));
      }
    } else {
      dispatch(setEditedEssential(null));
    }
  };

  const handleUpdateEditedEssential = (partialEssential: Partial<Essential>) => {
    dispatch(updateEditedEssential(partialEssential));
  };

  const handleEssentialDecision = (id: string, value: number) => {
    dispatch(setEssentialDecision({ id, value }));
  };

  const getFilteredEssentials = () => {
    // Create a deep copy to ensure we can modify the array
    let filteredEssentials = essentials.map((item) => ({ ...item }));

    // Apply Hide Past Dates filter
    if (hidePastDates) {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      filteredEssentials = filteredEssentials.filter((essential) => {
        if (!essential.due_date) return true; // Keep essentials without due date if hiding past
        const dueDate = new Date(essential.due_date);
        dueDate.setHours(23, 59, 59, 999);
        return dueDate >= now;
      });
    }

    // Apply Date Filter
    if (dateFilter !== "All") {
      const now = new Date();
      const filterYear = now.getFullYear();
      const filterMonth = now.getMonth(); // 0-indexed
      const filterDay = now.getDate();

      filteredEssentials = filteredEssentials.filter((essential) => {
        if (!essential.due_date) return false; // Exclude essentials without due date for specific date filters

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
    const sortedEssentials = [...filteredEssentials].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0; // Keep original order if both have no due date
      if (!a.due_date) return 1; // Sort items without due date to the end
      if (!b.due_date) return -1; // Sort items without due date to the end

      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();

      if (sortOrder === "Ascending") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return sortedEssentials;
  };

  const displayedEssentials = getFilteredEssentials();

  return {
    essentials: displayedEssentials,
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
    handleSetNewEssential,
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
