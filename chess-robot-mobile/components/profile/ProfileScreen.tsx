import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { profileStyles as styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
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
    StyleSheet,
} from 'react-native';
import authService, { type UserResponse } from '@/services/authService';

export default function ProfileScreen() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Reload profile when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [])
    );

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const profile = await authService.getProfile();
            if (profile) {
                setUser(profile);
            } else {
                // If failed to get profile, try from storage
                const localUser = await authService.getCurrentUser();
                if (localUser) {
                    setUser(localUser);
                } else {
                    Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
                    router.replace('/(auth)/login');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Lỗi', 'Lỗi khi tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
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

            {/* Header */}
            <NavigationHeader
                title="Profile & Settings"
                onBack={() => router.navigate('/(tabs)')}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                                <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
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
                            <Text style={styles.statLabel}>Thắng</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{(user as any)?.totalGamesPlayed || 0}</Text>
                            <Text style={styles.statLabel}>Trận</Text>
                        </View>
                    </View>

                {/* Settings Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Tài khoản</Text>
                    <View style={styles.sectionContent}>
                        <Link href="/profile/edit" asChild>
                            {renderSettingItem('person-outline', 'Thông tin cá nhân')}
                        </Link>
                        <Link href="/profile/security" asChild>
                            {renderSettingItem('lock-closed-outline', 'Bảo mật & Mật khẩu')}
                        </Link>
                        <Link href="/points-history" asChild>
                            {renderSettingItem('wallet-outline', 'Lịch sử giao dịch')}
                        </Link>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Lịch sử</Text>
                    <View style={styles.sectionContent}>
                        <Link href="/match-history" asChild>
                            {renderSettingItem('game-controller-outline', 'Lịch sử đấu')}
                        </Link>
                        <Link href="/ranking" asChild>
                            {renderSettingItem('trophy-outline', 'Bảng xếp hạng')}
                        </Link>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Cài đặt</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem('moon-outline', 'Chế độ tối', 'switch', isDarkMode, setIsDarkMode)}
                        {renderSettingItem('notifications-outline', 'Thông báo', 'switch', isNotificationsEnabled, setIsNotificationsEnabled)}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Hỗ trợ</Text>
                    <View style={styles.sectionContent}>
                        <Link href="/faq" asChild>
                            {renderSettingItem('help-circle-outline', 'Câu hỏi thường gặp')}
                        </Link>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
            )}
        </SafeAreaView>
    );
}

const loadingStyles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});
