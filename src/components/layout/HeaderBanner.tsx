import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderBannerProps {
    title: string;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({ title }) => {
    return (
        <div className="relative mx-auto w-full max-w-[300px] h-16 mb-2 flex items-center justify-center">
            {/* The Banner Shape - now uses theme colors */}
            <div className="absolute inset-0 shadow-lg"
                style={{
                    background: 'linear-gradient(to bottom, var(--theme-primary), color-mix(in srgb, var(--theme-primary) 50%, black))',
                    clipPath: "polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)"
                }}
            />
            {/* Inner Border */}
            <div className="absolute inset-1 border border-yellow-500/30"
                style={{
                    clipPath: "polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)"
                }}
            />
            <h1 className="relative z-10 text-yellow-100 font-rpg font-bold text-sm md:text-base tracking-[0.15em] text-shadow-red uppercase">
                {title}
            </h1>

            {/* Ornaments */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-yellow-500">
                <Sparkles size={20} fill="currentColor" />
            </div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-yellow-500">
                <Sparkles size={20} fill="currentColor" />
            </div>
        </div>
    );
};
