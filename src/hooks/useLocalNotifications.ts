import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

interface UseLocalNotificationsReturn {
    permissionGranted: boolean;
    requestPermission: () => Promise<boolean>;
    scheduleStreakReminder: () => Promise<void>;
    cancelAllNotifications: () => Promise<void>;
}

export function useLocalNotifications(): UseLocalNotificationsReturn {
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Check current permission status
        LocalNotifications.checkPermissions().then(status => {
            setPermissionGranted(status.display === 'granted');
        });
    }, []);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Notifications only work on native platforms');
            return false;
        }

        try {
            const status = await LocalNotifications.requestPermissions();
            const granted = status.display === 'granted';
            setPermissionGranted(granted);
            return granted;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }, []);

    const scheduleStreakReminder = useCallback(async () => {
        if (!Capacitor.isNativePlatform() || !permissionGranted) return;

        try {
            // Cancel existing streak reminders first
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

            // Schedule daily reminder at 20:00
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(20, 0, 0, 0);

            // If it's already past 20:00 today, schedule for tomorrow
            if (now > reminderTime) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            const schedule: ScheduleOptions = {
                notifications: [
                    {
                        id: 1,
                        title: "🔥 Não perca seu Streak!",
                        body: "Entre no RankiCard hoje para manter sua sequência ativa!",
                        schedule: {
                            at: reminderTime,
                            repeats: true,
                            every: 'day'
                        },
                        sound: 'default',
                        smallIcon: 'ic_stat_icon_config_sample',
                        iconColor: '#FFD700'
                    }
                ]
            };

            await LocalNotifications.schedule(schedule);
            console.log('Streak reminder scheduled for', reminderTime);
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    }, [permissionGranted]);

    const cancelAllNotifications = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({
                    notifications: pending.notifications.map(n => ({ id: n.id }))
                });
            }
        } catch (error) {
            console.error('Error canceling notifications:', error);
        }
    }, []);

    return {
        permissionGranted,
        requestPermission,
        scheduleStreakReminder,
        cancelAllNotifications,
    };
}
