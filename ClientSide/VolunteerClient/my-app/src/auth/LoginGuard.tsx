import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { Paths } from '../routes/paths';
import type { ReactNode } from 'react';
import { UserRole } from '../types/enums.types';

type Props = {
  children: ReactNode;
};

const LoginGuard = ({ children }: Props) => {
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state: RootState) => state.auth
  );

  // ממתין לסיום בדיקת הטוקן — מונע את הלופ!
  if (!isInitialized) {
    return <h1>Loading...</h1>;
  }

  // אם כבר מחובר — מעביר לדף הבית המתאים
  if (isAuthenticated && user) {
    const dest =
      user.userRole === UserRole.Volunteer ? Paths.homeVolunteer : Paths.homeNeedy;
    return <Navigate to={dest} />;
  }

  return <>{children}</>;
};

export default LoginGuard;