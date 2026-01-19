import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles } from "lucide-react";

import { useChatContext } from "./ChatProvider";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export const ChatPanel = () => {
  const { isOpen, closeChat, clearMessages, messages } = useChatContext();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <SheetContent
        side="right"
        className="w-[440px] sm:w-[540px] bg-white p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="bg-slate-900 px-6 py-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <SheetTitle className="font-oswald uppercase text-xl tracking-wide font-bold text-white">
                  CRM Agent
                </SheetTitle>
                <p className="font-sans text-slate-400 text-xs mt-0.5">
                  Powered by Claude
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors gap-2"
                onClick={clearMessages}
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                <span className="font-sans text-sm">Clear</span>
              </Button>
            )}
          </div>
          <p className="font-sans text-slate-300 text-sm mt-2">
            Describe meetings, conversations, or interactions and I'll help you
            log them in the CRM.
          </p>
        </SheetHeader>

        {/* Messages */}
        <ChatMessages />

        {/* Input */}
        <ChatInput />
      </SheetContent>
    </Sheet>
  );
};
