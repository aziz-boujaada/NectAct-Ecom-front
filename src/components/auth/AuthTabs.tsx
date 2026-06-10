import { KeyRound, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AuthMode } from '../../types';

type AuthTabsProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export function AuthTabs({ mode, onChange }: AuthTabsProps) {
  const { t } = useTranslation('auth');

  return (
    <div className="tabs" role="tablist" aria-label={t('login')}>
      <button className={mode === 'login' ? 'active' : ''} onClick={() => onChange('login')} type="button">
        <KeyRound size={17} aria-hidden="true" />
        {t('login')}
      </button>
      <button className={mode === 'register' ? 'active' : ''} onClick={() => onChange('register')} type="button">
        <UserPlus size={17} aria-hidden="true" />
        {t('register')}
      </button>
    </div>
  );
}
