import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ChefHat, Heart, User } from "lucide-react";
import LoginModal from "./components/LoginModal";
import { IngredientsProvider } from "./context/IngredientsContext";
import { LoginProvider } from "./context/LoginContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import RecipesPage from "./pages/RecipesPage";

function RootLayout() {
  return (
    <LoginProvider>
      <IngredientsProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Outlet />
          <Toaster richColors position="top-right" />
          <LoginModal />
        </div>
      </IngredientsProvider>
    </LoginProvider>
  );
}

function AppLayout() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-warm">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            AI Personal Chef
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/home"
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            activeProps={{
              className:
                "px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10",
            }}
            data-ocid="nav.home_link"
          >
            Home
          </Link>
          <Link
            to="/favorites"
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            activeProps={{
              className:
                "px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10",
            }}
            data-ocid="nav.favorites_link"
          >
            Favorites
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            activeProps={{
              className:
                "px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10",
            }}
            data-ocid="nav.profile_link"
          >
            {isLoggedIn ? "Profile" : "Login"}
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
          <Link
            to="/home"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-muted-foreground"
            activeProps={{
              className:
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-primary",
            }}
            data-ocid="nav.home_link"
          >
            <ChefHat className="w-5 h-5" />
            <span className="text-[10px] font-medium">Chef</span>
          </Link>
          <Link
            to="/favorites"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-muted-foreground"
            activeProps={{
              className:
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-primary",
            }}
            data-ocid="nav.favorites_link"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-muted-foreground"
            activeProps={{
              className:
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-primary",
            }}
            data-ocid="nav.profile_link"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: AppLayout,
});
const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/home",
  component: HomePage,
});
const recipesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/recipes",
  component: RecipesPage,
});
export const recipeDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/recipe/$id",
  component: RecipeDetailPage,
});
const favoritesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/favorites",
  component: FavoritesPage,
});
const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute.addChildren([
    homeRoute,
    recipesRoute,
    recipeDetailRoute,
    favoritesRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
