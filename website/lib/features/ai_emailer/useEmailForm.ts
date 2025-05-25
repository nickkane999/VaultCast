import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  setRequestType,
  setEmailTitle,
  setQuestion,
  setAction,
  setUpdateRequest,
  setAiResponse,
  setSendToEmail,
  handleSubmitThunk,
  handleSendEmailThunk,
  setSelectedPastEmail,
  fetchPastEmailsThunk,
  loadPastEmailThunk,
  deletePastEmailThunk,
  setSelectedDraftDesign,
  setDraftCustomizations,
  setUseDesignInDraft,
  generateEmailWithDesignThunk,
  fetchDesignsThunk,
  setSelectedHtmlTemplate,
  setHtmlDesignCustomizations,
  setHtmlDesignQuestion,
  setViewMode,
  fetchTemplatesForDesignThunk,
  generateHtmlDesignThunk,
  setDesignOption,
} from "@/store/aiEmailerSlice";

interface UseEditAiResponseProps {
  aiResponse: string;
}

export function useEditAiResponse({ aiResponse }: UseEditAiResponseProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editableAiResponse, setEditableAiResponse] = useState("");

  useEffect(() => {
    setEditableAiResponse(aiResponse);
  }, [aiResponse]);

  const handleEditClick = () => {
    setIsEditingResponse(true);
    setEditableAiResponse(aiResponse);
  };

  const handleSaveEdit = () => {
    dispatch(setAiResponse(editableAiResponse));
    setIsEditingResponse(false);
  };

  const handleCancelEdit = () => {
    setEditableAiResponse(aiResponse);
    setIsEditingResponse(false);
  };

  return {
    isEditingResponse,
    editableAiResponse,
    handleEditClick,
    handleSaveEdit,
    handleCancelEdit,
    setEditableAiResponse,
  };
}

export function useEmailFormHandlers() {
  const dispatch = useDispatch<AppDispatch>();

  const handleRequestTypeChange = (type: "Raw HTML" | "text" | "HTML Design") => {
    dispatch(setRequestType(type));

    // Fetch templates when HTML Design is selected
    if (type === "HTML Design") {
      dispatch(fetchTemplatesForDesignThunk());
    }
  };

  const handleEmailTitleChange = (title: string) => {
    dispatch(setEmailTitle(title));
  };

  const handleQuestionChange = (q: string) => {
    dispatch(setQuestion(q));
  };

  const handleActionChange = (actionType: "Draft" | "Send" | "Update" | "Load" | "Delete") => {
    dispatch(setAction(actionType));

    // Clear selected past email when changing actions
    dispatch(setSelectedPastEmail(null));

    // Fetch past emails when Load or Delete is selected
    if (actionType === "Load" || actionType === "Delete") {
      dispatch(fetchPastEmailsThunk());
    }

    // Fetch designs when Draft is selected
    if (actionType === "Draft") {
      dispatch(fetchDesignsThunk());
    }

    if (actionType !== "Draft" && actionType !== "Send") {
      dispatch(setEmailTitle(""));
      dispatch(setQuestion(""));
    }
    if (actionType !== "Update") {
      dispatch(setUpdateRequest(""));
    }
  };

  const handleUpdateRequestChange = (text: string) => {
    dispatch(setUpdateRequest(text));
  };

  const handleSendToEmailChange = (email: string) => {
    dispatch(setSendToEmail(email));
  };

  const handlePastEmailChange = (pastEmail: any) => {
    dispatch(setSelectedPastEmail(pastEmail));
  };

  const handleDraftDesignChange = (design: any) => {
    dispatch(setSelectedDraftDesign(design));
  };

  const handleDraftCustomizationChange = (field: string, value: string) => {
    dispatch(setDraftCustomizations({ [field]: value }));
  };

  const handleUseDesignToggle = (useDesign: boolean) => {
    dispatch(setUseDesignInDraft(useDesign));
  };

  // HTML Design mode handlers
  const handleHtmlTemplateChange = (template: any) => {
    dispatch(setSelectedHtmlTemplate(template));
  };

  const handleHtmlDesignCustomizationChange = (field: string, value: string) => {
    dispatch(setHtmlDesignCustomizations({ [field]: value }));
  };

  const handleHtmlDesignQuestionChange = (question: string) => {
    dispatch(setHtmlDesignQuestion(question));
  };

  const handleViewModeChange = (mode: "Raw HTML" | "Preview") => {
    dispatch(setViewMode(mode));
  };

  const handleDesignOptionChange = (option: "Templates" | "Designs") => {
    dispatch(setDesignOption(option));

    // Fetch appropriate data based on selection
    if (option === "Templates") {
      dispatch(fetchTemplatesForDesignThunk());
    } else {
      dispatch(fetchDesignsThunk());
    }
  };

  const handleSubmit = async () => {
    dispatch(handleSubmitThunk());
  };

  const handleSubmitWithDesign = async () => {
    dispatch(generateEmailWithDesignThunk());
  };

  const handleSubmitHtmlDesign = async () => {
    dispatch(generateHtmlDesignThunk());
  };

  const handleSendEmail = async () => {
    dispatch(handleSendEmailThunk());
  };

  const handleLoadEmail = async (emailId: string) => {
    dispatch(loadPastEmailThunk(emailId));
  };

  const handleDeleteEmail = async (emailId: string) => {
    dispatch(deletePastEmailThunk(emailId));
    // Clear selection after deletion
    dispatch(setSelectedPastEmail(null));
  };

  return {
    handleRequestTypeChange,
    handleEmailTitleChange,
    handleQuestionChange,
    handleActionChange,
    handleUpdateRequestChange,
    handleSendToEmailChange,
    handlePastEmailChange,
    handleDraftDesignChange,
    handleDraftCustomizationChange,
    handleUseDesignToggle,
    handleHtmlTemplateChange,
    handleHtmlDesignCustomizationChange,
    handleHtmlDesignQuestionChange,
    handleViewModeChange,
    handleDesignOptionChange,
    handleSubmit,
    handleSubmitWithDesign,
    handleSubmitHtmlDesign,
    handleSendEmail,
    handleLoadEmail,
    handleDeleteEmail,
  };
}
