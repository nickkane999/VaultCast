import OpenAI from "openai";

export async function askAI({
  prompt,
  systemPrompt,
  model,
  files, // Placeholder for file handling
}: {
  prompt: string;
  systemPrompt: string;
  model: string;
  files: string[];
}) {
  if (!process.env.CHATGPT_API_KEY) {
    throw new Error("CHATGPT_API_KEY is not set in the environment variables.");
  }

  const client = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
        // TODO: Add file content to the messages if needed
      ],
    });

    // Assuming the response structure has choices[0].message.content
    return response.choices[0]?.message?.content || "No response from AI.";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "Error getting response from AI.";
  }
}

export async function generateEmailWithDesign({
  emailTitle,
  question,
  designContext,
  customizations,
  requestType = "Raw HTML",
}: {
  emailTitle: string;
  question: string;
  designContext?: {
    templateName: string;
    category: string;
    availableFields: string[];
  };
  customizations?: Record<string, string>;
  requestType?: "Raw HTML" | "text";
}) {
  if (!process.env.CHATGPT_API_KEY) {
    throw new Error("CHATGPT_API_KEY is not set in the environment variables.");
  }

  const client = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY });

  let systemPrompt = "You are an expert email marketing copywriter and designer.";
  let userPrompt = "";

  if (designContext && requestType === "Raw HTML") {
    systemPrompt += ` You are working with a ${designContext.templateName} email template in the ${designContext.category} category. 
    The template has these customizable fields: ${designContext.availableFields.join(", ")}.
    
    Your task is to generate compelling, professional content that fits perfectly with this design template.
    Focus on creating content that matches the template's style and purpose.
    
    Return your response as a JSON object with keys matching the available fields.
    For example: {"title": "...", "subtitle": "...", "content": "...", "buttonText": "...", "buttonUrl": "...", "footerText": "..."}
    
    Make sure the content is:
    - Appropriate for the ${designContext.category} category
    - Professional and engaging
    - Optimized for the specific template design
    - Includes realistic URLs for buttons (use placeholder URLs like https://example.com/action)`;

    userPrompt = `Email Title: ${emailTitle}
    User Request: ${question}
    
    Current customizations: ${JSON.stringify(customizations, null, 2)}
    
    Please generate content for all available fields that creates a cohesive, professional email.`;
  } else {
    systemPrompt += ` Generate ${requestType === "Raw HTML" ? "HTML" : "text"} email content based on the user's requirements.`;
    userPrompt = `Email Title: ${emailTitle}
    Request: ${question}
    
    Please generate a complete email ${requestType === "Raw HTML" ? "in HTML format" : "in plain text"}.`;
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "No response from AI.";
  } catch (error) {
    console.error("Error calling OpenAI API for email generation:", error);
    return "Error getting response from AI.";
  }
}
