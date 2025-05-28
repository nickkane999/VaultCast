# AI Messenger API Installation Guide

This document explains how to set up the API routes for the AI Messenger feature in your Next.js application.

## 📁 Required API Route Structure

After integrating the AI Messenger feature, you need to copy the API routes from the feature directory to your main app's API directory. Here's the structure you need to create:

```
app/
  api/
    ai_messenger/
      route.ts                    # Main AI chat endpoint
      profiles/
        route.ts                  # GET/POST profiles
        [id]/
          route.ts               # PUT/DELETE specific profile
```

## 🔄 File Copying Instructions

Copy the following files from the integrated AI Messenger feature to your app's API directory:

### 1. Main AI Chat Endpoint

**Source:** `lib/features/ai_messenger/api/route.ts`
**Destination:** `app/api/ai_messenger/route.ts`

This handles the streaming AI chat functionality.

### 2. Profiles Management

**Source:** `lib/features/ai_messenger/api/profiles/route.ts`
**Destination:** `app/api/ai_messenger/profiles/route.ts`

This handles GET (fetch all profiles) and POST (create new profile) operations.

### 3. Individual Profile Management

**Source:** `lib/features/ai_messenger/api/profiles/[id]/route.ts`
**Destination:** `app/api/ai_messenger/profiles/[id]/route.ts`

This handles PUT (update profile) and DELETE (delete profile) operations for specific profiles.

## ⚙️ Required Environment Variables

Add these environment variables to your `.env.local` file:

```env
# OpenAI API Configuration
CHATGPT_API_KEY=your_openai_api_key_here

# Content Server URL (if using file attachments)
NEXT_PUBLIC_CONTENT_SERVER_URL=http://127.0.0.1:3001
```

## 🗄️ Database Requirements

The AI Messenger feature uses MongoDB with the following collection:

**Collection Name:** `messenger_profiles`

**Document Structure:**

```typescript
{
  _id: ObjectId,
  name: string,
  systemPrompt: string,
  files: string[]
}
```

## 📦 Required Dependencies

Make sure your project has these dependencies installed:

```bash
npm install openai mongodb @reduxjs/toolkit react-redux
```

## 🔧 Integration with Main Store

After copying the API routes, you'll also need to integrate the AI Messenger slice into your main Redux store:

```typescript
// In your main store.ts file
import aiMessengerReducer from "@/lib/features/ai_messenger/store/aiMessengerSlice";

export const store = configureStore({
  reducer: {
    // ... your other reducers
    aiMessenger: aiMessengerReducer,
  },
});
```

## 🚀 Usage

Once set up, you can use the AI Messenger feature by importing the client component:

```typescript
import AiMessengerClient from "@/lib/features/ai_messenger/AiMessengerClient";

// In your page component
export default function MyPage() {
  const initialData = await fetchAiMessengerData();

  return <AiMessengerClient initialData={initialData} refreshAction={refreshData} />;
}
```

## 🛠️ Troubleshooting

- **API Routes not working:** Ensure all files are copied to the correct `app/api/` directory structure
- **Database errors:** Verify MongoDB connection and collection setup
- **OpenAI errors:** Check your API key and ensure you have sufficient credits
- **Redux errors:** Make sure the aiMessenger slice is properly added to your main store

## 📝 Notes

- The API routes use MongoDB for data persistence
- The chat functionality streams responses from OpenAI
- File attachments are handled through the content server
- All routes include proper error handling and validation
