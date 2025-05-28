"use client";

import React from "react";
import { List, ListItem } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setEditingProfileId, updateEditForm, updateProfile, deleteProfile, setQuestion, sendMessageToAI } from "@/store/aiMessengerSlice";
import MessengerProfileCard from "./MessengerProfileCard";
import { MessageProfile } from "./types";

interface MessengerProfileListProps {
  profiles: MessageProfile[];
  availableFiles: string[];
}

export default function MessengerProfileList({ profiles, availableFiles }: MessengerProfileListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { editingProfileId, editForm, questions, aiResponses, chatLoading } = useSelector((state: RootState) => state.aiMessenger);

  const handleEditClick = (profileId: string) => {
    dispatch(setEditingProfileId(profileId));
  };

  const handleDeleteClick = (profileId: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      dispatch(deleteProfile(profileId));
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

  const handleCancelForm = () => {
    dispatch(setEditingProfileId(null));
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

  const handleSendClick = (profileId: string, question: string) => {
    if (!question.trim()) return;
    dispatch(sendMessageToAI({ profileId, question }));
  };

  return (
    <List>
      {profiles.map((profile) => {
        const isCurrentlyEditingThisCard = editingProfileId === profile.id;
        return (
          <ListItem key={profile.id} sx={{ mb: 6, mt: 6 }}>
            <MessengerProfileCard
              profile={profile}
              availableFiles={availableFiles}
              isEditing={isCurrentlyEditingThisCard}
              editedName={isCurrentlyEditingThisCard ? editForm.name : profile.name}
              editedSystemPrompt={isCurrentlyEditingThisCard ? editForm.systemPrompt : profile.systemPrompt}
              editedFiles={isCurrentlyEditingThisCard ? editForm.files : profile.files || []}
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
          </ListItem>
        );
      })}
    </List>
  );
}
