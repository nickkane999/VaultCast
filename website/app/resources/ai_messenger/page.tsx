"use client";
import React, { useState, useEffect } from "react";
import styles from "../../page.module.css";
import { Container, Typography, Box, TextField, Button, Paper, List, ListItem, Card, CardContent, CardActions, Autocomplete, Chip } from "@mui/material";
import ProfileForm from "@/app/features/ai_messenger/ProfileForm";
import MessengerProfileList from "@/app/features/ai_messenger/MessengerProfileList";
import { MessageProfile } from "@/app/features/ai_messenger/types";

export default function AIMessengerPage() {
  const [profiles, setProfiles] = useState<MessageProfile[]>([]);
  // State to control create form visibility and mode (editing state moved to card)
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Available files in the directory
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);

  // Fetch available files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/files/ai_messenger");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setAvailableFiles(data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  // Fetch existing profiles on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch("/api/messenger_profiles");
        if (!response.ok) {
          throw new Error("Failed to fetch profiles");
        }
        const data = await response.json();
        // Assuming the backend returns profiles with _id as ObjectId, convert it to string for key
        setProfiles(
          data.map((profile: any) => ({
            id: profile._id.toString(), // Convert ObjectId to string
            name: profile.name,
            systemPrompt: profile.systemPrompt,
            files: profile.files || [], // Ensure files is an array
          }))
        );
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    fetchProfiles();
  }, []); // Empty dependency array means this effect runs once on mount

  // Modify handleAddProfile to be called by the ProfileForm component when in create mode
  const handleAddProfile = async (profileData: { name: string; systemPrompt: string; files: string[] }) => {
    try {
      const response = await fetch("/api/messenger_profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      const addedProfile = await response.json();
      // Add the new profile to the state with data from profileData and the backend id
      setProfiles([
        ...profiles,
        {
          id: addedProfile.id.toString(), // Ensure id is string from backend response
          name: profileData.name, // Use name from the original form data
          systemPrompt: profileData.systemPrompt, // Use systemPrompt from the original form data
          files: profileData.files || [], // Use files from the original form data (ensure array)
        },
      ]);
    } catch (error) {
      console.error("Error adding profile:", error);
      // Optionally, display an error message to the user
    }
  };

  // Handler for deleting a profile
  const handleDeleteProfile = async (profileId: string) => {
    // Ensure id is string
    try {
      const response = await fetch(`/api/messenger_profiles?id=${profileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }

      // Remove the deleted profile from the state
      setProfiles(profiles.filter((profile) => profile.id !== profileId));
    } catch (error) {
      console.error("Error deleting profile:", error);
      // Optionally, display an error message to the user
    }
  };

  // Handle form submission for creation (editing handled inline in card)
  const handleCreateFormSubmit = async (profileData: { name: string; systemPrompt: string; files: string[] }) => {
    await handleAddProfile(profileData);
    setShowCreateForm(false); // Hide create form after submission
  };

  // Handler for create form cancellation
  const handleCreateFormCancel = () => {
    setShowCreateForm(false);
  };

  // Handler for updating a profile (called from inline edit form in card)
  const handleUpdateProfile = async (id: string, updatedData: { name: string; systemPrompt: string; files: string[] }) => {
    // Ensure id is string
    console.log("Updating profile", id, updatedData);
    // TODO: Implement PUT API call and update profiles state
    try {
      const response = await fetch(`/api/messenger_profiles?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      // Update the profile in the state, ensuring the id is a string for comparison
      setProfiles(profiles.map((profile) => (profile.id === updatedProfile._id.toString() ? { ...profile, ...updatedProfile, id: updatedProfile._id.toString() } : profile)));
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Messenger
        </Typography>

        {/* Button to show the create form */}
        {!showCreateForm && (
          <Box sx={{ my: 4, textAlign: "center" }}>
            <Button variant="contained" onClick={() => setShowCreateForm(true)}>
              Add New Profile
            </Button>
          </Box>
        )}

        {/* Render the ProfileForm for creation when showCreateForm is true */}
        {showCreateForm && <ProfileForm mode={"create"} availableFiles={availableFiles} onSubmit={handleCreateFormSubmit} onCancel={handleCreateFormCancel} />}

        <Typography variant="h5" component="h2" gutterBottom>
          Existing Profiles
        </Typography>

        {/* Use the new MessengerProfileList component and pass handlers */}
        {/* Pass the handleUpdateProfile and handleDeleteProfile handlers */}
        <MessengerProfileList
          profiles={profiles}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          availableFiles={availableFiles} // Pass available files down
        />
      </Box>
    </Container>
  );
}
