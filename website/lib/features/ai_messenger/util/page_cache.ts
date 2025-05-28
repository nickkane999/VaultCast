import { MessageProfile } from "../types";

export async function fetchAiMessengerData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "http://127.0.0.1:3001";

  try {
    const [profilesRes, filesRes] = await Promise.all([
      fetch(`${baseUrl}/api/ai_messenger/profiles`, {
        next: { revalidate: 300, tags: ["ai-messenger"] },
      }),
      fetch(`${filesUrl}/api/files/ai_messenger`, {
        next: { revalidate: 300, tags: ["ai-messenger-files"] },
      }),
    ]);

    const [profiles, filesData] = await Promise.all([profilesRes.ok ? profilesRes.json() : [], filesRes.ok ? filesRes.json() : { files: [] }]);

    return {
      profiles: profiles.map((item: any) => ({ ...item })),
      availableFiles: filesData.files || [],
    };
  } catch (error) {
    console.error("Error fetching AI messenger data:", error);
    return {
      profiles: [],
      availableFiles: [],
    };
  }
}
