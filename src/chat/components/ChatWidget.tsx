import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Chat } from "./Chat";

const chatThemeVars = {
  "--background": "#5c6e3a",
  "--foreground": "#f5efe0",
  "--card": "rgba(245, 239, 224, 0.06)",
  "--card-foreground": "#f5efe0",
  "--popover": "#3d4a26",
  "--popover-foreground": "#f5efe0",
  "--primary": "#ff9d6c",
  "--primary-foreground": "#3a3a1a",
  "--secondary": "rgba(245, 239, 224, 0.1)",
  "--secondary-foreground": "#f5efe0",
  "--muted": "rgba(245, 239, 224, 0.08)",
  "--muted-foreground": "rgba(245, 239, 224, 0.7)",
  "--accent": "rgba(255, 157, 108, 0.2)",
  "--accent-foreground": "#f5efe0",
  "--border": "rgba(245, 239, 224, 0.25)",
  "--input": "rgba(245, 239, 224, 0.08)",
  "--ring": "#ff9d6c",
  fontFamily: "'Cormorant Garamond', serif",
} as React.CSSProperties;

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
            style={chatThemeVars}
            className="fixed right-4 bottom-20 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span
                className="text-foreground"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                TaroBot
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
        className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#ff9d6c", color: "#3a3a1a" }}
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
