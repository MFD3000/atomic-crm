import { useEffect, useRef } from "react";
import { MessageSquare, Loader2 } from "lucide-react";

import { useChatContext } from "./ChatProvider";
import { ChatMessage } from "./ChatMessage";

export const ChatMessages = () => {
  const { messages, isLoading, error } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="font-oswald text-lg font-bold text-slate-700 mb-2">
          Start a Conversation
        </h3>
        <p className="text-sm text-slate-500 max-w-[280px] font-sans">
          Tell me about your meetings and I'll help you create contacts, deals,
          tasks, and notes in the CRM.
        </p>
        <div className="mt-6 space-y-2 text-left w-full max-w-[320px]">
          <p className="text-xs text-slate-400 font-sans uppercase tracking-wide">
            Try something like:
          </p>
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 font-sans">
            "Just had coffee with Sarah Chen from Midwest Orthotics. She's the
            clinic director, interested in our franchise model. Her email is
            sarah@midwestortho.com. Follow up next week about pricing."
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm font-sans p-3">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
          <span>Processing your message...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 font-sans">
          {error}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
