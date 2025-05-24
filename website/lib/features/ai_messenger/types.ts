export interface MessageProfile {
  id: string; // Use string to be consistent with MongoDB _id
  name: string;
  systemPrompt: string;
  files: string[];
}

export interface MessengerProfileCardProps {
  profile: MessageProfile;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onSendClick: (question: string) => void;
  availableFiles: string[];
  isEditing: boolean;
  editedName: string;
  editedSystemPrompt: string;
  editedFiles: string[];
  onNameChange: (name: string) => void;
  onSystemPromptChange: (prompt: string) => void;
  onFilesChange: (files: string[]) => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  question: string;
  onQuestionChange: (question: string) => void;
  aiResponse: string;
  loading?: boolean;
}

export interface MessengerProfileListProps {
  profiles: MessageProfile[];
  onUpdateProfile: (profileId: string, updatedData: { name: string; systemPrompt: string; files: string[] }) => Promise<void>;
  onDeleteProfile: (profileId: string) => void;
  availableFiles: string[];
}

export interface ProfileFormProps {
  initialProfile?: MessageProfile | null;
  onSubmit: (profileData: { name: string; systemPrompt: string; files: string[] }) => void;
  availableFiles: string[];
  mode: "create" | "edit";
  onCancel?: () => void;
  name: string;
  systemPrompt: string;
  selectedFiles: string[];
  onNameChange: (name: string) => void;
  onSystemPromptChange: (prompt: string) => void;
  onSelectedFilesChange: (files: string[]) => void;
}
