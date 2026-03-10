import { createContext, useContext, useState } from "react";

interface LoginContextValue {
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const LoginContext = createContext<LoginContextValue | null>(null);

export function LoginProvider({ children }: { children: React.ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <LoginContext.Provider
      value={{ isLoginModalOpen, openLoginModal, closeLoginModal }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error("useLoginModal must be used within LoginProvider");
  return ctx;
}
