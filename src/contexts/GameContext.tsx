import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useStudyTimer } from '../hooks/useStudyTimer';
import { useStravaSync } from '../hooks/useStravaSync';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '../lib/supabase';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface GameContextType {
    // Auth
    user: User | null;
    session: Session | null;
    authLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;

    // Profile
    profile: Profile | null;
    profileLoading: boolean;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    addXP: (amount: number, source?: string, description?: string) => Promise<{ newTotalXP: number; newLevel: number; leveledUp: boolean } | undefined>;
    addStudyXP: (amount: number) => Promise<boolean>;
    refreshProfile: () => void;

    // UI State
    logMsg: string;
    setLogMsg: (msg: string) => void;

    // Strava
    syncMsg: string;
    isStravaSyncing: boolean;
    stravaCooldownRemaining: number;
    handleStravaConnect: () => void;
    handleStravaSync: () => Promise<void>;
    handleStravaDisconnect: () => Promise<void>;

    // Timer
    isStudying: boolean;
    setIsStudying: (val: boolean) => void;
    timeLeft: number;
    setTimeLeft: (val: number | ((prev: number) => number)) => void;
    sessionXP: number;
    setSessionXP: (val: number) => void;
    handleStudyComplete: (xp: number) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    // Core hooks
    const { user, session, loading: authLoading, signInWithGoogle, signOut } = useAuth();
    const { profile, loading: profileLoading, addStudyXP, addXP, updateProfile, refreshProfile } = useProfile(user);

    // UI State
    const [logMsg, setLogMsg] = useState('Bem-vindo, Aventureiro!');

    // Study complete handler (stable reference for timer hook)
    const handleStudyComplete = useCallback(async (xp: number) => {
        const success = await addStudyXP(xp);
        if (success) {
            setLogMsg(`✅ +${xp} XP de Estudos!`);
        } else {
            setLogMsg('🛑 Limite diário atingido!');
        }
    }, [addStudyXP]);

    // Timer hook
    const studyTimer = useStudyTimer({ onComplete: handleStudyComplete });

    // Strava hook
    const stravaSync = useStravaSync({
        user,
        profile,
        updateProfile,
        addXP: async (amount: number) => {
            const result = await addXP(amount, 'strava_sync', 'Sincronização Strava');
            if (result) {
                setLogMsg(`+${amount} XP do Strava!`);
            }
            return result;
        },
        refreshProfile,
    });

    // Strava cooldown timer
    useEffect(() => {
        const interval = setInterval(() => {
            stravaSync.decrementCooldown();
        }, 1000);
        return () => clearInterval(interval);
    }, [stravaSync]);

    // Handle OAuth callback (Strava)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && user && state !== 'spotify') {
            window.history.replaceState({}, document.title, window.location.pathname);
            stravaSync.processCallback(code).then(success => {
                if (success) {
                    setLogMsg('✅ Strava conectado com sucesso!');
                } else {
                    setLogMsg('❌ Erro ao vincular Strava');
                }
            });
        }
    }, [user, stravaSync]);

    // Deep Link Handling (Capacitor)
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const processDeepLink = async (url: string) => {
            console.log('Processing deep link:', url);
            if (!url.startsWith('com.rankicard.app://')) return;

            try {
                const { Browser } = await import('@capacitor/browser');
                await Browser.close();
            } catch (e) {
                console.log('Browser close error:', e);
            }

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            const hashIndex = url.indexOf('#');
            if (hashIndex !== -1) {
                const params = new URLSearchParams(url.substring(hashIndex + 1));
                accessToken = params.get('access_token');
                refreshToken = params.get('refresh_token');
            }

            if (!accessToken) {
                const queryIndex = url.indexOf('?');
                if (queryIndex !== -1) {
                    const params = new URLSearchParams(url.substring(queryIndex + 1));
                    accessToken = params.get('access_token');
                    refreshToken = params.get('refresh_token');
                }
            }

            if (accessToken && refreshToken) {
                const { supabase } = await import('../lib/supabase');
                await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            }
        };

        CapacitorApp.addListener('appUrlOpen', async ({ url }) => await processDeepLink(url));
        CapacitorApp.getLaunchUrl().then(async (result) => {
            if (result?.url) await processDeepLink(result.url);
        });

        return () => { CapacitorApp.removeAllListeners(); };
    }, []);

    // Strava handlers (wrapped for confirmation dialogs and log messages)
    const handleStravaConnect = useCallback(() => {
        stravaSync.connect();
    }, [stravaSync]);

    const handleStravaSync = useCallback(async () => {
        const result = await stravaSync.sync();
        if (result && result.xpGained > 0) {
            setLogMsg(`+${result.xpGained} XP do Strava!`);
        } else if (!result) {
            setLogMsg('❌ Erro ao sincronizar Strava');
        }
    }, [stravaSync]);

    const handleStravaDisconnect = useCallback(async () => {
        if (!confirm('Desvincular Strava?')) return;
        await stravaSync.disconnect();
        setLogMsg('Strava desvinculado.');
    }, [stravaSync]);

    const value: GameContextType = {
        // Auth
        user,
        session,
        authLoading,
        signInWithGoogle,
        signOut,

        // Profile
        profile,
        profileLoading,
        updateProfile,
        addXP,
        addStudyXP,
        refreshProfile,

        // UI
        logMsg,
        setLogMsg,

        // Strava
        syncMsg: stravaSync.syncMsg,
        isStravaSyncing: stravaSync.isSyncing,
        stravaCooldownRemaining: stravaSync.cooldownRemaining,
        handleStravaConnect,
        handleStravaSync,
        handleStravaDisconnect,

        // Timer
        isStudying: studyTimer.isStudying,
        setIsStudying: studyTimer.setIsStudying,
        timeLeft: studyTimer.timeLeft,
        setTimeLeft: studyTimer.setTimeLeft,
        sessionXP: studyTimer.sessionXP,
        setSessionXP: studyTimer.setSessionXP,
        handleStudyComplete,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}

