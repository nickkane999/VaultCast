import { NextResponse } from "next/server";
import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      console.log("OAuth tokens received:", tokens);

      if (tokens.refresh_token) {
        console.log("IMPORTANT: Store this refresh_token securely:", tokens.refresh_token);
      }

      return NextResponse.redirect(new URL("/", request.url));
    } catch (error: any) {
      console.error("Error exchanging auth code for tokens:", error.message);
      return NextResponse.json({ error: "Failed to authenticate with Google", details: error.message }, { status: 500 });
    }
  } else {
    const error = url.searchParams.get("error");
    if (error) {
      console.error("Error during Google OAuth callback:", error);
      return NextResponse.json({ error: `Google OAuth Error: ${error}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Authorization code not found." }, { status: 400 });
  }
}
