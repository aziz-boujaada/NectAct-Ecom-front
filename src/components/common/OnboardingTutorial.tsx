import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Zap, 
  TrendingUp, 
  Package, 
  Truck, 
  BarChart3, 
  FileText, 
  Bot, 
  Rocket,
  ShieldCheck,
  Search,
  Database
} from 'lucide-react';
import './OnboardingTutorial.css';
import NextaImg from '../../assets/nextaAi.png';

const ONBOARDING_KEY = 'nexta_onboarding_completed';

interface OnboardingTutorialProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

interface Step {
  title: string;
  description: string;
  details: { icon: React.ReactNode; label: string; text: string }[];
  aiContext: string;
  image?: string;
  icon?: React.ReactNode;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const isCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!isCompleted || forceShow) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const steps: Step[] = [
    {
      title: "Welcome to Nexta ERP",
      description: "Nexta helps you manage sales, inventory, purchasing, finance and quotations in one intelligent workspace.",
      details: [
        { icon: <Rocket size={16} />, label: "ERP Overview", text: "A unified system to run your entire business operation smoothly." },
        { icon: <Zap size={16} />, label: "Unified Management", text: "Connect every department and stop jumping between disconnected tools." },
        { icon: <Bot size={16} />, label: "AI-Powered", text: "Intelligent insights that help you make better decisions faster." }
      ],
      aiContext: "Nexta AI acts as your virtual business analyst, processing your real-time data.",
      image: NextaImg
    },
    {
      title: "Sales & CRM",
      description: "Sales tracks revenue, orders and customer activity to keep your business growing.",
      details: [
        { icon: <TrendingUp size={16} />, label: "Revenue Tracking", text: "Monitor every dollar coming into your business with precise reporting." },
        { icon: <Search size={16} />, label: "Product Performance", text: "Identify your best-selling items and your underperforming stock." },
        { icon: <BarChart3 size={16} />, label: "Sales Trends", text: "Visualize growth patterns and seasonal fluctuations automatically." }
      ],
      aiContext: "Nexta AI uses sales reports to identify growth opportunities and predict future sales patterns.",
      icon: <TrendingUp size={120} strokeWidth={1} />
    },
    {
      title: "Master Data & Inventory",
      description: "Inventory helps monitor stock levels and product availability across your warehouse.",
      details: [
        { icon: <Package size={16} />, label: "Live Stock Levels", text: "Know exactly what you have on hand at any moment, updated in real-time." },
        { icon: <ShieldCheck size={16} />, label: "Low Stock Alerts", text: "Get notified before you run out, ensuring you never miss a sale." },
        { icon: <Zap size={16} />, label: "Turnover Metrics", text: "Track how fast your inventory moves and optimize your storage space." }
      ],
      aiContext: "Better inventory data leads to more accurate stock recommendations and replenishment alerts.",
      icon: <Package size={120} strokeWidth={1} />
    },
    {
      title: "Procurement & Purchasing",
      description: "Purchasing tracks supplier spending and procurement activity to optimize your costs.",
      details: [
        { icon: <Truck size={16} />, label: "Supplier Performance", text: "Evaluate your vendors based on reliability, pricing, and delivery speed." },
        { icon: <FileText size={16} />, label: "Purchase Orders", text: "Create and track professional POs from draft to delivery confirmation." },
        { icon: <Search size={16} />, label: "Spending Efficiency", text: "Analyze where your money goes and identify cost-saving opportunities." }
      ],
      aiContext: "Nexta analyzes purchasing behavior and spending efficiency to improve your profit margins.",
      icon: <Truck size={120} strokeWidth={1} />
    },
    {
      title: "Financial Intelligence",
      description: "Financial reports summarize business health through automated statements and P&L.",
      details: [
        { icon: <BarChart3 size={16} />, label: "Cash Flow", text: "Monitor the movement of money in and out of your business clearly." },
        { icon: <Check size={16} />, label: "Profitability", text: "See your true net profit after accounting for all expenses and refunds." },
        { icon: <Search size={16} />, label: "Revenue Analytics", text: "Deep dive into your income sources and financial performance trends." }
      ],
      aiContext: "Financial insights depend on accurate records. The cleaner your data, the better the AI's advice.",
      icon: <BarChart3 size={120} strokeWidth={1} />
    },
    {
      title: "Quotations / Devis",
      description: "Devis manage your quotation pipeline and help convert leads into loyal customers.",
      details: [
        { icon: <FileText size={16} />, label: "Pipeline Management", text: "Track quotations from draft to sent, accepted, or rejected status." },
        { icon: <Check size={16} />, label: "Auto-Conversion", text: "Accepted devis are automatically converted into sales orders instantly." },
        { icon: <Zap size={16} />, label: "Opportunity Analysis", text: "Identify why deals are lost and focus on the highest probability leads." }
      ],
      aiContext: "Nexta detects quotation performance and identifies untapped revenue opportunities in your pipeline.",
      icon: <FileText size={120} strokeWidth={1} />
    },
    {
      title: "Help Nexta Understand",
      description: "Nexta AI does NOT invent information. It is a powerful engine that analyzes your actual business activity.",
      details: [
        { icon: <Database size={16} />, label: "Real Data Analysis", text: "The AI studies your ERP reports to find patterns you might miss." },
        { icon: <Check size={16} />, label: "Accuracy Matters", text: "Add products, track stock, and record every sale for best results." },
        { icon: <Bot size={16} />, label: "Data-Driven Quality", text: "AI quality depends directly on the completeness of your business data." }
      ],
      aiContext: "The more complete your ERP data is, the more accurate and useful the AI analysis becomes.",
      image: NextaImg
    },
    {
      title: "You're Ready!",
      description: "You now understand how Nexta works and how AI generates business insights from your data.",
      details: [
        { icon: <Rocket size={16} />, label: "Start Exploring", text: "The dashboard is now yours to command. Welcome aboard!" },
        { icon: <Bot size={16} />, label: "AI is Waiting", text: "As you add data, the AI will start providing deeper insights." },
        { icon: <Check size={16} />, label: "Support", text: "Our team is always here if you need help navigating the platform." }
      ],
      aiContext: "Ready to transform your business data into actionable intelligence?",
      icon: <Check size={120} color="var(--fr-green)" strokeWidth={3} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-progress">
          <div className="onboarding-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="onboarding-header">
          <div className="onboarding-step-counter">
            Step {currentStep + 1} <span style={{ opacity: 0.5 }}>/ {steps.length}</span>
          </div>
          {!isLastStep && (
            <button className="onboarding-skip-btn" onClick={finishOnboarding}>
              Skip Tutorial
            </button>
          )}
        </div>

        <div className="onboarding-content-wrap">
          <div className="onboarding-step">
            <div className="onboarding-step-info">
              <h1 className="onboarding-title">{step.title}</h1>
              <p className="onboarding-description">{step.description}</p>
              
              <div className="onboarding-details">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="onboarding-detail-item">
                    <div className="onboarding-detail-icon">{detail.icon}</div>
                    <div className="onboarding-detail-text">
                      <h4>{detail.label}</h4>
                      <p>{detail.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="onboarding-ai-context">
                <div className="onboarding-ai-context-icon">
                  <Bot size={20} />
                </div>
                <p>{step.aiContext}</p>
              </div>
            </div>

            <div className="onboarding-visual">
              {step.image ? (
                <img src={step.image} alt="Onboarding" className="onboarding-illustration" />
              ) : (
                <div className="onboarding-icon-large" style={{ color: 'var(--primary)', opacity: 0.8 }}>
                  {step.icon}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="onboarding-footer">
          <button 
            className="onboarding-btn secondary" 
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="onboarding-nav-btns">
            {isLastStep ? (
              <>
                <button className="onboarding-btn secondary" onClick={() => setCurrentStep(0)}>
                  Replay Tutorial
                </button>
                <button className="onboarding-btn primary" onClick={finishOnboarding}>
                  Start Using Nexta
                  <Zap size={18} fill="white" />
                </button>
              </>
            ) : (
              <button className="onboarding-btn primary" onClick={handleNext}>
                Next Step
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
