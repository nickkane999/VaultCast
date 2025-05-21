import { useState } from "react";

interface UseCreateProfileFormStateProps {
  onProfileAdded: (newProfile: { name: string; systemPrompt: string; files: string[] }) => void;
}

export function useCreateProfileFormState({ onProfileAdded }: UseCreateProfileFormStateProps) {
  const [showForm, setShowForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");
  const [newFiles, setNewFiles] = useState<string[]>([]);

  const handleAddProfile = () => {
    if (newProfileName && newSystemPrompt) {
      onProfileAdded({
        name: newProfileName,
        systemPrompt: newSystemPrompt,
        files: newFiles,
      });

      setNewProfileName("");
      setNewSystemPrompt("");
      setNewFiles([]);
      setShowForm(false);
    }
  };

  return {
    showForm,
    setShowForm,
    newProfileName,
    setNewProfileName,
    newSystemPrompt,
    setNewSystemPrompt,
    newFiles,
    setNewFiles,
    handleAddProfile,
  };
}
