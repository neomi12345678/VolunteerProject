import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { Paths } from '../routes/paths';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/enums.types';

type Props = {
  children: ReactNode;
  roles?: UserRole[];
};

const AuthGuard = ({ children, roles }: Props) => {
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isInitialized) {
    return <h1>Loading...</h1>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${Paths.login}`} />;
  }

  if (roles && user && !roles.includes(user.userRole)) {
    return <h1>Unauthorized</h1>;
  }

  return <>{children}</>;
};

export default AuthGuard;