import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { profileStyles as styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import authService, { type UserResponse } from '@/services/authService';
import LanguageSelector from '@/components/settings/LanguageSelector';

export default function ProfileScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load cached user immediately on mount
    useEffect(() => {
        loadCachedUser();
    }, []);

    // Reload profile when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshUserProfile();
        }, [])
    );

    /**
     * Load user from AsyncStorage immediately (no loading state)
     * This ensures instant UI rendering with cached data
     */
    const loadCachedUser = async () => {
        try {
            const cachedUser = await authService.getCurrentUser();
            if (cachedUser) {
                setUser(cachedUser);
                // Fetch fresh data in background
                refreshUserProfile();
            } else {
                // No cached user, redirect to login
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error('Error loading cached user:', error);
            router.replace('/(auth)/login');
        }
    };

    /**
     * Fetch latest profile from API and update cache
     * Runs in background without blocking UI
     */
    const refreshUserProfile = async () => {
        setIsRefreshing(true);
        try {
            const profile = await authService.getProfile();
            if (profile) {
                setUser(profile);
            }
        } catch (error) {
            console.error('Error refreshing profile:', error);
            // Silent fail - keep showing cached data
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            t('logout'),
            t('logoutConfirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const getAvatarUrl = () => {
        if (user?.avatarUrl) return user.avatarUrl;
        const name = user?.fullName || user?.username || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=100`;
    };

    const getInitials = () => {
        const name = user?.fullName || user?.username || 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const renderSettingItem = (
        icon: keyof typeof Ionicons.glyphMap,
        title: string,
        type: 'link' | 'switch' = 'link',
        value?: boolean,
        onValueChange?: (val: boolean) => void,
        color: string = Colors.light.text
    ) => (
        <TouchableOpacity
            style={styles.settingItem}
            disabled={type === 'switch'}
            activeOpacity={type === 'switch' ? 1 : 0.7}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: Colors.light.background }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.settingTitle, { color }]}>{title}</Text>
            </View>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#D1D5DB', true: Colors.light.primary }}
                    thumbColor={'white'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with refresh indicator */}
            <NavigationHeader
                title={t('profileAndSettings')}
                onBack={() => router.navigate('/(tabs)')}
                rightComponent={
                    isRefreshing ? (
                        <ActivityIndicator size="small" color={Colors.light.primary} />
                    ) : null
                }
            />

            <ScrollView 
                contentContainerStyle={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refreshUserProfile}
                        colors={[Colors.light.primary]}
                        tintColor={Colors.light.primary}
                    />
                }
            >
                {/* User Profile Card */}
                <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: getAvatarUrl() }}
                                style={styles.avatar}
                            />
                            {/* <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="camera" size={16} color="white" />
                            </TouchableOpacity> */}
                        </View>
                        <Text style={styles.userName}>{user?.fullName || user?.username || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || ''}</Text>
                        {user?.phoneNumber && (
                            <Text style={styles.userPhone}>📱 {user.phoneNumber}</Text>
                        )}
                        <Link href="/profile/edit" asChild>
                            <TouchableOpacity style={styles.editProfileButton}>
                                <Text style={styles.editProfileText}>{t('editProfile')}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {/* Stats Summary */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{(user as any)?.eloRating || 1200}</Text>
                            <Text style={styles.statLabel}>ELO</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{(user as any)?.wins || 0}</Text>
                            <Text style={styles.statLabel}>{t('wins')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{(user as any)?.totalGamesPlayed || 0}</Text>
                            <Text style={styles.statLabel}>{t('matches')}</Text>
                        </View>
                    </View>

                    {/* Settings Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t('account')}</Text>
                        <View style={styles.sectionContent}>
                            <Link href="/profile/edit" asChild>
                                {renderSettingItem('person-outline', t('personalInfo'))}
                            </Link>
                            <Link href="/profile/security" asChild>
                                {renderSettingItem('lock-closed-outline', t('securityAndPassword'))}
                            </Link>
                            <Link href="/points-history" asChild>
                                {renderSettingItem('wallet-outline', t('transactionHistory'))}
                            </Link>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t('history')}</Text>
                        <View style={styles.sectionContent}>
                            <Link href="/match-history" asChild>
                                {renderSettingItem('game-controller-outline', t('matchHistory'))}
                            </Link>
                            <Link href="/ranking" asChild>
                                {renderSettingItem('trophy-outline', t('ranking'))}
                            </Link>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t('settings')}</Text>
                        <View style={styles.sectionContent}>
                            {renderSettingItem('moon-outline', t('darkMode'), 'switch', isDarkMode, setIsDarkMode)}
                            {renderSettingItem('notifications-outline', t('notifications'), 'switch', isNotificationsEnabled, setIsNotificationsEnabled)}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t('language')}</Text>
                        <LanguageSelector />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>{t('support')}</Text>
                        <View style={styles.sectionContent}>
                            <Link href="/faq" asChild>
                                {renderSettingItem('help-circle-outline', t('faq'))}
                            </Link>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>{t('logout')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </ScrollView>
        </SafeAreaView>
    );
}
