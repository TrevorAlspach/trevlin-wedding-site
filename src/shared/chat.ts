import type { TaroBotAppearance } from "./tarobot.js";

export type ChatRole = "user" | "assistant";

export type ChatRequestMessage = {
  role: ChatRole;
  content: string;
};

export type ChatStreamEvent =
  | { type: "text"; content: string }
  | { type: "appearance"; helmet: TaroBotAppearance["helmet"]; face: TaroBotAppearance["face"] }
  | { type: "done" }
  | { type: "error"; content?: string };

