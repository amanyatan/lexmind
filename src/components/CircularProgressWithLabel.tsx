import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressWithLabelProps {
    value: number;
    size?: number;
    strokeWidth?: number;
}

export default function CircularProgressWithLabel({
    value,
    size = 120,
    strokeWidth = 8
}: CircularProgressWithLabelProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(var(--primary-rgb), 0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="var(--primary)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    strokeLinecap="round"
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.6))'
                    }}
                />
            </svg>
            <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)'
                }}>
                    {Math.round(value)}%
                </span>
            </div>
        </div>
    );
}
