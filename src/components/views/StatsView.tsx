import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { getXpProgress, getRank, getTitle, STUDY_DAILY_CAP } from '../../utils/gameLogic';
import { StatBox, ProgressBar } from '../ui';
import { AvatarFrame } from '../player';

export const StatsView = () => {
    const { user, profile, logMsg } = useGame();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    if (!user) return null;

    const totalXP = profile?.total_xp || 0;
    const currentLevel = profile?.current_level || 1;
    const todayStudyXP = profile?.today_study_xp || 0;
    const currentAvatarUrl = avatarUrl || profile?.avatar_url;

    const { xpInLevel, xpRequired } = getXpProgress(totalXP, currentLevel);
    const rank = getRank(currentLevel);
    // Title isn't used in the body of stats view in App.tsx, but it is in the header.
    // The header remains in App.tsx or moves to a Layout?
    // In App.tsx: HeaderBanner title={`${title} - Rank ${rank}`} is outside the tabs.
    // So StatsView only contains the content below.

    return (
        <div className="animate-fade-in h-[480px] overflow-y-auto overflow-x-hidden custom-scrollbar landscape-content">
            {/* Player Name */}
            <div className="text-center mb-4">
                <h2 className="text-4xl md:text-5xl font-rpg font-black text-transparent bg-clip-text bg-gradient-to-b from-[#5c4033] to-[#2c1810] drop-shadow-sm mb-1">
                    {profile?.display_name?.split(' ')[0] || user.email?.split('@')[0] || 'Aventureiro'}
                </h2>
                <p className="font-rpg font-bold text-[#8a1c1c] tracking-widest text-sm opacity-80">
                    ID: {user.id.slice(0, 8).toUpperCase()}
                </p>
            </div>

            {/* Stats + Avatar Section */}
            <div className="flex items-center justify-between mb-3">
                {/* Stats Column */}
                <div className="flex flex-col gap-4 w-1/3 pt-2">
                    <StatBox label="NÍVEL ATUAL" value={currentLevel} delay={100} />
                    <StatBox label="TOTAL XP" value={Math.floor(totalXP)} delay={200} />
                    <StatBox label="FADIGA" value={`${todayStudyXP}/${STUDY_DAILY_CAP}`} delay={300} />
                </div>

                {/* Avatar Column */}
                <div className="w-2/3 pl-4 pt-2 relative">
                    <AvatarFrame
                        avatarUrl={currentAvatarUrl}
                        rank={rank}
                        userId={user.id}
                        onAvatarChange={setAvatarUrl}
                    />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="text-center mb-4">
                <p className="font-rpg text-[#5c4033] mb-2">Progresso do Nível</p>
                <ProgressBar current={xpInLevel} max={xpRequired} />
            </div>

            {/* Log Message */}
            <div className="bg-black/80 text-green-400 p-2 rounded font-mono text-xs border border-gray-700 text-center mb-4">
                {logMsg}
            </div>
        </div>
    );
};
