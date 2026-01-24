import React from 'react';

interface StravaPanelProps {
    connected: boolean;
    syncMessage: string;
    onConnect: () => void;
    onSync: () => void;
    onDisconnect: () => void;
    isSyncDisabled?: boolean;
    isLoading?: boolean;
    cooldownRemaining?: number; // seconds remaining
}

export const StravaPanel: React.FC<StravaPanelProps> = ({
    connected,
    syncMessage,
    onConnect,
    onSync,
    onDisconnect,
    isSyncDisabled = false,
    isLoading = false,
    cooldownRemaining = 0,
}) => {
    // Format remaining time as MM:SS
    const formatCooldown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <div className="bg-gradient-to-b from-[#e6d5ac] to-[#d4c196] rounded-lg p-4 border-2 border-[#FC4C02] shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#FC4C02]/30">
                <span className="text-2xl">🏃‍♂️</span>
                <h3 className="font-rpg font-bold text-[#FC4C02] text-lg">Strava Sync</h3>
            </div>

            {!connected ? (
                <div className="text-center py-2">
                    <p className="text-sm text-[#5c4033] mb-4 font-rpg">
                        Conecte sua conta para importar corridas automaticamente.
                    </p>
                    <button
                        onClick={onConnect}
                        className="w-full bg-[#FC4C02] hover:bg-[#e04402] text-white py-3 rounded-lg font-rpg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.09 13.999h4.273" />
                        </svg>
                        Conectar ao Strava
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-xs text-green-700 font-rpg font-bold mb-3">
                        ✅ Conta Vinculada
                    </p>

                    <button
                        onClick={onSync}
                        disabled={isSyncDisabled || isLoading}
                        className={`w-full py-3 rounded-lg font-rpg font-bold transition-all flex items-center justify-center gap-2 mb-2 ${isSyncDisabled || isLoading
                            ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                            : 'bg-[#2c241b] hover:bg-[#4a3b2a] text-white'
                            }`}
                    >
                        {isLoading
                            ? '🔄 Sincronizando...'
                            : isSyncDisabled
                                ? `⏳ Aguarde ${formatCooldown(cooldownRemaining)}`
                                : '🔄 Sincronizar Atividades'}
                    </button>

                    {syncMessage && (
                        <p className="text-xs text-[#5c4033] mb-3 font-rpg">
                            {syncMessage}
                        </p>
                    )}

                    <button
                        onClick={onDisconnect}
                        className="text-xs text-red-500 hover:text-red-700 underline font-rpg"
                    >
                        Desvincular Strava
                    </button>
                </div>
            )}

            {/* XP Info */}
            <div className="mt-4 pt-3 border-t border-[#FC4C02]/20">
                <p className="text-[10px] text-[#5c4033]/70 font-rpg text-center">
                    🚶 0.27 XP/m • 🚴 0.09 XP/m
                </p>
            </div>
        </div>
    );
};
