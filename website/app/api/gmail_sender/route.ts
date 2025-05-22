import { NextResponse } from "next/server";
import { google } from "googleapis";

// These should be stored securely as environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// This is the URL Google redirects to after user authorization. It must be registered in your GCP OAuth 2.0 client settings.
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/gmail_sender";

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

// This function would ideally retrieve a stored refresh token for a user
// For this example, it's a placeholder. In a real app, you'd get this after the user grants consent.
async function getUserRefreshToken(): Promise<string | null> {
  // Placeholder: In a real application, you would fetch this from your database for the authenticated user.
  // This token is obtained once when the user first authorizes your application.
  // For testing, you might manually obtain one and set it as an env var, but this is not suitable for production.
  return process.env.GMAIL_USER_REFRESH_TOKEN || null;
}

export async function POST(request: Request) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("Google OAuth credentials are not configured.");
    return NextResponse.json({ error: "Email sending service not configured (OAuth)." }, { status: 500 });
  }

  const { to, subject, body, instruction_to_mcp_server } = await request.json();

  // The `instruction_to_mcp_server` might contain the full details, or you can use discrete fields.
  // For robustness, let's assume `to`, `subject`, `body` are passed explicitly from chatGPTGmail.ts

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
  }

  try {
    const refreshToken = await getUserRefreshToken();
    if (!refreshToken) {
      // This would be the point where you might redirect the user to an auth URL if no token exists
      // const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/gmail.send'] });
      // For an API, you'd typically expect the token to be pre-authorized.
      console.error("No refresh token available for Gmail API. User needs to authorize.");
      return NextResponse.json({ error: "Gmail authorization required." }, { status: 401 });
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Get a new access token (googleapis handles refreshing it if necessary using the refresh token)
    // Note: The library automatically refreshes the token if the refresh_token is set and the access_token is expired.
    // const { token: accessToken } = await oauth2Client.getAccessToken(); // Not always needed to call explicitly

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const emailLines = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/html; charset=utf-8", "", body];
    const email = emailLines.join("\n");

    // Gmail API expects the email to be base64url encoded
    const base64EncodedEmail = Buffer.from(email).toString("base64url");

    await gmail.users.messages.send({
      userId: "me", // 'me' refers to the authenticated user
      requestBody: {
        raw: base64EncodedEmail,
      },
    });

    console.log("Email ostensibly sent via Gmail API.");
    return NextResponse.json({ success: true, message: "Email sent successfully via Gmail API." });
  } catch (error: any) {
    console.error("Error sending email via Gmail API:", error.message);
    let errorMessage = "Failed to send email.";
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = `Gmail API Error: ${error.response.data.error.message}`;
    }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
