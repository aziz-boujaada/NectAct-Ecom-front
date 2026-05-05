import { LogOut, RefreshCw } from 'lucide-react';
import type { User } from '../../types';

type AccountCardProps = {
  user: User;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AccountCard({ user, loading, onRefresh, onLogout }: AccountCardProps) {
  return (
    <aside className="account-card">
      <div className="avatar">{getInitials(user.name)}</div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {user.role && <span>{user.role}</span>}
      <div className="account-actions">
        <button onClick={onRefresh} disabled={loading} type="button">
          <RefreshCw size={17} aria-hidden="true" />
          Refresh token
        </button>
        <button onClick={onLogout} disabled={loading} type="button">
          <LogOut size={17} aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
