import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { createProfile, deleteProfile, setShowCreateForm, setEditingProfileId, updateProfile, fetchProfiles, fetchAvailableFiles, setQuestion, setAiResponse, setChatLoading, sendMessageToAI, updateEditForm, clearEditForm } from "@/store/aiMessengerSlice";
import { MessageProfile } from "./types";
import { useEffect } from "react";

export const useAiMessengerPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, showCreateForm, availableFiles, loading, error, editingProfileId, questions, aiResponses, chatLoading, editForm } = useSelector((state: RootState) => state.aiMessenger);

  // Data is now initialized from server-side cache instead of useEffect

  const handleShowCreateForm = () => {
    dispatch(setEditingProfileId(null));
    dispatch(setShowCreateForm(true));
    dispatch(clearEditForm());
  };

  const handleCancelForm = () => {
    dispatch(setShowCreateForm(false));
    dispatch(setEditingProfileId(null));
    dispatch(clearEditForm());
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      dispatch(deleteProfile(profileId));
    }
  };

  const handleCreateFormSubmit = (profileData: Omit<MessageProfile, "id">) => {
    dispatch(createProfile(profileData));
  };

  const handleUpdateProfileFromForm = (profileData: Omit<MessageProfile, "id">) => {
    if (editingProfileId) {
      const updatedProfile: MessageProfile = {
        id: editingProfileId,
        ...profileData,
      };
      dispatch(updateProfile(updatedProfile));
    }
  };

  const handleSaveEditedProfileCard = () => {
    if (editingProfileId) {
      const updatedProfileData: MessageProfile = {
        id: editingProfileId,
        name: editForm.name,
        systemPrompt: editForm.systemPrompt,
        files: editForm.files,
      };
      dispatch(updateProfile(updatedProfileData));
    }
  };

  const handleEditClick = (profileId: string) => {
    dispatch(setEditingProfileId(profileId));
  };

  const handleDeleteClick = (profileId: string) => {
    handleDeleteProfile(profileId);
  };

  const handleSendClick = (profileId: string, question: string) => {
    if (!question.trim()) return;
    dispatch(sendMessageToAI({ profileId, question }));
  };

  const handleNameChange = (name: string) => {
    dispatch(updateEditForm({ name }));
  };

  const handleSystemPromptChange = (prompt: string) => {
    dispatch(updateEditForm({ systemPrompt: prompt }));
  };

  const handleFilesChange = (files: string[]) => {
    dispatch(updateEditForm({ files }));
  };

  const handleQuestionChange = (profileId: string, question: string) => {
    dispatch(setQuestion({ profileId, question }));
  };

  const editingProfile = editingProfileId ? profiles.find((p) => p.id === editingProfileId) : null;

  return {
    profiles,
    showCreateForm,
    availableFiles,
    loading,
    error,
    editingProfileId,
    editingProfile,
    editedName: editForm.name,
    editedSystemPrompt: editForm.systemPrompt,
    editedFiles: editForm.files,
    questions,
    aiResponses,
    chatLoading,
    handleShowCreateForm,
    handleCancelForm,
    handleDeleteProfile,
    handleCreateFormSubmit,
    handleUpdateProfileFromForm,
    handleSaveEditedProfileCard,
    handleEditClick,
    handleDeleteClick,
    handleSendClick,
    handleNameChange,
    handleSystemPromptChange,
    handleFilesChange,
    handleQuestionChange,
  };
};
