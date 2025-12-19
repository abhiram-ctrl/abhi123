import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' }
  ];

  const changeLanguage = (lng) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('disaster-guardian-language', lng);
    setIsOpen(false);
    // Removed window.location.reload() for smoother UX
  };

  return (
    <div className="language-selector">
      <div className="language-dropdown">
        <button 
          className="lang-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Change Language"
        >
          <Globe size={18} color="#fff" />
          <span className="lang-code">{i18n.language?.toUpperCase() || 'EN'}</span>
        </button>
        
        {isOpen && (
          <div className="lang-dropdown-menu">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.native}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;