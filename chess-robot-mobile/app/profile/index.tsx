import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={{ width: 40 }} />
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
      alignItems: 'center',
      marginBottom: 24,
  },
  avatarContainer: {
      position: 'relative',
      marginBottom: 16,
  },
  avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: Colors.light.card,
  },
  editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: Colors.light.primary,
      padding: 8,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: Colors.light.background,
  },
  userName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 4,
  },
  userEmail: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 16,
  },
  editProfileButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: Colors.light.primary,
      borderRadius: 20,
  },
  editProfileText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
  },
  statsContainer: {
      flexDirection: 'row',
      backgroundColor: Colors.light.card,
      borderRadius: 16,
      padding: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
        android: { elevation: 2 },
    }),
  },
  statItem: {
      alignItems: 'center',
      flex: 1,
  },
  statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#111827',
      marginBottom: 4,
  },
  statLabel: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
  },
  statDivider: {
      width: 1,
      height: 30,
      backgroundColor: Colors.light.border,
  },
  section: {
      marginBottom: 24,
  },
  sectionHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: '#6B7280',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  sectionContent: {
      backgroundColor: Colors.light.card,
      borderRadius: 16,
      overflow: 'hidden',
  },
  settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors.light.border,
  },
  settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  settingIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
  },
  settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#111827',
  },
  logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FEF2F2',
      padding: 16,
      borderRadius: 16,
      gap: 8,
      marginBottom: 24,
  },
  logoutText: {
      color: '#EF4444',
      fontWeight: '600',
      fontSize: 16,
  },
  versionText: {
      textAlign: 'center',
      color: '#9CA3AF',
      fontSize: 12,
  },
});
