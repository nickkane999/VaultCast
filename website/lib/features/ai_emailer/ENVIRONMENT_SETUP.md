# AI Emailer Environment Setup Guide

## Required Environment Variables

To use the AI Emailer feature, you need to set up the following environment variables in your `.env.local` file:

### 1. OpenAI API (Required for AI Email Generation)

```env
CHATGPT_API_KEY=your_openai_api_key_here
```

- Get this from: https://platform.openai.com/api-keys
- Used for AI-powered email content generation

### 2. MongoDB (Required for Email Storage)

```env
MONGODB_URI=your_mongodb_connection_string_here
```

- Used to store email history, templates, and designs
- Example: `mongodb://localhost:27017/vaultcast` or MongoDB Atlas connection string

### 3. Next.js App URL (Required for Internal API Calls)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- Used for internal API route communication
- Change to your production URL when deploying

### 4. Gmail API Configuration (Required for Email Sending)

#### Google OAuth2 Credentials

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

#### Gmail User Refresh Token

```env
GMAIL_USER_REFRESH_TOKEN=your_refresh_token_here
```

## Setting Up Gmail API

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Gmail API

### Step 2: Create OAuth2 Credentials

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

### Step 3: Get Refresh Token

You'll need to implement an OAuth flow to get the refresh token. Here's a basic example:

1. Create a temporary route to handle OAuth:

```javascript
// pages/api/auth/google/callback.js
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

export default async function handler(req, res) {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Refresh Token:", tokens.refresh_token);
    res.json({ refresh_token: tokens.refresh_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. Visit the authorization URL:

```javascript
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
  prompt: "consent",
});
```

## Troubleshooting Common Issues

### "invalid_client" Error

- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set
- Verify that the OAuth2 credentials are for a "Web application" type
- Make sure the redirect URI matches exactly what's configured in Google Cloud Console

### "Gmail authorization required" Error

- The `GMAIL_USER_REFRESH_TOKEN` is missing or invalid
- You need to go through the OAuth flow to get a fresh refresh token
- Make sure the refresh token was generated with the correct scopes

### Email Generation Fails

- Check that `CHATGPT_API_KEY` is valid and has sufficient credits
- Verify that the OpenAI API key has the correct permissions

### Database Connection Issues

- Verify `MONGODB_URI` is correct and the database is accessible
- Make sure MongoDB is running (if using local installation)
- Check network connectivity to MongoDB Atlas (if using cloud)

## Security Notes

1. **Never commit environment variables to version control**
2. **Use different credentials for development and production**
3. **Regularly rotate API keys and tokens**
4. **Limit OAuth2 scopes to only what's needed**
5. **Monitor API usage and costs**

## Testing the Setup

After setting up all environment variables, test the integration:

1. Try generating an email (tests OpenAI API)
2. Check if emails appear in past emails (tests MongoDB)
3. Attempt to send an email (tests Gmail API)

If any step fails, check the console logs for specific error messages and refer to the troubleshooting section above.
