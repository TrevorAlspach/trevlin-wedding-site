import { Chat } from "@/chat/components/Chat";

const chatThemeVars = {
  "--background": "#e9edc6",
  "--foreground": "#29311d",
  "--card": "rgba(52, 53, 31, 0.06)",
  "--card-foreground": "#29311d",
  "--popover": "#e9edc6",
  "--popover-foreground": "#29311d",
  "--primary": "#ff9d6c",
  "--primary-foreground": "#3a3a1a",
  "--secondary": "rgba(92, 110, 58, 0.1)",
  "--secondary-foreground": "#29311d",
  "--muted": "rgba(92, 110, 58, 0.09)",
  "--muted-foreground": "rgba(52, 53, 31, 0.68)",
  "--accent": "rgba(255, 157, 108, 0.24)",
  "--accent-foreground": "#29311d",
  "--border": "rgba(74, 82, 43, 0.24)",
  "--input": "rgba(255, 255, 255, 0.3)",
  "--ring": "#ff9d6c",
  "--color-background": "#e9edc6",
  "--color-foreground": "#29311d",
  "--color-card": "rgba(52, 53, 31, 0.06)",
  "--color-card-foreground": "#29311d",
  "--color-popover": "#e9edc6",
  "--color-popover-foreground": "#29311d",
  "--color-primary": "#ff9d6c",
  "--color-primary-foreground": "#3a3a1a",
  "--color-secondary": "rgba(92, 110, 58, 0.1)",
  "--color-secondary-foreground": "#29311d",
  "--color-muted": "rgba(92, 110, 58, 0.09)",
  "--color-muted-foreground": "rgba(52, 53, 31, 0.68)",
  "--color-accent": "rgba(255, 157, 108, 0.24)",
  "--color-accent-foreground": "#29311d",
  "--color-border": "rgba(74, 82, 43, 0.24)",
  "--color-input": "rgba(255, 255, 255, 0.3)",
  "--color-ring": "#ff9d6c",
} as React.CSSProperties;

export default function ChatPage() {
  return (
    <div
      style={{ ...chatThemeVars, fontFamily: "'Montserrat', 'Roboto', sans-serif" }}
      className="h-full w-full md:px-5 md:pb-4 lg:px-8"
    >
      <Chat
        characterVariant="page"
        className="mx-auto h-full w-full max-w-6xl overflow-hidden"
      />
    </div>
  );
}
