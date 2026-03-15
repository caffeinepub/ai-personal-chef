import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recipe, RecipeMatch, UserProfile } from "../backend";
import { useActor } from "./useActor";

function ingredientMatches(ingredient: string, available: string): boolean {
  const ing = ingredient.toLowerCase();
  const avail = available.toLowerCase();
  return ing.includes(avail) || avail.includes(ing);
}

function computeMatchScore(recipe: Recipe, available: string[]): number {
  if (recipe.ingredients.length === 0) return 0;
  let count = 0;
  for (const ing of recipe.ingredients) {
    for (const avail of available) {
      if (ingredientMatches(ing, avail)) {
        count++;
        break;
      }
    }
  }
  return Math.round((count * 100) / recipe.ingredients.length);
}

export function useSearchRecipes(
  ingredients: string[],
  isVeg: boolean | null,
  maxTime: number | null,
  difficulty: string | null,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<RecipeMatch[]>({
    queryKey: ["searchRecipes", ingredients, isVeg, maxTime, difficulty],
    queryFn: async () => {
      if (!actor) return [];
      let all = await actor.getAllRecipes();

      // Apply filters
      if (isVeg !== null) {
        all = all.filter((r) => r.isVeg === isVeg);
      }
      if (maxTime !== null) {
        all = all.filter((r) => Number(r.estimatedTimeMinutes) <= maxTime);
      }
      if (difficulty !== null && difficulty !== "") {
        all = all.filter(
          (r) => r.difficulty.toLowerCase() === difficulty.toLowerCase(),
        );
      }

      // Score and sort
      const matches: RecipeMatch[] = all.map((recipe) => ({
        recipe,
        matchScore: BigInt(computeMatchScore(recipe, ingredients)),
      }));

      matches.sort((a, b) => Number(b.matchScore) - Number(a.matchScore));

      return matches.filter((m) => Number(m.matchScore) > 0);
    },
    enabled: enabled && !!actor && !isFetching && ingredients.length > 0,
  });
}

export function useGetFavorites() {
  const { actor, isFetching } = useActor();
  return useQuery<Recipe[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavorites();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllRecipes() {
  const { actor, isFetching } = useActor();
  return useQuery<Recipe[]>({
    queryKey: ["allRecipes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor)
        return {
          displayName: "",
          searchesPerformed: BigInt(0),
          favoriteCount: BigInt(0),
        };
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipeId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.addFavorite(recipeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRemoveFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipeId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeFavorite(recipeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProfile(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
