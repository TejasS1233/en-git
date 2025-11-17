import { motion } from "framer-motion";
import { AlertCircle, Github, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export function GitHubUsernameBanner({ onAddUsername }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <div className="relative overflow-hidden rounded-lg border">
        {/* Animated shine effect */}
        <div className="absolute inset-0" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Add Your GitHub Username
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your GitHub account to unlock powerful features
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                  <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Track Achievements</p>
                    <p className="text-xs text-muted-foreground">See locked goals & progress</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Get Insights</p>
                    <p className="text-xs text-muted-foreground">Personalized recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Receive Notifications</p>
                    <p className="text-xs text-muted-foreground">Achievement unlocks & more</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={onAddUsername}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                >
                  <Github className="h-4 w-4 mr-2" />
                  Add GitHub Username
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

