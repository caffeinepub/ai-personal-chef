import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, RefreshCw, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Recipe } from "../backend";
import { useIngredients } from "../context/IngredientsContext";
import { STATIC_RECIPES } from "../data/recipes";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS = ["Breakfast", "Lunch", "Dinner"] as const;
type MealType = (typeof MEALS)[number];

type MealPlan = Record<string, Record<MealType, Recipe | null>>;

function pickRandom(arr: Recipe[], exclude: Recipe[] = []): Recipe {
  const pool = arr.filter((r) => !exclude.includes(r));
  const src = pool.length > 0 ? pool : arr;
  return src[Math.floor(Math.random() * src.length)];
}

function generatePlan(budgetFriendly: boolean): MealPlan {
  const pool = budgetFriendly
    ? [...STATIC_RECIPES]
        .sort((a, b) => a.ingredients.length - b.ingredients.length)
        .slice(0, 30)
    : STATIC_RECIPES;
  const plan: MealPlan = {};
  for (const day of DAYS) {
    plan[day] = { Breakfast: null, Lunch: null, Dinner: null };
    const used: Recipe[] = [];
    for (const meal of MEALS) {
      const r = pickRandom(pool as Recipe[], used);
      plan[day][meal] = r;
      used.push(r);
    }
  }
  return plan;
}

function loadPlan(): MealPlan | null {
  try {
    const stored = localStorage.getItem("mealPlan");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Re-hydrate bigint fields
    for (const day of DAYS) {
      for (const meal of MEALS) {
        if (parsed[day]?.[meal]) {
          parsed[day][meal].id = BigInt(parsed[day][meal].id);
          parsed[day][meal].estimatedTimeMinutes = BigInt(
            parsed[day][meal].estimatedTimeMinutes,
          );
        }
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePlan(plan: MealPlan) {
  const serializable: any = {};
  for (const day of DAYS) {
    serializable[day] = {};
    for (const meal of MEALS) {
      const r = plan[day][meal];
      if (r) {
        serializable[day][meal] = {
          ...r,
          id: r.id.toString(),
          estimatedTimeMinutes: r.estimatedTimeMinutes.toString(),
        };
      } else {
        serializable[day][meal] = null;
      }
    }
  }
  localStorage.setItem("mealPlan", JSON.stringify(serializable));
}

export default function MealPlannerPage() {
  const navigate = useNavigate();
  const { ingredients } = useIngredients();
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [plan, setPlan] = useState<MealPlan>(
    () => loadPlan() ?? generatePlan(false),
  );
  const [showGrocery, setShowGrocery] = useState(false);

  useEffect(() => {
    savePlan(plan);
  }, [plan]);

  const handleAutoFill = () => {
    const newPlan = generatePlan(budgetFriendly);
    setPlan(newPlan);
  };

  const handleCycleSlot = (day: string, meal: MealType) => {
    const pool = budgetFriendly
      ? [...STATIC_RECIPES]
          .sort((a, b) => a.ingredients.length - b.ingredients.length)
          .slice(0, 30)
      : [...STATIC_RECIPES];
    const current = plan[day][meal];
    const idx = current ? pool.findIndex((r) => r.id === current.id) : -1;
    const next = pool[(idx + 1) % pool.length];
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: next },
    }));
  };

  // Build grocery list
  const allRecipeIngredients: string[] = [];
  for (const day of DAYS) {
    for (const meal of MEALS) {
      const r = plan[day][meal];
      if (r) {
        for (const ing of r.ingredients) {
          const clean = ing
            .replace(
              /^[\d\w./\s]*?(cup|tbsp|tsp|g|kg|ml|l|piece|pieces|cloves?|stalk|stalks)?\s*/i,
              "",
            )
            .trim()
            .toLowerCase();
          if (clean) allRecipeIngredients.push(clean);
        }
      }
    }
  }
  const uniqueIngredients = [...new Set(allRecipeIngredients)];
  const missingIngredients = uniqueIngredients.filter(
    (ing) =>
      !ingredients.some((have) => ing.includes(have) || have.includes(ing)),
  );

  const mealColors: Record<MealType, string> = {
    Breakfast: "bg-amber-50 border-amber-200 text-amber-700",
    Lunch: "bg-emerald-50 border-emerald-200 text-emerald-700",
    Dinner: "bg-violet-50 border-violet-200 text-violet-700",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
          data-ocid="meal_planner.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-violet-600" />
            AI Meal Planner
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan your week, generate grocery lists
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-card border border-border rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <Switch
            id="budget-switch"
            checked={budgetFriendly}
            onCheckedChange={setBudgetFriendly}
            data-ocid="meal_planner.budget_switch"
          />
          <Label
            htmlFor="budget-switch"
            className="text-sm font-medium cursor-pointer"
          >
            💰 Budget-friendly options
          </Label>
        </div>
        <Button
          onClick={handleAutoFill}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          data-ocid="meal_planner.autofill_button"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Auto-fill Week
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowGrocery(!showGrocery)}
          className="rounded-xl"
          data-ocid="meal_planner.grocery_button"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Grocery List
          {missingIngredients.length > 0 && (
            <Badge className="ml-2 bg-primary/10 text-primary border-0 text-xs">
              {missingIngredients.length}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Grocery List */}
      <AnimatePresence>
        {showGrocery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
            data-ocid="meal_planner.grocery_panel"
          >
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Auto Grocery List
                <span className="text-xs font-normal text-emerald-600">
                  (ingredients you need to buy)
                </span>
              </h3>
              {missingIngredients.length === 0 ? (
                <p className="text-sm text-emerald-700">
                  🎉 You have all the ingredients!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingIngredients.map((ing) => (
                    <Badge
                      key={ing}
                      className="bg-white border-emerald-300 text-emerald-800 capitalize"
                    >
                      {ing}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {DAYS.map((day, dayIdx) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * dayIdx }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
            data-ocid={`meal_planner.day_card.${dayIdx + 1}`}
          >
            <div className="px-4 py-2 bg-secondary/50 border-b border-border">
              <span className="font-semibold text-sm text-foreground">
                {day}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {MEALS.map((meal) => {
                const recipe = plan[day][meal];
                return (
                  <button
                    type="button"
                    key={meal}
                    onClick={() => handleCycleSlot(day, meal)}
                    className="p-3 text-left hover:bg-secondary/30 transition-colors group"
                    title="Click to change"
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${mealColors[meal]}`}
                    >
                      {meal}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe?.name ?? "—"}
                    </p>
                    {recipe && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(recipe.estimatedTimeMinutes)}m ·{" "}
                        {recipe.difficulty}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
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
