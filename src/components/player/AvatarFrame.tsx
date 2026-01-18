import React, { useRef, useState } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AvatarFrameProps {
    avatarUrl?: string | null;
    rank?: string;
    userId?: string;
    onAvatarChange?: (url: string) => void;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({
    avatarUrl,
    rank = 'F',
    userId,
    onAvatarChange
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleAvatarClick = () => {
        if (userId) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 2MB.');
            return;
        }

        setUploading(true);

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/avatar.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Add cache buster
            const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: urlWithCacheBuster })
                .eq('id', userId);

            if (updateError) throw updateError;

            onAvatarChange?.(urlWithCacheBuster);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao fazer upload do avatar.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto group cursor-pointer">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Glow Back */}
            <div className="absolute -inset-4 bg-yellow-500/30 rounded-full blur-xl group-hover:bg-yellow-400/50 transition-all duration-500" />

            {/* The Gold Frame */}
            <div
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-gradient-to-br from-[#ffd700] via-[#b8860b] to-[#8b4513] p-[4px] rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform rotate-45 scale-90 md:scale-100"
            >
                <div className="w-full h-full bg-black/80 rounded-lg overflow-hidden relative border border-[#ffd700]/50">
                    {/* Avatar Image or Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10" />

                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="absolute inset-0 w-full h-full object-cover transform -rotate-45 scale-150"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                            <User size={64} className="text-indigo-300 drop-shadow-[0_0_15px_rgba(100,100,255,0.8)]" />
                        </div>
                    )}

                    {/* Upload Overlay */}
                    {userId && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity transform -rotate-45">
                            {uploading ? (
                                <Loader2 size={32} className="text-yellow-400 animate-spin" />
                            ) : (
                                <Camera size={32} className="text-yellow-400" />
                            )}
                        </div>
                    )}

                    {/* Flare Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/20 blur-md mix-blend-overlay animate-pulse" />
                </div>
            </div>

            {/* Rank Seal Overlay */}
            <div className="absolute -top-12 -right-2 md:-top-10 md:-right-4 w-16 h-16 md:w-20 md:h-20 z-20 animate-float">
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-300 bg-gradient-to-br from-[#8a1c1c] to-[#4a0404] shadow-lg box-border ring-2 ring-[#b8860b] ring-offset-2 ring-offset-black" />
                    {/* Inner Decoration */}
                    <div className="absolute inset-2 rounded-full border border-yellow-500/50 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-80" />
                    <span className="relative z-10 text-3xl font-rpg font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-md">
                        {rank}
                    </span>
                </div>
            </div>
        </div>
    );
};
