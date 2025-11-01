import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, CheckCircle, Bell, Star, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SignupPrompt({ onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 max-w-lg"
        >
          <div className="relative backdrop-blur-xl bg-[rgba(59,130,246,0.08)] dark:bg-[rgba(59,130,246,0.15)] border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Subtle animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 opacity-60 animate-pulse" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-4 w-4 text-gray-200 dark:text-gray-300" />
            </button>

            <div className="relative p-6 space-y-4">
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-600">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Join and Unlock More!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create your free account to get started
                  </p>
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Track achievements</span> and measure progress
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Bell className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Stay updated</span> with personalized alerts
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Earn rewards</span> for completing milestones
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleSignup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                size="lg"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <p className="text-xs text-center text-gray-700 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
