import { memo } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import type { ChatMessage } from "@/chat/lib/types";
import { Action, Actions } from "@/chat/elements/actions";
import { CopyIcon } from "@/chat/icons";

function PureMessageActions({
  message,
  isLoading,
}: {
  message: ChatMessage;
  isLoading: boolean;
}) {
  const [, copyToClipboard] = useCopyToClipboard();

  if (isLoading || message.role === "user") {
    return null;
  }

  const handleCopy = async () => {
    if (!message.content) return;
    await copyToClipboard(message.content);
  };

  return (
    <Actions className="-ml-0.5">
      <Action onClick={handleCopy} tooltip="Copy">
        <CopyIcon />
      </Action>
    </Actions>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    return true;
  }
);
