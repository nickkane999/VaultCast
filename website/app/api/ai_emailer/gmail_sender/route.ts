import { NextResponse } from "next/server";
import { google } from "googleapis";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

async function getUserRefreshToken(): Promise<string | null> {
  return process.env.GMAIL_USER_REFRESH_TOKEN || null;
}

export async function POST(request: Request) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.error("Google OAuth credentials are not configured.");
    return NextResponse.json({ error: "Email sending service not configured (OAuth)." }, { status: 500 });
  }

  const { to, subject, body, instruction_to_mcp_server } = await request.json();

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
  }

  try {
    const refreshToken = await getUserRefreshToken();
    if (!refreshToken) {
      console.error("No refresh token available for Gmail API. User needs to authorize.");
      return NextResponse.json({ error: "Gmail authorization required." }, { status: 401 });
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const htmlBody = body.replace(/\n/g, "<br>");

    const emailLines = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/html; charset=utf-8", "", htmlBody];
    const email = emailLines.join("\n");

    const base64EncodedEmail = Buffer.from(email).toString("base64url");

    await gmail.users.messages.send({
      userId: "me",
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
