import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        padding: '8px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)',
      }}
      title={t('common.language')}
    >
      <Languages size={18} style={{ color: 'var(--primary)' }} />
      <span>{language === 'en' ? 'EN' : 'HI'}</span>
    </motion.button>
  );
}
