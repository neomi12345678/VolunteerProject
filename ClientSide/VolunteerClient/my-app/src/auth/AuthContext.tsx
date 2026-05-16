import { createContext, useEffect, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSession, setSession } from "./auth.utils";
import { loginByToken } from "../services/auth.service";
import { authSuccess, initializationComplete } from "../redux/slices/authSlice";
import type { RootState, AppDispatch } from "../redux/store";

// ✅ הטיפוס בא ישירות מה-Redux — אין יותר חוסר התאמה
type AuthUser = RootState['auth']['user'];

type AuthContextType = {
    user: AuthUser;
    isInitialized: boolean;
    isAuthenticated: boolean;
    updateCategories: (newCategories: any[]) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null)

type Props = { children: ReactNode }

export const AuthProvider = ({ children }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isInitialized, isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isInitialized) return;

        const initialize = async () => {
            const token = getSession();
            try {
                if (token) {
                    const fetchedUser = await loginByToken(token);
                    setSession(token);
                    dispatch(authSuccess({ user: fetchedUser, token }));
                } else {
                    dispatch(initializationComplete());
                }
            } catch {
                localStorage.removeItem('token');
                dispatch(initializationComplete());
            }
        };

        initialize();
    }, []);

    const updateCategories = (newCategories: any[]) => {
        console.log('updateCategories', newCategories);
    };

    return (
        <AuthContext.Provider value={{ user, isInitialized, isAuthenticated, updateCategories }}>
            {children}
        </AuthContext.Provider>
    );
};