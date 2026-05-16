import { createBrowserRouter, RouterProvider } from 'react-router';
import LayoutNeedy from '../layouts/LayoutNeedy';
import LayoutVolunteer from '../layouts/LayoutVolunteer';
import { HomeVolunteer } from '../pages/Volunteer/HomeVolunteer';
import { HomeNeedy } from '../pages/Needy/HomeNeedy';
import { NewRequestPage } from '../pages/Needy/NewRequestPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import AuthGuard from '../auth/AuthGuard';
import LoginGuard from '../auth/LoginGuard';
import { Paths } from './paths';
import { UserRole } from '../types/enums.types';
import { SchedulePage } from '../pages/Volunteer/SchedulePage';
import { CategoriesPage } from '../pages/Volunteer/CategoriesPage';
import { ChatPage } from '../pages/ChatPage';

const router = createBrowserRouter([
  {
    path: Paths.login,
    element: <LoginGuard><LoginPage /></LoginGuard>,
  },
  {
    path: '/',
    element: <LoginGuard><LoginPage /></LoginGuard>,
  },
  {
    path: Paths.register,
    element: <LoginGuard><RegisterPage /></LoginGuard>,
  },

  // ── Needy ──────────────────────────────────────────────
  {
    path: Paths.homeNeedy,
    element: (
      <AuthGuard roles={[UserRole.Needy]}>
        <LayoutNeedy />
      </AuthGuard>
    ),
    children: [
      { index: true,                        element: <HomeNeedy />       },
      { path: Paths.NewRequestPage,         element: <NewRequestPage />  },
      { path: Paths.chatNeedy,              element: <ChatPage />        }, // ✅ תוקן
    ],
  },

  // ── Volunteer ──────────────────────────────────────────
  {
    path: Paths.homeVolunteer,
    element: (
      <AuthGuard roles={[UserRole.Volunteer]}>
        <LayoutVolunteer />
      </AuthGuard>
    ),
    children: [
      { index: true,                        element: <HomeVolunteer />   },
      { path: Paths.SchedulePage,           element: <SchedulePage />    },
      { path: Paths.CategoriesPage,         element: <CategoriesPage />  },
      { path: Paths.chatVolunteer,          element: <ChatPage />        },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
