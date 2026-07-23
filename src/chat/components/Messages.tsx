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
            "mx-auto flex min-w-0 flex-col gap-4 px-2 py-4 md:gap-6 md:px-4",
            variant === "page" ? "max-w-5xl" : "max-w-4xl",
          )}
        >
          {messages.length === 0 && <Greeting variant={variant} />}

          {messages.map((message, index) => (
            <PreviewMessage
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              key={message.id}
              message={message}
              variant={variant}
            />
          ))}

          {status === "streaming" &&
            messages.length > 0 &&
            !messages[messages.length - 1].content && (
              <ThinkingMessage variant={variant} />
            )}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
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
