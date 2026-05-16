import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Paths } from "../routes/paths";
import { useDispatch } from "react-redux";
import { authSuccess } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store";
import "../styles/styleLogin.css";

export default function LoginAdmin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    try {

      const res = await api.post("/login", { email, password });

      if (res.data.role !== "ADMIN") {
        alert("Access denied — admin privileges required.");
        return;
      }

      dispatch(authSuccess(res.data));

      navigate(`/${Paths.dashboard}`);

    } catch {

      alert("Invalid email or password.");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="alp">

      <div className="alp-glow alp-glow-1" />
      <div className="alp-glow alp-glow-2" />
      <div className="alp-glow alp-glow-3" />

      <div className="alp-divider" />

      <nav className="alp-nav">
        <div className="alp-logo">
          <div className="alp-logo-icon">🤝</div>
          <span className="alp-logo-name">Together</span>
        </div>
        <div className="alp-pill">
          <span className="alp-pill-dot" />
          Admin Portal
        </div>
      </nav>

      <div className="alp-left">

        <div className="alp-ring-wrap">
          <div className="alp-ring">
            <div className="alp-ring-inner">🤝</div>
          </div>
        </div>

        <div className="alp-eyebrow">
          <div className="alp-eyebrow-line" />
          <span className="alp-eyebrow-text">Admin Dashboard</span>
        </div>

        <h1 className="alp-headline">
          Manage.<br />
          <em>Monitor.</em>
          <strong>Control.</strong>
        </h1>

        <p className="alp-sub">
          Your central command for the Together platform —
          oversee volunteers, resolve requests, and keep the
          community running smoothly.
        </p>


      </div>

      <div className="alp-right">

        <div className="alp-card">

          <p className="alp-form-label">Restricted Access</p>

          <h2 className="alp-form-title">
            Welcome back,<br />Administrator
          </h2>

          <p className="alp-form-desc">
            Sign in to access the control panel.
          </p>

          <form onSubmit={handleLogin}>

            <div className="alp-field">

              <label className="alp-field-label">Email address</label>

              <div className="alp-field-wrap">

                <input
                  className="alp-input"
                  type="email"
                  placeholder="admin@together.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

            </div>

            <div className="alp-field">

              <label className="alp-field-label">Password</label>

              <div className="alp-field-wrap">

                <input
                  className="alp-input"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

              </div>

            </div>

            <button className="alp-btn" type="submit" disabled={loading}>

              {loading ? (
                <>
                  <div className="alp-spinner" /> Signing in…
                </>
              ) : (
                <>Sign In →</>
              )}

            </button>

          </form>

          

        </div>

      </div>

      <footer className="alp-footer">

        <div className="alp-footer-item">
          <span className="alp-footer-icon">🔒</span>
          Encrypted session
        </div>

        <div className="alp-footer-item">
          <span className="alp-footer-icon">🛡️</span>
          Admin access only
        </div>

        <div className="alp-footer-item">
          <span className="alp-footer-icon">📋</span>
          Activity is logged
        </div>

      </footer>

    </div>
  );
}




