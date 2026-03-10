import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChefHat, Fingerprint, X } from "lucide-react";
import { useLoginModal } from "../context/LoginContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useLoginModal();
  const { login, isLoggingIn } = useInternetIdentity();

  const handleLogin = async () => {
    await login();
    closeLoginModal();
  };

  return (
    <Dialog
      open={isLoginModalOpen}
      onOpenChange={(open) => !open && closeLoginModal()}
    >
      <DialogContent
        className="sm:max-w-sm rounded-2xl border-border bg-card p-0 overflow-hidden"
        data-ocid="login.dialog"
      >
        {/* Decorative header */}
        <div className="h-24 bg-gradient-to-br from-primary to-accent relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center text-8xl select-none">
            🍽️
          </div>
          <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            data-ocid="login.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <DialogHeader className="mb-5 text-left">
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              Sign in to continue
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1 leading-relaxed">
              Log in with Internet Identity to save recipes and track your
              favourites across all your devices.
            </DialogDescription>
          </DialogHeader>

          <Button
            size="lg"
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm font-semibold text-base py-5"
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            {isLoggingIn ? "Connecting..." : "Log In with Internet Identity"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure, passwordless authentication on the Internet Computer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
