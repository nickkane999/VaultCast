import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

interface EmailTemplate {
  id: string;
  name: string;
  category: "marketing" | "newsletter" | "announcement" | "promotional" | "transactional";
  thumbnail: string;
  htmlContent: string;
  customizableFields: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface EmailDesign {
  id: string;
  name: string;
  templateId: string;
  customizations: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  htmlContent: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PastEmail {
  _id: string;
  emailTitle: string;
  response: string;
  timestamp: Date;
  requestType?: string;
  question?: string;
  isDeleted?: boolean;
}

interface AiEmailerState {
  requestType: "Raw HTML" | "text" | "HTML Design";
  emailTitle: string;
  question: string;
  action: "Draft" | "Send" | "Update" | "Load" | "Delete";
  updateRequest: string;
  aiResponse: string;
  loading: boolean;
  error: string | null;
  sendToEmail: string;

  // Design-related state
  currentTab: "write" | "design";
  templates: EmailTemplate[];
  designs: EmailDesign[];
  selectedTemplate: EmailTemplate | null;
  selectedDesign: EmailDesign | null;
  designCustomizations: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  previewHtml: string;
  designLoading: boolean;
  designError: string | null;
  showPreview: boolean;
  selectedCategory: "all" | "marketing" | "newsletter" | "announcement" | "promotional" | "transactional";
  designMode: "create" | "update";
  selectedDesignForUpdate: EmailDesign | null;

  // Past emails state
  pastEmails: PastEmail[];
  selectedPastEmail: PastEmail | null;
  pastEmailsLoading: boolean;
  pastEmailsError: string | null;

  // Draft with design state
  selectedDraftDesign: EmailDesign | null;
  draftCustomizations: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  useDesignInDraft: boolean;

  // HTML Design mode state
  selectedHtmlTemplate: EmailTemplate | null;
  htmlDesignCustomizations: {
    title?: string;
    subtitle?: string;
    content?: string;
    buttonText?: string;
    buttonUrl?: string;
    footerText?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  htmlDesignQuestion: string;
  viewMode: "Raw HTML" | "Preview";
  designOption: "Templates" | "Designs";
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

  // Design-related initial state
  currentTab: "write",
  templates: [],
  designs: [],
  selectedTemplate: null,
  selectedDesign: null,
  designCustomizations: {},
  previewHtml: "",
  designLoading: false,
  designError: null,
  showPreview: false,
  selectedCategory: "all",
  designMode: "create",
  selectedDesignForUpdate: null,

  // Past emails initial state
  pastEmails: [],
  selectedPastEmail: null,
  pastEmailsLoading: false,
  pastEmailsError: null,

  // Draft with design initial state
  selectedDraftDesign: null,
  draftCustomizations: {},
  useDesignInDraft: false,

  // HTML Design mode initial state
  selectedHtmlTemplate: null,
  htmlDesignCustomizations: {},
  htmlDesignQuestion: "",
  viewMode: "Raw HTML",
  designOption: "Templates",
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

export const fetchTemplatesThunk = createAsyncThunk<
  EmailTemplate[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/fetchTemplates", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_emailer/designs?type=templates");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.templates || [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch templates");
  }
});

export const fetchDesignsThunk = createAsyncThunk<
  EmailDesign[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/fetchDesigns", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_emailer/designs?type=designs");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.designs || [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch designs");
  }
});

export const saveDesignThunk = createAsyncThunk<
  EmailDesign,
  { name: string; templateId: string; customizations: any },
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/saveDesign", async ({ name, templateId, customizations }, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_emailer/designs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "design",
        name,
        templateId,
        customizations,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.design;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to save design");
  }
});

export const updateDesignThunk = createAsyncThunk<
  EmailDesign,
  { designId: string; customizations: any },
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/updateDesign", async ({ designId, customizations }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/ai_emailer/designs/${designId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customizations,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.design;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update design");
  }
});

export const generatePreviewThunk = createAsyncThunk<
  string,
  { templateId: string; customizations: any },
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/generatePreview", async ({ templateId, customizations }, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_emailer/designs/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        customizations,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.html;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to generate preview");
  }
});

export const fetchPastEmailsThunk = createAsyncThunk<
  PastEmail[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/fetchPastEmails", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_emailer/past-emails");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.emails || [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch past emails");
  }
});

export const loadPastEmailThunk = createAsyncThunk<
  string,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/loadPastEmail", async (emailId, { getState, rejectWithValue, dispatch }) => {
  try {
    const state = getState().aiEmailer;
    const selectedEmail = state.pastEmails.find((email: PastEmail) => email._id === emailId);

    if (!selectedEmail) {
      throw new Error("Email not found");
    }

    // Set the email response and title
    dispatch(setAiResponse(selectedEmail.response));
    dispatch(setEmailTitle(selectedEmail.emailTitle));

    return selectedEmail.response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load email");
  }
});

export const deletePastEmailThunk = createAsyncThunk<
  string,
  string,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/deletePastEmail", async (emailId, { rejectWithValue, dispatch }) => {
  try {
    const response = await fetch("/api/ai_emailer/past-emails", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Refresh the past emails list
    dispatch(fetchPastEmailsThunk());

    return emailId;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete email");
  }
});

export const generateEmailWithDesignThunk = createAsyncThunk<
  { response: string; customizations?: any; isDesignBased: boolean },
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/generateEmailWithDesign", async (_, { getState, rejectWithValue, dispatch }) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  const state = getState().aiEmailer;
  const { requestType, emailTitle, question, selectedDraftDesign, draftCustomizations, useDesignInDraft } = state;

  try {
    const response = await fetch("/api/ai_emailer/generate-with-design", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailTitle,
        question,
        requestType,
        selectedDesignId: useDesignInDraft ? selectedDraftDesign?.id : null,
        customizations: draftCustomizations,
      }),
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

    const data = await response.json();

    // Update customizations if they were returned
    if (data.customizations) {
      dispatch(setDraftCustomizations(data.customizations));
    }

    return data;
  } catch (error: any) {
    console.error("Error generating email with design:", error);
    return rejectWithValue(error.message || "An unknown error occurred during generation.");
  }
});

export const fetchTemplatesForDesignThunk = createAsyncThunk<
  EmailTemplate[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/fetchTemplatesForDesign", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/ai_emailer/designs?type=templates");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.templates || [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch templates");
  }
});

export const generateHtmlDesignThunk = createAsyncThunk<
  { response: string; customizations?: any; isDesignBased: boolean },
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>("aiEmailer/generateHtmlDesign", async (_, { getState, rejectWithValue, dispatch }) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  const state = getState().aiEmailer;
  const { selectedHtmlTemplate, htmlDesignCustomizations, htmlDesignQuestion, designOption, selectedDraftDesign, draftCustomizations } = state;

  // Determine which option is selected
  const isTemplateMode = designOption === "Templates";
  const selectedItem = isTemplateMode ? selectedHtmlTemplate : selectedDraftDesign;
  const customizations = isTemplateMode ? htmlDesignCustomizations : draftCustomizations;

  if (!selectedItem) {
    return rejectWithValue("No template or design selected");
  }

  try {
    const response = await fetch("/api/ai_emailer/generate-with-design", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailTitle: customizations.title || "Email",
        question: htmlDesignQuestion,
        requestType: "Raw HTML",
        selectedDesignId: isTemplateMode ? null : selectedItem.id,
        customizations: customizations,
        templateId: isTemplateMode ? selectedItem.id : (selectedItem as EmailDesign).templateId,
      }),
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

    const data = await response.json();

    // Save to emailer_agent collection
    try {
      const saveResponse = await fetch("/api/ai_emailer/save-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "Draft",
          requestType: "Raw HTML",
          emailTitle: customizations.title || "HTML Design Email",
          question: htmlDesignQuestion,
          response: data.response,
          timestamp: new Date(),
        }),
      });

      if (!saveResponse.ok) {
        console.warn("Failed to save to emailer_agent collection");
      }
    } catch (saveError) {
      console.warn("Failed to save to emailer_agent collection:", saveError);
    }

    // Update customizations if they were returned
    if (data.customizations) {
      if (isTemplateMode) {
        dispatch(setHtmlDesignCustomizations(data.customizations));
      } else {
        dispatch(setDraftCustomizations(data.customizations));
      }
    }

    return data;
  } catch (error: any) {
    console.error("Error generating HTML design:", error);
    return rejectWithValue(error.message || "An unknown error occurred during HTML design generation.");
  }
});

const aiEmailerSlice = createSlice({
  name: "aiEmailer",
  initialState,
  reducers: {
    setRequestType: (state, action: PayloadAction<"Raw HTML" | "text" | "HTML Design">) => {
      state.requestType = action.payload;
    },
    setEmailTitle: (state, action: PayloadAction<string>) => {
      state.emailTitle = action.payload;
    },
    setQuestion: (state, action: PayloadAction<string>) => {
      state.question = action.payload;
    },
    setAction: (state, action: PayloadAction<"Draft" | "Send" | "Update" | "Load" | "Delete">) => {
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

    // Design-related reducers
    setCurrentTab: (state, action: PayloadAction<"write" | "design">) => {
      state.currentTab = action.payload;
    },
    setSelectedTemplate: (state, action: PayloadAction<EmailTemplate | null>) => {
      state.selectedTemplate = action.payload;
      if (action.payload) {
        state.designCustomizations = { ...action.payload.customizableFields };
      }
    },
    setSelectedDesign: (state, action: PayloadAction<EmailDesign | null>) => {
      state.selectedDesign = action.payload;
      if (action.payload) {
        state.designCustomizations = { ...action.payload.customizations };
      }
    },
    setDesignCustomizations: (state, action: PayloadAction<Partial<typeof state.designCustomizations>>) => {
      state.designCustomizations = { ...state.designCustomizations, ...action.payload };
    },
    setPreviewHtml: (state, action: PayloadAction<string>) => {
      state.previewHtml = action.payload;
    },
    setDesignLoading: (state, action: PayloadAction<boolean>) => {
      state.designLoading = action.payload;
    },
    setDesignError: (state, action: PayloadAction<string | null>) => {
      state.designError = action.payload;
    },
    setShowPreview: (state, action: PayloadAction<boolean>) => {
      state.showPreview = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<typeof state.selectedCategory>) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
      state.designCustomizations = {};
      state.previewHtml = "";
    },
    clearSelectedDesign: (state) => {
      state.selectedDesign = null;
      state.designCustomizations = {};
      state.previewHtml = "";
    },
    setDesignMode: (state, action: PayloadAction<"create" | "update">) => {
      state.designMode = action.payload;
    },
    setSelectedDesignForUpdate: (state, action: PayloadAction<EmailDesign | null>) => {
      state.selectedDesignForUpdate = action.payload;
      if (action.payload) {
        state.designCustomizations = { ...action.payload.customizations };
      }
    },

    // Past emails reducers
    setPastEmails: (state, action: PayloadAction<PastEmail[]>) => {
      state.pastEmails = action.payload;
    },
    setSelectedPastEmail: (state, action: PayloadAction<PastEmail | null>) => {
      state.selectedPastEmail = action.payload;
    },
    setPastEmailsLoading: (state, action: PayloadAction<boolean>) => {
      state.pastEmailsLoading = action.payload;
    },
    setPastEmailsError: (state, action: PayloadAction<string | null>) => {
      state.pastEmailsError = action.payload;
    },

    // Draft with design reducers
    setSelectedDraftDesign: (state, action: PayloadAction<EmailDesign | null>) => {
      state.selectedDraftDesign = action.payload;
      if (action.payload) {
        state.draftCustomizations = { ...action.payload.customizations };
      }
    },
    setDraftCustomizations: (state, action: PayloadAction<Partial<typeof state.draftCustomizations>>) => {
      state.draftCustomizations = { ...state.draftCustomizations, ...action.payload };
    },
    setUseDesignInDraft: (state, action: PayloadAction<boolean>) => {
      state.useDesignInDraft = action.payload;
    },

    // HTML Design mode reducers
    setSelectedHtmlTemplate: (state, action: PayloadAction<EmailTemplate | null>) => {
      state.selectedHtmlTemplate = action.payload;
      if (action.payload) {
        state.htmlDesignCustomizations = { ...action.payload.customizableFields };
      }
    },
    setHtmlDesignCustomizations: (state, action: PayloadAction<Partial<typeof state.htmlDesignCustomizations>>) => {
      state.htmlDesignCustomizations = { ...state.htmlDesignCustomizations, ...action.payload };
    },
    setHtmlDesignQuestion: (state, action: PayloadAction<string>) => {
      state.htmlDesignQuestion = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"Raw HTML" | "Preview">) => {
      state.viewMode = action.payload;
    },
    setDesignOption: (state, action: PayloadAction<"Templates" | "Designs">) => {
      state.designOption = action.payload;
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
      })

      // Design-related extra reducers
      .addCase(fetchTemplatesThunk.pending, (state) => {
        state.designLoading = true;
        state.designError = null;
      })
      .addCase(fetchTemplatesThunk.fulfilled, (state, action: PayloadAction<EmailTemplate[]>) => {
        state.designLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesThunk.rejected, (state, action) => {
        state.designLoading = false;
        state.designError = (action.payload as string) || "Failed to fetch templates";
      })
      .addCase(fetchDesignsThunk.pending, (state) => {
        state.designLoading = true;
        state.designError = null;
      })
      .addCase(fetchDesignsThunk.fulfilled, (state, action: PayloadAction<EmailDesign[]>) => {
        state.designLoading = false;
        state.designs = action.payload;
      })
      .addCase(fetchDesignsThunk.rejected, (state, action) => {
        state.designLoading = false;
        state.designError = (action.payload as string) || "Failed to fetch designs";
      })
      .addCase(saveDesignThunk.pending, (state) => {
        state.designLoading = true;
        state.designError = null;
      })
      .addCase(saveDesignThunk.fulfilled, (state, action: PayloadAction<EmailDesign>) => {
        state.designLoading = false;
        state.designs.push(action.payload);
        state.selectedDesign = action.payload;
      })
      .addCase(saveDesignThunk.rejected, (state, action) => {
        state.designLoading = false;
        state.designError = (action.payload as string) || "Failed to save design";
      })
      .addCase(updateDesignThunk.pending, (state) => {
        state.designLoading = true;
        state.designError = null;
      })
      .addCase(updateDesignThunk.fulfilled, (state, action: PayloadAction<EmailDesign>) => {
        state.designLoading = false;
        const index = state.designs.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.designs[index] = action.payload;
        }
        state.selectedDesignForUpdate = action.payload;
      })
      .addCase(updateDesignThunk.rejected, (state, action) => {
        state.designLoading = false;
        state.designError = (action.payload as string) || "Failed to update design";
      })
      .addCase(generatePreviewThunk.pending, (state) => {
        state.designLoading = true;
        state.designError = null;
      })
      .addCase(generatePreviewThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.designLoading = false;
        state.previewHtml = action.payload;
      })
      .addCase(generatePreviewThunk.rejected, (state, action) => {
        state.designLoading = false;
        state.designError = (action.payload as string) || "Failed to generate preview";
      })
      .addCase(fetchPastEmailsThunk.pending, (state) => {
        state.pastEmailsLoading = true;
        state.pastEmailsError = null;
      })
      .addCase(fetchPastEmailsThunk.fulfilled, (state, action: PayloadAction<PastEmail[]>) => {
        state.pastEmailsLoading = false;
        state.pastEmails = action.payload;
      })
      .addCase(fetchPastEmailsThunk.rejected, (state, action) => {
        state.pastEmailsLoading = false;
        state.pastEmailsError = (action.payload as string) || "Failed to fetch past emails";
      })
      .addCase(loadPastEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPastEmailThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
      })
      .addCase(loadPastEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load email";
      })
      .addCase(deletePastEmailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePastEmailThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
      })
      .addCase(deletePastEmailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete email";
      })
      .addCase(generateEmailWithDesignThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateEmailWithDesignThunk.fulfilled, (state, action: PayloadAction<{ response: string; customizations?: any; isDesignBased: boolean }>) => {
        state.loading = false;
        state.aiResponse = action.payload.response;
        if (action.payload.customizations) {
          state.draftCustomizations = action.payload.customizations;
        }
      })
      .addCase(generateEmailWithDesignThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to generate email with design";
      })
      .addCase(fetchTemplatesForDesignThunk.pending, (state) => {
        state.designLoading = true;
        state.designError = null;
      })
      .addCase(fetchTemplatesForDesignThunk.fulfilled, (state, action: PayloadAction<EmailTemplate[]>) => {
        state.designLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesForDesignThunk.rejected, (state, action) => {
        state.designLoading = false;
        state.designError = (action.payload as string) || "Failed to fetch templates for design";
      })
      .addCase(generateHtmlDesignThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateHtmlDesignThunk.fulfilled, (state, action: PayloadAction<{ response: string; customizations?: any; isDesignBased: boolean }>) => {
        state.loading = false;
        state.aiResponse = action.payload.response;
        if (action.payload.customizations) {
          state.htmlDesignCustomizations = action.payload.customizations;
        }
      })
      .addCase(generateHtmlDesignThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to generate HTML design";
      });
  },
});

export const {
  setRequestType,
  setEmailTitle,
  setQuestion,
  setAction,
  setUpdateRequest,
  setAiResponse,
  setLoading,
  setError,
  setSendToEmail,
  setCurrentTab,
  setSelectedTemplate,
  setSelectedDesign,
  setDesignCustomizations,
  setPreviewHtml,
  setDesignLoading,
  setDesignError,
  setShowPreview,
  setSelectedCategory,
  clearSelectedTemplate,
  clearSelectedDesign,
  setDesignMode,
  setSelectedDesignForUpdate,
  setPastEmails,
  setSelectedPastEmail,
  setPastEmailsLoading,
  setPastEmailsError,
  setSelectedDraftDesign,
  setDraftCustomizations,
  setUseDesignInDraft,
  setSelectedHtmlTemplate,
  setHtmlDesignCustomizations,
  setHtmlDesignQuestion,
  setViewMode,
  setDesignOption,
} = aiEmailerSlice.actions;

export default aiEmailerSlice.reducer;

export type { AiEmailerState, EmailTemplate, EmailDesign, PastEmail };
