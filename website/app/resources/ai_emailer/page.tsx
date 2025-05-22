"use client";

import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import MessengerProfileCard from "../../features/ai_messenger/MessengerProfileCard";
import ProfileForm from "../../features/ai_messenger/ProfileForm";
import { MessageProfile } from "../../features/ai_messenger/types";
import { useAIMessengerPageState } from "../../features/ai_messenger/states/AIMessengerPageState";

export default function AiMessengerPage() {
  const { profiles, showCreateForm, availableFiles, setShowCreateForm, handleDeleteProfile, handleCreateFormSubmit, handleCreateFormCancel, handleUpdateProfile } = useAIMessengerPageState();

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Messenger Profiles
      </Typography>

      {/* Button to show create form */}
      {!showCreateForm && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Button variant="contained" onClick={() => setShowCreateForm(true)}>
            Create New Profile
          </Button>
        </Box>
      )}

      {/* Create/Edit Profile Form */}
      {showCreateForm && <ProfileForm mode="create" onSubmit={handleCreateFormSubmit} availableFiles={availableFiles} onCancel={handleCreateFormCancel} />}

      {/* List of Profiles */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Existing Profiles
        </Typography>
        {profiles.map((profile) => (
          <MessengerProfileCard
            key={profile.id}
            profile={profile}
            onUpdate={handleUpdateProfile}
            onDelete={handleDeleteProfile}
            availableFiles={availableFiles} // Pass available files to the card
          />
        ))}
      </Box>
    </Container>
  );
}
