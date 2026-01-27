import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface ActivityLogEntry {
    id: string;
    user_id: string;
    action_type: string;
    description: string;
    xp_amount: number;
    gold_amount: number;
    metadata: Record<string, any>;
    created_at: string;
}

export function useActivityLog(user: User | null) {
    const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActivities = useCallback(async () => {
        if (!user) {
            setActivities([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('activity_log')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setActivities(data);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const logActivity = useCallback(async (
        action_type: string,
        description: string,
        xp_amount: number = 0,
        gold_amount: number = 0,
        metadata: Record<string, any> = {}
    ) => {
        if (!user) return;

        const { error } = await supabase
            .from('activity_log')
            .insert({
                user_id: user.id,
                action_type,
                description,
                xp_amount,
                gold_amount,
                metadata
            });

        if (!error) {
            // Refresh activities
            loadActivities();
        }
    }, [user, loadActivities]);

    const getActionIcon = (action_type: string): string => {
        switch (action_type) {
            case 'xp_gain': return '⭐';
            case 'level_up': return '🎉';
            case 'achievement': return '🏆';
            case 'purchase': return '🛒';
            case 'strava_sync': return '🏃';
            case 'study': return '📚';
            case 'streak': return '🔥';
            case 'mission': return '🎯';
            default: return '📝';
        }
    };

    const getActionColor = (action_type: string): string => {
        switch (action_type) {
            case 'xp_gain': return 'text-yellow-400';
            case 'level_up': return 'text-purple-400';
            case 'achievement': return 'text-amber-400';
            case 'purchase': return 'text-green-400';
            case 'strava_sync': return 'text-orange-400';
            case 'study': return 'text-blue-400';
            case 'streak': return 'text-red-400';
            case 'mission': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    return {
        activities,
        loading,
        logActivity,
        refresh: loadActivities,
        getActionIcon,
        getActionColor,
        formatTimeAgo,
    };
}
