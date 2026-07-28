import { motion } from "framer-motion";
import { memo } from "react";
import { Suggestion } from "@/chat/elements/suggestion";
import { cn } from "@/chat/lib/utils";

type SuggestedActionsProps = {
  sendMessage: (text: string) => void;
  variant?: "page" | "widget";
};

function PureSuggestedActions({
  sendMessage,
  variant = "widget",
}: SuggestedActionsProps) {
  const suggestedActions = [
    "What's the dress code?",
    "Where is the venue?",
    "What time does the ceremony start?",
    "Is there parking?",
  ];

  return (
    <div
      className="grid w-full gap-1 sm:grid-cols-2 sm:gap-2"
      data-testid="suggested-actions"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className={cn(
              "h-auto w-full whitespace-normal p-2 text-left text-sm leading-tight sm:p-3 sm:text-lg sm:leading-snug",
              variant === "page" &&
                "border-[#5c6e3a] bg-[#5c6e3a] text-[#f7f4df] hover:bg-[#4f6032] hover:text-[#fffdf0]",
            )}
            onClick={(suggestion) => {
              sendMessage(suggestion);
            }}
            suggestion={suggestedAction}
          >
            {suggestedAction}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);
