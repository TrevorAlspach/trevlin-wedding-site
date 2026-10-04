import { ArrowDownIcon } from "lucide-react";
import { cn } from "@/chat/lib/utils";
import { useMessages } from "@/chat/hooks/use-messages";
import type { ChatMessage, ChatStatus } from "@/chat/lib/types";
import { Greeting } from "./Greeting";
import { PreviewMessage, ThinkingMessage } from "./Message";

type MessagesProps = {
  status: ChatStatus;
  messages: ChatMessage[];
  variant?: "page" | "widget";
};

export function Messages({
  status,
  messages,
  variant = "widget",
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
  } = useMessages({
    status,
  });

  return (
    <div
      className={cn(
        "relative flex-1",
        variant === "page" ? "bg-[#e9edc6]" : "bg-background",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 touch-pan-y overflow-y-auto",
          variant === "page" ? "bg-[#e9edc6]" : "bg-background",
        )}
        ref={messagesContainerRef}
      >
        <div
          className={cn(
            "mx-auto flex min-w-0 flex-col px-2 md:gap-6 md:px-4 md:py-4",
            messages.length === 0
              ? "min-h-full gap-1 py-1 md:min-h-0"
              : "gap-4 py-4",
            variant === "page" ? "max-w-5xl" : "max-w-4xl",
          )}
        >
          {messages.length === 0 && <Greeting variant={variant} />}

          {messages.map((message, index) =>
            message.role === "assistant" && !message.content ? null : (
              <PreviewMessage
                isLoading={
                  status === "streaming" && messages.length - 1 === index
                }
                key={message.id}
                message={message}
                variant={variant}
              />
            ),
          )}

          {status === "streaming" &&
            messages.length > 0 &&
            !messages[messages.length - 1].content && (
              <ThinkingMessage variant={variant} />
            )}

          <div
            className={cn(
              "shrink-0",
              messages.length === 0
                ? "min-h-1 min-w-1 md:min-h-6 md:min-w-6"
                : "min-h-6 min-w-6",
            )}
            ref={messagesEndRef}
          />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={cn(
          "absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border p-2 shadow-lg transition-all hover:bg-muted",
          variant === "page" ? "bg-[#e9edc6]" : "bg-background",
          isAtBottom
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100",
        )}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}
