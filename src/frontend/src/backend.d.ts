import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RecipeMatch {
    matchScore: bigint;
    recipe: Recipe;
}
export interface Recipe {
    id: bigint;
    estimatedTimeMinutes: bigint;
    difficulty: string;
    name: string;
    description: string;
    steps: Array<string>;
    cuisine: string;
    isVeg: boolean;
    ingredients: Array<string>;
}
export interface UserProfile {
    displayName: string;
    searchesPerformed: bigint;
    favoriteCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFavorite(recipeId: bigint): Promise<void>;
    addRecipe(recipe: Recipe): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllRecipes(): Promise<Array<Recipe>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavorites(): Promise<Array<Recipe>>;
    getProfile(): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFavorite(recipeId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchRecipes(availableIngredients: Array<string>, isVeg: boolean | null, maxTimeMinutes: bigint | null, difficulty: string | null): Promise<Array<RecipeMatch>>;
    updateProfile(displayName: string): Promise<void>;
}
