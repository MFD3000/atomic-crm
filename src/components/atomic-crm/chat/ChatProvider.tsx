import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../providers/supabase/supabase";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { ChatMessage, ChatResponse, ChatExecutedAction } from "../types";

interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  sendMessage: () => {},
  clearMessages: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { currentBoard } = useConfigurationContext();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke<ChatResponse>(
        "chat",
        {
          body: {
            message,
            conversationHistory,
            boardId: currentBoard?.id,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      if (!data) return;

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        executedActions: data.executedActions,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory(data.conversationHistory);

      // Invalidate queries for any created/updated records
      const recordTypes = new Set(
        data.executedActions
          .filter((a: ChatExecutedAction) => a.success && a.result)
          .map((a: ChatExecutedAction) => a.result?.recordType),
      );

      if (recordTypes.has("company")) {
        queryClient.invalidateQueries({ queryKey: ["companies"] });
      }
      if (recordTypes.has("contact")) {
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
      }
      if (recordTypes.has("deal")) {
        queryClient.invalidateQueries({ queryKey: ["deals"] });
      }
      if (recordTypes.has("task")) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      if (recordTypes.has("note")) {
        queryClient.invalidateQueries({ queryKey: ["contactNotes"] });
        queryClient.invalidateQueries({ queryKey: ["dealNotes"] });
      }

      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to API
      chatMutation.mutate(message);
    },
    [chatMutation],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isOpen,
      isLoading: chatMutation.isPending,
      error,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      clearMessages,
    }),
    [
      messages,
      isOpen,
      chatMutation.isPending,
      error,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      clearMessages,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => useContext(ChatContext);
