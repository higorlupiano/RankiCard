import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
    });

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthState({
                user: session?.user ?? null,
                session,
                loading: false,
            });
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setAuthState({
                    user: session?.user ?? null,
                    session,
                    loading: false,
                });
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = useCallback(async () => {
        // Use custom URL scheme for Android, web URL for browser
        const isNative = Capacitor.isNativePlatform();
        const redirectUrl = isNative
            ? 'com.rankicard.app://auth/callback'
            : 'https://rankicard.vercel.app';

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: isNative, // Skip auto redirect for native apps
            },
        });

        if (error) {
            console.error('Error signing in:', error);
            throw error;
        }

        // For native platforms, open browser manually
        if (isNative && data?.url) {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({
                url: data.url,
                windowName: '_self',
            });
        }
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }, []);

    return {
        user: authState.user,
        session: authState.session,
        loading: authState.loading,
        signInWithGoogle,
        signOut,
    };
}
