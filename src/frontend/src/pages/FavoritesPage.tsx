import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ChefHat, Heart, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Recipe } from "../backend";
import { useLoginModal } from "../context/LoginContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetFavorites, useRemoveFavorite } from "../hooks/useQueries";

function FavoriteCard({
  recipe,
  index,
  onRemove,
  onClick,
}: {
  recipe: Recipe;
  index: number;
  onRemove: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-card border border-border rounded-2xl shadow-card card-hover overflow-hidden"
      data-ocid={`favorites.item.${index}`}
    >
      <div className="h-1.5 bg-gradient-to-r from-rose-400 to-primary" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <button
            type="button"
            className="flex-1 min-w-0 text-left"
            onClick={onClick}
          >
            <h3 className="font-display text-lg font-bold text-foreground leading-snug line-clamp-1">
              {recipe.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {recipe.cuisine}
            </p>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors flex-shrink-0"
            data-ocid={`favorites.delete_button.${index}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <button type="button" className="w-full text-left" onClick={onClick}>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {recipe.description}
          </p>
          {/* Ingredient chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.ingredients.slice(0, 5).map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border"
              >
                {ing}
              </span>
            ))}
            {recipe.ingredients.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-muted-foreground bg-secondary border border-border">
                +{recipe.ingredients.length - 5} more
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{String(recipe.estimatedTimeMinutes)}m</span>
            <span>·</span>
            <span>{recipe.difficulty}</span>
            <span>·</span>
            <span>{recipe.isVeg ? "🌿 Veg" : "🍗 Non-Veg"}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { openLoginModal } = useLoginModal();
  const { data: favorites = [], isLoading } = useGetFavorites();
  const removeFavorite = useRemoveFavorite();

  const handleRemove = async (id: bigint) => {
    await removeFavorite.mutateAsync(id);
    toast.success("Removed from favourites");
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-5">
          <Heart className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Favourites
        </h2>
        <p className="text-muted-foreground text-center mb-6 max-w-xs">
          Log in to save and access your favourite recipes across all devices.
        </p>
        <Button
          onClick={openLoginModal}
          className="bg-primary text-primary-foreground shadow-warm px-8"
          data-ocid="favorites.open_modal_button"
        >
          Log In to See Favourites
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Favourite Recipes
          </h1>
          <p className="text-sm text-muted-foreground">
            {favorites.length} saved recipe{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isLoading && (
        <div
          className="flex justify-center py-16"
          data-ocid="favorites.loading_state"
        >
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="favorites.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-5">
            <Heart className="w-8 h-8 text-rose-300" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            No favourites yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Start exploring recipes and save the ones you love.
          </p>
          <Button
            onClick={() => navigate({ to: "/home" })}
            className="bg-primary text-primary-foreground shadow-warm"
            data-ocid="favorites.primary_button"
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Find Recipes
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence>
          {favorites.map((recipe, i) => (
            <motion.div
              key={String(recipe.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <FavoriteCard
                recipe={recipe}
                index={i + 1}
                onRemove={() => handleRemove(recipe.id)}
                onClick={() =>
                  navigate({
                    to: "/recipe/$id",
                    params: { id: String(recipe.id) },
                  })
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
