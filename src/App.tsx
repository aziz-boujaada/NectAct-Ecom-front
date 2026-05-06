import { FormEvent, useEffect, useState } from 'react';
import {
  ApiError,
  fetchMe,
  login,
  logout,
  register,
  tokenStore,
  updatePassword,
  updateProfile,
} from './api/auth';
import { AuthHeader } from './components/AuthHeader';
import { StatusMessage } from './components/StatusMessage';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthPanel } from './components/auth/AuthPanel';
import { Dashboard } from './components/dashboard/Dashboard';
import type { AuthMode, Status, User } from './types';

const emptyLogin = { email: '', password: '' };
const emptyRegister = { name: '', email: '', password: '' };
const emptyPassword = { current_password: '', password: '', password_confirmation: '' };
const THEME_KEY = 'nextact_theme';

type ThemeMode = 'dark' | 'light';

function initialTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const firstValidationError = error.errors ? Object.values(error.errors).flat()[0] : undefined;
    return firstValidationError ?? error.message;
  }

  return error instanceof Error ? error.message : 'Something went wrong';
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState(emptyPassword);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  const token = tokenStore.get();
  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    fetchMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setProfileForm({ name: currentUser.name, email: currentUser.email });
        }
      })
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = await login(loginForm);
      if (data.user) {
        setUser(data.user);
        setProfileForm({ name: data.user.name, email: data.user.email });
      }
      setLoginForm(emptyLogin);
      setStatus({ type: 'success', text: data.message ?? 'Login successful' });
    } catch (error) {
      setStatus({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = await register(registerForm);
      if (data.user) {
        setUser(data.user);
        setProfileForm({ name: data.user.name, email: data.user.email });
      }
      setRegisterForm(emptyRegister);
      setStatus({ type: 'success', text: data.message ?? 'Account created successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const updatedUser = await updateProfile(profileForm);
      if (updatedUser) {
        setUser(updatedUser);
        setProfileForm({ name: updatedUser.name, email: updatedUser.email });
      }
      setStatus({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = await updatePassword(passwordForm);
      setPasswordForm(emptyPassword);
      setStatus({ type: 'success', text: data.message ?? 'Password updated successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  
  async function handleLogout() {
    setLoading(true);
    await logout();
    setUser(null);
    setStatus({ type: 'info', text: 'Logged out' });
    setLoading(false);
  }

  if (booting) {
    return <main className="shell loading-screen">Loading auth session...</main>;
  }

  if (isAuthenticated) {
    return (
      <Dashboard
        user={user}
        status={status}
        profileForm={profileForm}
        passwordForm={passwordForm}
        loading={loading}
        onProfileChange={setProfileForm}
        onPasswordChange={setPasswordForm}
        onProfileSubmit={handleProfile}
        onPasswordSubmit={handlePassword}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
    );
  }

  return (
    <main className="shell">
      <div className="theme-toggle-wrap">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
      <section className="auth-panel">
        <AuthHeader />
        <StatusMessage status={status} />

        <AuthPanel
          mode={mode}
          loginForm={loginForm}
          registerForm={registerForm}
          loading={loading}
          onModeChange={setMode}
          onLoginChange={setLoginForm}
          onRegisterChange={setRegisterForm}
          onLoginSubmit={handleLogin}
          onRegisterSubmit={handleRegister}
        />
      </section>
    </main>
  );
}
