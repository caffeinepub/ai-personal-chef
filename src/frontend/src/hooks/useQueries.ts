import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Recipe, RecipeMatch, UserProfile } from "../backend";
import { useActor } from "./useActor";

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
      return actor.searchRecipes(
        ingredients,
        isVeg,
        maxTime != null ? BigInt(maxTime) : null,
        difficulty,
      );
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
