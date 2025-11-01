import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as Icons from "lucide-react";

const TIER_COLORS = {
  Bronze: "from-amber-700 to-amber-900",
  Silver: "from-gray-400 to-gray-600",
  Gold: "from-yellow-400 to-yellow-600",
  Platinum: "from-slate-300 to-slate-500",
  Diamond: "from-cyan-300 to-cyan-500",
  Legendary: "from-orange-500 to-red-600",
};

const TIER_GLOW = {
  Bronze: "shadow-amber-700/50",
  Silver: "shadow-gray-400/50",
  Gold: "shadow-yellow-400/50",
  Platinum: "shadow-slate-300/50",
  Diamond: "shadow-cyan-300/50",
  Legendary: "shadow-orange-500/50",
};

export default function Achievements({ username }) {
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unlocked, locked
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, [username]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/achievements/${username}`
      );
      setAchievements(response.data.data);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!achievements) {
    return <div className="text-center py-12 text-gray-500">Failed to load achievements</div>;
  }

  const displayAchievements = [
    ...(filter === "locked" ? [] : achievements.unlocked),
    ...(filter === "unlocked" ? [] : achievements.locked),
  ].filter((a) => categoryFilter === "all" || a.category === categoryFilter);

  const categories = [
    "all",
    "score",
    "stars",
    "repos",
    "followers",
    "languages",
    "activity",
    "special",
  ];

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{achievements.unlockedCount}</div>
            <div className="text-sm text-gray-400">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">
              {achievements.total - achievements.unlockedCount}
            </div>
            <div className="text-sm text-gray-400">Locked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {achievements.completionPercentage}%
            </div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {achievements.unlocked.filter((a) => a.tier.name === "Legendary").length}
            </div>
            <div className="text-sm text-gray-400">Legendary</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Achievement Progress</span>
            <span>
              {achievements.unlockedCount} / {achievements.total}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${achievements.completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {["all", "unlocked", "locked"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-purple-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {displayAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isLocked={achievement.progress < 100}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <AchievementModal
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AchievementCard({ achievement, isLocked, onClick }) {
  const tierColor = TIER_COLORS[achievement.tier.name];
  const tierGlow = TIER_GLOW[achievement.tier.name];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: isLocked ? 1 : 1.05 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
        isLocked
          ? "bg-gray-900/50 border-gray-700 opacity-60"
          : `bg-gradient-to-br ${tierColor} border-transparent shadow-lg ${tierGlow}`
      }`}
    >
      {/* Tier Badge */}
      <div className="absolute top-2 right-2">
        <span
          className={`text-xs px-2 py-1 rounded-full font-bold ${
            isLocked ? "bg-gray-700 text-gray-400" : "bg-black/30 text-white backdrop-blur-sm"
          }`}
        >
          {achievement.tier.name}
        </span>
      </div>

      {/* Icon */}
      <div className="mb-3 flex justify-center">
        {isLocked && achievement.secret ? (
          <Icons.Lock className="w-12 h-12 text-gray-500" />
        ) : (
          (() => {
            const IconComponent = Icons[achievement.icon] || Icons.Star;
            return (
              <IconComponent
                className="w-12 h-12"
                style={{
                  color: isLocked ? "#6b7280" : tierColor,
                  filter: isLocked ? "grayscale(100%)" : "none",
                }}
              />
            );
          })()
        )}
      </div>

      {/* Title */}
      <h3 className={`font-bold text-lg mb-1 ${isLocked ? "text-gray-400" : "text-white"}`}>
        {isLocked && achievement.secret ? "???" : achievement.name}
      </h3>

      {/* Description */}
      <p className={`text-sm mb-3 ${isLocked ? "text-gray-500" : "text-white/80"}`}>
        {isLocked && achievement.secret ? "Secret achievement" : achievement.description}
      </p>

      {/* Progress Bar (for locked achievements) */}
      {isLocked && !achievement.secret && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Unlocked Badge */}
      {!isLocked && (
        <div className="absolute bottom-2 right-2">
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">
            ✓ Unlocked
          </span>
        </div>
      )}
    </motion.div>
  );
}

function AchievementModal({ achievement, onClose }) {
  const isLocked = achievement.progress < 100;
  const tierColor = TIER_COLORS[achievement.tier.name];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-md w-full p-8 rounded-2xl border ${
          isLocked
            ? "bg-gray-900 border-gray-700"
            : `bg-gradient-to-br ${tierColor} border-transparent shadow-2xl`
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
        >
          ×
        </button>

        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {isLocked && achievement.secret ? (
              <Icons.Lock className="w-20 h-20 text-gray-500" />
            ) : (
              (() => {
                const IconComponent = Icons[achievement.icon] || Icons.Star;
                return (
                  <IconComponent
                    className="w-20 h-20"
                    style={{
                      color: isLocked ? "#6b7280" : tierColor,
                      filter: isLocked ? "grayscale(100%)" : "none",
                    }}
                  />
                );
              })()
            )}
          </div>

          <div
            className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${
              isLocked ? "bg-gray-700 text-gray-400" : "bg-black/30 text-white"
            }`}
          >
            {achievement.tier.name}
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${isLocked ? "text-gray-400" : "text-white"}`}>
            {isLocked && achievement.secret ? "Secret Achievement" : achievement.name}
          </h2>

          <p className={`text-lg mb-6 ${isLocked ? "text-gray-500" : "text-white/80"}`}>
            {isLocked && achievement.secret
              ? "Keep exploring to unlock this secret achievement!"
              : achievement.description}
          </p>

          {isLocked && !achievement.secret && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progress</span>
                <span className="font-bold">{achievement.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievement.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {!isLocked && achievement.unlockedAt && (
            <div className="mt-6 text-sm text-white/60">
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
