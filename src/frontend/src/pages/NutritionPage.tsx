import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Recipe } from "../backend";
import { STATIC_RECIPES } from "../data/recipes";

const CUISINE_CALORIES: Record<string, number> = {
  "Tamil Nadu": 350,
  "North Indian": 450,
  Italian: 380,
  Asian: 300,
  Kerala: 400,
  Karnataka: 350,
  Mediterranean: 320,
  "South Indian": 340,
  Mughal: 480,
  Indian: 390,
};

function getCalories(recipe: Recipe): number {
  return CUISINE_CALORIES[recipe.cuisine] ?? 380;
}

const ALLERGY_FILTERS = [
  {
    id: "nut-free",
    label: "🚫🥜 Nut-free",
    check: (r: Recipe) =>
      !r.ingredients.some((i) =>
        ["almond", "cashew", "peanut", "walnut"].some((n) =>
          i.toLowerCase().includes(n),
        ),
      ),
  },
  {
    id: "dairy-free",
    label: "🥛 Dairy-free",
    check: (r: Recipe) =>
      !r.ingredients.some((i) =>
        ["milk", "cream", "butter", "cheese", "paneer"].some((n) =>
          i.toLowerCase().includes(n),
        ),
      ),
  },
  {
    id: "gluten-free",
    label: "🌾 Gluten-free",
    check: (r: Recipe) =>
      !r.ingredients.some((i) =>
        ["flour", "wheat", "pasta", "bread"].some((n) =>
          i.toLowerCase().includes(n),
        ),
      ),
  },
];

const HIGH_PROTEIN_VEG = [
  "paneer",
  "tofu",
  "lentil",
  "chickpea",
  "bean",
  "soy",
];

function getDietLabel(recipe: Recipe, cal: number): string[] {
  const tags: string[] = [];
  if (cal <= 350) tags.push("weight-loss");
  if (
    !recipe.isVeg ||
    HIGH_PROTEIN_VEG.some((p) =>
      recipe.ingredients.some((i) => i.toLowerCase().includes(p)),
    )
  )
    tags.push("muscle-gain");
  if (cal >= 351 && cal <= 500) tags.push("balanced");
  return tags;
}

export default function NutritionPage() {
  const navigate = useNavigate();
  const [activeAllergies, setActiveAllergies] = useState<string[]>([]);
  const [dietTab, setDietTab] = useState("all");

  const toggleAllergy = (id: string) => {
    setActiveAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const MAX_CAL = 700;

  let recipes = STATIC_RECIPES.map((r) => ({ ...r, cal: getCalories(r) }));

  // Apply allergy filters
  for (const af of ALLERGY_FILTERS) {
    if (activeAllergies.includes(af.id)) {
      recipes = recipes.filter(af.check);
    }
  }

  // Apply diet tab
  let tabFiltered = recipes;
  if (dietTab === "weight-loss")
    tabFiltered = recipes.filter((r) => r.cal <= 350);
  else if (dietTab === "muscle-gain")
    tabFiltered = recipes.filter(
      (r) =>
        !r.isVeg ||
        HIGH_PROTEIN_VEG.some((p) =>
          r.ingredients.some((i) => i.toLowerCase().includes(p)),
        ),
    );
  else if (dietTab === "balanced")
    tabFiltered = recipes.filter((r) => r.cal >= 351 && r.cal <= 500);

  const calBarColor = (cal: number) =>
    cal <= 300 ? "bg-emerald-500" : cal <= 400 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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
          data-ocid="nutrition.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-rose-500" />
            Nutrition & Health
          </h1>
          <p className="text-sm text-muted-foreground">
            Calories, diet plans & allergy-safe recipes
          </p>
        </div>
      </motion.div>

      {/* Allergy Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        <p className="text-xs text-muted-foreground self-center font-medium uppercase tracking-wide w-full">
          Allergy Filters
        </p>
        {ALLERGY_FILTERS.map((af) => (
          <Button
            key={af.id}
            variant={activeAllergies.includes(af.id) ? "default" : "outline"}
            onClick={() => toggleAllergy(af.id)}
            className="rounded-full text-sm"
            size="sm"
            data-ocid="nutrition.allergy_toggle"
          >
            {af.label}
          </Button>
        ))}
      </motion.div>

      {/* Diet Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <Tabs value={dietTab} onValueChange={setDietTab}>
          <TabsList className="rounded-xl" data-ocid="nutrition.diet_tabs">
            <TabsTrigger value="all" data-ocid="nutrition.all_tab">
              All
            </TabsTrigger>
            <TabsTrigger
              value="weight-loss"
              data-ocid="nutrition.weight_loss_tab"
            >
              ⚖️ Weight Loss
            </TabsTrigger>
            <TabsTrigger
              value="muscle-gain"
              data-ocid="nutrition.muscle_gain_tab"
            >
              💪 Muscle Gain
            </TabsTrigger>
            <TabsTrigger value="balanced" data-ocid="nutrition.balanced_tab">
              🥗 Balanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value={dietTab} className="mt-4">
            {tabFiltered.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="nutrition.empty_state"
              >
                <p>No recipes match your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tabFiltered.map((recipe, i) => (
                  <motion.div
                    key={String(recipe.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * i }}
                    className="bg-card border border-border rounded-2xl p-4"
                    data-ocid={`nutrition.recipe_card.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-foreground leading-tight flex-1">
                        {recipe.name}
                      </h3>
                      <Badge className="shrink-0 bg-rose-50 text-rose-700 border-rose-200 text-xs flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {recipe.cal} cal
                      </Badge>
                    </div>

                    {/* Calorie Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${calBarColor(recipe.cal)}`}
                          style={{
                            width: `${Math.min((recipe.cal / MAX_CAL) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>0 cal</span>
                        <span>{MAX_CAL} cal max</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {recipe.cuisine}
                      </Badge>
                      {recipe.isVeg && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          🥦 Veg
                        </Badge>
                      )}
                      {getDietLabel(recipe, recipe.cal).map((tag) => (
                        <Badge
                          key={tag}
                          className="text-[10px] bg-violet-50 text-violet-700 border-violet-200 capitalize"
                        >
                          {tag.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Cuisine Calorie Guide */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display text-lg font-bold text-foreground">
            📊 Calorie Guide by Cuisine
          </h2>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {Object.entries(CUISINE_CALORIES).map(([cuisine, cal]) => (
            <div
              key={cuisine}
              className="flex items-center justify-between p-2 rounded-xl bg-secondary/40"
            >
              <span className="text-sm font-medium text-foreground">
                {cuisine}
              </span>
              <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                {cal} cal
              </Badge>
            </div>
          ))}
        </div>
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
