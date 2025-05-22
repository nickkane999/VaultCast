import { NextResponse } from "next/server";
import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g., http://localhost:3000/api/oauth2callback

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

export async function GET() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("Google OAuth credentials are not configured for auth URL generation.");
    return NextResponse.json({ error: "OAuth service not configured." }, { status: 500 });
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // crucial to get a refresh_token
    scope: ["https://www.googleapis.com/auth/gmail.send"], // scope for sending email
    prompt: "consent", // Optional: forces the consent screen every time, useful for testing
  });

  console.log("Generated Google Auth URL:", authUrl);
  // Redirect the user to Google's OAuth 2.0 server
  return NextResponse.redirect(authUrl);
}
