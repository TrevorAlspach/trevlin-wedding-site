export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  createdAt: Date;
};

export type ChatStatus = "idle" | "streaming" | "error";
