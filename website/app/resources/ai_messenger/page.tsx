"use client";

import React from "react";
import { Container, Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import MessengerProfileCard from "@/app/features/ai_messenger/MessengerProfileCard";
import ProfileForm from "@/app/features/ai_messenger/ProfileForm";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAiMessengerPage } from "@/app/features/ai_messenger/useAIMessenger";

function AiMessengerPageContent() {
  const {
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
  } = useAiMessengerPage();

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Messenger Profiles
      </Typography>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!showCreateForm && !loading && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
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
                question={question}
                onQuestionChange={setQuestion}
                onSendClick={(q) => handleSendClick(profile.id, q)}
                aiResponse={aiResponse}
              />
            );
          })}
        </Box>
      )}
    </Container>
  );
}

export default function AiMessengerPage() {
  return (
    <Provider store={store}>
      <AiMessengerPageContent />
    </Provider>
  );
}
