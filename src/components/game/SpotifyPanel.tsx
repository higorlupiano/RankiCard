import React from 'react';

interface SpotifyPanelProps {
    connected: boolean;
    syncMessage: string;
    onConnect: () => void;
    onSync: () => void;
    onDisconnect: () => void;
    isSyncDisabled?: boolean;
}

export const SpotifyPanel: React.FC<SpotifyPanelProps> = ({
    connected,
    syncMessage,
    onConnect,
    onSync,
    onDisconnect,
    isSyncDisabled = false,
}) => {
    return (
        <div className="bg-gradient-to-b from-[#e6d5ac] to-[#d4c196] rounded-lg p-4 border-2 border-[#1DB954] shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#1DB954]/30">
                <span className="text-2xl">🎵</span>
                <h3 className="font-rpg font-bold text-[#1DB954] text-lg">Spotify Sync</h3>
            </div>

            {!connected ? (
                <div className="text-center py-2">
                    <p className="text-sm text-[#5c4033] mb-4 font-rpg">
                        Conecte sua conta para ganhar XP por ouvir música.
                    </p>
                    <button
                        onClick={onConnect}
                        className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white py-3 rounded-lg font-rpg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Conectar ao Spotify
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-xs text-green-700 font-rpg font-bold mb-3">
                        ✅ Conta Vinculada
                    </p>

                    <button
                        onClick={onSync}
                        disabled={isSyncDisabled}
                        className="w-full bg-[#2c241b] hover:bg-[#4a3b2a] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-rpg font-bold transition-all flex items-center justify-center gap-2 mb-2"
                    >
                        🔄 Sincronizar Músicas
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
                        Desvincular Spotify
                    </button>
                </div>
            )}

            {/* XP Info */}
            <div className="mt-4 pt-3 border-t border-[#1DB954]/20">
                <p className="text-[10px] text-[#5c4033]/70 font-rpg text-center">
                    🎧 1 XP por minuto de música
                </p>
            </div>
        </div>
    );
};
