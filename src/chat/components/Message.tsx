import type { ChatMessage } from "@/chat/lib/types";
import { cn, sanitizeText } from "@/chat/lib/utils";
import { MessageContent } from "@/chat/elements/message";
import { Response } from "@/chat/elements/response";
import { SparklesIcon } from "@/chat/icons";
import { MessageActions } from "./MessageActions";
import { MessageReasoning } from "./MessageReasoning";

export const PreviewMessage = ({
  message,
  isLoading,
}: {
  message: ChatMessage;
  isLoading: boolean;
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
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
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
          {message.reasoning && (
            <MessageReasoning
              isLoading={isLoading}
              reasoning={message.reasoning}
            />
          )}

          {message.content && (
            <div>
              <MessageContent
                className={cn({
                  "wrap-break-word w-fit rounded-2xl px-3 py-2 text-right text-white":
                    message.role === "user",
                  "bg-transparent px-0 py-0 text-left":
                    message.role === "assistant",
                })}
                data-testid="message-content"
                style={
                  message.role === "user"
                    ? { backgroundColor: "#006cff" }
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

export const ThinkingMessage = () => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
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
