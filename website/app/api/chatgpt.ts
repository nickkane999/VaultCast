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
