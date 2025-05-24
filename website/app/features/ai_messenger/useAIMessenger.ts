import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { createProfile, deleteProfile, setShowCreateForm, setEditingProfileId, updateProfile, fetchProfiles, fetchAvailableFiles } from "@/store/aiMessengerSlice";
import { MessageProfile } from "./types";
import { useState, useEffect } from "react";

export const useAiMessengerPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, showCreateForm, availableFiles, loading, error, editingProfileId } = useSelector((state: RootState) => state.aiMessenger);

  // State for the form inputs when editing
  const [editedName, setEditedName] = useState("");
  const [editedSystemPrompt, setEditedSystemPrompt] = useState("");
  const [editedFiles, setEditedFiles] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    dispatch(fetchProfiles());
    dispatch(fetchAvailableFiles());
  }, [dispatch]);

  useEffect(() => {
    if (editingProfileId) {
      const profileToEdit = profiles.find((p) => p.id === editingProfileId);
      if (profileToEdit) {
        setEditedName(profileToEdit.name);
        setEditedSystemPrompt(profileToEdit.systemPrompt);
        setEditedFiles(profileToEdit.files || []);
      } else {
        dispatch(setEditingProfileId(null));
      }
    } else {
      setEditedName("");
      setEditedSystemPrompt("");
      setEditedFiles([]);
    }
  }, [editingProfileId, profiles, dispatch]);

  const handleShowCreateForm = () => {
    dispatch(setEditingProfileId(null));
    dispatch(setShowCreateForm(true));
    setEditedName("");
    setEditedSystemPrompt("");
    setEditedFiles([]);
  };

  const handleCancelForm = () => {
    dispatch(setShowCreateForm(false));
    dispatch(setEditingProfileId(null));
    setEditedName("");
    setEditedSystemPrompt("");
    setEditedFiles([]);
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
      const profileToUpdate = profiles.find((p) => p.id === editingProfileId);
      if (profileToUpdate) {
        const updatedProfileData: MessageProfile = {
          ...profileToUpdate,
          id: editingProfileId,
          name: editedName,
          systemPrompt: editedSystemPrompt,
          files: editedFiles,
        };
        dispatch(updateProfile(updatedProfileData));
      }
    }
  };

  // Handlers for MessengerProfileCard
  const handleEditClick = (profileId: string) => {
    dispatch(setEditingProfileId(profileId));
  };

  const handleDeleteClick = (profileId: string) => {
    handleDeleteProfile(profileId);
  };

  const handleSendClick = async (profileId: string, currentQuestion: string) => {
    if (!currentQuestion.trim()) return;
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) {
      console.error("Profile not found for sending message");
      setAiResponse("Error: Profile not found.");
      return;
    }
    console.log(`Sending message for profile ${profileId} (${profile.name}): ${currentQuestion}`);
    setAiResponse("Waiting for AI response...");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_prompt: profile.systemPrompt,
          user_message: currentQuestion,
          file_ids: profile.files,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText || "Failed to get response"}`);
      }
      const data = await response.json();
      setAiResponse(data.response || "No response content from AI.");
    } catch (error: any) {
      console.error("Error sending message to AI:", error);
      setAiResponse(`Error: ${error.message || "Could not get AI response."}`);
    }
  };

  const handleNameChange = (name: string) => {
    setEditedName(name);
  };

  const handleSystemPromptChange = (prompt: string) => {
    setEditedSystemPrompt(prompt);
  };

  const handleFilesChange = (files: string[]) => {
    setEditedFiles(files);
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
    editedName,
    editedSystemPrompt,
    editedFiles,
    question,
    aiResponse,
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
    setQuestion,
    setAiResponse,
  };
};
