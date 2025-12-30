import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    ...props
}) => {
    return (
        <motion.div
            className={`glass-card ${className}`}
            style={{ padding: noPadding ? '0' : '24px', ...props.style }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
