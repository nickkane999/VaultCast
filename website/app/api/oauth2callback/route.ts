import { NextResponse } from "next/server";
import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Should be http://localhost:3000/api/oauth2callback for local

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      console.log("OAuth tokens received:", tokens);
      // IMPORTANT: Securely store tokens.refresh_token for future use!
      // This usually means associating it with a user in your database.
      // For this example, we'll just log it. DO NOT DO THIS IN PRODUCTION FOR REAL USER DATA.
      if (tokens.refresh_token) {
        console.log("IMPORTANT: Store this refresh_token securely:", tokens.refresh_token);
        // You could set it as a cookie for the session, or better, save to a DB associated with the user.
      }

      // Redirect user to a page indicating success or back to the app
      // For an API, you might just return a success message.
      return NextResponse.redirect(new URL("/", request.url)); // Redirect to homepage
    } catch (error: any) {
      console.error("Error exchanging auth code for tokens:", error.message);
      return NextResponse.json({ error: "Failed to authenticate with Google", details: error.message }, { status: 500 });
    }
  } else {
    // If no code, it might be an error from Google or an initial visit.
    // For a proper app, you might redirect to an error page or back to where they started the auth flow.
    const error = url.searchParams.get("error");
    if (error) {
      console.error("Error during Google OAuth callback:", error);
      return NextResponse.json({ error: `Google OAuth Error: ${error}` }, { status: 400 });
    }
    return NextResponse.json({ error: "Authorization code not found." }, { status: 400 });
  }
}
