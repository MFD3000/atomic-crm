import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

import { useChatContext } from "./ChatProvider";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const ChatInput = () => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { sendMessage, isLoading } = useChatContext();

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // Initialize speech recognition
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Append final transcripts to existing input, show interim in real-time
      if (finalTranscript) {
        setInput((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 p-4">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... speak now" : "Describe a meeting, call, or interaction..."}
          disabled={isLoading}
          className={cn(
            "flex-1 min-h-[44px] max-h-[200px] resize-none bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 font-sans text-sm transition-colors",
            isListening && "border-red-300 bg-red-50"
          )}
          rows={1}
        />
        {speechSupported && (
          <Button
            onClick={toggleListening}
            disabled={isLoading}
            variant="outline"
            className={cn(
              "self-end h-11 w-11 p-0 transition-all",
              isListening && "bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse"
            )}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Mic className="w-4 h-4" strokeWidth={2} />
            )}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="self-end h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
          ) : (
            <Send className="w-4 h-4" strokeWidth={2} />
          )}
        </Button>
      </div>
      <p className="text-xs text-slate-400 mt-2 font-sans">
        {isListening ? (
          <span className="text-red-500 font-medium">Recording... click mic to stop</span>
        ) : (
          "Press Enter to send, Shift+Enter for new line"
        )}
      </p>
    </div>
  );
};
