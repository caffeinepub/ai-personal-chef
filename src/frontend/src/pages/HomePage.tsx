import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { useNavigate } from "@tanstack/react-router";
import {
  ChefHat,
  ChevronDown,
  ChevronUp,
  Leaf,
  Mic,
  MicOff,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useIngredients } from "../context/IngredientsContext";

const COMMON_INGREDIENTS = [
  "onion",
  "garlic",
  "tomato",
  "chicken",
  "rice",
  "pasta",
  "eggs",
  "flour",
  "butter",
  "milk",
  "cheese",
  "potato",
  "carrot",
  "spinach",
  "lemon",
  "ginger",
  "cumin",
  "pepper",
  "salt",
  "olive oil",
  "mushroom",
  "bell pepper",
  "broccoli",
  "tofu",
  "beef",
  "fish",
  "shrimp",
  "beans",
  "lentils",
  "yogurt",
  "cream",
  "basil",
  "oregano",
  "thyme",
  "rosemary",
  "soy sauce",
  "vinegar",
  "corn",
  "zucchini",
  "eggplant",
  "peas",
  "cauliflower",
  "cabbage",
  "celery",
];

const CATEGORIZED_INGREDIENTS: Record<string, string[]> = {
  Vegetables: [
    "onion",
    "garlic",
    "tomato",
    "potato",
    "carrot",
    "spinach",
    "mushroom",
    "bell pepper",
    "broccoli",
    "cauliflower",
    "cabbage",
    "zucchini",
    "eggplant",
    "corn",
    "peas",
    "celery",
    "ginger",
    "cucumber",
    "beetroot",
    "pumpkin",
  ],
  Proteins: [
    "chicken",
    "eggs",
    "beef",
    "fish",
    "shrimp",
    "tofu",
    "paneer",
    "lentils",
    "beans",
    "chickpeas",
    "mutton",
    "prawns",
  ],
  "Dairy & Fats": [
    "milk",
    "butter",
    "cream",
    "cheese",
    "yogurt",
    "ghee",
    "coconut milk",
  ],
  "Grains & Pasta": [
    "rice",
    "pasta",
    "flour",
    "bread",
    "oats",
    "noodles",
    "semolina",
  ],
  "Spices & Herbs": [
    "cumin",
    "pepper",
    "salt",
    "basil",
    "oregano",
    "thyme",
    "rosemary",
    "turmeric",
    "chili",
    "coriander",
    "curry leaves",
    "tamarind",
  ],
  "Oils & Sauces": [
    "olive oil",
    "soy sauce",
    "vinegar",
    "lemon",
    "coconut oil",
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  Vegetables:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  Proteins: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  "Dairy & Fats":
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  "Grains & Pasta":
    "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  "Spices & Herbs":
    "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  "Oils & Sauces": "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
};

const CATEGORY_LABEL_COLORS: Record<string, string> = {
  Vegetables: "text-emerald-600",
  Proteins: "text-rose-600",
  "Dairy & Fats": "text-amber-600",
  "Grains & Pasta": "text-yellow-600",
  "Spices & Herbs": "text-orange-600",
  "Oils & Sauces": "text-blue-600",
};

export default function HomePage() {
  const navigate = useNavigate();
  const { ingredients, filters, addIngredient, removeIngredient, setFilters } =
    useIngredients();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.trim().length > 0) {
      const filtered = COMMON_INGREDIENTS.filter(
        (ing) => ing.includes(val.toLowerCase()) && !ingredients.includes(ing),
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddIngredient = (ingredient: string) => {
    addIngredient(ingredient);
    setInputValue("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleAddIngredient(inputValue.trim());
    }
  };

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const words = transcript
        .split(/[,\s]+/)
        .filter((w: string) => w.length > 1);
      for (const word of words) {
        addIngredient(word.toLowerCase());
      }
      if (words.length > 0) {
        toast.success(`Added: ${words.join(", ")}`);
      }
    };
    recognition.start();
  }, [addIngredient]);

  const handleFindRecipes = () => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient first.");
      return;
    }
    navigate({ to: "/recipes" });
  };

  const timeLabels: Record<number, string> = {
    15: "15m",
    30: "30m",
    45: "45m",
    60: "1h",
    90: "1.5h",
  };

  const categoryEntries = Object.entries(CATEGORIZED_INGREDIENTS);
  const visibleCategories = showAllCategories
    ? categoryEntries
    : categoryEntries.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-warm">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          What's in your kitchen?
        </h1>
        <p className="text-muted-foreground text-base">
          Add your ingredients and we'll find the perfect recipes
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl shadow-card p-5 mb-4"
      >
        {/* Ingredient input */}
        <div className="relative flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an ingredient... (e.g. tomato)"
              className="pl-10 pr-4 py-3 text-base rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/30"
              data-ocid="home.ingredient_input"
            />
            {/* Suggestions dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-card-hover z-50 overflow-hidden"
                >
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors capitalize first:pt-3 last:pb-3"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddIngredient(s);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            variant={isListening ? "default" : "outline"}
            size="icon"
            onClick={startVoiceInput}
            className={`rounded-xl flex-shrink-0 w-11 h-11 ${
              isListening
                ? "bg-primary text-primary-foreground animate-pulse"
                : "border-border hover:border-primary hover:text-primary"
            }`}
            title={isListening ? "Listening..." : "Voice input"}
            data-ocid="home.voice_button"
          >
            {isListening ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Categorized quick add */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Quick Add Ingredients
            </p>
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              data-ocid="home.toggle"
            >
              {showAllCategories ? (
                <>
                  Show less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Show all categories <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {visibleCategories.map(([category, items]) => {
                const available = items.filter((i) => !ingredients.includes(i));
                if (available.length === 0) return null;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${
                        CATEGORY_LABEL_COLORS[category] ??
                        "text-muted-foreground"
                      }`}
                    >
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {available.map((ing) => (
                        <button
                          type="button"
                          key={ing}
                          onClick={() => handleAddIngredient(ing)}
                          className={`text-xs px-2.5 py-1 rounded-full transition-all capitalize border font-medium ${
                            CATEGORY_COLORS[category] ??
                            "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:text-primary"
                          }`}
                        >
                          + {ing}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>

        {/* Selected ingredients */}
        <AnimatePresence>
          {ingredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-2.5 font-medium uppercase tracking-wide">
                  Your ingredients ({ingredients.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, i) => (
                    <motion.div
                      key={ing}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Badge
                        className="pl-3 pr-1 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors gap-1.5 capitalize text-sm"
                        data-ocid={`home.ingredient_tag.${i + 1}`}
                      >
                        {ing}
                        <button
                          type="button"
                          onClick={() => removeIngredient(ing)}
                          className="w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {ingredients.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No ingredients added yet</p>
            <p className="text-xs mt-1">Type above or tap a quick-add chip</p>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border border-border rounded-2xl shadow-card overflow-hidden mb-4"
      >
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            Filters
            {(filters.isVeg !== null ||
              filters.maxTime !== null ||
              filters.difficulty !== null) && (
              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                Active
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {showFilters ? "Hide" : "Show"}
          </span>
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-2 space-y-5 border-t border-border">
                {/* Veg toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">Veg only</span>
                  </div>
                  <div className="flex gap-1">
                    <Toggle
                      pressed={filters.isVeg === null}
                      onPressedChange={() =>
                        setFilters({ ...filters, isVeg: null })
                      }
                      size="sm"
                      className="text-xs data-[state=on]:bg-secondary data-[state=on]:text-foreground"
                      data-ocid="home.veg_toggle"
                    >
                      Any
                    </Toggle>
                    <Toggle
                      pressed={filters.isVeg === true}
                      onPressedChange={() =>
                        setFilters({ ...filters, isVeg: true })
                      }
                      size="sm"
                      className="text-xs data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700"
                    >
                      Veg
                    </Toggle>
                    <Toggle
                      pressed={filters.isVeg === false}
                      onPressedChange={() =>
                        setFilters({ ...filters, isVeg: false })
                      }
                      size="sm"
                      className="text-xs data-[state=on]:bg-red-100 data-[state=on]:text-red-700"
                    >
                      Non-Veg
                    </Toggle>
                  </div>
                </div>

                {/* Max time */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      Max cooking time
                    </span>
                    <span className="text-sm text-primary font-semibold">
                      {filters.maxTime
                        ? (timeLabels[filters.maxTime] ?? `${filters.maxTime}m`)
                        : "Any"}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={90}
                    step={15}
                    value={[filters.maxTime ?? 0]}
                    onValueChange={([val]) =>
                      setFilters({
                        ...filters,
                        maxTime: val === 0 ? null : val,
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                    {["Any", "15m", "30m", "45m", "1h", "1.5h"].map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Difficulty</span>
                  <Select
                    value={filters.difficulty ?? "any"}
                    onValueChange={(val) =>
                      setFilters({
                        ...filters,
                        difficulty: val === "any" ? null : val,
                      })
                    }
                  >
                    <SelectTrigger
                      className="w-36 rounded-xl border-border text-sm"
                      data-ocid="home.difficulty_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any level</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm rounded-xl py-6 text-base font-semibold"
          onClick={handleFindRecipes}
          data-ocid="home.find_recipes_button"
        >
          <ChefHat className="w-5 h-5 mr-2" />
          Find Recipes
          {ingredients.length > 0 && (
            <Badge className="ml-2 bg-white/20 text-white border-0 text-xs">
              {ingredients.length}
            </Badge>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
