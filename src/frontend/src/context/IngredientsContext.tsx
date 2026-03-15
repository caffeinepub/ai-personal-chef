import { type ReactNode, createContext, useContext, useState } from "react";
import type { RecipeMatch } from "../backend";

export interface RecipeFilters {
  isVeg: boolean | null;
  maxTime: number | null;
  difficulty: string | null;
}

interface IngredientsContextType {
  ingredients: string[];
  filters: RecipeFilters;
  lastSearchResults: RecipeMatch[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
  setFilters: (filters: RecipeFilters) => void;
  setLastSearchResults: (results: RecipeMatch[]) => void;
}

const IngredientsContext = createContext<IngredientsContextType | undefined>(
  undefined,
);

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>({
    isVeg: null,
    maxTime: null,
    difficulty: null,
  });
  const [lastSearchResults, setLastSearchResults] = useState<RecipeMatch[]>([]);

  const addIngredient = (ingredient: string) => {
    const normalized = ingredient.trim().toLowerCase();
    if (normalized && !ingredients.includes(normalized)) {
      setIngredients((prev) => [...prev, normalized]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const clearIngredients = () => setIngredients([]);

  return (
    <IngredientsContext.Provider
      value={{
        ingredients,
        filters,
        lastSearchResults,
        addIngredient,
        removeIngredient,
        clearIngredients,
        setFilters,
        setLastSearchResults,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const ctx = useContext(IngredientsContext);
  if (!ctx)
    throw new Error("useIngredients must be used within IngredientsProvider");
  return ctx;
}
