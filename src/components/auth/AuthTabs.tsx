import { KeyRound, UserPlus } from 'lucide-react';
import type { AuthMode } from '../../types';

type AuthTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Authentication mode">
      <button className={mode === 'login' ? 'active' : ''} onClick={() => onChange('login')} type="button">
        <KeyRound size={17} aria-hidden="true" />
        Login
      </button>
      <button className={mode === 'register' ? 'active' : ''} onClick={() => onChange('register')} type="button">
        <UserPlus size={17} aria-hidden="true" />
        Register
      </button>
    </div>
  );
}
