import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { MessageProfile } from "../types";

interface AiMessengerState {
  profiles: MessageProfile[];
  showCreateForm: boolean;
  availableFiles: string[];
  loading: boolean;
  error: string | null;
  editingProfileId: string | null;
  questions: Record<string, string>;
  aiResponses: Record<string, string>;
  chatLoading: Record<string, boolean>;
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

export const fetchAvailableFiles = createAsyncThunk<
  string[],
  void,
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

export const fetchProfiles = createAsyncThunk<
  MessageProfile[],
  void,
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

export const createProfile = createAsyncThunk<
  MessageProfile,
  Omit<MessageProfile, "id">,
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
    return data as MessageProfile;
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return rejectWithValue(error.message || "Failed to create profile");
  }
});

export const updateProfile = createAsyncThunk<
  MessageProfile,
  MessageProfile,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiMessenger/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/ai_messenger/profiles/${profileData.id}`, {
      method: "PUT",
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
    return data as MessageProfile;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return rejectWithValue(error.message || "Failed to update profile");
  }
});

export const deleteProfile = createAsyncThunk<
  string,
  string,
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
    return profileId;
  } catch (error: any) {
    console.error("Error deleting profile:", error);
    return rejectWithValue(error.message || "Failed to delete profile");
  }
});

export const sendMessageToAI = createAsyncThunk<
  string,
  { profileId: string; question: string },
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

      dispatch(setAiResponse({ profileId, response: streamedResponse }));
    }

    dispatch(setChatLoading({ profileId, loading: false }));
    return streamedResponse;
  } catch (error: any) {
    console.error("Error sending message:", error);
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
      if (action.payload && !state.editingProfileId) {
        state.editingProfileId = null;
      }
      if (!action.payload) {
        state.editingProfileId = null;
      }
    },
    setEditingProfileId: (state, action: PayloadAction<string | null>) => {
      state.editingProfileId = action.payload;

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
      .addCase(fetchAvailableFiles.pending, (state) => {})
      .addCase(fetchAvailableFiles.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.availableFiles = action.payload;
      })
      .addCase(fetchAvailableFiles.rejected, (state, action) => {
        console.error("Failed to fetch available files:", action.payload);
      })
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
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action: PayloadAction<MessageProfile>) => {
        state.loading = false;
        state.profiles.push(action.payload);
        state.showCreateForm = false;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create profile";
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<MessageProfile>) => {
        state.loading = false;
        const index = state.profiles.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
        state.showCreateForm = false;
        state.editingProfileId = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update profile";
      })
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.profiles = state.profiles.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete profile";
      })
      .addCase(sendMessageToAI.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {})
      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to send message";
      });
  },
});

export const { setShowCreateForm, setEditingProfileId, setAvailableFiles, setQuestion, setAiResponse, setChatLoading, setEditForm, updateEditForm, clearEditForm, setProfiles } = aiMessengerSlice.actions;

export default aiMessengerSlice.reducer;
export type { AiMessengerState };
