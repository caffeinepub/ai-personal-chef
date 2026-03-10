import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Heart,
  Leaf,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { recipeDetailRoute } from "../App";
import { useIngredients } from "../context/IngredientsContext";
import { useLoginModal } from "../context/LoginContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFavorite,
  useGetAllRecipes,
  useGetFavorites,
  useRemoveFavorite,
} from "../hooks/useQueries";

function difficultyColor(d: string) {
  if (d === "Easy") return "bg-emerald-100 text-emerald-700";
  if (d === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function RecipeDetailPage() {
  const navigate = useNavigate();
  const { id } = recipeDetailRoute.useParams();
  const { ingredients: userIngredients } = useIngredients();
  const { identity } = useInternetIdentity();
  const { openLoginModal } = useLoginModal();
  const { data: allRecipes = [], isLoading } = useGetAllRecipes();
  const { data: favorites = [] } = useGetFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const recipe = allRecipes.find((r) => String(r.id) === id);
  const isFavorited = favorites.some((f) => String(f.id) === id);
  const score = 75;

  const handleFavoriteToggle = async () => {
    if (!identity) {
      openLoginModal();
      return;
    }
    if (!recipe) return;
    if (isFavorited) {
      await removeFavorite.mutateAsync(recipe.id);
      toast.success("Removed from favourites");
    } else {
      await addFavorite.mutateAsync(recipe.id);
      toast.success("Saved to favourites!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-foreground font-medium mb-4">Recipe not found</p>
        <Button onClick={() => navigate({ to: "/recipes" })}>
          Back to Recipes
        </Button>
      </div>
    );
  }

  const hasIngredient = (ing: string) =>
    userIngredients.some(
      (u) =>
        ing.toLowerCase().includes(u.toLowerCase()) ||
        u.toLowerCase().includes(ing.toLowerCase()),
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/recipes" })}
        className="mb-5 -ml-2 rounded-xl hover:bg-secondary"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to results
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero section */}
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden mb-5">
          <div className="h-32 bg-gradient-to-br from-primary to-accent relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-8xl">🍽️</span>
            </div>
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 ${
                  isFavorited ? "text-rose-300" : "text-white/80"
                }`}
                onClick={handleFavoriteToggle}
                data-ocid="recipe_detail.save_button"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="p-5">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {recipe.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {recipe.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge
                className={`border ${
                  recipe.isVeg ? "veg-indicator" : "nonveg-indicator"
                }`}
              >
                {recipe.isVeg ? (
                  <>
                    <Leaf className="w-3.5 h-3.5 mr-1" />
                    Vegetarian
                  </>
                ) : (
                  <>
                    <span className="mr-1">🍗</span>Non-Vegetarian
                  </>
                )}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {recipe.cuisine}
              </Badge>
              <Badge
                className={`border-0 ${difficultyColor(recipe.difficulty)}`}
              >
                {recipe.difficulty}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {String(recipe.estimatedTimeMinutes)} min
              </Badge>
            </div>

            {userIngredients.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">
                    Ingredient match
                  </span>
                  <span className="text-primary font-semibold">{score}%</span>
                </div>
                <Progress value={score} className="h-2 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-5">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Ingredients
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.ingredients.map((ing) => {
              const have = hasIngredient(ing);
              return (
                <div
                  key={ing}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm ${
                    have
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-orange-50 border-orange-200 text-orange-800"
                  }`}
                >
                  {have ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                  <span className="capitalize">{ing}</span>
                </div>
              );
            })}
          </div>
          {userIngredients.length > 0 && (
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                You have it
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                Need to buy
              </span>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Cooking Instructions
          </h2>
          <div className="space-y-4">
            {recipe.steps.map((step, stepIdx) => (
              <motion.div
                key={`step-${stepIdx + 1}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: stepIdx * 0.07 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {stepIdx + 1}
                </div>
                <p className="text-foreground text-sm leading-relaxed pt-1.5">
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <Button
          size="lg"
          className={`w-full rounded-xl py-6 text-base font-semibold ${
            isFavorited
              ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm"
          }`}
          onClick={handleFavoriteToggle}
          data-ocid="recipe_detail.save_button"
        >
          <Heart
            className={`w-5 h-5 mr-2 ${isFavorited ? "fill-current" : ""}`}
          />
          {isFavorited ? "Remove from Favourites" : "Save to Favourites"}
        </Button>
      </motion.div>
    </div>
  );
}
