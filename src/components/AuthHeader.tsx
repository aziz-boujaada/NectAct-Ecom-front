import { ShieldCheck } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export function AuthHeader() {
  return (
    <>
      <div className="brand-block">
        <div className="brand-mark">
          <ShieldCheck size={30} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">NextAct Ecom</p>
          <h1>Authentication</h1>
        </div>
      </div>

      <p className="intro">
        React client connected to the Laravel JWT API at <code>{apiBaseUrl}</code>.
      </p>
    </>
  );
}
