import { type ReactNode, createContext, useContext, useState } from "react";

export interface RecipeFilters {
  isVeg: boolean | null;
  maxTime: number | null;
  difficulty: string | null;
}

interface IngredientsContextType {
  ingredients: string[];
  filters: RecipeFilters;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
  setFilters: (filters: RecipeFilters) => void;
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
        addIngredient,
        removeIngredient,
        clearIngredients,
        setFilters,
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
