import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Guild {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
    leader_id: string | null;
    total_xp: number;
    member_count: number;
    max_members: number;
    is_public: boolean;
    invite_code: string;
    created_at: string;
}

export interface GuildMember {
    id: string;
    guild_id: string;
    user_id: string;
    role: 'leader' | 'officer' | 'member';
    contribution_xp: number;
    joined_at: string;
    // Joined data
    profile?: {
        display_name: string | null;
        avatar_url: string | null;
        current_level: number;
        total_xp: number;
    };
}

export interface GuildLeaderboardEntry {
    id: string;
    name: string;
    avatar_url: string | null;
    total_xp: number;
    member_count: number;
    created_at: string;
    rank?: number;
}

export function useGuilds(user: User | null) {
    const [myGuild, setMyGuild] = useState<Guild | null>(null);
    const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
    const [leaderboard, setLeaderboard] = useState<GuildLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user's guild and leaderboard
    const loadData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check if user is in a guild
            const { data: profile } = await supabase
                .from('profiles')
                .select('guild_id')
                .eq('id', user.id)
                .single();

            if (profile?.guild_id) {
                // Load guild details
                const { data: guild } = await supabase
                    .from('guilds')
                    .select('*')
                    .eq('id', profile.guild_id)
                    .single();

                if (guild) {
                    setMyGuild(guild);

                    // Load guild members
                    const { data: members } = await supabase
                        .from('guild_members')
                        .select(`
                            *,
                            profile:profiles(display_name, avatar_url, current_level, total_xp)
                        `)
                        .eq('guild_id', guild.id)
                        .order('contribution_xp', { ascending: false });

                    setGuildMembers(members || []);
                }
            } else {
                setMyGuild(null);
                setGuildMembers([]);
            }

            // Load guild leaderboard
            const { data: leaderboardData } = await supabase
                .from('guild_leaderboard')
                .select('*')
                .limit(20);

            if (leaderboardData) {
                setLeaderboard(leaderboardData.map((g, i) => ({ ...g, rank: i + 1 })));
            }

        } catch (err) {
            console.error('Error loading guilds:', err);
            setError('Erro ao carregar guildas');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Create a new guild
    const createGuild = useCallback(async (name: string, description?: string): Promise<boolean> => {
        if (!user) return false;

        try {
            // Create guild
            const { data: guild, error: createError } = await supabase
                .from('guilds')
                .insert({
                    name,
                    description,
                    leader_id: user.id,
                    member_count: 1
                })
                .select()
                .single();

            if (createError) throw createError;

            // Add user as leader
            await supabase
                .from('guild_members')
                .insert({
                    guild_id: guild.id,
                    user_id: user.id,
                    role: 'leader'
                });

            // Update user's profile
            await supabase
                .from('profiles')
                .update({ guild_id: guild.id })
                .eq('id', user.id);

            await loadData();
            return true;
        } catch (err: any) {
            console.error('Error creating guild:', err);
            setError(err.message || 'Erro ao criar guilda');
            return false;
        }
    }, [user, loadData]);

    // Join a guild
    const joinGuild = useCallback(async (guildId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            // Check if guild has space
            const { data: guild } = await supabase
                .from('guilds')
                .select('member_count, max_members')
                .eq('id', guildId)
                .single();

            if (!guild || guild.member_count >= guild.max_members) {
                setError('Guilda está cheia');
                return false;
            }

            // Join guild
            const { error: joinError } = await supabase
                .from('guild_members')
                .insert({
                    guild_id: guildId,
                    user_id: user.id,
                    role: 'member'
                });

            if (joinError) throw joinError;

            // Update profile
            await supabase
                .from('profiles')
                .update({ guild_id: guildId })
                .eq('id', user.id);

            // Increment member count
            await supabase
                .from('guilds')
                .update({ member_count: guild.member_count + 1 })
                .eq('id', guildId);

            await loadData();
            return true;
        } catch (err: any) {
            console.error('Error joining guild:', err);
            setError(err.message || 'Erro ao entrar na guilda');
            return false;
        }
    }, [user, loadData]);

    // Leave guild
    const leaveGuild = useCallback(async (): Promise<boolean> => {
        if (!user || !myGuild) return false;

        try {
            // Remove from guild_members
            await supabase
                .from('guild_members')
                .delete()
                .eq('guild_id', myGuild.id)
                .eq('user_id', user.id);

            // Update profile
            await supabase
                .from('profiles')
                .update({ guild_id: null })
                .eq('id', user.id);

            // Decrement member count
            await supabase
                .from('guilds')
                .update({ member_count: Math.max(0, myGuild.member_count - 1) })
                .eq('id', myGuild.id);

            setMyGuild(null);
            setGuildMembers([]);
            await loadData();
            return true;
        } catch (err) {
            console.error('Error leaving guild:', err);
            setError('Erro ao sair da guilda');
            return false;
        }
    }, [user, myGuild, loadData]);

    // Contribute XP to guild (called when user gains XP)
    const contributeXP = useCallback(async (xpAmount: number) => {
        if (!user || !myGuild) return;

        try {
            // Update guild total
            await supabase
                .from('guilds')
                .update({ total_xp: myGuild.total_xp + xpAmount })
                .eq('id', myGuild.id);

            // Update member contribution
            await supabase
                .from('guild_members')
                .update({
                    contribution_xp: supabase.rpc('increment_contribution', {
                        xp: xpAmount,
                        gid: myGuild.id,
                        uid: user.id
                    })
                })
                .eq('guild_id', myGuild.id)
                .eq('user_id', user.id);

        } catch (err) {
            console.error('Error contributing XP:', err);
        }
    }, [user, myGuild]);

    return {
        myGuild,
        guildMembers,
        leaderboard,
        loading,
        error,
        createGuild,
        joinGuild,
        leaveGuild,
        contributeXP,
        refresh: loadData,
    };
}
