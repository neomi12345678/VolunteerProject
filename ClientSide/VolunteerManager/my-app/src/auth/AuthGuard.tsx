import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { Paths } from "../routes/paths";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

type Props = {
  children: ReactNode;
  requireAdmin?: boolean;
};

const AuthGuard = ({ children, requireAdmin = false }: Props) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) return <Navigate to={`/${Paths.login}`} />;

  if (requireAdmin && user.role !== "ADMIN") {
    return <Navigate to={`/${Paths.login}`} />;
  }

  return <>{children}</>;
};

export default AuthGuard;