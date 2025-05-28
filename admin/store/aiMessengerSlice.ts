import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "./store"; // Adjust path as needed
import { MessageProfile } from "@/lib/features/ai_messenger/types"; // Adjust path as needed

interface AiMessengerState {
  profiles: MessageProfile[];
  showCreateForm: boolean;
  availableFiles: string[]; // Assuming availableFiles is an array of strings
  loading: boolean;
  error: string | null;
  // Add state for the profile being edited, if any
  editingProfileId: string | null;
  // Add question and AI response state per profile
  questions: Record<string, string>; // profileId -> question
  aiResponses: Record<string, string>; // profileId -> aiResponse
  chatLoading: Record<string, boolean>; // profileId -> loading state for chat
  // Form state for editing
  editForm: {
    name: string;
    systemPrompt: string;
    files: string[];
  };
}

const initialState: AiMessengerState = {
  profiles: [],
  showCreateForm: false,
  availableFiles: [],
  loading: false,
  error: null,
  editingProfileId: null,
  questions: {},
  aiResponses: {},
  chatLoading: {},
  editForm: {
    name: "",
    systemPrompt: "",
    files: [],
  },
};

// Async Thunks

// Thunk to fetch available files
export const fetchAvailableFiles = createAsyncThunk<
  string[], // Return type on fulfillment
  void, // Argument type
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/fetchAvailableFiles", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CONTENT_SERVER_URL || "http://127.0.0.1:3001"}/api/files/ai_messenger`);
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch files");
    }
    const data = await response.json();
    return data.files as string[];
  } catch (error: any) {
    console.error("Error fetching available files:", error);
    return rejectWithValue(error.message || "Failed to fetch files");
  }
});

// Thunk to fetch profiles (You'll need to implement the API call)
export const fetchProfiles = createAsyncThunk<
  MessageProfile[], // Return type on fulfillment
  void, // Argument type
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/fetchProfiles", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_messenger/profiles", {
      next: { revalidate: 300, tags: ["ai-messenger"] },
    });
    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to fetch profiles");
    }
    const data = await response.json();
    return data as MessageProfile[];
  } catch (error: any) {
    console.error("Error fetching profiles:", error);
    return rejectWithValue(error.message || "Failed to fetch profiles");
  }
});

// Thunk to create a profile (You'll need to implement the API call)
export const createProfile = createAsyncThunk<
  MessageProfile, // Return type on fulfillment (the created profile)
  Omit<MessageProfile, "id">, // Argument type (profile data without ID)
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/createProfile", async (newProfileData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_messenger/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProfileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to create profile");
    }
    const data = await response.json();
    return data as MessageProfile; // Assuming API returns the created profile with ID
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return rejectWithValue(error.message || "Failed to create profile");
  }
});

// Thunk to update a profile (You'll need to implement the API call)
export const updateProfile = createAsyncThunk<
  MessageProfile, // Return type on fulfillment (the updated profile)
  MessageProfile, // Argument type (the full profile object with ID)
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/ai_messenger/profiles/${profileData.id}`, {
      method: "PUT", // or PATCH
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to update profile");
    }
    const data = await response.json();
    return data as MessageProfile; // Assuming API returns the updated profile
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return rejectWithValue(error.message || "Failed to update profile");
  }
});

// Thunk to delete a profile (You'll need to implement the API call)
export const deleteProfile = createAsyncThunk<
  string, // Return type on fulfillment (the ID of the deleted profile)
  string, // Argument type (the ID of the profile to delete)
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/deleteProfile", async (profileId, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/ai_messenger/profiles/${profileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to delete profile");
    }
    // Assuming success response doesn't need to return the full object, just confirm deletion
    // You might adjust this based on your actual API response
    return profileId; // Return the ID of the deleted profile
  } catch (error: any) {
    console.error("Error deleting profile:", error);
    return rejectWithValue(error.message || "Failed to delete profile");
  }
});

// Thunk to send message to AI with streaming
export const sendMessageToAI = createAsyncThunk<
  string, // Return type on fulfillment (AI response)
  { profileId: string; question: string }, // Argument type
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/sendMessage", async ({ profileId, question }, { getState, rejectWithValue, dispatch }) => {
  try {
    const state = getState();
    const profile = state.aiMessenger.profiles.find((p) => p.id === profileId);

    if (!profile) {
      return rejectWithValue("Profile not found");
    }

    // Clear any existing response for this profile and set chat loading
    dispatch(setAiResponse({ profileId, response: "" }));
    dispatch(setChatLoading({ profileId, loading: true }));

    const response = await fetch("/api/ai_messenger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId,
        question,
        systemPrompt: profile.systemPrompt,
        files: profile.files || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Failed to send message");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return rejectWithValue("Failed to get reader from response body.");
    }

    const decoder = new TextDecoder();
    let streamedResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      streamedResponse += chunk;

      // Update the Redux state with the accumulated response in real-time
      dispatch(setAiResponse({ profileId, response: streamedResponse }));
    }

    // Clear chat loading when done
    dispatch(setChatLoading({ profileId, loading: false }));
    return streamedResponse;
  } catch (error: any) {
    console.error("Error sending message:", error);
    // Clear chat loading on error
    dispatch(setChatLoading({ profileId, loading: false }));
    return rejectWithValue(error.message || "Failed to send message");
  }
});

const aiMessengerSlice = createSlice({
  name: "aiMessenger",
  initialState,
  reducers: {
    setShowCreateForm: (state, action: PayloadAction<boolean>) => {
      state.showCreateForm = action.payload;
      // Clear editing state when showing the create form for a new profile
      // or ensure editingId is set if we intend to edit with the main form.
      if (action.payload && !state.editingProfileId) {
        // If showing form AND no specific profile is being edited
        state.editingProfileId = null; // Ensure it's for creation
      }
      // If we are hiding the form, also clear editingProfileId if it was for the main form.
      // Card-specific editing is handled by setting editingProfileId directly.
      if (!action.payload) {
        state.editingProfileId = null;
      }
    },
    setEditingProfileId: (state, action: PayloadAction<string | null>) => {
      state.editingProfileId = action.payload;

      // If setting a profile ID, populate the edit form with that profile's data
      if (action.payload) {
        const profile = state.profiles.find((p) => p.id === action.payload);
        if (profile) {
          state.editForm = {
            name: profile.name,
            systemPrompt: profile.systemPrompt,
            files: profile.files || [],
          };
        }
      } else {
        // If clearing the editing ID, clear the form
        state.editForm = { name: "", systemPrompt: "", files: [] };
      }
    },
    setAvailableFiles: (state, action: PayloadAction<string[]>) => {
      state.availableFiles = action.payload;
    },
    setQuestion: (state, action: PayloadAction<{ profileId: string; question: string }>) => {
      state.questions[action.payload.profileId] = action.payload.question;
    },
    setAiResponse: (state, action: PayloadAction<{ profileId: string; response: string }>) => {
      state.aiResponses[action.payload.profileId] = action.payload.response;
    },
    setChatLoading: (state, action: PayloadAction<{ profileId: string; loading: boolean }>) => {
      state.chatLoading[action.payload.profileId] = action.payload.loading;
    },
    setEditForm: (state, action: PayloadAction<{ name: string; systemPrompt: string; files: string[] }>) => {
      state.editForm = action.payload;
    },
    updateEditForm: (state, action: PayloadAction<Partial<{ name: string; systemPrompt: string; files: string[] }>>) => {
      state.editForm = { ...state.editForm, ...action.payload };
    },
    clearEditForm: (state) => {
      state.editForm = { name: "", systemPrompt: "", files: [] };
    },
    setProfiles: (state, action: PayloadAction<MessageProfile[]>) => {
      state.profiles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAvailableFiles lifecycle
      .addCase(fetchAvailableFiles.pending, (state) => {
        // You can add loading state for files if needed
      })
      .addCase(fetchAvailableFiles.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.availableFiles = action.payload;
      })
      .addCase(fetchAvailableFiles.rejected, (state, action) => {
        console.error("Failed to fetch available files:", action.payload);
        // You could set an error state for files if needed
      })
      // Handle fetchProfiles lifecycle
      .addCase(fetchProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action: PayloadAction<MessageProfile[]>) => {
        state.loading = false;
        state.profiles = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch profiles";
      })
      // Handle createProfile lifecycle
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action: PayloadAction<MessageProfile>) => {
        state.loading = false;
        state.profiles.push(action.payload);
        state.showCreateForm = false; // Hide form on successful creation
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create profile";
      })
      // Handle updateProfile lifecycle
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<MessageProfile>) => {
        state.loading = false;
        // Find and replace the updated profile in the state array
        const index = state.profiles.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
        state.showCreateForm = false; // Hide form on successful update
        state.editingProfileId = null; // Clear editing state
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      })
      // Handle deleteProfile lifecycle
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        // Remove the deleted profile from the state array
        state.profiles = state.profiles.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete profile";
      })
      // Handle sendMessageToAI lifecycle
      .addCase(sendMessageToAI.pending, (state) => {
        // Don't set global loading for chat - we handle it per-card
        state.error = null;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        // Don't set aiResponse here since it's updated in real-time during streaming
        // Don't change global loading state
      })
      .addCase(sendMessageToAI.rejected, (state, action) => {
        // Don't change global loading state for chat errors
        state.error = (action.payload as string) || "Failed to send message";
      });
  },
});

export const { setShowCreateForm, setEditingProfileId, setAvailableFiles, setQuestion, setAiResponse, setChatLoading, setEditForm, updateEditForm, clearEditForm, setProfiles } = aiMessengerSlice.actions;

export default aiMessengerSlice.reducer;
export type { AiMessengerState };
