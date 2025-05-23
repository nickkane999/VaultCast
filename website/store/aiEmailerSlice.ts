import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface AiEmailerState {
  requestType: "Raw HTML" | "text";
  emailTitle: string;
  question: string;
  action: "Draft" | "Send" | "Update";
  updateRequest: string;
  aiResponse: string;
  loading: boolean;
  error: string | null;
  sendToEmail: string;
}

const initialState: AiEmailerState = {
  requestType: "text",
  emailTitle: "",
  question: "",
  action: "Draft",
  updateRequest: "",
  aiResponse: "",
  loading: false,
  error: null,
  sendToEmail: "",
};

export const handleSubmitThunk = createAsyncThunk<
  string,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/handleSubmit", async (_, { getState, rejectWithValue, dispatch }) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  const state = getState().aiEmailer;
  const { requestType, emailTitle, question, action, updateRequest, aiResponse } = state;

  let requestBody: any = { action };

  if (action === "Draft") {
    requestBody = { ...requestBody, requestType, emailTitle, question };
  } else if (action === "Update") {
    requestBody = { ...requestBody, originalResponse: aiResponse, updateRequest };
  }

  try {
    const response = await fetch("/api/ai_emailer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        return rejectWithValue(errorJson.error || `HTTP error! status: ${response.status}`);
      } catch (e) {
        return rejectWithValue(errorText || `HTTP error! status: ${response.status}`);
      }
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
      dispatch(setAiResponse(streamedResponse));
    }

    return streamedResponse;
  } catch (error: any) {
    console.error("Error submitting form (thunk):", error);
    return rejectWithValue(error.message || "An unknown error occurred during submission.");
  }
});

export const handleSendEmailThunk = createAsyncThunk<
  any,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/handleSendEmail", async (_, { getState, rejectWithValue, dispatch }) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  const state = getState().aiEmailer;
  const { aiResponse, emailTitle, sendToEmail } = state;

  console.log("Sending email with content (thunk):", aiResponse, "to:", sendToEmail);

  try {
    const response = await fetch("/api/ai_emailer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "SendEmailDirectly", emailBody: aiResponse, emailTitle: emailTitle, to: sendToEmail }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Send email API response (thunk):", result);
    return result;
  } catch (error: any) {
    console.error("Error sending email (thunk):", error);
    return rejectWithValue(error.message || "Failed to send email via thunk.");
  } finally {
  }
});

const aiEmailerSlice = createSlice({
  name: "aiEmailer",
  initialState,
  reducers: {
    setRequestType: (state, action: PayloadAction<"Raw HTML" | "text">) => {
      state.requestType = action.payload;
    },
    setEmailTitle: (state, action: PayloadAction<string>) => {
      state.emailTitle = action.payload;
    },
    setQuestion: (state, action: PayloadAction<string>) => {
      state.question = action.payload;
    },
    setAction: (state, action: PayloadAction<"Draft" | "Send" | "Update">) => {
      state.action = action.payload;
    },
    setUpdateRequest: (state, action: PayloadAction<string>) => {
      state.updateRequest = action.payload;
    },
    setAiResponse: (state, action: PayloadAction<string>) => {
      state.aiResponse = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSendToEmail: (state, action: PayloadAction<string>) => {
      state.sendToEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleSubmitThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.aiResponse = "";
      })
      .addCase(handleSubmitThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
      })
      .addCase(handleSubmitThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "An error occurred";
      })
      .addCase(handleSendEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleSendEmailThunk.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Email sent successfully (extraReducer):");
      })
      .addCase(handleSendEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to send email";
      });
  },
});

export const { setRequestType, setEmailTitle, setQuestion, setAction, setUpdateRequest, setAiResponse, setLoading, setError, setSendToEmail } = aiEmailerSlice.actions;

export default aiEmailerSlice.reducer;

export type { AiEmailerState };
