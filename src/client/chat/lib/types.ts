import type { ChatRequestMessage } from "../../../shared/chat";

export type ChatMessage = ChatRequestMessage & {
  id: string;
  createdAt: Date;
};

export type ChatStatus = "idle" | "streaming" | "error";
