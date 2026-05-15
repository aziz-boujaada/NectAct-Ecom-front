import React from 'react';

const PREVIEWS = [
  {
    title: 'Operations Overview',
    subtitle: 'Real-time metrics and workflows',
  },
  {
    title: 'Sales Pipeline',
    subtitle: 'Customer activity and invoice tracking',
  },
  {
    title: 'Inventory Control',
    subtitle: 'Stock movement and low-stock alerts',
  },
  {
    title: 'Financial Reports',
    subtitle: 'Export-ready analytics and insights',
  },
];

export const DashboardPreviewSection: React.FC = () => {
  return (
    <section className="preview-section">
      <div className="preview-header">
        <div className="section-badge">Product Preview</div>
        <h2 className="section-title">Designed for the way your team works</h2>
        <p className="section-description">
          A polished overview of the existing dashboard experience with motion, depth, and clarity.
        </p>
      </div>

      <div className="preview-grid">
        {PREVIEWS.map((item) => (
          <div key={item.title} className="preview-card">
            <div className="preview-card-image">
              <div>
                <strong>{item.title}</strong>
                <div style={{ marginTop: '0.5rem' }}>{item.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const VIDEOS = [
  {
    title: 'Walkthrough Video',
    description: 'A guided product tour for stakeholders and operators.',
  },
  {
    title: 'Product Demo',
    description: 'Showcase core ERP workflows in under three minutes.',
  },
  {
    title: 'Feature Deep Dive',
    description: 'Explore inventory, sales, and reporting capabilities.',
  },
];

export const VideoDemoSection: React.FC = () => {
  return (
    <section className="preview-section" style={{ marginTop: '2rem' }}>
      <div className="preview-header">
        <div className="section-badge">Video Demo</div>
        <h2 className="section-title">See the system in action</h2>
        <p className="section-description">
          Elegant presentation cards for walkthroughs, live demos, and feature explainers.
        </p>
      </div>

      <div className="preview-grid">
        {VIDEOS.map((video) => (
          <div key={video.title} className="preview-card">
            <div className="preview-card-image">
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>▶</div>
                <strong>{video.title}</strong>
                <div style={{ marginTop: '0.5rem' }}>{video.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const DemoAccessSection: React.FC<{ onTestClick: () => void }> = ({ onTestClick }) => {
  return (
    <section className="demo-section">
      <div className="demo-card">
        <div className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
          Sandbox Access
        </div>
        <h2 className="demo-title">Try the Next Gestco sandbox</h2>
        <p className="demo-subtitle">
          Access the live demo environment using the credentials below.
        </p>

        <div className="demo-credentials">
          <div className="credential-row">
            <span className="credential-label">Email</span>
            <span className="credential-value">demo@nextgestco.com</span>
          </div>
          <div className="credential-row">
            <span className="credential-label">Password</span>
            <span className="credential-value">demo123</span>
          </div>
        </div>

        <p className="demo-subtitle" style={{ fontSize: '0.95rem', opacity: 0.9 }}>
          Secure demo instance with preconfigured permissions, sample data, and guided onboarding.
        </p>

        <button className="demo-button" onClick={onTestClick}>
          Tester maintenant
        </button>
      </div>
    </section>
  );
};
