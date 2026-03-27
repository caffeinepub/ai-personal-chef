import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calculator, IndianRupee } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Recipe } from "../backend";
import { useIngredients } from "../context/IngredientsContext";
import { STATIC_RECIPES } from "../data/recipes";

const CHEAP_ALTERNATIVES = [
  { expensive: "Chicken", cheap: "Eggs", saving: "~₹80" },
  { expensive: "Paneer", cheap: "Tofu", saving: "~₹60" },
  { expensive: "Cream", cheap: "Yogurt", saving: "~₹40" },
  { expensive: "Cheese", cheap: "Coconut Milk", saving: "~₹50" },
  { expensive: "Almonds", cheap: "Peanuts", saving: "~₹120" },
];

const BUDGET_FILTERS = [
  { label: "₹100", max: 100 },
  { label: "₹200", max: 200 },
  { label: "₹500", max: 500 },
  { label: "All", max: Number.POSITIVE_INFINITY },
];

function getRecipeCost(recipe: Recipe): number {
  return Math.round(recipe.ingredients.length * 15 + (recipe.isVeg ? 0 : 30));
}

export default function BudgetPage() {
  const navigate = useNavigate();
  const { ingredients: contextIngredients } = useIngredients();
  const [budgetMax, setBudgetMax] = useState<number>(Number.POSITIVE_INFINITY);
  const [calcInput, setCalcInput] = useState(contextIngredients.join(", "));
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedCalcId, setExpandedCalcId] = useState<number | null>(null);

  const recipesWithCost = STATIC_RECIPES.map((r) => ({
    ...r,
    cost: getRecipeCost(r),
  }));

  const filteredRecipes = recipesWithCost
    .filter((r) => r.cost <= budgetMax)
    .sort((a, b) => a.cost - b.cost);

  // Calculator
  const calcIngredients = calcInput
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const calcResults = recipesWithCost
    .filter((r) => {
      if (calcIngredients.length === 0) return false;
      return calcIngredients.some((have) =>
        r.ingredients.some(
          (ing) =>
            ing.toLowerCase().includes(have) ||
            have.includes(ing.toLowerCase().split(" ").pop() ?? ""),
        ),
      );
    })
    .sort((a, b) => a.cost - b.cost)
    .slice(0, 10);

  const costColor = (cost: number) =>
    cost <= 100
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : cost <= 200
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-rose-100 text-rose-700 border-rose-200";

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
          data-ocid="budget.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
            Budget Cooking Mode
          </h1>
          <p className="text-sm text-muted-foreground">
            For students & money-savers 💰
          </p>
        </div>
      </motion.div>

      {/* Budget filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {BUDGET_FILTERS.map((bf) => (
          <Button
            key={bf.label}
            variant={budgetMax === bf.max ? "default" : "outline"}
            onClick={() => setBudgetMax(bf.max)}
            className="rounded-xl"
            data-ocid="budget.filter_button"
          >
            {bf.label}
          </Button>
        ))}
      </motion.div>

      {/* Recipes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
      >
        {filteredRecipes.length === 0 ? (
          <p
            className="text-muted-foreground col-span-2 text-center py-8"
            data-ocid="budget.empty_state"
          >
            No recipes found under this budget.
          </p>
        ) : (
          filteredRecipes.slice(0, 20).map((recipe, i) => (
            <motion.div
              key={String(recipe.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3"
              data-ocid={`budget.recipe_card.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <button
                    type="button"
                    className="font-semibold text-sm text-foreground leading-tight cursor-pointer hover:text-emerald-600 underline decoration-dotted transition-colors text-left"
                    onClick={() =>
                      setExpandedId(
                        expandedId === Number(recipe.id)
                          ? null
                          : Number(recipe.id),
                      )
                    }
                    data-ocid={`budget.recipe_name.${i + 1}`}
                  >
                    {recipe.name}
                  </button>
                  <Badge
                    className={`shrink-0 text-xs border ${costColor(recipe.cost)}`}
                  >
                    ₹{recipe.cost}
                  </Badge>
                </div>

                {/* Expandable ingredients */}
                <AnimatePresence initial={false}>
                  {expandedId === Number(recipe.id) && (
                    <motion.div
                      key="ingredients"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1 pt-1 pb-2">
                        {recipe.ingredients.map((ing) => (
                          <Badge
                            key={ing}
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {recipe.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">
                    {recipe.cuisine}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {Number(recipe.estimatedTimeMinutes)}m
                  </Badge>
                  {recipe.isVeg && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      🥦 Veg
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Cheap Alternatives Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl overflow-hidden mb-8"
      >
        <div className="px-5 py-3 border-b border-border bg-amber-50">
          <h2 className="font-display text-lg font-bold text-amber-900">
            💡 Cheapest Alternatives
          </h2>
          <p className="text-xs text-amber-700 mt-0.5">
            Swap expensive ingredients and save money
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expensive</TableHead>
              <TableHead>Cheap Alternative</TableHead>
              <TableHead>Savings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHEAP_ALTERNATIVES.map((alt) => (
              <TableRow key={alt.expensive}>
                <TableCell className="font-medium">{alt.expensive}</TableCell>
                <TableCell className="text-emerald-700">{alt.cheap}</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {alt.saving}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Smart Cost Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-5"
        data-ocid="budget.calculator_panel"
      >
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Smart Cost Calculator
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Enter ingredients you have — see what you can cook sorted by cost
        </p>
        <Input
          value={calcInput}
          onChange={(e) => setCalcInput(e.target.value)}
          placeholder="e.g. garlic, tomato, rice, chicken"
          className="rounded-xl mb-4"
          data-ocid="budget.calculator_input"
        />
        <div className="space-y-2">
          {calcResults.length === 0 && calcIngredients.length > 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-4"
              data-ocid="budget.calculator_empty_state"
            >
              No matching recipes found.
            </p>
          )}
          {calcResults.map((recipe, i) => (
            <div
              key={String(recipe.id)}
              className="p-3 rounded-xl bg-secondary/40 border border-border"
              data-ocid={`budget.calc_result.${i + 1}`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="font-semibold text-sm text-foreground cursor-pointer hover:text-emerald-600 underline decoration-dotted transition-colors text-left"
                  onClick={() =>
                    setExpandedCalcId(
                      expandedCalcId === Number(recipe.id)
                        ? null
                        : Number(recipe.id),
                    )
                  }
                  data-ocid={`budget.calc_recipe_name.${i + 1}`}
                >
                  {recipe.name}
                </button>
                <Badge
                  className={`shrink-0 text-xs border ${costColor(recipe.cost)}`}
                >
                  ₹{recipe.cost}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {recipe.cuisine} · {Number(recipe.estimatedTimeMinutes)}m
              </p>
              {/* Expandable ingredients */}
              <AnimatePresence initial={false}>
                {expandedCalcId === Number(recipe.id) && (
                  <motion.div
                    key="calc-ingredients"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1 pt-2">
                      {recipe.ingredients.map((ing) => (
                        <Badge
                          key={ing}
                          variant="outline"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
