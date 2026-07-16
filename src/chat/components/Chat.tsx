import { cn } from "@/chat/lib/utils";
import { useStreamingChat } from "@/chat/hooks/use-streaming-chat";
import { TooltipProvider } from "@/chat/ui/tooltip";
import { Messages } from "./Messages";
import { ChatInput } from "./ChatInput";

const CHAT_API_URL = "/api/chat";

type ChatProps = {
  className?: string;
};

export function Chat({ className }: ChatProps) {
  const {
    messages,
    input,
    setInput,
    status,
    error,
    sendMessage,
    stop,
  } = useStreamingChat({ apiUrl: CHAT_API_URL });

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col bg-background",
          className
        )}
      >
        <Messages status={status} messages={messages} />
        <div className="mx-auto w-full max-w-4xl px-2 pb-4 md:px-4">
          {error && (
            <p className="mb-2 text-left text-sm text-[#ffd7c3]" role="alert">
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
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
