import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { ShoppingBag, Coins } from 'lucide-react';

export const ShopView = () => {
    const { profile } = useGame();

    return (
        <div className="w-full flex flex-col items-center justify-center animate-fade-in text-[#5c4033] h-[480px] overflow-y-auto custom-scrollbar landscape-content">
            {/* Gold Balance */}
            <div className="flex items-center gap-2 mb-6 bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-3 rounded-full shadow-lg">
                <Coins size={28} className="text-yellow-100" />
                <span className="font-rpg text-2xl font-bold text-white">
                    {profile?.gold || 0}
                </span>
            </div>

            <ShoppingBag size={48} className="mb-4 opacity-50" />
            <p className="font-rpg text-lg">Loja em breve...</p>
            <p className="font-rpg text-sm opacity-70 mt-2">Itens e upgrades estarão disponíveis aqui</p>
        </div>
    );
};
