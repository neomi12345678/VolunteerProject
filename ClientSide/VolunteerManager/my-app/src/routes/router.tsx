import { createBrowserRouter, RouterProvider } from "react-router";
import LayoutAdmin      from "../layout/LayoutAdmin";
import LoginAdmin       from "../pages/LoginAdmin";
import HomeAdmin        from "../pages/HomeAdmin";
import VolunteerPage    from "../pages/VolunteerPage";
import NeedyPage        from "../pages/NeedyPage";
import HelpRequestsPage from "../pages/HelpRequestsPage";
import CategoriesPage   from "../pages/CategoriesPage";
import AssignmentsPage  from "../pages/AssignmentsPage"; // ← חדש
import AuthGuard        from "../auth/AuthGuard";
import { Paths }        from "./paths";

const router = createBrowserRouter([
  // ── ציבורי ─────────────────────────────────────────────
  { path: "/",         element: <LoginAdmin /> },
  { path: Paths.login, element: <LoginAdmin /> },

  // ── מוגן ───────────────────────────────────────────────
  {
    path: Paths.dashboard,
    element: (
      <AuthGuard requireAdmin>
        <LayoutAdmin />
      </AuthGuard>
    ),
    children: [
      { index: true,                  element: <HomeAdmin />        },
      { path: Paths.volunteers,       element: <VolunteerPage />    },
      { path: Paths.needy,            element: <NeedyPage />        },
      { path: Paths.helpRequests,     element: <HelpRequestsPage /> },
      { path: Paths.categories,       element: <CategoriesPage />   },
      { path: Paths.assignments,      element: <AssignmentsPage />  }, // ← חדש
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}