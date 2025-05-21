import { useState, useEffect } from "react";
import { MessageProfile } from "../types";

interface UseMessengerProfileStateProps {
  profile: MessageProfile;
  onUpdate: (profileId: string, updatedData: { name: string; systemPrompt: string; files: string[] }) => Promise<void>;
  onDelete: (profileId: string) => void;
}

export function useMessengerProfileState({ profile, onUpdate, onDelete }: UseMessengerProfileStateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedSystemPrompt, setEditedSystemPrompt] = useState(profile.systemPrompt);
  const [editedFiles, setEditedFiles] = useState<string[]>(profile.files || []);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    setEditedName(profile.name);
    setEditedSystemPrompt(profile.systemPrompt);
    setEditedFiles(profile.files || []);
    setQuestion("");
    setAiResponse("");
  }, [profile]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (editedName && editedSystemPrompt) {
      await onUpdate(profile.id, {
        name: editedName,
        systemPrompt: editedSystemPrompt,
        files: editedFiles,
      });
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setEditedName(profile.name);
    setEditedSystemPrompt(profile.systemPrompt);
    setEditedFiles(profile.files || []);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(profile.id);
  };

  const handleSendClick = async () => {
    if (question.trim()) {
      setAiResponse("Loading...");
      try {
        const apiResponse = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: question,
            systemPrompt: editedSystemPrompt,
            model: "gpt-4.1-nano",
            files: editedFiles, // This is a placeholder for now
          }),
        });

        const data = await apiResponse.json();

        if (apiResponse.ok) {
          setAiResponse(data.response);
        } else {
          console.error("Error from API route:", data.error);
          setAiResponse(data.error || "Failed to get response.");
        }
      } catch (error) {
        console.error("Error sending message to AI:", error);
        setAiResponse("Failed to get response.");
      }
    }
  };

  return {
    isEditing,
    editedName,
    editedSystemPrompt,
    editedFiles,
    question,
    aiResponse,
    setIsEditing,
    setEditedName,
    setEditedSystemPrompt,
    setEditedFiles,
    setQuestion,
    setAiResponse,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleDeleteClick,
    handleSendClick,
  };
}
