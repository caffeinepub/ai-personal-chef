import { useNavigate } from "@tanstack/react-router";
import { Clock, Leaf, MapPin, Utensils } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { STATIC_RECIPES } from "../data/recipes";

type Region = {
  name: string;
  emoji: string;
  description: string;
  color: string;
};

const REGIONS: Region[] = [
  {
    name: "Kerala",
    emoji: "🌴",
    description:
      "God's Own Country — coconut-rich curries, seafood, and Onam sadhya classics",
    color: "from-green-600 to-emerald-500",
  },
  {
    name: "Tamil Nadu",
    emoji: "🌶",
    description:
      "Temple cuisine — bold tamarind gravies, crispy dosas, and rice-based staples",
    color: "from-orange-600 to-red-500",
  },
  {
    name: "Karnataka",
    emoji: "☕",
    description:
      "Udupi to Mysore — lemon rice, spiced rotis, and iconic masala dosas",
    color: "from-yellow-600 to-amber-500",
  },
  {
    name: "Telangana",
    emoji: "🍛",
    description:
      "Hyderabadi heritage — biryani, bold Gongura flavours, and spicy pesarattu",
    color: "from-rose-600 to-pink-500",
  },
];

export default function RegionalPage() {
  const [activeRegion, setActiveRegion] = useState<string>("Kerala");
  const navigate = useNavigate();

  const recipes = STATIC_RECIPES.filter((r) => r.cuisine === activeRegion);
  const activeRegionData = REGIONS.find((r) => r.name === activeRegion)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-primary mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Explore by Region
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Regional Recipes
          </h1>
          <p className="text-muted-foreground text-base">
            Authentic flavours from South India
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Region Tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none"
          data-ocid="regional.tab"
        >
          {REGIONS.map((region) => {
            const count = STATIC_RECIPES.filter(
              (r) => r.cuisine === region.name,
            ).length;
            const isActive = activeRegion === region.name;
            return (
              <button
                type="button"
                key={region.name}
                onClick={() => setActiveRegion(region.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
                data-ocid={`regional.${region.name.toLowerCase().replace(" ", "_")}.tab`}
              >
                <span className="text-base">{region.emoji}</span>
                <span>{region.name}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Region Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeRegion}desc`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{activeRegionData.emoji}</span>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {activeRegion}
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {activeRegionData.description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Recipe Grid */}
        <AnimatePresence mode="wait">
          {recipes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
              data-ocid="regional.empty_state"
            >
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">
                No recipes yet for {activeRegion}
              </p>
              <p className="text-sm mt-1">
                Check back soon for authentic {activeRegion} dishes!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeRegion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-ocid="regional.list"
            >
              {recipes.map((recipe, index) => (
                <motion.div
                  key={String(recipe.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:shadow-warm hover:border-primary/40 transition-all group"
                  onClick={() =>
                    navigate({
                      to: "/recipe/$id",
                      params: { id: String(recipe.id) },
                    })
                  }
                  data-ocid={`regional.item.${index + 1}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {recipe.name}
                    </h3>
                    <span
                      className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                        recipe.isVeg
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}
                    >
                      <Leaf className="w-3 h-3" />
                      {recipe.isVeg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {String(recipe.estimatedTimeMinutes)} min
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          recipe.difficulty === "Easy"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : recipe.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {recipe.difficulty}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({
                          to: "/recipe/$id",
                          params: { id: String(recipe.id) },
                        });
                      }}
                      data-ocid={`regional.view_recipe.button.${index + 1}`}
                    >
                      View Recipe →
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
