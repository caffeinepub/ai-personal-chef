import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChefHat, Loader2, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { RecipeMatch } from "../backend";
import RecipeCard from "../components/RecipeCard";
import { useIngredients } from "../context/IngredientsContext";
import { useSearchRecipes } from "../hooks/useQueries";

const SMART_SUGGESTIONS: RecipeMatch[] = [
  {
    matchScore: BigInt(85),
    recipe: {
      id: BigInt(101),
      name: "Classic Spaghetti Aglio e Olio",
      description:
        "A simple yet elegant Italian pasta with garlic, olive oil, and chili flakes.",
      ingredients: ["pasta", "garlic", "olive oil", "chili flakes", "parmesan"],
      steps: [
        "Boil pasta in salted water until al dente.",
        "Sauté garlic in olive oil until golden.",
        "Toss pasta with garlic oil and chili flakes.",
        "Top with parmesan and serve.",
      ],
      estimatedTimeMinutes: BigInt(20),
      difficulty: "Easy",
      cuisine: "Italian",
      isVeg: true,
    },
  },
  {
    matchScore: BigInt(72),
    recipe: {
      id: BigInt(102),
      name: "Tomato Basil Soup",
      description: "A rich, velvety tomato soup with fresh basil and cream.",
      ingredients: ["tomato", "onion", "garlic", "basil", "cream", "butter"],
      steps: [
        "Roast tomatoes and onions until caramelised.",
        "Blend with garlic and stock.",
        "Simmer with cream and season well.",
        "Garnish with fresh basil.",
      ],
      estimatedTimeMinutes: BigInt(35),
      difficulty: "Easy",
      cuisine: "Mediterranean",
      isVeg: true,
    },
  },
  {
    matchScore: BigInt(60),
    recipe: {
      id: BigInt(103),
      name: "Chicken Stir Fry",
      description: "Quick and flavourful Asian-style chicken with vegetables.",
      ingredients: [
        "chicken",
        "soy sauce",
        "ginger",
        "garlic",
        "bell pepper",
        "carrot",
      ],
      steps: [
        "Marinate chicken in soy sauce and ginger.",
        "Stir fry on high heat for 5 minutes.",
        "Add vegetables and toss for 3 more minutes.",
        "Serve over steamed rice.",
      ],
      estimatedTimeMinutes: BigInt(25),
      difficulty: "Medium",
      cuisine: "Asian",
      isVeg: false,
    },
  },
];

export default function RecipesPage() {
  const navigate = useNavigate();
  const { ingredients, filters, setLastSearchResults } = useIngredients();
  const {
    data: results,
    isLoading,
    isError,
  } = useSearchRecipes(
    ingredients,
    filters.isVeg,
    filters.maxTime,
    filters.difficulty,
    true,
  );

  const showSuggestions =
    !isLoading && ingredients.length > 0 && (!results || results.length === 0);
  const displayResults =
    results && results.length > 0
      ? results
      : showSuggestions
        ? SMART_SUGGESTIONS
        : [];

  // Save results to context so RecipeDetailPage can use them without re-fetching
  useEffect(() => {
    if (results && results.length > 0) {
      setLastSearchResults(results);
    } else if (showSuggestions) {
      setLastSearchResults(SMART_SUGGESTIONS);
    }
  }, [results, showSuggestions, setLastSearchResults]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/home" })}
          className="rounded-xl hover:bg-secondary"
          data-ocid="recipes.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Recipe Suggestions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>
      </div>

      {/* Ingredient summary */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {ingredients.map((ing) => (
            <Badge key={ing} variant="secondary" className="capitalize text-xs">
              {ing}
            </Badge>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-24"
          data-ocid="recipes.loading_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <p className="text-foreground font-medium">
            Finding perfect recipes...
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Analysing your ingredients
          </p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-24" data-ocid="recipes.error_state">
          <UtensilsCrossed className="w-12 h-12 text-destructive mx-auto mb-4 opacity-60" />
          <p className="text-foreground font-medium">Something went wrong</p>
          <p className="text-muted-foreground text-sm mt-1">Please try again</p>
        </div>
      )}

      {/* No ingredients */}
      {!isLoading && !isError && ingredients.length === 0 && (
        <div className="text-center py-24">
          <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-foreground font-medium">No ingredients selected</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/home" })}>
            Add Ingredients
          </Button>
        </div>
      )}

      {/* Smart suggestions banner */}
      {showSuggestions && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-amber-800 font-semibold text-sm mb-1">
            No exact matches found
          </p>
          <p className="text-amber-700 text-sm">
            Try these popular recipes — you might only need a few extra
            ingredients:
          </p>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !isError && results && results.length > 0 && (
        <p className="text-sm text-muted-foreground mb-5 font-medium">
          {results.length} recipe{results.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Recipe grid */}
      {!isLoading && !isError && displayResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {displayResults.map((match, i) => (
              <motion.div
                key={String(match.recipe.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                data-ocid={`recipes.item.${i + 1}`}
              >
                <RecipeCard
                  match={match}
                  index={i + 1}
                  userIngredients={ingredients}
                  onClick={() =>
                    navigate({
                      to: "/recipe/$id",
                      params: { id: String(match.recipe.id) },
                    })
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
