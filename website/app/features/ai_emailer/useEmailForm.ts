import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setRequestType, setEmailTitle, setQuestion, setAction, setUpdateRequest, setAiResponse, setSendToEmail, handleSubmitThunk, handleSendEmailThunk } from "@/store/aiEmailerSlice";

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

  const handleRequestTypeChange = (type: "Raw HTML" | "text") => {
    dispatch(setRequestType(type));
  };

  const handleEmailTitleChange = (title: string) => {
    dispatch(setEmailTitle(title));
  };

  const handleQuestionChange = (q: string) => {
    dispatch(setQuestion(q));
  };

  const handleActionChange = (actionType: "Draft" | "Send" | "Update") => {
    dispatch(setAction(actionType));
    if (actionType !== "Draft") {
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

  const handleSubmit = async () => {
    dispatch(handleSubmitThunk());
  };

  const handleSendEmail = async () => {
    dispatch(handleSendEmailThunk());
  };

  return {
    handleRequestTypeChange,
    handleEmailTitleChange,
    handleQuestionChange,
    handleActionChange,
    handleUpdateRequestChange,
    handleSendToEmailChange,
    handleSubmit,
    handleSendEmail,
  };
}
