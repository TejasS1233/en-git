import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatBotButton = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "How do I compare users?",
    "Take me to my dashboard",
    "Explain repository insights",
    "What features do you have?",
  ];

  const getRuleBasedResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Navigation rules with detailed explanations
    if (input.includes("profile") || input.includes("my account")) {
      return {
        text: "I'll take you to your dashboard where you can view your complete GitHub profile! There you'll find your contribution statistics, repository insights, skill analysis, and personalized recommendations. You can also track your progress over time and see how you compare with other developers. Navigating now...",
        navigate: "/dashboard",
      };
    }
    if (input.includes("dashboard") || input.includes("home")) {
      return {
        text: "Taking you to your dashboard! This is your personal hub where you can see an overview of your GitHub activity, recent contributions, top repositories, and performance metrics. It's the perfect place to get a quick snapshot of your development journey. Redirecting now...",
        navigate: "/dashboard",
      };
    }
    if (input.includes("compare") || input.includes("comparison")) {
      return {
        text: "Opening the user comparison tool! This powerful feature lets you compare GitHub profiles side-by-side. You can analyze differences in contribution patterns, programming languages, repository statistics, and overall activity. It's great for benchmarking yourself against peers or finding collaboration opportunities. Taking you there now...",
        navigate: "/compare",
      };
    }
    if (input.includes("repository") || input.includes("repo") || input.includes("insights")) {
      return {
        text: "Opening repository insights! This feature provides deep analysis of any GitHub repository including code quality metrics, contribution patterns, technology stack breakdown, and activity trends. You can explore detailed statistics about commits, pull requests, issues, and contributor activity. Navigating now...",
        navigate: "/repo",
      };
    }
    if (input.includes("login") || input.includes("sign in")) {
      return {
        text: "Taking you to the login page! Once you sign in with your GitHub account, you'll unlock access to personalized analytics, comparison tools, and detailed insights about your coding journey. Your data is securely handled and we only access public GitHub information. Redirecting now...",
        navigate: "/login",
      };
    }
    if (input.includes("signup") || input.includes("register") || input.includes("sign up")) {
      return {
        text: "Let's get you signed up! Creating an account will give you access to all our features including personalized dashboards, user comparisons, repository deep dives, and AI-powered insights. The signup process is quick and secure - we'll connect with your GitHub account to provide you with the best experience. Taking you there now...",
        navigate: "/signup",
      };
    }

    // Feature explanations - detailed and informative
    if (
      input.includes("payment") ||
      input.includes("pay") ||
      input.includes("premium") ||
      input.includes("subscription")
    ) {
      return {
        text: "Our payment system allows you to unlock premium features! With a premium subscription, you get access to advanced analytics, unlimited comparisons, priority support, and exclusive insights powered by AI. We use secure payment processing to ensure your financial information is protected. Payments can be made through various methods including credit cards and digital wallets. Would you like me to take you to the payment page?",
      };
    }

    if (input.includes("how") && input.includes("compare")) {
      return {
        text: "Comparing users is easy and insightful! Here's how it works:\n\n1. Navigate to the Compare Users page\n2. Enter the GitHub usernames you want to compare (you can compare yourself with others)\n3. Our system analyzes both profiles and presents side-by-side statistics\n4. You'll see comparisons of contributions, languages used, repository counts, followers, and activity patterns\n5. Visual charts make it easy to spot differences and similarities\n\nThis feature is perfect for understanding your position in the developer community or finding developers with complementary skills. Would you like me to take you to the comparison page?",
      };
    }

    if (
      input.includes("what") &&
      (input.includes("feature") || input.includes("do") || input.includes("can you"))
    ) {
      return {
        text: "I'm Nexus, your GitHub analytics assistant! Here's what I can help you with:\n\n🏠 Dashboard Navigation - Access your personalized analytics hub\n👥 User Comparisons - Compare GitHub profiles side-by-side\n📊 Repository Insights - Deep dive into any repository's metrics\n💳 Payment Information - Learn about premium features\n🔐 Account Management - Help with login and signup\n📈 Feature Explanations - Understand how to use our tools\n\nI can navigate you to any section of the app or explain features in detail. Just ask me what you'd like to explore, and I'll guide you there!",
      };
    }

    if (input.includes("heatmap") || input.includes("contribution")) {
      return {
        text: "The contribution heatmap is one of our most popular features! It visualizes your GitHub activity over time using a color-coded calendar view. Darker colors indicate more contributions on that day. This helps you:\n\n• Track your coding consistency\n• Identify your most productive periods\n• Set and maintain contribution streaks\n• Visualize your development patterns\n\nYou can find your contribution heatmap on your dashboard. Would you like me to take you there?",
      };
    }

    if (input.includes("skill") || input.includes("radar") || input.includes("technology")) {
      return {
        text: "Our skill radar chart provides a visual representation of your technical expertise! It analyzes your GitHub repositories to determine your proficiency in different programming languages and technologies. The chart shows:\n\n• Your top programming languages\n• Relative skill levels based on code volume and activity\n• Technology stack diversity\n• Areas where you might want to grow\n\nThis feature helps you understand your technical profile at a glance and identify opportunities for skill development. Check it out on your dashboard!",
      };
    }

    if (
      input.includes("badge") ||
      input.includes("achievement") ||
      input.includes("gamification")
    ) {
      return {
        text: "We've gamified your GitHub journey with achievement badges! As you code and contribute, you unlock various badges that recognize your accomplishments:\n\n🏆 Milestone badges for contribution counts\n🔥 Streak badges for consistent activity\n⭐ Special badges for unique achievements\n💻 Language-specific badges for expertise\n\nBadges make tracking your progress fun and motivating. You can view all your earned badges and see which ones you're close to unlocking on your dashboard. Keep coding to collect them all!",
      };
    }

    // Greetings - warm and welcoming
    if (input.match(/^(hi|hello|hey|greetings|howdy)/)) {
      return {
        text: "Hello! I'm Nexus, your friendly GitHub analytics assistant. I'm here to help you navigate the platform and make the most of your experience!\n\nI can help you:\n• Navigate to different sections of the app\n• Explain features and how to use them\n• Compare GitHub profiles\n• Understand your analytics\n• Access repository insights\n\nWhat would you like to explore today? Feel free to ask me anything or use the suggested prompts below!",
      };
    }

    if (input.includes("thank") || input.includes("thanks") || input.includes("appreciate")) {
      return {
        text: "You're very welcome! I'm always here to help you navigate and understand your GitHub analytics. If you have any other questions or need assistance with anything else, don't hesitate to ask. Happy coding! 🚀",
      };
    }

    if (input.includes("bye") || input.includes("goodbye") || input.includes("see you")) {
      return {
        text: "Goodbye! It was great helping you today. Feel free to come back anytime you need assistance navigating the platform or understanding your GitHub analytics. Keep up the great work on your coding journey! 👋",
      };
    }

    // Help - comprehensive guide
    if (input.includes("help") || input.includes("guide") || input.includes("tutorial")) {
      return {
        text: "I'm here to help! Here's a comprehensive guide to what I can do:\n\n📍 NAVIGATION\n• Take you to your dashboard, profile, or any page\n• Help you find specific features quickly\n\n📊 FEATURES\n• Explain how to compare GitHub users\n• Guide you through repository insights\n• Describe analytics and metrics\n• Help with account and payment questions\n\n💡 TIPS\n• Just tell me where you want to go or what you want to know\n• Ask in natural language - I understand context\n• Use the suggested prompts for quick actions\n\nTry asking things like:\n• 'Show me my dashboard'\n• 'How do I compare users?'\n• 'Explain the skill radar chart'\n• 'Take me to repository insights'\n\nWhat would you like help with?",
      };
    }

    if (input.includes("who") && (input.includes("you") || input.includes("are you"))) {
      return {
        text: "I'm Nexus, your intelligent GitHub analytics assistant! I was created to help developers like you navigate this platform and understand your GitHub data better.\n\nMy purpose is to:\n• Guide you through the platform's features\n• Provide detailed explanations of analytics tools\n• Help you navigate quickly to where you need to go\n• Answer questions about GitHub metrics and insights\n\nI use rule-based intelligence to understand your questions and provide helpful, detailed responses. I'm constantly learning to serve you better. Think of me as your personal guide to unlocking the full potential of your GitHub analytics!",
      };
    }

    // Default response - helpful and encouraging
    return {
      text: "I want to help you, but I'm not quite sure what you're asking about. Let me share what I can assist with:\n\n🔍 Navigation - I can take you to any page (dashboard, compare users, repository insights, etc.)\n📚 Feature Explanations - I can explain how our tools work\n💬 General Questions - Ask me about analytics, comparisons, or GitHub metrics\n\nTry rephrasing your question or use one of the suggested prompts below. For example:\n• 'Take me to my dashboard'\n• 'How do I compare users?'\n• 'Explain repository insights'\n• 'What features do you have?'\n\nI'm here to help make your experience smooth and informative!",
    };
  };

  const handleSend = async (prompt) => {
    const currentInput = (typeof prompt === "string" ? prompt : input).trim();
    if (!currentInput) return;

    const userMsg = { from: "user", text: currentInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const response = getRuleBasedResponse(currentInput);
      const botMsg = { from: "bot", text: response.text };
      setMessages((prev) => [...prev, botMsg]);

      if (response.navigate) {
        setTimeout(() => navigate(response.navigate), 1000);
      }

      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          from: "bot",
          text: "Hi! I'm Nexus, your GitHub analytics assistant! 👋\n\nI'm here to help you navigate the platform and understand your GitHub data better. I can take you to different pages, explain features, and answer your questions.\n\nWhat would you like to explore today?",
        },
      ]);
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
