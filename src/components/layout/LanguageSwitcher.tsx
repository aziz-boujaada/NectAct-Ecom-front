import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Check } from 'lucide-react';

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="icon-action-btn lang-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--text-main)',
          fontSize: '14px'
        }}
      >
        <Languages size={18} />
        <span>{currentLanguage.flag}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div className="lang-dropdown" style={{
          position: 'absolute',
          top: '100%',
          right: i18n.language === 'ar' ? 'auto' : 0,
          left: i18n.language === 'ar' ? 0 : 'auto',
          marginTop: '8px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 10000,
          minWidth: '150px',
          overflow: 'hidden'
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: i18n.language === lang.code ? 'var(--bg-hover)' : 'transparent',
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontSize: '14px',
                textAlign: i18n.language === 'ar' ? 'right' : 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i18n.language === lang.code ? 'var(--bg-hover)' : 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {i18n.language === lang.code && <Check size={14} color="var(--primary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
