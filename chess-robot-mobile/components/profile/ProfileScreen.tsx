import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { profileStyles as styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

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

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>John Doe</Text>
                    <Text style={styles.userEmail}>john.doe@example.com</Text>
                    <Link href="/profile/edit" asChild>
                        <TouchableOpacity style={styles.editProfileButton}>
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Stats Summary */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>2450</Text>
                        <Text style={styles.statLabel}>ELO</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>142</Text>
                        <Text style={styles.statLabel}>Wins</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>#42</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem('person-outline', 'Personal Information')}
                        <Link href="/profile/security" asChild>
                            {renderSettingItem('lock-closed-outline', 'Security & Password')}
                        </Link>
                        {renderSettingItem('card-outline', 'Payment Methods')}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem('moon-outline', 'Dark Mode', 'switch', isDarkMode, setIsDarkMode)}
                        {renderSettingItem('notifications-outline', 'Notifications', 'switch', isNotificationsEnabled, setIsNotificationsEnabled)}
                        {renderSettingItem('language-outline', 'Language')}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Support</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem('help-circle-outline', 'Help Center')}
                        {renderSettingItem('document-text-outline', 'Terms of Service')}
                        {renderSettingItem('shield-checkmark-outline', 'Privacy Policy')}
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/(auth)/login')}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
