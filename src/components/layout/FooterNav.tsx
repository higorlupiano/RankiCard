import React from 'react';
import { ShoppingBag, Scroll, Sword, QrCode } from 'lucide-react';
import { SpriteIcon } from '../ui/SpriteIcon';
import { Tab } from '../../types';

interface FooterNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-30 px-8 flex justify-between items-end">
            <SpriteIcon
                icon={<ShoppingBag size={24} />}
                label="Loja"
                isActive={activeTab === 'shop'}
                onClick={() => onTabChange('shop')}
            />
            <SpriteIcon
                icon={<Scroll size={24} />}
                label="Integrações"
                isActive={activeTab === 'integrations'}
                onClick={() => onTabChange('integrations')}
            />
            <SpriteIcon
                icon={<Sword size={24} />}
                label="Perfil"
                isActive={activeTab === 'stats'}
                onClick={() => onTabChange('stats')}
            />
            <SpriteIcon
                icon={<QrCode size={24} />}
                label="QR Code"
                isActive={activeTab === 'qr'}
                onClick={() => onTabChange('qr')}
            />
        </div>
    );
};
