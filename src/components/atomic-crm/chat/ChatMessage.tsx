import { User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import type { ChatMessage as ChatMessageType } from "../types";
import { ExecutedAction } from "./ExecutedAction";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? "bg-slate-200" : "bg-gradient-to-br from-blue-500 to-violet-600"}
        `}
      >
        {isUser ? (
          <User className="w-4 h-4 text-slate-600" strokeWidth={2} />
        ) : (
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isUser ? "text-right" : ""}`}>
        <div
          className={`
            inline-block max-w-[90%] rounded-lg px-4 py-2.5
            ${isUser ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}
          `}
        >
          <p className="font-sans text-sm whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Executed Actions */}
        {message.executedActions && message.executedActions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.executedActions.map((action) => (
              <ExecutedAction key={action.id} action={action} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-slate-400 mt-1.5 font-sans">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
