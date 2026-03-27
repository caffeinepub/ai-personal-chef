import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Flame, Star, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { STATIC_RECIPES } from "../data/recipes";

const BADGES = [
  { id: "beginner", name: "Beginner Chef", pts: 10, emoji: "🍳" },
  { id: "home_cook", name: "Home Cook", pts: 50, emoji: "🥘" },
  { id: "expert", name: "Kitchen Expert", pts: 150, emoji: "👨‍🍳" },
  { id: "master", name: "Master Chef", pts: 500, emoji: "🏆" },
];

const CONFETTI_COLORS = ["#e8614a", "#f59e0b", "#10b981", "#6366f1", "#ec4899"];
const CONFETTI_ITEMS = Array.from({ length: 30 }, (_, i) => ({
  id: `c${i}`,
  color: CONFETTI_COLORS[i % 5],
}));

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ChallengesPage() {
  const navigate = useNavigate();
  const dayOfYear = getDayOfYear();
  const todayKey = getTodayKey();
  const dailyRecipe = STATIC_RECIPES[dayOfYear % STATIC_RECIPES.length];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [points, setPoints] = useState(() =>
    Number(localStorage.getItem("challenges_points") ?? 0),
  );
  const [streak, setStreak] = useState(() =>
    Number(localStorage.getItem("challenges_streak") ?? 0),
  );
  const [lastDate, setLastDate] = useState(
    () => localStorage.getItem("challenges_lastDate") ?? "",
  );
  const [completed, setCompleted] = useState(
    () => localStorage.getItem("challenges_completed") === todayKey,
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [dishPhoto, setDishPhoto] = useState<string>(
    () => localStorage.getItem(`dish_photo_${todayKey}`) ?? "",
  );
  const [journal, setJournal] = useState<
    { date: string; photo: string; dish: string }[]
  >(() => JSON.parse(localStorage.getItem("cooking_journal") ?? "[]"));

  useEffect(() => {
    localStorage.setItem("challenges_points", String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem("challenges_streak", String(streak));
  }, [streak]);

  const handleComplete = () => {
    if (completed) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];
    const newStreak = lastDate === yesterdayKey ? streak + 1 : 1;

    setPoints((p) => p + 10);
    setStreak(newStreak);
    setLastDate(todayKey);
    setCompleted(true);
    setShowConfetti(true);

    localStorage.setItem("challenges_streak", String(newStreak));
    localStorage.setItem("challenges_lastDate", todayKey);
    localStorage.setItem("challenges_completed", todayKey);

    toast.success("🎉 Challenge complete! +10 points");
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem(`dish_photo_${todayKey}`, dataUrl);
      setDishPhoto(dataUrl);

      const updatedJournal = [
        ...journal.filter((j) => j.date !== todayKey),
        { date: todayKey, photo: dataUrl, dish: dailyRecipe.name },
      ].sort((a, b) => b.date.localeCompare(a.date));

      localStorage.setItem("cooking_journal", JSON.stringify(updatedJournal));
      setJournal(updatedJournal);
      toast.success("📸 Dish photo saved!");
    };
    reader.readAsDataURL(file);
  };

  const nextBadge = BADGES.find((b) => points < b.pts);
  const recentJournal = journal.slice(0, 7);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {CONFETTI_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  background: item.color,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ y: -100, opacity: 1, scale: 0 }}
                animate={{
                  y: Math.random() * 600 + 200,
                  opacity: 0,
                  scale: 1,
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/home" })}
          data-ocid="challenges.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Cooking Challenges
          </h1>
          <p className="text-sm text-muted-foreground">
            Cook daily. Earn points. Build your streak.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="relative">
            <Flame className="w-8 h-8 text-orange-500" />
            {dishPhoto && (
              <img
                src={dishPhoto}
                alt="Today's dish"
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full object-cover border-2 border-amber-300 shadow-sm"
              />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-3">
          <Star className="w-8 h-8 text-violet-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{points}</p>
            <p className="text-xs text-muted-foreground">total points</p>
          </div>
        </div>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl overflow-hidden mb-6"
        data-ocid="challenges.daily_card"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
          <p className="text-white font-semibold text-sm flex items-center gap-2">
            🏆 Daily Challenge
          </p>
        </div>
        <div className="p-5">
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {dailyRecipe.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            {dailyRecipe.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{dailyRecipe.cuisine}</Badge>
            <Badge variant="outline">
              {Number(dailyRecipe.estimatedTimeMinutes)}m
            </Badge>
            <Badge variant="outline">{dailyRecipe.difficulty}</Badge>
            {dailyRecipe.isVeg && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                🥦 Veg
              </Badge>
            )}
          </div>
          <Button
            onClick={handleComplete}
            disabled={completed}
            className={`w-full rounded-xl font-semibold ${
              completed
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            data-ocid="challenges.complete_button"
          >
            {completed
              ? "✅ Completed Today! (+10 pts)"
              : "Mark as Complete (+10 pts)"}
          </Button>

          {/* Dish Photo Upload — visible once challenge is completed */}
          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-ocid="challenges.upload_button"
                />
                {dishPhoto ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={dishPhoto}
                      alt="Your dish"
                      className="w-full max-h-52 rounded-xl object-cover border border-amber-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                    >
                      Change photo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50">
                    <Camera className="w-8 h-8 text-amber-400" />
                    <p className="text-sm text-muted-foreground text-center">
                      Snap a photo of your dish to maintain your streak!
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-amber-400 text-amber-700 hover:bg-amber-50"
                    >
                      📸 Add Your Dish Photo
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-5 mb-6"
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((badge, badgeIdx) => {
            const earned = points >= badge.pts;
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                  earned
                    ? "bg-amber-50 border-amber-200"
                    : "bg-muted/30 border-border opacity-50"
                }`}
                data-ocid={`challenges.badge_card.${badgeIdx + 1}`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p
                  className={`text-xs font-semibold ${earned ? "text-amber-700" : "text-muted-foreground"}`}
                >
                  {badge.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {badge.pts} pts
                </p>
              </div>
            );
          })}
        </div>
        {nextBadge && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to {nextBadge.name}</span>
              <span>
                {points}/{nextBadge.pts} pts
              </span>
            </div>
            <Progress value={(points / nextBadge.pts) * 100} className="h-2" />
          </div>
        )}
      </motion.div>

      {/* Cooking Journal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-5 mb-6"
        data-ocid="challenges.journal_panel"
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          🍽️ My Cooking Journal
        </h2>
        {recentJournal.length === 0 ? (
          <div
            className="text-center py-6 text-muted-foreground text-sm"
            data-ocid="challenges.journal_empty_state"
          >
            {completed
              ? "Add a photo above to start your cooking journal!"
              : "Complete today's challenge and add a photo to start your journal!"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentJournal.map((entry, idx) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col gap-2 rounded-xl border border-border overflow-hidden bg-muted/20"
                data-ocid={`challenges.journal_item.${idx + 1}`}
              >
                <img
                  src={entry.photo}
                  alt={entry.dish}
                  className="w-full h-20 object-cover"
                />
                <div className="px-2 pb-2">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {entry.dish}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(entry.date)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
