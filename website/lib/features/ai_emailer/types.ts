export interface EmailTemplate {
  _id: string;
  name: string;
  category: string;
  html: string;
  fields: string[];
  createdAt: string;
}

export interface EmailDesign {
  _id: string;
  name: string;
  html: string;
  fields: string[];
  createdAt: string;
}

export interface PastEmail {
  _id: string;
  emailTitle: string;
  question: string;
  response: string;
  requestType: string;
  timestamp: string;
  sendToEmail?: string;
}

export interface Customizations {
  [key: string]: string;
}

export interface AIEmailerState {
  requestType: "Raw HTML" | "text" | "HTML Design";
  emailTitle: string;
  question: string;
  aiResponse: string;
  loading: boolean;
  error: string | null;
  action: "Draft" | "Send" | "Update" | "Load" | "Delete";
  updateRequest: string;
  sendToEmail: string;
  pastEmails: PastEmail[];
  selectedPastEmail: string;
  pastEmailsLoading: boolean;
  pastEmailsError: string | null;
  designs: EmailDesign[];
  selectedDraftDesign: string;
  draftCustomizations: Customizations;
  useDesignInDraft: boolean;
  designLoading: boolean;
  templates: EmailTemplate[];
  selectedHtmlTemplate: string;
  htmlDesignCustomizations: Customizations;
  htmlDesignQuestion: string;
  viewMode: "Form" | "Preview";
  designOption: "Templates" | "Designs";
}

export interface EmailFormData {
  requestType: string;
  emailTitle: string;
  question: string;
  action: string;
  updateRequest?: string;
  sendToEmail?: string;
  selectedPastEmail?: string;
  selectedDraftDesign?: string;
  draftCustomizations?: Customizations;
  useDesignInDraft?: boolean;
  selectedHtmlTemplate?: string;
  htmlDesignCustomizations?: Customizations;
  htmlDesignQuestion?: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}
