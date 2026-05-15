import React, { useEffect, useState } from 'react';
import nextGestcoLogo from '../../assets/NextGestCologo1.png';
import { AuthPanel } from '../auth/AuthPanel';
import { StatusMessage } from '../StatusMessage';
import { HeroSection, FeaturesSection } from '../landing/HeroSection';
import { DashboardPreviewSection, VideoDemoSection, DemoAccessSection } from '../landing/PreviewSections';
import { SecuritySection, PricingSection, FooterSection } from '../landing/SupportSections';
import type { AuthMode, LoginFormValues, RegisterFormValues, Status } from '../../types';
import type { FormEvent } from 'react';

interface LandingPageProps {
  onTestClick: () => void;
  onDemoClick: () => void;
  mode: AuthMode;
  loginForm: LoginFormValues;
  registerForm: RegisterFormValues;
  loading: boolean;
  status: Status;
  onModeChange: (mode: AuthMode) => void;
  onLoginChange: (form: LoginFormValues) => void;
  onRegisterChange: (form: RegisterFormValues) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

import { Moon, Sun } from 'lucide-react';

export const LandingPage: React.FC<LandingPageProps> = ({
  onTestClick,
  onDemoClick,
  mode,
  loginForm,
  registerForm,
  loading,
  status,
  onModeChange,
  onLoginChange,
  onRegisterChange,
  onLoginSubmit,
  onRegisterSubmit,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={nextGestcoLogo} alt="Next Gestco" className="landing-logo" />
            <div className="landing-brand-text">
              <div className="landing-brand-name">Next Gestco</div>
              <div className="landing-brand-tagline">Enterprise ERP</div>
            </div>
          </div>

          <nav className="landing-nav" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#auth-access">Demo</a>
            <a href="#docs">Docs</a>
          </nav>

          <div className="landing-cta">
            <button className="btn btn-demo" onClick={onDemoClick}>Voir la démo</button>
            <button className="btn btn-get-started" onClick={onTestClick}>Tester</button>
            <button aria-label="Toggle theme" className="btn btn-theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <HeroSection onDemoClick={onDemoClick} onTestClick={onTestClick} />
      <FeaturesSection />
      <DashboardPreviewSection />
      <VideoDemoSection />
      <DemoAccessSection onTestClick={onTestClick} />
      <section className="access-section" id="auth-access">
        <div className="section-header">
          <div className="section-badge">Secure Access</div>
          <h2 className="section-title">Enter the system securely</h2>
          <p className="section-description">
            Use the existing authentication experience to access the dashboard or create a new account.
          </p>
        </div>

        <div className="access-layout">
          <div className="access-panel">
            <StatusMessage status={status} />
            <AuthPanel
              mode={mode}
              loginForm={loginForm}
              registerForm={registerForm}
              loading={loading}
              onModeChange={onModeChange}
              onLoginChange={onLoginChange}
              onRegisterChange={onRegisterChange}
              onLoginSubmit={onLoginSubmit}
              onRegisterSubmit={onRegisterSubmit}
            />
          </div>
          <div className="access-copy">
            <div className="access-copy-card">
              <h3>Sandbox ready</h3>
              <p>
                The demo environment is preloaded with business data, permissions, and secure access flows.
              </p>
              <ul>
                <li>Single sign-on ready</li>
                <li>Role-based permissions</li>
                <li>Audit-friendly workflows</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <SecuritySection />
      <PricingSection />
      <FooterSection />
    </main>
  );
};
