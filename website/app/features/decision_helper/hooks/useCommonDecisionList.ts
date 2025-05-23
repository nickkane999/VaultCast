import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { setDecisionShowForm, setNewDecision, updateNewDecision, setEditingDecisionId, setEditedDecision, updateEditedDecision, setCommonDecisionResult, createDecision, updateDecisionThunk, deleteDecisionThunk } from "../../../../store/decisionHelperSlice";
import { CommonDecision } from "../types";

interface UseCommonDecisionListProps {
  initialDecisions: CommonDecision[];
}

export const useCommonDecisionList = ({ initialDecisions }: UseCommonDecisionListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { commonDecisions, decisionShowForm, newDecision, editingDecisionId, editedDecision, commonDecisionResults, loading } = useSelector((state: RootState) => state.decisionHelper);

  const handleAddCard = () => dispatch(setDecisionShowForm(true));

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateNewDecision({ [e.target.name]: e.target.value }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateEditedDecision({ [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.name) return;

    dispatch(createDecision(newDecision.name));
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedDecision.name || editingDecisionId === null) return;

    dispatch(
      updateDecisionThunk({
        id: editingDecisionId,
        name: editedDecision.name,
      })
    );
  };

  const handleDelete = async (id: string | number) => {
    dispatch(deleteDecisionThunk(id));
  };

  const handleEdit = (id: string | number, name: string) => {
    dispatch(setEditingDecisionId(id));
    dispatch(setEditedDecision({ name }));
  };

  const handleDecision = (id: string | number) => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    dispatch(setCommonDecisionResult({ id: id.toString(), value: randomNum }));
  };

  return {
    decisions: commonDecisions,
    showForm: decisionShowForm,
    newDecision,
    editingId: editingDecisionId,
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
    setShowForm: (show: boolean) => dispatch(setDecisionShowForm(show)),
    setEditingId: (id: string | number | null) => dispatch(setEditingDecisionId(id)),
  };
};
