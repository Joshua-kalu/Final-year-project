import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, AlertTriangle, MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { logger } from "@/lib/logger";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
  suggestedDepartment?: string;
}

const departmentInfo: Record<string, string> = {
  cardiology: "Cardiology",
  neurology: "Neurology",
  orthopedics: "Orthopedics",
  pediatrics: "Pediatrics",
  ophthalmology: "Ophthalmology",
  general: "General Medicine",
};

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your virtual health assistant. I can help you find the right department for your needs. Please describe your symptoms or concerns, and I'll guide you to the appropriate specialist.\n\n⚠️ **Important**: I cannot provide medical advice or diagnoses. For emergencies, please call 112 immediately.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectEmergency = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return lowerText.includes("🚨 emergency") || lowerText.includes("call 112");
  };

  const detectDepartment = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    for (const dept of Object.keys(departmentInfo)) {
      if (lowerText.includes(dept)) {
        return dept;
      }
    }
    return null;
  };

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (resp.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }

    if (resp.status === 402) {
      throw new Error("Service temporarily unavailable. Please try again later.");
    }

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to connect to AI assistant");
    }

    return resp;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Prepare messages for API (exclude the welcome message)
    const apiMessages = messages
      .filter((m) => m.id !== "1")
      .map((m) => ({ role: m.role, content: m.content }))
      .concat({ role: "user", content: currentInput });

    try {
      const resp = await streamChat(apiMessages);
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      // Create placeholder assistant message
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Incomplete JSON, wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final update with emergency/department detection
      const isEmergency = detectEmergency(assistantContent);
      const suggestedDepartment = detectDepartment(assistantContent);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, isEmergency, suggestedDepartment: suggestedDepartment || undefined }
            : m
        )
      );

      if (isEmergency) {
        toast({
          title: "Emergency Detected",
          description: "Please call 112 immediately for medical assistance.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("AI chat error:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to AI assistant.",
        variant: "destructive",
      });
      // Remove the failed assistant message placeholder
      setMessages((prev) => prev.filter((m) => m.role !== "assistant" || m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Health Assistant</h1>
        <p className="text-muted-foreground">
          Describe your symptoms and I'll help you find the right department
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.isEmergency
                      ? "bg-emergency text-emergency-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : message.isEmergency ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : message.isEmergency
                      ? "bg-emergency/10 border-2 border-emergency text-foreground rounded-bl-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.suggestedDepartment && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Link to={`/booking?department=${message.suggestedDepartment}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-card"
                        >
                          Book {departmentInfo[message.suggestedDepartment]} Appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.content === "" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <Bot className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md p-4">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          {!user && (
            <div className="mb-3 p-3 bg-secondary/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>{" "}
                to save your chat history and book appointments
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 bg-secondary rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!inputValue.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            This assistant does not provide medical advice. For emergencies, call 112.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
