import { createContext, useState, useContext, type ReactNode } from "react";

type UserType = {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "VOLUNTEER" | "NEEDY";
  token: string;
};

type AuthContextType = {
  user: UserType | null;
  setUser: (user: UserType) => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserType | null>(() => {
    const saved = localStorage.getItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });

  const setUser = (user: UserType) => {
    setUserState(user);
    localStorage.setItem("adminUser", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext)!;
