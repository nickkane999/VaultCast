export async function sendEmailViaInternalSender({ to, subject, body }: { to: string; subject: string; body: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const internalGmailSenderUrl = `${appUrl}/api/ai_emailer/gmail_sender`;

  console.log(`Attempting to call internal Gmail sender at: ${internalGmailSenderUrl}`);

  try {
    const response = await fetch(internalGmailSenderUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body }),
    });

    if (!response.ok) {
      let errorResult;
      try {
        errorResult = await response.json();
      } catch (e) {
        const errorText = await response.text();
        throw new Error(errorText || `Internal Gmail sender request failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorResult.error || `Internal Gmail sender request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Call to internal Gmail sender successful.`);

    return {
      success: true,
      message: result.message || "Email processed by internal sender.",
      details: result,
    };
  } catch (error: any) {
    console.error("Error in sendEmailViaInternalSender:", error.message);
    return {
      success: false,
      message: "Failed to send email via internal sender.",
      error: error.message || error.toString(),
    };
  }
}
