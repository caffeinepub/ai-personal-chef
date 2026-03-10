import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  ChefHat,
  Edit2,
  Heart,
  Loader2,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLoginModal } from "../context/LoginContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetProfile, useUpdateProfile } from "../hooks/useQueries";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card text-center">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const { openLoginModal } = useLoginModal();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Profile
        </h2>
        <p className="text-muted-foreground text-center mb-6 max-w-xs">
          Log in to view your profile, stats, and cooking history.
        </p>
        <Button
          onClick={openLoginModal}
          className="bg-primary text-primary-foreground shadow-warm px-8"
          data-ocid="profile.open_modal_button"
        >
          Log In
        </Button>
      </div>
    );
  }

  const displayName = profile?.displayName || "Chef";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");

  const handleStartEdit = () => {
    setEditName(displayName);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    await updateProfile.mutateAsync(editName.trim());
    toast.success("Profile updated!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    clear();
    toast.success("Logged out successfully");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Avatar card */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-6 mb-5 text-center">
          {isLoading ? (
            <div
              className="flex justify-center py-8"
              data-ocid="profile.loading_state"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl font-bold">
                  {initials || <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>

              {isEditing ? (
                <div className="flex gap-2 justify-center mb-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="max-w-48 text-center rounded-xl text-base"
                    autoFocus
                    data-ocid="profile.input"
                  />
                  <Button
                    size="icon"
                    className="rounded-xl bg-primary text-primary-foreground w-10 h-10"
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    data-ocid="profile.save_button"
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {displayName}
                  </h2>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="w-7 h-7 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                    data-ocid="profile.edit_button"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {identity.getPrincipal().toString().slice(0, 16)}...
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        {!isLoading && profile && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <StatCard
              icon={Search}
              label="Searches"
              value={String(profile.searchesPerformed)}
              color="bg-amber-50 text-amber-600"
            />
            <StatCard
              icon={Heart}
              label="Favourites"
              value={String(profile.favoriteCount)}
              color="bg-rose-50 text-rose-500"
            />
          </div>
        )}

        {/* About */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <ChefHat className="w-5 h-5 text-primary" />
            <h3 className="font-display text-base font-bold text-foreground">
              AI Personal Chef
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A college innovation project that uses AI to match your available
            ingredients with the perfect recipes. Built with Internet Computer
            blockchain technology.
          </p>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-xl py-5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive"
          onClick={handleLogout}
          data-ocid="profile.logout_button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </motion.div>
    </div>
  );
}
