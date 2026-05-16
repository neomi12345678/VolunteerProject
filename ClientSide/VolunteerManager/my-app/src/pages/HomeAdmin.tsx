import { useNavigate } from "react-router";
import type { RootState } from "../redux/store";
import "../styles/styleHome.css";
import { useSelector } from "react-redux";
import { Paths } from "../routes/paths";

const sections = [
  {
    title: "Volunteers",
    description: "Manage all volunteers — add, update, delete",
    icon: "M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s1-4 6-4 6 4 6 4",
    path: Paths.volunteers,
    color: "#c9973a",
  },
  {
    title: "Needy",
    description: "Manage all registered needy users",
    icon: "M2 4h12M2 8h8M2 12h10",
    path: Paths.needy,
    color: "#6dbf8a",
  },
  {
    title: "Categories",
    description: "Manage request categories — add & edit",
    icon: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H9z",
    path: Paths.categories,
    color: "#7eb8e6",
  },
  {
    title: "Help Requests",
    description: "Track and manage open help requests",
    icon: "M2 4h12M2 8h8M2 12h10M12 6l3-3M12 6l3 3",
    path: Paths.helpRequests,
    color: "#e07070",
  },
  {
    title: "Assignments",
    description: "Manage active matches — complete or cancel",
    icon: "M2 2h12v2H2zM2 6h8v2H2zM2 10h10v2H2zM11 8l3 3-3 3",
    path: Paths.assignments, // ← צריך להוסיף ב-paths
    color: "#9b7de8",
  },
];

export default function HomeAdmin() {
  const navigate = useNavigate();
 

  return (
    <div className="dash-main" style={{ direction: "ltr" }}>

      <div className="top-bar">
        <div>
          <div className="page-eyebrow">Overview</div>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          Live
        </div>
      </div>


      <div className="section">
        <div className="section-header">
          <h2 className="section-title">System Management</h2>
        </div>
        <div className="nav-cards-grid">
          {sections.map((s) => (
            <button
              key={s.path}
              className="nav-card"
              onClick={() => navigate(s.path)}
            >
              <div
                className="nav-card-icon"
                style={{ color: s.color, borderColor: `${s.color}30`, background: `${s.color}12` }}
              >
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                  <path d={s.icon} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="nav-card-body">
                <div className="nav-card-title" style={{ color: s.color }}>{s.title}</div>
                <div className="nav-card-desc">{s.description}</div>
              </div>
              <div className="nav-card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
