import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import QRCode from 'react-qr-code';
import { ViewContainer } from '../ui';
import { Copy, Check } from 'lucide-react';

export const QrCodeView = () => {
    const { user } = useGame();
    const [copied, setCopied] = useState(false);

    if (!user) return null;

    const copyUserId = () => {
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ViewContainer centered>
            <h2 className="font-rpg text-xl text-[#5c4033] mb-6">Seu QR Code</h2>
            <div className="bg-white p-6 rounded-lg border-4 border-[#8a1c1c] shadow-lg">
                <QRCode
                    value={user.id}
                    size={160}
                    level="H"
                />
            </div>
            <div className="mt-4 p-3 bg-black/10 rounded-lg max-w-[280px]">
                <p className="font-rpg text-xs text-[#5c4033]/70 mb-1">Seu ID (para convites de guilda):</p>
                <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-[#5c4033] break-all flex-1 select-all">
                        {user.id}
                    </p>
                    <button
                        onClick={copyUserId}
                        className="p-2 rounded-lg bg-[#5c4033]/20 text-[#5c4033] hover:bg-[#5c4033]/30 transition-colors flex-shrink-0"
                    >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
            <p className="font-rpg text-xs mt-3 text-[#5c4033]/70">
                Use este código para identificação
            </p>
        </ViewContainer>
    );
};
