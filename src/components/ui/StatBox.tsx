import React from 'react';

interface StatBoxProps {
    label: string;
    value: string | number;
    delay?: number;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value, delay = 0 }) => (
    <div
        className="relative group animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background styling to match the beige boxes in Image 3 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e6d5ac] to-[#d4c196] rounded-lg shadow-inner border border-[#bfa57d] transform skew-x-[-2deg]" />

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#8a1c1c] rounded-tl" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#8a1c1c] rounded-tr" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#8a1c1c] rounded-bl" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#8a1c1c] rounded-br" />

        {/* Content */}
        <div className="relative z-10 p-2 text-center transform skew-x-[-2deg]">
            {/* Red Label Banner */}
            <div className="mx-auto -mt-5 mb-1 px-3 py-1 bg-gradient-to-r from-[#590e0e] via-[#8a1c1c] to-[#590e0e] text-yellow-100 text-[10px] font-rpg font-bold tracking-wider border-y border-yellow-600/50 shadow-md max-w-[90%] clip-path-banner">
                {label}
            </div>
            <div className="text-[#2c1810] font-rpg font-bold text-lg drop-shadow-sm">
                {value}
            </div>
        </div>
    </div>
);
