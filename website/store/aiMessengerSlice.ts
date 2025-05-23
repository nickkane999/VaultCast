import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "./store"; // Adjust path as needed
import { MessageProfile } from "../app/features/ai_messenger/types"; // Adjust path as needed

interface AiMessengerState {
  profiles: MessageProfile[];
  showCreateForm: boolean;
  availableFiles: string[]; // Assuming availableFiles is an array of strings
  loading: boolean;
  error: string | null;
  // Add state for the profile being edited, if any
  editingProfileId: string | null;
}

const initialState: AiMessengerState = {
  profiles: [],
  showCreateForm: false,
  availableFiles: [],
  loading: false,
  error: null,
  editingProfileId: null,
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
    const response = await fetch("http://localhost:3001/api/files/ai_messenger");
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
    // TODO: Implement actual API call to fetch profiles
    const response = await fetch("/api/messenger_profiles"); // Assuming an API endpoint
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
    // TODO: Implement actual API call to create a profile
    const response = await fetch("/api/messenger_profiles", {
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
    // TODO: Implement actual API call to update a profile
    const response = await fetch(`/api/messenger_profiles/${profileData.id}`, {
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
    // TODO: Implement actual API call to delete a profile
    const response = await fetch(`/api/messenger_profiles/${profileId}`, {
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
      // If an ID is set, it means we are editing a specific card. The main form should not automatically open.
      // If the main form is ALREADY open for this profile, it can stay open.
      // If action.payload is null, it means we are cancelling an edit.
      if (!action.payload && state.showCreateForm) {
        // If we are clearing editingProfileId AND the main form is shown,
        // it implies we were editing with the main form, so hide it.
        // However, this might conflict if a card edit is cancelled while main form is open for creation.
        // A more robust solution for main form edit: have a separate state like `editingProfileWithMainFormId`
        // For now, just removing the problematic line is the safest first step.
      }
    },
    setAvailableFiles: (state, action: PayloadAction<string[]>) => {
      state.availableFiles = action.payload;
    },
    // You might add reducers for simple state updates if needed
    // e.g., setLoading, setError if not fully handled by extraReducers
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
      });
  },
});

export const { setShowCreateForm, setEditingProfileId, setAvailableFiles } = aiMessengerSlice.actions;

export default aiMessengerSlice.reducer;
export type { AiMessengerState };
