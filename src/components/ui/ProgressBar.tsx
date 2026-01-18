import React from 'react';

interface ProgressBarProps {
    current: number;
    max: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className="relative w-full h-10 mt-6 select-none">
            {/* Background container (Dark Bar from Image 3) */}
            <div className="absolute inset-0 bg-[#1a0f0a] border-2 border-[#5c4033] rounded-sm shadow-inner overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent" />
            </div>

            {/* Filled Bar (Gold Bar from Image 3) */}
            <div
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#b8860b] via-[#ffd700] to-[#b8860b] transition-all duration-1000 ease-out flex items-center justify-end pr-2 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                style={{ width: `${percentage}%` }}
            >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-[50%] bg-white/30" />

                {/* Sparkle at the tip */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                    <div className="w-8 h-8 bg-yellow-100 blur-md rounded-full opacity-80" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                </div>
            </div>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <span className="font-rpg font-bold text-white text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-widest">
                    {current} <span className="text-yellow-400 mx-1">/</span> {max}
                </span>
            </div>

            {/* Decorative End Caps */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-6 h-6 rotate-45 bg-[#8a1c1c] border-2 border-[#ffd700] shadow-md z-30" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-6 h-6 rotate-45 bg-[#8a1c1c] border-2 border-[#ffd700] shadow-md z-30" />
        </div>
    );
};
