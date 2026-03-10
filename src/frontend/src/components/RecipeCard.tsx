import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Leaf } from "lucide-react";
import { toast } from "sonner";
import type { RecipeMatch } from "../backend";
import { useLoginModal } from "../context/LoginContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFavorite,
  useGetFavorites,
  useRemoveFavorite,
} from "../hooks/useQueries";

interface RecipeCardProps {
  match: RecipeMatch;
  index: number;
  userIngredients?: string[];
  onClick?: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-orange-100 text-orange-700 border-orange-200";
}

function difficultyColor(difficulty: string): string {
  if (difficulty === "Easy") return "bg-emerald-100 text-emerald-700";
  if (difficulty === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function RecipeCard({
  match,
  index,
  userIngredients = [],
  onClick,
}: RecipeCardProps) {
  const { recipe } = match;
  const score = Number(match.matchScore);
  const { identity } = useInternetIdentity();
  const { openLoginModal } = useLoginModal();
  const { data: favorites = [] } = useGetFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorited = favorites.some((f) => f.id === recipe.id);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) {
      openLoginModal();
      return;
    }
    if (isFavorited) {
      await removeFavorite.mutateAsync(recipe.id);
      toast.success("Removed from favourites");
    } else {
      await addFavorite.mutateAsync(recipe.id);
      toast.success("Saved to favourites!");
    }
  };

  const matchedCount = recipe.ingredients.filter((ing) =>
    userIngredients.some(
      (u) =>
        ing.toLowerCase().includes(u.toLowerCase()) ||
        u.toLowerCase().includes(ing.toLowerCase()),
    ),
  ).length;

  // Ingredient chips — first 5, with overflow count
  const visibleIngredients = recipe.ingredients.slice(0, 5);
  const extraCount = recipe.ingredients.length - visibleIngredients.length;

  return (
    <button
      type="button"
      className="bg-card border border-border rounded-2xl shadow-card card-hover cursor-pointer overflow-hidden w-full text-left"
      onClick={onClick}
    >
      {/* Score bar */}
      <div className="h-1.5 bg-secondary">
        <div
          className={`h-full transition-all duration-700 ${
            score >= 70
              ? "bg-emerald-500"
              : score >= 40
                ? "bg-amber-500"
                : "bg-orange-400"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground leading-snug line-clamp-2">
              {recipe.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {recipe.cuisine}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge
              className={`text-xs border font-semibold ${scoreColor(score)}`}
            >
              {score}% match
            </Badge>
            <Badge
              className={`text-[10px] border ${
                recipe.isVeg ? "veg-indicator" : "nonveg-indicator"
              }`}
            >
              {recipe.isVeg ? (
                <>
                  <Leaf className="w-3 h-3 mr-0.5" />
                  Veg
                </>
              ) : (
                <>
                  <span className="mr-0.5">🍗</span>Non-Veg
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
          {recipe.description}
        </p>

        {/* Ingredient chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {visibleIngredients.map((ing) => {
            const have = userIngredients.some(
              (u) =>
                ing.toLowerCase().includes(u.toLowerCase()) ||
                u.toLowerCase().includes(ing.toLowerCase()),
            );
            return (
              <span
                key={ing}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  have
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {ing}
              </span>
            );
          })}
          {extraCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-muted-foreground bg-secondary border border-border">
              +{extraCount} more
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{String(recipe.estimatedTimeMinutes)}m</span>
            </div>
            <Badge
              className={`text-xs border-0 ${difficultyColor(recipe.difficulty)}`}
            >
              {recipe.difficulty}
            </Badge>
            {userIngredients.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {matchedCount}/{recipe.ingredients.length} ingr.
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 rounded-full ${
              isFavorited
                ? "text-rose-500 hover:text-rose-600 bg-rose-50"
                : "text-muted-foreground hover:text-rose-500"
            }`}
            onClick={handleFavoriteToggle}
            data-ocid={`recipes.favorite_button.${index}`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </button>
  );
}
