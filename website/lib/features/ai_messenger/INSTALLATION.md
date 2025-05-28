# AI Messenger Feature - Installation Guide

## 📦 Required Dependencies

Add these packages to your project:

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/icons-material": "^7.1.0",
    "@mui/material": "^7.1.0",
    "@mui/types": "^7.4.2",
    "@reduxjs/toolkit": "^2.8.2",
    "react-redux": "^9.2.0",
    "mongodb": "^6.16.0",
    "openai": "^4.100.0"
  }
}
```

## 🗄️ Database Requirements

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

## ⚙️ Environment Variables

Add to your `.env.local`:

```env
# OpenAI API Configuration
CHATGPT_API_KEY=your_openai_api_key_here

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Content Server URL (optional)
NEXT_PUBLIC_CONTENT_SERVER_URL=http://127.0.0.1:3001
```

## 📁 Required API Routes

Copy these API files to your project:

1. **Main AI Chat Endpoint**

   - From: `lib/features/ai_messenger/api/route.ts`
   - To: `app/api/ai_messenger/route.ts`

2. **Profiles Management**

   - From: `lib/features/ai_messenger/api/profiles/route.ts`
   - To: `app/api/ai_messenger/profiles/route.ts`

3. **Individual Profile Management**
   - From: `lib/features/ai_messenger/api/profiles/[id]/route.ts`
   - To: `app/api/ai_messenger/profiles/[id]/route.ts`

## 🔧 Redux Store Integration

Add the aiMessenger slice to your store:

```typescript
// In store/store.ts
import aiMessengerReducer from "@/lib/features/ai_messenger/store/aiMessengerSlice";

export const store = configureStore({
  reducer: {
    aiMessenger: aiMessengerReducer,
    // ... other reducers
  },
});
```

## 🚀 Usage

Import and use the AI Messenger component:

```typescript
import AiMessengerClient from "@/lib/features/ai_messenger/AiMessengerClient";
import { fetchAiMessengerData } from "@/lib/features/ai_messenger/util/page_cache";

export default async function MyPage() {
  const data = await fetchAiMessengerData();

  return <AiMessengerClient initialData={data} refreshAction={refreshData} />;
}
```

## 🛠️ Setup Commands

```bash
# Install required packages
npm install @mui/material @mui/icons-material @reduxjs/toolkit react-redux openai mongodb

# For MUI setup, also install emotion (if not already installed)
npm install @emotion/react @emotion/styled
```
