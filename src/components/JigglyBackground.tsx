import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Dot = ({ dot, scrollY }: { dot: any, scrollY: any }) => {
    // Parallax effect: dots move at different speeds relative to scroll
    const yOffset = useTransform(scrollY, [0, 3000], [0, -500 * dot.speed]);

    // Jiggle effect: more pronounced horizontal movement based on scroll position
    const jiggleX = useTransform(scrollY, (v: number) => Math.sin(v / (100 * dot.speed)) * 40 * dot.speed);

    return (
        <motion.div
            animate={{
                y: [0, dot.floatY, 0],
                x: [0, dot.floatX, 0],
                scale: [1, 1.2, 1],
                opacity: [dot.opacity, dot.opacity * 1.5, dot.opacity]
            }}
            transition={{
                duration: dot.floatDuration,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{
                position: 'absolute',
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                backgroundColor: 'rgba(var(--primary-rgb), 0.8)',
                borderRadius: '50%',
                y: yOffset,
                x: jiggleX,
                boxShadow: `0 0 ${dot.size * 3}px rgba(var(--primary-rgb), 0.6)`,
                zIndex: -1
            }}
        />
    );
};

export default function JigglyBackground() {
    const { scrollY } = useScroll();

    const dots = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 100; i++) { // Increased count for density
            temp.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 150 - 25,
                size: Math.random() * 5 + 2,
                speed: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.4 + 0.3, // Brighter
                floatX: (Math.random() - 0.5) * 50,
                floatY: (Math.random() - 0.5) * 50,
                floatDuration: Math.random() * 5 + 5
            });
        }
        return temp;
    }, []);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-main)',
        }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {dots.map((dot) => (
                    <Dot key={dot.id} dot={dot} scrollY={scrollY} />
                ))}

                {/* Brighter Accent Glows */}
                <div style={{
                    position: 'absolute',
                    top: '-5%',
                    left: '5%',
                    width: '60vw',
                    height: '60vw',
                    background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)',
                    filter: 'blur(120px)',
                    zIndex: -1
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '5%',
                    width: '50vw',
                    height: '50vw',
                    background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    zIndex: -1
                }} />
            </div>
        </div>
    );
}
