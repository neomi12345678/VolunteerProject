import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import Router from './routes/router';
import { loginByToken } from './services/auth.service';
import { getSession, setSession } from './auth/auth.utils';
import { authSuccess, initializationComplete } from './redux/slices/authSlice';
import type { AppDispatch } from './redux/store';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initialize = async () => {
      const token = getSession();

      if (!token) {
        dispatch(initializationComplete());
        return;
      }

      try {
        const user = await loginByToken(token);
        setSession(token);
        dispatch(authSuccess({ user, token }));
      } catch (err: any) {  // ← שני את catch לקבל err
        console.log('TOKEN:', token);
        console.log('ERROR STATUS:', err?.response?.status);
        console.log('ERROR DATA:', err?.response?.data);
        localStorage.removeItem('token');
        dispatch(initializationComplete());
      }
    };

    initialize();
  }, []);

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Router />
      </AuthInitializer>
    </Provider>
  );
}

export default App;
