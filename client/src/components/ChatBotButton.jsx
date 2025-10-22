import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

const ChatBotButton = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "How do I make a payment?",
    "Take me to my profile",
    "Explain the blockchain feature",
    "How does the video call work?",
  ];

  const handleSend = async (prompt) => {
    const currentInput = (typeof prompt === "string" ? prompt : input).trim();
    if (!currentInput) return;

    const userMsg = { from: "user", text: currentInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.from === "bot" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      const res = await axios.post("/chat", {
        message: currentInput,
        history,
      });

      let botReply = res.data?.data?.reply || "Sorry, I couldn't get a response.";

      const navRegex = /NAVIGATE_TO::(\/\S*)/;
      const navMatch = botReply.match(navRegex);

      if (navMatch) {
        const path = navMatch[1];
        const cleanReply = botReply.replace(navRegex, "").trim();
        if (cleanReply) {
          const botMsg = { from: "bot", text: cleanReply };
          setMessages((prev) => [...prev, botMsg]);
        }
        navigate(path);
      } else {
        const botMsg = { from: "bot", text: botReply };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      const errorMsg = { from: "bot", text: "Sorry, something went wrong. Please try again." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ from: "bot", text: "Hi! I'm Nexus. How can I help you today?" }]);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button className="rounded-full h-14 w-14 p-0 shadow-lg">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={16}
          className="w-[90vw] max-w-[400px] h-[50vh] sm:h-[450px] flex flex-col p-0 rounded-xl shadow-xl z-[9999]"
        >
          <div className="border-b px-4 py-2 text-sm font-semibold flex justify-between items-center">
            Nexus Assistant
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap ${
                  msg.from === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-3 py-2 rounded-lg max-w-[85%]">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && !isLoading && (
            <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Or try one of these prompts:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 text-wrap text-left"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Nexus anything..."
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatBotButton;
