"use client";

import React, { useEffect, useTransition, useState } from "react";
import { Container, Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import MessengerProfileCard from "./MessengerProfileCard";
import ProfileForm from "./ProfileForm";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { useAiMessengerPage } from "./useAIMessenger";
import { MessageProfile } from "./types";
import { setProfiles, setAvailableFiles } from "./store/aiMessengerSlice";

interface AiMessengerData {
  profiles: MessageProfile[];
  availableFiles: string[];
}

interface AiMessengerClientProps {
  initialData: AiMessengerData;
  refreshAction: () => Promise<void>;
}

function AiMessengerContent({ initialData, refreshAction }: AiMessengerClientProps) {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    profiles,
    showCreateForm,
    availableFiles,
    loading,
    error: reduxError,
    editingProfileId,
    editingProfile,
    editedName,
    editedSystemPrompt,
    editedFiles,
    questions,
    aiResponses,
    chatLoading,
    handleShowCreateForm,
    handleCancelForm,
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
  } = useAiMessengerPage();

  useEffect(() => {
    console.log("Initializing AI Messenger with data:", initialData);
    dispatch(setProfiles(initialData.profiles));
    dispatch(setAvailableFiles(initialData.availableFiles));
  }, [dispatch, initialData]);

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await refreshAction();
        setError(null);
      } catch (err) {
        setError("Failed to refresh data");
      }
    });
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Messenger Profiles
      </Typography>

      {(error || reduxError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleClearError}>
          {error || reduxError}
        </Alert>
      )}

      {loading && <CircularProgress sx={{ mt: 2 }} />}

      {!showCreateForm && !loading && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Button variant="contained" onClick={handleRefresh} disabled={isPending} sx={{ mr: 2 }}>
            {isPending ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="contained" onClick={handleShowCreateForm}>
            Create New Profile
          </Button>
        </Box>
      )}

      {showCreateForm && (
        <ProfileForm
          mode={editingProfileId && editingProfile ? "edit" : "create"}
          initialProfile={editingProfile}
          onSubmit={editingProfileId && editingProfile ? handleUpdateProfileFromForm : handleCreateFormSubmit}
          availableFiles={availableFiles}
          onCancel={handleCancelForm}
          name={editedName}
          systemPrompt={editedSystemPrompt}
          selectedFiles={editedFiles}
          onNameChange={handleNameChange}
          onSystemPromptChange={handleSystemPromptChange}
          onSelectedFilesChange={handleFilesChange}
        />
      )}

      {!showCreateForm && !loading && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Existing Profiles
          </Typography>
          {profiles.map((profile) => {
            const isCurrentlyEditingThisCard = editingProfileId === profile.id;
            return (
              <MessengerProfileCard
                key={profile.id}
                profile={profile}
                availableFiles={availableFiles}
                isEditing={isCurrentlyEditingThisCard}
                editedName={isCurrentlyEditingThisCard ? editedName : profile.name}
                editedSystemPrompt={isCurrentlyEditingThisCard ? editedSystemPrompt : profile.systemPrompt}
                editedFiles={isCurrentlyEditingThisCard ? editedFiles : profile.files || []}
                onNameChange={handleNameChange}
                onSystemPromptChange={handleSystemPromptChange}
                onFilesChange={handleFilesChange}
                onSaveClick={handleSaveEditedProfileCard}
                onCancelClick={handleCancelForm}
                onEditClick={() => handleEditClick(profile.id)}
                onDeleteClick={() => handleDeleteClick(profile.id)}
                question={questions[profile.id] || ""}
                onQuestionChange={(q) => handleQuestionChange(profile.id, q)}
                onSendClick={(q) => handleSendClick(profile.id, q)}
                aiResponse={aiResponses[profile.id] || ""}
                loading={chatLoading[profile.id] || false}
              />
            );
          })}
        </Box>
      )}
    </Container>
  );
}

export default function AiMessengerClient(props: AiMessengerClientProps) {
  return (
    <Provider store={store}>
      <AiMessengerContent {...props} />
    </Provider>
  );
}
