import { useState, useEffect, useCallback } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useProfile(user: User | null) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Load profile when user changes
    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        loadProfile(user.id);
    }, [user]);

    const loadProfile = async (userId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error loading profile:', error);
                return;
            }

            // Check for daily reset
            const today = new Date().toISOString().split('T')[0];
            if (data.last_date !== today) {
                await updateProfile({ today_study_xp: 0, last_date: today });
                setProfile({ ...data, today_study_xp: 0, last_date: today });
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = useCallback(async (updates: Partial<Profile>) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            return;
        }

        setProfile((prev) => prev ? { ...prev, ...updates } : null);
    }, [user]);

    const addXP = useCallback(async (amount: number) => {
        if (!profile) return;

        const newTotalXP = profile.total_xp + amount;
        let newLevel = profile.current_level;

        // Calculate new level
        const getXpForNextLevel = (level: number) => 50 * (level * level);
        while (newTotalXP >= getXpForNextLevel(newLevel)) {
            newLevel++;
        }

        await updateProfile({
            total_xp: newTotalXP,
            current_level: newLevel,
        });

        return { newTotalXP, newLevel, leveledUp: newLevel > profile.current_level };
    }, [profile, updateProfile]);

    const addStudyXP = useCallback(async (amount: number) => {
        if (!profile) return false;

        const STUDY_DAILY_CAP = 1500;
        if (profile.today_study_xp + amount > STUDY_DAILY_CAP) {
            return false; // Cap reached
        }

        await updateProfile({
            today_study_xp: profile.today_study_xp + amount,
        });
        await addXP(amount);
        return true;
    }, [profile, updateProfile, addXP]);

    return {
        profile,
        loading,
        updateProfile,
        addXP,
        addStudyXP,
        refreshProfile: () => user && loadProfile(user.id),
    };
}
