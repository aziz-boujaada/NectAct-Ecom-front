import React from 'react';
import dashboardPreview from '../../assets/dashboardPec.png';

interface HeroSectionProps {
  onDemoClick: () => void;
  onTestClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onDemoClick, onTestClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-gradient-1"></div>
        <div className="hero-gradient-2"></div>
      </div>

      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">
              <span>✨ Premium ERP Solution</span>
            </div>

            <h1 className="hero-title">
              Manage Your Business with Confidence
            </h1>

            <p className="hero-subtitle">
              Next Gestco is an enterprise-grade ERP system designed for modern businesses.
              Streamline operations, gain insights, and scale with ease.
            </p>

            <div className="hero-cta-group">
              <button className="hero-cta-button hero-cta-primary" onClick={onTestClick}>
                Tester le système
              </button>
              <button className="hero-cta-button hero-cta-secondary" onClick={onDemoClick}>
                Voir la démo
              </button>
            </div>

            <div className="hero-trust-badges">
              <div className="trust-badge">
                <div className="trust-badge-icon">✓</div>
                <span>Enterprise Security</span>
              </div>
              <div className="trust-badge">
                <div className="trust-badge-icon">✓</div>
                <span>100% Uptime SLA</span>
              </div>
              <div className="trust-badge">
                <div className="trust-badge-icon">✓</div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          <div className="hero-laptop" aria-hidden>
            <div className="laptop-frame">
              <div className="laptop-screen">
                <img src={dashboardPreview} alt="dashboard preview" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeaturesGridProps {}

const FEATURES = [
  {
    id: 'inventory',
    name: 'Stock Management',
    description: 'Real-time inventory tracking with automated alerts and historical records.',
    icon: '📦'
  },
  {
    id: 'sales',
    name: 'Sales & CRM',
    description: 'Manage orders, clients, and customer relationships in one place.',
    icon: '📊'
  },
  {
    id: 'purchasing',
    name: 'Purchase Orders',
    description: 'Streamline supplier management and purchase workflows.',
    icon: '🛒'
  },
  {
    id: 'clients',
    name: 'Client Management',
    description: 'Track customer information, history, and interactions.',
    icon: '👥'
  },
  {
    id: 'suppliers',
    name: 'Supplier Directory',
    description: 'Maintain comprehensive supplier database and contacts.',
    icon: '🤝'
  },
  {
    id: 'reporting',
    name: 'Advanced Reports',
    description: 'Generate detailed reports with export to Excel and PDF.',
    icon: '📈'
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    description: 'Visualize business metrics with interactive dashboards.',
    icon: '🎯'
  },
  {
    id: 'invoicing',
    name: 'Invoicing System',
    description: 'Create professional invoices and manage billing cycles.',
    icon: '📋'
  },
  {
    id: 'permissions',
    name: 'Permissions & Roles',
    description: 'Fine-grained access control with flexible permission system.',
    icon: '🔐'
  }
];

export const FeaturesSection: React.FC<FeaturesGridProps> = () => {
  return (
    <section id="features" className="features-section">
      <div className="section-header">
        <div className="section-badge">Powerful Features</div>
        <h2 className="section-title">Everything You Need to Run Your Business</h2>
        <p className="section-description">
          Comprehensive modules designed to handle all aspects of your operations.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-name">{feature.name}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
