import { useState } from "react";

export function useAIEmailerPageState() {
  const [requestType, setRequestType] = useState<"Raw HTML" | "text">("text");
  const [emailTitle, setEmailTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [action, setAction] = useState<"Draft" | "Send" | "Update">("Draft");
  const [updateRequest, setUpdateRequest] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendToEmail, setSendToEmail] = useState("");

  const handleRequestTypeChange = (type: "Raw HTML" | "text") => {
    setRequestType(type);
  };

  const handleEmailTitleChange = (title: string) => {
    setEmailTitle(title);
  };

  const handleQuestionChange = (q: string) => {
    setQuestion(q);
  };

  const handleActionChange = (actionType: "Draft" | "Send" | "Update") => {
    setAction(actionType);
    if (actionType !== "Draft") {
      // setEmailTitle("");
      // setQuestion("");
    }
    if (actionType !== "Update") {
      // setUpdateRequest("");
    }
  };

  const handleUpdateRequestChange = (text: string) => {
    setUpdateRequest(text);
  };

  const handleSendToEmailChange = (email: string) => {
    setSendToEmail(email);
  };

  const handleSubmit = async () => {
    console.log("Submitting:", { requestType, emailTitle, question, action, updateRequest });
    setAiResponse("");
    setLoading(true);
    setError(null);

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
          throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
        } catch (e) {
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response body.");
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        setAiResponse((prev) => prev + chunk);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    console.log("Sending email with content:", aiResponse, "to:", sendToEmail);
    setLoading(true);
    setError(null);
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
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Send email API response:", result);
    } catch (error: any) {
      console.error("Error sending email:", error);
      setError(error.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return {
    requestType,
    emailTitle,
    question,
    action,
    updateRequest,
    aiResponse,
    loading,
    error,
    sendToEmail,
    handleRequestTypeChange,
    handleEmailTitleChange,
    handleQuestionChange,
    handleActionChange,
    handleUpdateRequestChange,
    handleSubmit,
    handleSendEmail,
    handleSendToEmailChange,
    setAiResponse,
  };
}
