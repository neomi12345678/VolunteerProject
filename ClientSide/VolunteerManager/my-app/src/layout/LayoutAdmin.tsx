import { NavLink, Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { Paths } from '../routes/paths';
import '../styles/styleLayout.css';

const navItems = [
  { label: 'Dashboard',    path: Paths.dashboard,   icon: 'M2 2h6v6H2zM10 2h6v6h-6zM2 10h6v6H2zM10 10h6v6h-6z' },
  { label: 'Volunteers',   path: Paths.volunteers,  icon: 'M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s1-4 6-4 6 4 6 4' },
  { label: 'Needy',        path: Paths.needy,       icon: 'M2 4h12M2 8h8M2 12h10' },
  { label: 'Categories',   path: Paths.categories,  icon: 'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z' },
  { label: 'HelpRequests', path: Paths.helpRequests,icon: 'M2 4h12M2 8h8M2 12h10M12 6l3-3M12 6l3 3' },
  { label: 'Assignments',  path: Paths.assignments, icon: 'M2 2h12v2H2zM2 6h8v2H2zM2 10h10v2H2zM13 9l2 2-2 2' }, // ← חדש
];

const LayoutAdmin = () => {
  const user    = useSelector((state: RootState) => state.auth.user);
  const initial = user?.fullName?.[0]?.toUpperCase() ?? 'A';
  const name    = user?.fullName ?? 'Admin';

  return (
    <div className="admin-layout">

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3"  y="3"  width="10" height="10" rx="2" fill="#c9973a" opacity="0.9"/>
              <rect x="15" y="3"  width="10" height="10" rx="2" fill="#c9973a" opacity="0.5"/>
              <rect x="3"  y="15" width="10" height="10" rx="2" fill="#c9973a" opacity="0.5"/>
              <rect x="15" y="15" width="10" height="10" rx="2" fill="#c9973a" opacity="0.9"/>
            </svg>
          </div>
          <span className="sidebar-brand-name">Together</span>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === Paths.dashboard}
              className={({ isActive }) =>
                `nav-item${isActive ? ' nav-item--active' : ''}`
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d={item.icon} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{initial}</div>
          <div>
            <div className="sidebar-admin-name">{name}</div>
            <div className="sidebar-admin-role">Administrator</div>
          </div>
        </div>
      </aside>

      <div className="admin-layout-body">
        <main className="admin-layout-main">
          <Outlet />
        </main>

        <footer className="admin-footer">
          <div className="admin-footer-left">
            <span className="admin-footer-brand">Together</span>
            <span className="admin-footer-sep">·</span>
            <span className="admin-footer-copy">Admin Panel © {new Date().getFullYear()}</span>
          </div>
          <div className="admin-footer-right">
            <span className="admin-footer-status">
              <span className="admin-footer-dot" />
              All systems operational
            </span>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default LayoutAdmin;


