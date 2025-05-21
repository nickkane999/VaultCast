import { useState, useEffect } from "react";
import { MessageProfile } from "../types";

export function useAIMessengerPageState() {
  const [profiles, setProfiles] = useState<MessageProfile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
  }, []);

  // Handler for adding a profile
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
      setProfiles([...profiles, { id: addedProfile.id.toString(), name: profileData.name, systemPrompt: profileData.systemPrompt, files: profileData.files || [] }]);
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  // Handler for deleting a profile
  const handleDeleteProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/messenger_profiles?id=${profileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }

      setProfiles(profiles.filter((profile) => profile.id !== profileId));
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  // Handle form submission for creation
  const handleCreateFormSubmit = async (profileData: { name: string; systemPrompt: string; files: string[] }) => {
    await handleAddProfile(profileData);
    setShowCreateForm(false);
  };

  // Handler for create form cancellation
  const handleCreateFormCancel = () => {
    setShowCreateForm(false);
  };

  // Handler for updating a profile
  const handleUpdateProfile = async (id: string, updatedData: { name: string; systemPrompt: string; files: string[] }) => {
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
      setProfiles(profiles.map((profile) => (profile.id === updatedProfile._id.toString() ? { ...profile, ...updatedProfile, id: updatedProfile._id.toString() } : profile)));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return {
    profiles,
    showCreateForm,
    availableFiles,
    setShowCreateForm,
    handleAddProfile,
    handleDeleteProfile,
    handleCreateFormSubmit,
    handleCreateFormCancel,
    handleUpdateProfile,
  };
}
