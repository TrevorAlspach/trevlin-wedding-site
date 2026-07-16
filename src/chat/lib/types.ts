export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type ChatStatus = "idle" | "streaming" | "error";
