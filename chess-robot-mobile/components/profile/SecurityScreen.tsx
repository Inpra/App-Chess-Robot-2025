import { Colors } from '@/constants/theme';
import { securityStyles as styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SecurityScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    const handleSave = () => {
        // Implement save logic here
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Change Password</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Current Password</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Enter current password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry
                                    />
                                    <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Enter new password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry
                                    />
                                    <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Confirm new password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry
                                    />
                                    <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
                                <Text style={styles.updateButtonText}>Update Password</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Two-Factor Authentication</Text>
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rowTitle}>Enable 2FA</Text>
                                    <Text style={styles.rowSubtitle}>Protect your account with an extra layer of security.</Text>
                                </View>
                                <Switch
                                    value={is2FAEnabled}
                                    onValueChange={setIs2FAEnabled}
                                    trackColor={{ false: '#D1D5DB', true: Colors.light.primary }}
                                    thumbColor={'white'}
                                />
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
