import React, { ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Union of HTML button props and Motion props
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & HTMLMotionProps<"button"> & {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    ...props
}) => {
    // Map variants to CSS classes defined in index.css
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`${variantClass} ${sizeClass} ${className} flex-center gap-2`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div style={{
                    width: '1em',
                    height: '1em',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            ) : icon ? (
                <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
            ) : null}
            {children}
        </motion.button>
    );
};
