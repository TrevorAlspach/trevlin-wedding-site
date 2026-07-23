import type { ChatMessage } from "@/chat/lib/types";
import { cn, sanitizeText } from "@/chat/lib/utils";
import { MessageContent } from "@/chat/elements/message";
import { Response } from "@/chat/elements/response";
import { SparklesIcon } from "@/chat/icons";
import { MessageActions } from "./MessageActions";

export const PreviewMessage = ({
  message,
  isLoading,
  variant = "widget",
}: {
  message: ChatMessage;
  isLoading: boolean;
  variant?: "page" | "widget";
}) => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-200"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div
            className={cn(
              "-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border",
              variant === "page" ? "bg-[#e9edc6]" : "bg-background",
            )}
          >
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.content?.trim(),
            "w-full": message.role === "assistant",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user",
          })}
        >
          {message.content && (
            <div>
              <MessageContent
                className={cn({
                  "wrap-break-word w-fit rounded-2xl text-right text-white":
                    message.role === "user",
                  "bg-transparent px-0 py-0 text-left":
                    message.role === "assistant",
                  "px-4 py-3 text-lg leading-relaxed md:px-5 md:py-3.5 md:text-xl":
                    variant === "page" && message.role === "user",
                  "text-lg leading-relaxed md:text-xl":
                    variant === "page" && message.role === "assistant",
                  "px-3 py-2 text-lg leading-relaxed":
                    variant === "widget" && message.role === "user",
                  "text-lg leading-relaxed":
                    variant === "widget" && message.role === "assistant",
                })}
                data-testid="message-content"
                style={
                  message.role === "user"
                    ? { backgroundColor: "#ff9d6c", color: "#3a3a1a" }
                    : undefined
                }
              >
                <Response>{sanitizeText(message.content)}</Response>
              </MessageContent>
            </div>
          )}

          <MessageActions message={message} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export const ThinkingMessage = ({
  variant = "widget",
}: {
  variant?: "page" | "widget";
}) => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div
          className={cn(
            "-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border",
            variant === "page" ? "bg-[#e9edc6]" : "bg-background",
          )}
        >
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div
            className={cn(
              "flex items-center gap-1 p-0 text-muted-foreground",
              variant === "page" ? "text-base md:text-lg" : "text-base",
            )}
          >
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
