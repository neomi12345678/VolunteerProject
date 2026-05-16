import { NavLink, Outlet } from 'react-router';
import { Paths } from '../routes/paths';
import { removeSession } from '../auth/auth.utils';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { AssignmentStatus } from '../types/assignments.types';
import ProfileAvatar from '../pages/ProfileAvatar';
import '../styles/styleLayout.css';
import '../styles/profileAvatar.css';

const LayoutNeedy = () => {
  const activeAssignments = useSelector(
    (state: RootState) => state.assignments?.activeAssignments ?? []
  );

  const activeAssignment = activeAssignments.find(
    a => a.status === AssignmentStatus.Active
  );

  return (
    <div className="layout-container">

      <header className="layout-header">
        <div className="layout-header-inner">

          {/* Logo */}
          <NavLink to={Paths.homeNeedy} className="layout-logo">
            <div className="w1-logo">
              <div className="w1-logo-icon">🤝</div>
            </div>
            <span className="layout-logo-name">Together</span>
          </NavLink>

          {/* Nav */}
          <nav className="layout-nav">
            <NavLink to={Paths.homeNeedy} className="layout-nav-link" end>
              Home
            </NavLink>
            <NavLink to={Paths.NewRequestPage} className="layout-nav-link">
              New Request
            </NavLink>

            {activeAssignment && (
              <NavLink
                to={Paths.chatNeedy.replace(':assignmentId', String(activeAssignment.id))}
                className="layout-nav-link layout-nav-chat"
              >
                💬 Messages
                <span className="layout-nav-badge" />
              </NavLink>
            )}
          </nav>

          {/* Right side — Avatar + Logout */}
          <div className="layout-right">
            <ProfileAvatar />
            <button className="layout-logout" onClick={() => removeSession()}>
              <svg viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>

        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <div className="layout-footer-inner">
          <div className="layout-footer-left">
            <div className="layout-footer-dot" />
            <span className="layout-footer-copy">© 2025 Together. All rights reserved.</span>
          </div>
          <span className="layout-footer-right">Built on trust, driven by community.</span>
        </div>
      </footer>

    </div>
  );
};

export default LayoutNeedy;
