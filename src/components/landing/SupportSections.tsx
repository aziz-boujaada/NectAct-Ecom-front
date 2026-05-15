import React from 'react';
import { ShieldCheck, Lock, KeyRound, Database, CheckCircle2 } from 'lucide-react';

const SECURITY_FEATURES = [
  {
    title: 'Authentication',
    description: 'Secure login flows with token-based session management.',
    icon: <ShieldCheck size={24} />,
  },
  {
    title: 'Permissions System',
    description: 'Role-aware access control for every business module.',
    icon: <KeyRound size={24} />,
  },
  {
    title: 'API Protection',
    description: 'Safeguard every endpoint with secure authorization layers.',
    icon: <Lock size={24} />,
  },
  {
    title: 'Secure Management',
    description: 'Enterprise-ready controls for data and operational governance.',
    icon: <Database size={24} />,
  },
];

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: '€49',
    period: '/month',
    description: 'For small teams getting started with ERP workflows.',
    features: ['Up to 5 users', 'Core modules', 'Email support', 'Basic reports'],
    cta: 'Start Free Trial',
    featured: false,
  },
  {
    name: 'Business',
    price: '€129',
    period: '/month',
    description: 'For growing businesses that need advanced automation.',
    features: ['Up to 25 users', 'All modules', 'Advanced analytics', 'Priority support'],
    cta: 'Most Popular',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations requiring custom deployment and support.',
    features: ['Unlimited users', 'Custom integrations', 'Dedicated onboarding', 'SLA support'],
    cta: 'Contact Sales',
    featured: false,
  },
];

export const SecuritySection: React.FC = () => {
  return (
    <section className="security-section">
      <div className="section-header">
        <div className="section-badge">Security First</div>
        <h2 className="section-title">Built for secure business operations</h2>
        <p className="section-description">
          Protect data, users, and workflows with a modern access model designed for enterprise teams.
        </p>
      </div>

      <div className="security-grid">
        {SECURITY_FEATURES.map((feature) => (
          <div key={feature.title} className="security-card">
            <div className="security-icon">{feature.icon}</div>
            <h3 className="security-title">{feature.title}</h3>
            <p className="security-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="pricing-section">
      <div className="section-header">
        <div className="section-badge">Pricing</div>
        <h2 className="section-title">Flexible plans for every stage</h2>
        <p className="section-description">
          Choose a plan that matches your business size, complexity, and growth ambitions.
        </p>
      </div>

      <div className="pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <div key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
            {plan.featured && <div className="pricing-badge">Recommended</div>}
            <h3 className="pricing-name">{plan.name}</h3>
            <p className="pricing-description">{plan.description}</p>
            <div className="pricing-price">{plan.price}</div>
            <div className="pricing-period">{plan.period}</div>

            <ul className="pricing-features">
              {plan.features.map((feature) => (
                <li key={feature} className="pricing-feature">
                  <span className="pricing-feature-icon">
                    <CheckCircle2 size={14} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`pricing-button ${plan.featured ? 'pricing-button-primary' : 'pricing-button-secondary'}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export const FooterSection: React.FC = () => {
  return (
    <footer id="docs" className="footer-section">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>Contact</h4>
            <a className="footer-link" href="mailto:contact@nextgestco.com">contact@nextgestco.com</a>
            <a className="footer-link" href="tel:+212000000000">+212 000 000 000</a>
          </div>
          <div className="footer-column">
            <h4>Documentation</h4>
            <a className="footer-link" href="#">API Docs</a>
            <a className="footer-link" href="#">Getting Started</a>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <a className="footer-link" href="#">Help Center</a>
            <a className="footer-link" href="#">Live Chat</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a className="footer-link" href="#">Privacy Policy</a>
            <a className="footer-link" href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 Next Gestco. All rights reserved.
          </div>
          <div className="footer-socials">
            <a className="footer-social-link" href="#" aria-label="LinkedIn">in</a>
            <a className="footer-social-link" href="#" aria-label="X">x</a>
            <a className="footer-social-link" href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
