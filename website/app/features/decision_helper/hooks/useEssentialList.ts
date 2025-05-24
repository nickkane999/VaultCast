import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchEssentials, completeEssential, createEssential, updateEssential, deleteEssential, setShowForm, setNewEssential, updateNewEssential, setEditingEssentialId, setEditedEssential, updateEditedEssential, setEssentialDecision, Essential } from "@/store/decision_helper";

export const useEssentialList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { essentials, loading, error, showForm, newEssential, editingEssentialId, editedEssential, essentialDecisions } = useSelector((state: RootState) => state.decisionHelper.essentials);

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

  return {
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
    handleSetNewEssential,
    handleUpdateNewEssential,
    handleSetEditingEssential,
    handleUpdateEditedEssential,
    handleEssentialDecision,
  };
};
