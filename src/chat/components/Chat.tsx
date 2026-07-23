import { cn } from "@/chat/lib/utils";
import { useStreamingChat } from "@/chat/hooks/use-streaming-chat";
import { TooltipProvider } from "@/chat/ui/tooltip";
import { Messages } from "./Messages";
import { ChatInput } from "./ChatInput";
import { TaroBotAvatar } from "./TaroBotAvatar";

const CHAT_API_URL = "/api/chat";

type ChatProps = {
  className?: string;
  characterVariant?: "page" | "widget";
};

export function Chat({ className, characterVariant = "widget" }: ChatProps) {
  const {
    messages,
    input,
    setInput,
    status,
    error,
    appearance,
    sendMessage,
    stop,
  } = useStreamingChat({ apiUrl: CHAT_API_URL });

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col",
          characterVariant === "page"
            ? "bg-[#e9edc6] text-[#29311d]"
            : "bg-background",
          className,
        )}
      >
        <TaroBotAvatar
          appearance={appearance}
          status={status}
          variant={characterVariant}
        />
        <Messages
          status={status}
          messages={messages}
          variant={characterVariant}
        />
        <div
          className={cn(
            "mx-auto w-full px-2 pb-4 md:px-4",
            characterVariant === "page" ? "max-w-5xl" : "max-w-4xl",
          )}
        >
          {error && (
            <p className="mb-2 text-left text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <ChatInput
            input={input}
            setInput={setInput}
            status={status}
            stop={stop}
            messages={messages}
            sendMessage={sendMessage}
            variant={characterVariant}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
