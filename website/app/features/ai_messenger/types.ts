export interface MessageProfile {
  id: string; // Use string to be consistent with MongoDB _id
  name: string;
  systemPrompt: string;
  files: string[];
}
