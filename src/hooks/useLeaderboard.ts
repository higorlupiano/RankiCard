import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    total_xp: number;
    current_level: number;
    streak_count: number;
    created_at: string;
    rank?: number;
}

export type LeaderboardFilter = 'all_time' | 'weekly' | 'by_level';

export function useLeaderboard(currentUserId: string | null) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<LeaderboardFilter>('all_time');
    const [userRank, setUserRank] = useState<number | null>(null);

    const loadLeaderboard = useCallback(async () => {
        setLoading(true);

        try {
            let query = supabase
                .from('leaderboard')
                .select('*')
                .limit(50);

            // Apply ordering based on filter
            if (filter === 'by_level') {
                query = query.order('current_level', { ascending: false });
            } else {
                query = query.order('total_xp', { ascending: false });
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error loading leaderboard:', error);
                return;
            }

            if (data) {
                // Add rank numbers
                const ranked = data.map((entry, index) => ({
                    ...entry,
                    rank: index + 1
                }));

                setEntries(ranked);

                // Find current user's rank
                if (currentUserId) {
                    const userEntry = ranked.find(e => e.id === currentUserId);
                    setUserRank(userEntry?.rank || null);
                }
            }
        } catch (error) {
            console.error('Leaderboard error:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, currentUserId]);

    useEffect(() => {
        loadLeaderboard();
    }, [loadLeaderboard]);

    const getRankEmoji = (rank: number): string => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '🏅';
        return '🎖️';
    };

    const getRankColor = (rank: number): string => {
        if (rank === 1) return 'from-yellow-500 to-amber-600';
        if (rank === 2) return 'from-gray-300 to-gray-400';
        if (rank === 3) return 'from-amber-600 to-amber-700';
        return 'from-gray-600 to-gray-700';
    };

    return {
        entries,
        loading,
        filter,
        setFilter,
        userRank,
        refresh: loadLeaderboard,
        getRankEmoji,
        getRankColor,
    };
}
