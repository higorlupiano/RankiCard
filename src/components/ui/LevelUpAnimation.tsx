import React, { useEffect, useState } from 'react';

interface LevelUpAnimationProps {
    newLevel: number;
    onComplete: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({ newLevel, onComplete }) => {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // Generate confetti particles
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#9B59B6', '#3498DB', '#2ECC71'];
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5
        }));
        setParticles(newParticles);

        // Show text after particles start
        setTimeout(() => setShowText(true), 200);

        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onComplete}
        >
            {/* Confetti particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${particle.x}%`,
                        top: '-10%',
                        animationDelay: `${particle.delay}s`,
                        backgroundColor: particle.color,
                        width: '10px',
                        height: '10px',
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                />
            ))}

            {/* Level up content */}
            {showText && (
                <div className="text-center animate-bounce-in z-10">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-radial from-yellow-500/30 to-transparent blur-3xl" />

                    {/* Star burst */}
                    <div className="text-8xl mb-4 animate-pulse">⭐</div>

                    {/* Level up text */}
                    <h1 className="font-rpg text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 drop-shadow-lg mb-2 animate-glow">
                        LEVEL UP!
                    </h1>

                    {/* New level */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="text-yellow-100 text-xl font-rpg">Nível</span>
                        <span className="text-5xl font-rpg font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 animate-pulse">
                            {newLevel}
                        </span>
                    </div>

                    {/* Tap to continue */}
                    <p className="text-gray-400 text-sm mt-6 animate-pulse">
                        Toque para continuar
                    </p>
                </div>
            )}

            {/* CSS for animations */}
            <style>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                
                @keyframes bounce-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes glow {
                    0%, 100% {
                        text-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
                                     0 0 40px rgba(255, 215, 0, 0.6),
                                     0 0 60px rgba(255, 215, 0, 0.4);
                    }
                    50% {
                        text-shadow: 0 0 30px rgba(255, 215, 0, 1),
                                     0 0 60px rgba(255, 215, 0, 0.8),
                                     0 0 90px rgba(255, 215, 0, 0.6);
                    }
                }
                
                .animate-confetti {
                    animation: confetti 3s ease-out forwards;
                }
                
                .animate-bounce-in {
                    animation: bounce-in 0.5s ease-out forwards;
                }
                
                .animate-glow {
                    animation: glow 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
