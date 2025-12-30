import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    size?: 'small' | 'medium';
}

export default function ThemeToggle({ theme, toggleTheme, size = 'medium' }: ThemeToggleProps) {
    const isDark = theme === 'dark';
    const isSmall = size === 'small';

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'relative',
                width: isSmall ? '48px' : '60px',
                height: isSmall ? '26px' : '32px',
                borderRadius: isSmall ? '13px' : '16px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                flexShrink: 0
            }}
            aria-label="Toggle Theme"
        >
            <motion.div
                animate={{
                    x: isSmall ? (isDark ? 22 : 0) : (isDark ? 28 : 0),
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
                style={{
                    width: isSmall ? '20px' : '26px',
                    height: isSmall ? '20px' : '26px',
                    borderRadius: '50%',
                    background: isDark ? '#1e293b' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: 2
                }}
            >
                {isDark ? (
                    <Moon size={isSmall ? 10 : 14} color="#fcd34d" fill="#fcd34d" />
                ) : (
                    <Sun size={isSmall ? 10 : 14} color="#f59e0b" />
                )}
            </motion.div>

            {!isSmall && (
                <>
                    <div style={{
                        position: 'absolute',
                        left: '8px',
                        opacity: isDark ? 0.3 : 1,
                        transition: 'opacity 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Sun size={12} color={isDark ? "var(--text-secondary)" : "#f59e0b"} />
                    </div>

                    <div style={{
                        position: 'absolute',
                        right: '8px',
                        opacity: isDark ? 1 : 0.3,
                        transition: 'opacity 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Moon size={12} color={isDark ? "#fcd34d" : "var(--text-secondary)"} />
                    </div>
                </>
            )}
        </button>
    );
}
