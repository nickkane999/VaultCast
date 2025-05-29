# AI Emailer Feature Installation Guide

## Overview

The AI Emailer feature provides comprehensive email generation, template management, and sending capabilities using OpenAI and Gmail APIs. This guide will help you integrate it into your VaultCast template system.

## Prerequisites

- Next.js 13+ with App Router
- MongoDB database
- OpenAI API account
- Google Cloud Platform account (for Gmail API)
- Redux Toolkit for state management

## Installation Steps

### 1. Environment Variables Setup

Create or update your `.env.local` file with the following variables:

```env
# OpenAI Configuration
CHATGPT_API_KEY=your_openai_api_key_here

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Gmail API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GMAIL_USER_REFRESH_TOKEN=your_refresh_token_here
```

### 2. Dependencies

Ensure these packages are installed:

```bash
npm install openai googleapis mongodb
```

### 3. File Structure

The AI Emailer feature includes the following structure:

```
website/lib/features/ai_emailer/
├── api/
│   ├── route.ts                    # Main AI generation endpoint
│   ├── utils/
│   │   └── emailSender.ts         # Email sending utility
│   ├── gmail_sender/
│   │   └── route.ts               # Gmail API integration
│   ├── generate-with-design/
│   │   └── route.ts               # Design-based generation
│   ├── designs/
│   │   ├── route.ts               # Template management
│   │   └── preview/
│   │       └── route.ts           # Template preview
│   ├── past-emails/
│   │   └── route.ts               # Email history
│   ├── save-result/
│   │   └── route.ts               # Save generated emails
│   └── chatgpt_gmail/
│       └── route.ts               # Direct email sending
├── page.tsx                       # Main feature page
├── INSTALLATION.md                # This file
└── ENVIRONMENT_SETUP.md           # Environment setup guide
```

### 4. Template Integration

To integrate this feature into your template system:

#### Option A: Direct Page Usage

```typescript
// In your template's page.tsx
import AIEmailerPage from "@/lib/features/ai_emailer/page";

export default function TemplatePage() {
  return <AIEmailerPage />;
}
```

#### Option B: Component Integration

```typescript
// Import specific components
import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import EmailForm from "@/app/resources/EmailForm";

export default function CustomPage() {
  return (
    <Provider store={store}>
      <div className="container mx-auto p-4">
        <h1>AI Email Generator</h1>
        <EmailForm />
      </div>
    </Provider>
  );
}
```

### 5. API Route Registration

The API routes are self-contained within the feature package. They will be automatically available at:

- `/api/ai_emailer/*` (main routes)
- Feature package routes for template integration

### 6. Database Collections

The feature uses these MongoDB collections:

- `emailer_agent` - Stores generated emails and history
- `email_designs` - Stores custom email designs
- `email_templates` - Template definitions (optional)

### 7. Redux Store Integration

The feature integrates with your existing Redux store. Ensure your store includes:

```typescript
// website/lib/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from "@/store/aiEmailerSlice";

export const store = configureStore({
  reducer: {
    aiEmailer: aiEmailerReducer,
    // ... other reducers
  },
});
```

## Features Included

### 1. AI Email Generation

- OpenAI-powered content generation
- Multiple request types (Raw HTML, Plain Text, etc.)
- Streaming responses for real-time generation

### 2. Template System

- 4 pre-built responsive email templates:
  - Modern Marketing
  - Clean Newsletter
  - Vibrant Promotion
  - Elegant Announcement
- Customizable fields (colors, content, buttons, etc.)
- Template preview functionality

### 3. Email Management

- Email history and storage
- Draft saving and editing
- Email deletion (soft delete)

### 4. Email Sending

- Gmail API integration
- Direct email sending
- Email validation and error handling

### 5. Design Tools

- Visual template customization
- Real-time preview
- Custom design saving

## Usage Examples

### Basic Email Generation

```typescript
const response = await fetch("/api/ai_emailer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "Draft",
    requestType: "Raw HTML",
    emailTitle: "Welcome Email",
    question: "Create a welcome email for new users",
  }),
});
```

### Template-Based Generation

```typescript
const response = await fetch("/api/ai_emailer/generate-with-design", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    emailTitle: "Product Launch",
    question: "Announce our new product",
    templateId: "marketing-modern",
    customizations: {
      primaryColor: "#6366f1",
      title: "Exciting Product Launch!",
    },
  }),
});
```

### Send Email

```typescript
const response = await fetch("/api/ai_emailer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "SendEmailDirectly",
    to: "user@example.com",
    emailTitle: "Subject Line",
    emailBody: "<h1>Hello World!</h1>",
  }),
});
```

## Troubleshooting

### Common Issues

1. **Gmail API Errors**: Check environment variables and OAuth setup
2. **OpenAI API Errors**: Verify API key and billing status
3. **MongoDB Connection**: Ensure database is accessible
4. **Template Rendering**: Check template syntax and customizations

### Debug Mode

Enable debug logging by adding:

```env
DEBUG=ai_emailer:*
```

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Email Validation**: Validate email addresses before sending
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Content Filtering**: Consider content filtering for generated emails

## Support

For issues and questions:

1. Check the environment setup guide
2. Review the troubleshooting section
3. Verify all dependencies are installed
4. Check console logs for specific error messages

## License

This feature is part of the VaultCast template system.
