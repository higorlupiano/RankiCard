import React from 'react';
import { Coins, Sparkles, Check, Clock, Flame } from 'lucide-react';
import { Mission, RANK_COLORS, getMissionTypeIcon, Rank } from '../../utils/missionLogic';

interface MissionCardProps {
    mission: Mission;
    status: 'pending' | 'completed' | 'expired';
    onComplete: () => void;
    isLoading?: boolean;
    dynamicXP?: number;
    bonuses?: string[];
}

export const MissionCard: React.FC<MissionCardProps> = ({
    mission,
    status,
    onComplete,
    isLoading = false,
    dynamicXP,
    bonuses = [],
}) => {
    const rankColor = RANK_COLORS[mission.rank as Rank] || RANK_COLORS.F;
    const typeIcon = getMissionTypeIcon(mission.mission_type);
    const isCompleted = status === 'completed';
    const displayXP = dynamicXP ?? 0;
    const hasBonuses = bonuses.length > 0;

    return (
        <div
            className={`relative rounded-lg p-3 border-2 shadow-md transition-all ${isCompleted
                ? 'border-green-500/50 opacity-75'
                : 'hover:brightness-105'
                }`}
            style={{
                background: 'var(--theme-gradient)',
                borderColor: isCompleted ? undefined : 'var(--theme-accent)'
            }}
        >
            {/* Rank Badge */}
            <div
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-rpg font-bold text-sm shadow-lg border-2 border-white"
                style={{ backgroundColor: rankColor }}
            >
                {mission.rank}
            </div>

            {/* Weekend/Bonus Indicator */}
            {hasBonuses && !isCompleted && (
                <div className="absolute -top-2 left-2 flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] font-rpg font-bold shadow">
                    <Flame size={10} />
                    Bônus
                </div>
            )}

            {/* Mission Type Icon */}
            <div className="text-2xl mb-1">{typeIcon}</div>

            {/* Title */}
            <h4
                className="font-rpg font-bold text-sm leading-tight mb-1 pr-6"
                style={{ color: 'var(--theme-primary)' }}
            >
                {mission.title}
            </h4>

            {/* Description */}
            {mission.description && (
                <p
                    className="text-[10px] mb-2 leading-tight"
                    style={{ color: 'var(--theme-primary)', opacity: 0.7 }}
                >
                    {mission.description}
                </p>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1 text-xs">
                    <Sparkles size={12} className="text-purple-600" />
                    <span
                        className={`font-rpg ${hasBonuses ? 'text-orange-600 font-bold' : ''}`}
                        style={{ color: hasBonuses ? undefined : 'var(--theme-primary)' }}
                    >
                        {displayXP} XP
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <Coins size={12} className="text-yellow-600" />
                    <span
                        className="font-rpg"
                        style={{ color: 'var(--theme-primary)' }}
                    >
                        {mission.gold_reward}
                    </span>
                </div>
            </div>

            {/* Bonus Tags */}
            {hasBonuses && !isCompleted && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {bonuses.map((bonus, idx) => (
                        <span
                            key={idx}
                            className="text-[8px] font-rpg bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded"
                        >
                            {bonus}
                        </span>
                    ))}
                </div>
            )}

            {/* Action Button */}
            {isCompleted ? (
                <div className="flex items-center justify-center gap-1 bg-green-600/20 text-green-700 py-1.5 rounded font-rpg text-xs">
                    <Check size={14} />
                    Concluída
                </div>
            ) : (
                <button
                    onClick={onComplete}
                    disabled={isLoading}
                    className="w-full disabled:bg-gray-400 text-white py-1.5 rounded font-rpg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    style={{
                        backgroundColor: 'var(--theme-primary)',
                        opacity: isLoading ? 0.6 : 1
                    }}
                >
                    {isLoading ? (
                        <>
                            <Clock size={12} className="animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        'Completar'
                    )}
                </button>
            )}
        </div>
    );
};
