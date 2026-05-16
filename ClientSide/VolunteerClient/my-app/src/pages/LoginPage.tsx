import { type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { setSession } from '../auth/auth.utils';
import { login as loginService } from '../services/auth.service';
import { Paths } from '../routes/paths';
import { UserRole } from '../types/enums.types';
import { type LoginType } from '../types/auth.types';
import { authStart, authSuccess, authFailure, clearError } from '../redux/slices/authSlice';
import { type RootState } from '../redux/store';
import '../styles/styleLogin.css';

export const LoginPage = () => {
  useDocumentTitle('Login');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // שליפת המצב מתוך ה-Store
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as LoginType;

    try {
      dispatch(authStart());
      const response = await loginService(data);
      setSession(response.token);

      // העברת המשתמש והטוקן ל-Redux
      dispatch(authSuccess({ user: response.user, token: response.token }));
      console.log("Navigating to:", response.user.userRole === UserRole.Volunteer ? Paths.homeVolunteer : Paths.homeNeedy);

      if (response.user.userRole === UserRole.Volunteer) {
        navigate(Paths.homeVolunteer);
      } else {
        navigate(Paths.homeNeedy);
      }
    } catch (err: any) {
      const serverData = err?.response?.data;
      const message =
        serverData?.message
        ?? serverData?.error
        ?? (typeof serverData === 'string' ? serverData : null)
        ?? err?.message
        ?? 'Something went wrong, please try again';

      dispatch(authFailure(message));
    }
  };

  return (
    <div className="ll-root">
      {/* LEFT */}
      <div className="ll-left">
        <div className="ll-deco-c1" />
        <div className="ll-deco-c2" />
        <div className="ll-deco-c3" />
        <div className="ll-logo">
          <div className="ll-logo-icon">🤝</div>
          Together
        </div>
        <div className="ll-mid">
          <div className="ll-tag">✦ Community Platform</div>
          <h1 className="ll-h1">Give help.<br /><em>Receive</em><br />kindness.</h1>
          <p className="ll-p">A space where volunteers and those in need find each other — built on trust, driven by community.</p>
        </div>
        
      </div>

      {/* RIGHT */}
      <div className="ll-right">
        <div className="ll-form-wrap">
          <div className="ll-step">Welcome Back</div>
          <h2 className="ll-form-h">Sign in to<br />your account</h2>
          <p className="ll-form-sub">Good to see you again</p>

          {/* Error banner - משתמש ב-error מה-Redux */}
          {error && (
            <div className="w1-banner-err">⚠ {error}</div>
          )}

          <form onSubmit={login} noValidate>
            <div className="ll-fields">
              <div className="ll-f">
                <label className="ll-lbl">Email</label>
                <input
                  className="ll-inp"
                  type="email" name="email"
                  placeholder="you@email.com" required
                  onChange={() => dispatch(clearError())}
                />
              </div>
              <div className="ll-f">
                <label className="ll-lbl">Password</label>
                <input
                  className="ll-inp"
                  type="password" name="password"
                  placeholder="Your password" required
                  onChange={() => dispatch(clearError())}
                />
              </div>
            </div>

            <button className="ll-btn" type="submit" disabled={loading}>
              {loading ? <span className="w1-spinner" /> : 'Sign In →'}
            </button>

            <p className="ll-foot">
              Don't have an account?{' '}
              <Link to={Paths.register}>Join the community</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;