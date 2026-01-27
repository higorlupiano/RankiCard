import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useGuilds } from '../../hooks/useGuilds';
import { Users, Crown, Plus, LogOut, Loader2, Trophy, Star, Shield, Trash2, Lock, Unlock, UserPlus, Check, X, Copy, Image } from 'lucide-react';
import { ViewContainer } from '../ui';

export const GuildView = () => {
    const { user } = useGame();
    const {
        myGuild,
        guildMembers,
        leaderboard,
        pendingInvitations,
        loading,
        error,
        isLeader,
        createGuild,
        joinGuild,
        leaveGuild,
        deleteGuild,
        sendInvitation,
        acceptInvitation,
        rejectInvitation,
        toggleGuildPrivacy,
        uploadGuildAvatar,
        refresh,
        clearError
    } = useGuilds(user);

    const [showCreate, setShowCreate] = useState(false);
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildDesc, setNewGuildDesc] = useState('');
    const [newGuildPublic, setNewGuildPublic] = useState(false);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteUserId, setInviteUserId] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    const [togglingPrivacy, setTogglingPrivacy] = useState(false);
    const [copied, setCopied] = useState(false);
    const [updatingAvatar, setUpdatingAvatar] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleCreateGuild = async () => {
        if (!newGuildName.trim()) return;
        setCreating(true);
        clearError();
        const success = await createGuild(newGuildName.trim(), newGuildDesc.trim(), newGuildPublic);
        if (success) {
            setShowCreate(false);
            setNewGuildName('');
            setNewGuildDesc('');
            setNewGuildPublic(false);
        }
        setCreating(false);
    };

    const handleJoinGuild = async (guildId: string) => {
        setJoining(guildId);
        clearError();
        await joinGuild(guildId);
        setJoining(null);
    };

    const handleLeaveGuild = async () => {
        if (confirm('Tem certeza que deseja sair da guilda?')) {
            clearError();
            await leaveGuild();
        }
    };

    const handleDeleteGuild = async () => {
        if (confirm('ATENÇÃO: Isso irá deletar a guilda permanentemente e remover todos os membros. Continuar?')) {
            setDeleting(true);
            clearError();
            await deleteGuild();
            setDeleting(false);
        }
    };

    const handleSendInvite = async () => {
        if (!inviteUserId.trim()) return;
        setSendingInvite(true);
        clearError();
        const success = await sendInvitation(inviteUserId.trim());
        if (success) {
            setInviteUserId('');
            setShowInvite(false);
            alert('Convite enviado com sucesso!');
        }
        setSendingInvite(false);
    };

    const handleAcceptInvite = async (invitationId: string) => {
        clearError();
        await acceptInvitation(invitationId);
    };

    const handleRejectInvite = async (invitationId: string) => {
        clearError();
        await rejectInvitation(invitationId);
    };

    const handleTogglePrivacy = async () => {
        setTogglingPrivacy(true);
        clearError();
        await toggleGuildPrivacy();
        setTogglingPrivacy(false);
    };

    const handleAvatarClick = () => {
        if (isLeader) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUpdatingAvatar(true);
        clearError();
        const success = await uploadGuildAvatar(file);
        setUpdatingAvatar(false);

        // Reset input value to allow selecting same file again if needed
        if (e.target.value) e.target.value = '';
    };

    const copyUserId = () => {
        navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <ViewContainer centered>
                <Loader2 className="animate-spin mr-2 text-yellow-100" />
                <span className="text-yellow-100">Carregando guildas...</span>
            </ViewContainer>
        );
    }

    // Show pending invitations if user is not in a guild
    if (!myGuild && pendingInvitations.length > 0) {
        return (
            <ViewContainer>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-yellow-100">
                        <Users size={24} />
                        <span className="font-rpg text-lg">Guildas</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* Pending Invitations */}
                <div className="mb-6">
                    <h3 className="font-rpg text-sm text-yellow-100 mb-3 flex items-center gap-2">
                        <UserPlus size={16} />
                        Convites Pendentes
                    </h3>
                    <div className="space-y-2">
                        {pendingInvitations.map(invite => (
                            <div
                                key={invite.id}
                                className="p-3 rounded-lg bg-purple-900/30 border border-purple-500/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-rpg text-sm text-purple-200">
                                            {invite.guild?.name || 'Guilda'}
                                        </h4>
                                        <p className="text-xs text-gray-400">
                                            {invite.guild?.description || 'Sem descrição'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAcceptInvite(invite.id)}
                                            className="p-2 rounded-lg bg-green-600/50 text-green-200 hover:bg-green-600 transition-colors"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRejectInvite(invite.id)}
                                            className="p-2 rounded-lg bg-red-600/50 text-red-200 hover:bg-red-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Show leaderboard below invitations */}
                <h3 className="font-rpg text-sm text-yellow-100 mb-2 flex items-center gap-2">
                    <Trophy size={16} />
                    Top Guildas
                </h3>
                <div className="space-y-2">
                    {leaderboard.map(guild => (
                        <div
                            key={guild.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-gray-700/30"
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-rpg font-bold text-sm
                                ${guild.rank === 1 ? 'bg-yellow-500 text-black' :
                                    guild.rank === 2 ? 'bg-gray-300 text-black' :
                                        guild.rank === 3 ? 'bg-amber-600 text-white' :
                                            'bg-gray-700 text-gray-300'}
                            `}>
                                {guild.rank}
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-purple-600/30 flex items-center justify-center text-xl border border-purple-500/30">
                                ⚔️
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-rpg text-sm text-gray-200 truncate flex items-center gap-1">
                                    {guild.name}
                                    {guild.is_public ? (
                                        <Unlock size={12} className="text-green-400" />
                                    ) : (
                                        <Lock size={12} className="text-gray-500" />
                                    )}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Star size={10} className="text-yellow-400" />
                                        {guild.total_xp.toLocaleString()} XP
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users size={10} />
                                        {guild.member_count}/6
                                    </span>
                                </div>
                            </div>
                            {guild.is_public && (
                                <button
                                    onClick={() => handleJoinGuild(guild.id)}
                                    disabled={joining === guild.id}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600/50 text-purple-200 text-xs hover:bg-purple-600 transition-colors disabled:opacity-50"
                                >
                                    {joining === guild.id ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        'Entrar'
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </ViewContainer>
        );
    }

    // User is in a guild - show guild details
    if (myGuild) {
        return (
            <ViewContainer>
                {/* Guild Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg p-4 mb-4 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-16 h-16 rounded-lg bg-purple-600/50 flex items-center justify-center text-3xl border border-purple-400/50 relative overflow-hidden group ${isLeader ? 'cursor-pointer hover:border-yellow-400' : ''}`}
                            onClick={handleAvatarClick}
                        >
                            {isLeader && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        {updatingAvatar ? (
                                            <Loader2 className="animate-spin text-yellow-400" size={24} />
                                        ) : (
                                            <Image className="text-yellow-400" size={24} />
                                        )}
                                    </div>
                                </>
                            )}
                            {myGuild.avatar_url ? (
                                <img src={myGuild.avatar_url} alt={myGuild.name} className="w-full h-full object-cover" />
                            ) : (
                                '⚔️'
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="font-rpg text-lg text-yellow-100">{myGuild.name}</h2>
                                {isLeader && (
                                    <Crown size={16} className="text-yellow-400" />
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{myGuild.description || 'Sem descrição'}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs">
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Star size={12} />
                                    {myGuild.total_xp.toLocaleString()} XP
                                </span>
                                <span className="flex items-center gap-1 text-purple-300">
                                    <Users size={12} />
                                    {myGuild.member_count}/6
                                </span>
                                <span className={`flex items-center gap-1 ${myGuild.is_public ? 'text-green-400' : 'text-gray-400'}`}>
                                    {myGuild.is_public ? <Unlock size={12} /> : <Lock size={12} />}
                                    {myGuild.is_public ? 'Pública' : 'Privada'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* Leader Controls */}
                {isLeader && (
                    <div className="mb-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                        <h3 className="font-rpg text-sm text-yellow-200 mb-3 flex items-center gap-2">
                            <Crown size={14} />
                            Controles do Líder
                        </h3>

                        <div className="space-y-2">
                            {/* Privacy Toggle */}
                            <button
                                onClick={handleTogglePrivacy}
                                disabled={togglingPrivacy}
                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${myGuild.is_public
                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                    : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
                                    }`}
                            >
                                {togglingPrivacy ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        {myGuild.is_public ? <Unlock size={16} /> : <Lock size={16} />}
                                        {myGuild.is_public ? 'Guilda Pública (clique para tornar privada)' : 'Guilda Privada (clique para tornar pública)'}
                                    </>
                                )}
                            </button>

                            {/* Invite Button */}
                            <button
                                onClick={() => setShowInvite(!showInvite)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                            >
                                <UserPlus size={16} />
                                Convidar Membro
                            </button>

                            {/* Invite Form */}
                            {showInvite && (
                                <div className="p-3 bg-black/30 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-2">
                                        Digite o ID do usuário para convidar. O usuário pode copiar seu ID na tela do perfil.
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="ID do usuário"
                                            value={inviteUserId}
                                            onChange={(e) => setInviteUserId(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <button
                                            onClick={handleSendInvite}
                                            disabled={!inviteUserId.trim() || sendingInvite}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {sendingInvite ? <Loader2 className="animate-spin" size={16} /> : 'Enviar'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Your User ID (for sharing) */}
                <div className="mb-4 p-3 bg-black/30 rounded-lg border border-gray-700/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Seu ID (compartilhe para receber convites)</p>
                            <p className="font-mono text-sm text-gray-200">{user.id}</p>
                        </div>
                        <button
                            onClick={copyUserId}
                            className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Members */}
                <div className="mb-4">
                    <h3 className="font-rpg text-sm text-yellow-100 mb-2 flex items-center gap-2">
                        <Users size={16} />
                        Membros ({myGuild.member_count}/6)
                    </h3>
                    <div className="space-y-2">
                        {guildMembers.map(member => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-black/30 border border-gray-700/30"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/50">
                                    {member.profile?.avatar_url ? (
                                        <img src={member.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">👤</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-200">
                                            {member.profile?.display_name || 'Aventureiro'}
                                        </span>
                                        {member.role === 'leader' && (
                                            <Crown size={14} className="text-yellow-400" />
                                        )}
                                        {member.role === 'officer' && (
                                            <Shield size={14} className="text-blue-400" />
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Nível {member.profile?.current_level || 1} • {member.contribution_xp.toLocaleString()} XP contribuído
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    {!isLeader && (
                        <button
                            onClick={handleLeaveGuild}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
                        >
                            <LogOut size={16} />
                            Sair da Guilda
                        </button>
                    )}

                    {isLeader && (
                        <button
                            onClick={handleDeleteGuild}
                            disabled={deleting}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
                        >
                            {deleting ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Deletar Guilda
                                </>
                            )}
                        </button>
                    )}
                </div>
            </ViewContainer>
        );
    }

    // User is not in a guild - show create/join
    return (
        <ViewContainer>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-yellow-100">
                    <Users size={24} />
                    <span className="font-rpg text-lg">Guildas</span>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"
                >
                    <Plus size={16} />
                    Criar
                </button>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Your User ID */}
            <div className="mb-4 p-3 bg-black/30 rounded-lg border border-gray-700/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Seu ID (compartilhe para receber convites)</p>
                        <p className="font-mono text-sm text-gray-200 truncate">{user.id}</p>
                    </div>
                    <button
                        onClick={copyUserId}
                        className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Create Guild Form */}
            {showCreate && (
                <div className="mb-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                    <h3 className="font-rpg text-sm text-purple-200 mb-3">Criar Nova Guilda</h3>
                    <input
                        type="text"
                        placeholder="Nome da guilda"
                        value={newGuildName}
                        onChange={(e) => setNewGuildName(e.target.value)}
                        className="w-full mb-2 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        maxLength={30}
                    />
                    <textarea
                        placeholder="Descrição (opcional)"
                        value={newGuildDesc}
                        onChange={(e) => setNewGuildDesc(e.target.value)}
                        className="w-full mb-3 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                        rows={2}
                        maxLength={100}
                    />
                    <label className="flex items-center gap-2 mb-3 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newGuildPublic}
                            onChange={(e) => setNewGuildPublic(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="flex items-center gap-1">
                            {newGuildPublic ? <Unlock size={14} /> : <Lock size={14} />}
                            Guilda Pública (qualquer pessoa pode entrar)
                        </span>
                    </label>
                    <button
                        onClick={handleCreateGuild}
                        disabled={!newGuildName.trim() || creating}
                        className="w-full py-2 rounded-lg bg-purple-600 text-white font-rpg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {creating ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Criar Guilda'}
                    </button>
                </div>
            )}

            {/* Guild Leaderboard */}
            <div className="mb-2">
                <h3 className="font-rpg text-sm text-yellow-100 mb-2 flex items-center gap-2">
                    <Trophy size={16} />
                    Top Guildas
                </h3>
            </div>

            <div className="space-y-2">
                {leaderboard.map(guild => (
                    <div
                        key={guild.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-gray-700/30"
                    >
                        {/* Rank */}
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-rpg font-bold text-sm
                            ${guild.rank === 1 ? 'bg-yellow-500 text-black' :
                                guild.rank === 2 ? 'bg-gray-300 text-black' :
                                    guild.rank === 3 ? 'bg-amber-600 text-white' :
                                        'bg-gray-700 text-gray-300'}
                        `}>
                            {guild.rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-lg bg-purple-600/30 flex items-center justify-center text-xl border border-purple-500/30">
                            ⚔️
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-rpg text-sm text-gray-200 truncate flex items-center gap-1">
                                {guild.name}
                                {guild.is_public ? (
                                    <Unlock size={12} className="text-green-400" />
                                ) : (
                                    <Lock size={12} className="text-gray-500" />
                                )}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Star size={10} className="text-yellow-400" />
                                    {guild.total_xp.toLocaleString()} XP
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={10} />
                                    {guild.member_count}/6
                                </span>
                            </div>
                        </div>

                        {/* Join button - only for public guilds */}
                        {guild.is_public ? (
                            <button
                                onClick={() => handleJoinGuild(guild.id)}
                                disabled={joining === guild.id}
                                className="px-3 py-1.5 rounded-lg bg-purple-600/50 text-purple-200 text-xs hover:bg-purple-600 transition-colors disabled:opacity-50"
                            >
                                {joining === guild.id ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        ) : (
                            <span className="px-3 py-1.5 text-xs text-gray-500">
                                Privada
                            </span>
                        )}
                    </div>
                ))}

                {leaderboard.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <Users size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Nenhuma guilda encontrada</p>
                        <p className="text-sm">Seja o primeiro a criar uma!</p>
                    </div>
                )}
            </div>
        </ViewContainer>
    );
};
