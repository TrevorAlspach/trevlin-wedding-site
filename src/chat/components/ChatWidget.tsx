import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Chat } from "./Chat";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-20 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold text-foreground text-sm">
                Wedding Chat
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                type="button"
                aria-label="Close chat"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <Chat className="flex-1" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        type="button"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <XIcon className="size-6" />
        ) : (
          <MessageCircleIcon className="size-6" />
        )}
      </button>
    </>
  );
}
