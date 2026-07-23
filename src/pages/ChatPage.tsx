import { Chat } from "@/chat/components/Chat";

const chatThemeVars = {
  "--background": "transparent",
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
} as React.CSSProperties;

export default function ChatPage() {
  return (
    <div
      style={{ ...chatThemeVars, fontFamily: "'Cormorant Garamond', serif" }}
      className="w-full"
    >
      <Chat
        characterVariant="page"
        className="h-[calc(100vh-80px)] w-full"
      />
    </div>
  );
}
