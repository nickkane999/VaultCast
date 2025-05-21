import { useState, useEffect } from "react";
import { MessageProfile } from "../types";

interface UseProfileFormStateProps {
  initialProfile?: MessageProfile | null;
  onSubmit: (profileData: { name: string; systemPrompt: string; files: string[] }) => void;
}

export function useProfileFormState({ initialProfile, onSubmit }: UseProfileFormStateProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [systemPrompt, setSystemPrompt] = useState(initialProfile?.systemPrompt || "");
  const [selectedFiles, setSelectedFiles] = useState<string[]>(initialProfile?.files || []);

  useEffect(() => {
    setName(initialProfile?.name || "");
    setSystemPrompt(initialProfile?.systemPrompt || "");
    setSelectedFiles(initialProfile?.files || []);
  }, [initialProfile]);

  const handleSave = () => {
    if (name && systemPrompt) {
      onSubmit({
        name: name,
        systemPrompt: systemPrompt,
        files: selectedFiles,
      });
    }
  };

  return {
    name,
    setName,
    systemPrompt,
    setSystemPrompt,
    selectedFiles,
    setSelectedFiles,
    handleSave,
  };
}
