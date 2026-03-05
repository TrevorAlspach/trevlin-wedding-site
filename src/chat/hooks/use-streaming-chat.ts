import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ChatStatus } from "@/chat/lib/types";
import { generateUUID } from "@/chat/lib/utils";

type UseStreamingChatOptions = {
  apiUrl: string;
};

export function useStreamingChat({ apiUrl }: UseStreamingChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus("idle");
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: ChatMessage = {
        id: generateUUID(),
        role: "user",
        content: text.trim(),
        createdAt: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setStatus("streaming");

      const assistantMessage: ChatMessage = {
        id: generateUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages([...updatedMessages, assistantMessage]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";
        let accumulatedReasoning = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "text") {
                accumulatedContent += event.content;
              } else if (event.type === "reasoning") {
                accumulatedReasoning += event.content;
              } else if (event.type === "done") {
                // Stream complete
              } else if (event.type === "error") {
                throw new Error(event.content || "Stream error");
              }

              setMessages([
                ...updatedMessages,
                {
                  ...assistantMessage,
                  content: accumulatedContent,
                  reasoning: accumulatedReasoning || undefined,
                },
              ]);
            } catch {
              // Skip malformed JSON lines
            }
          }
        }

        setStatus("idle");
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        setStatus("error");
      } finally {
        abortControllerRef.current = null;
      }
    },
    [messages, apiUrl]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStatus("idle");
  }, []);

  return {
    messages,
    input,
    setInput,
    status,
    sendMessage,
    stop,
    clearMessages,
    setMessages,
  };
}
