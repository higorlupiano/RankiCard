import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { getRank } from '../../utils/gameLogic';
import { MissionsPanel } from '../game';

export const MissionsView = () => {
    const { user, profile, addXP, updateProfile, refreshProfile, setLogMsg } = useGame();

    if (!user) return null;

    const currentLevel = profile?.current_level || 1;
    const rank = getRank(currentLevel);

    return (
        <div className="w-full animate-fade-in h-[480px] overflow-y-auto custom-scrollbar landscape-content">
            <MissionsPanel
                userRank={rank}
                userLevel={currentLevel}
                userId={user.id}
                onMissionComplete={async (xp, gold) => {
                    await addXP(xp);
                    await updateProfile({ gold: (profile?.gold || 0) + gold });
                    refreshProfile();
                }}
                onLog={setLogMsg}
            />
        </div>
    );
};
