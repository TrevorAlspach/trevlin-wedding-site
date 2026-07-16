import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ChatStatus } from "@/chat/lib/types";
import { generateUUID } from "@/chat/lib/utils";

type UseStreamingChatOptions = {
  apiUrl: string;
};

type StreamEvent = {
  type: "text" | "done" | "error";
  content?: string;
};

function takeCompletedSseEvents(buffer: string): {
  events: StreamEvent[];
  remainder: string;
} {
  const events: StreamEvent[] = [];
  let remainder = buffer;

  while (true) {
    const boundary = remainder.match(/\r?\n\r?\n/);
    if (!boundary || boundary.index === undefined) break;

    const block = remainder.slice(0, boundary.index);
    remainder = remainder.slice(boundary.index + boundary[0].length);
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");

    if (!data || data === "[DONE]") continue;
    const parsed: unknown = JSON.parse(data);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("type" in parsed) ||
      (parsed.type !== "text" && parsed.type !== "done" && parsed.type !== "error") ||
      ("content" in parsed && typeof parsed.content !== "string")
    ) {
      throw new Error("Invalid response from TaroBot.");
    }
    events.push(parsed as StreamEvent);
  }

  return { events, remainder };
}

async function readServerError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string" &&
      body.error.trim()
    ) {
      return body.error;
    }
  } catch {
    // Fall through to a status-based message.
  }

  if (response.status === 401) return "Your session has expired. Please sign in again.";
  if (response.status === 429) return "Too many chat requests. Please try again shortly.";
  return "TaroBot is unavailable right now. Please try again.";
}

export function useStreamingChat({ apiUrl }: UseStreamingChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setError(null);
    setStatus("idle");
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || status === "streaming") return;

      const userMessage: ChatMessage = {
        id: generateUUID(),
        role: "user",
        content: text.trim(),
        createdAt: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      const assistantMessage: ChatMessage = {
        id: generateUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages([...updatedMessages, assistantMessage]);
      setInput("");
      setError(null);
      setStatus("streaming");

      const controller = new AbortController();
      abortControllerRef.current = controller;
      let accumulatedContent = "";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await readServerError(response));
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("TaroBot returned an empty response.");

        const decoder = new TextDecoder();
        let buffer = "";
        let completed = false;

        const applyEvents = (events: StreamEvent[]) => {
          for (const event of events) {
            if (event.type === "text") {
              accumulatedContent += event.content ?? "";
              setMessages([
                ...updatedMessages,
                { ...assistantMessage, content: accumulatedContent },
              ]);
            } else if (event.type === "done") {
              completed = true;
            } else if (event.type === "error") {
              throw new Error(event.content || "TaroBot could not finish the response.");
            }
          }
        };

        while (!completed) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          const parsed = takeCompletedSseEvents(buffer);
          buffer = parsed.remainder;
          applyEvents(parsed.events);
          if (done) break;
        }

        if (!completed) {
          throw new Error("TaroBot's response ended unexpectedly. Please try again.");
        }

        setStatus("idle");
      } catch (caught: unknown) {
        if (controller.signal.aborted) {
          if (!accumulatedContent) setMessages(updatedMessages);
          setStatus("idle");
          return;
        }

        if (!accumulatedContent) setMessages(updatedMessages);
        setError(caught instanceof Error ? caught.message : "TaroBot is unavailable right now.");
        setStatus("error");
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [apiUrl, messages, status],
  );

  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([]);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    messages,
    input,
    setInput,
    status,
    error,
    sendMessage,
    stop,
    clearMessages,
    setMessages,
  };
}
