import NavigationHeader from '@/components/common/NavigationHeader';
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
    ActivityIndicator,
    Alert,
} from 'react-native';
import authService from '@/services/authService';

export default function SecurityScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [saving, setSaving] = useState(false);

    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePasswords = () => {
        if (!currentPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
            return false;
        }

        if (!newPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return false;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validatePasswords()) {
            return;
        }

        setSaving(true);
        try {
            const result = await authService.changePassword(currentPassword, newPassword);

            if (result.success) {
                Alert.alert(
                    'Thành công',
                    'Mật khẩu đã được thay đổi thành công',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                                router.back();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Lỗi', result.error || 'Mật khẩu hiện tại không đúng hoặc không thể thay đổi mật khẩu');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Lỗi', 'Lỗi khi thay đổi mật khẩu. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader title="Bảo mật & Mật khẩu" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Thay đổi mật khẩu</Text>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu hiện tại *</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showCurrentPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        <Ionicons
                                            name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu mới *</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showNewPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                        <Ionicons
                                            name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Xác nhận mật khẩu mới *</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Nhập lại mật khẩu mới"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.updateButton, saving && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.updateButtonText}>Cập nhật mật khẩu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Xác thực hai yếu tố</Text>
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rowTitle}>Kích hoạt 2FA</Text>
                                    <Text style={styles.rowSubtitle}>Bảo vệ tài khoản với lớp bảo mật bổ sung (sắp có).</Text>
                                </View>
                                <Switch
                                    value={is2FAEnabled}
                                    onValueChange={setIs2FAEnabled}
                                    trackColor={{ false: '#D1D5DB', true: Colors.light.primary }}
                                    thumbColor={'white'}
                                    disabled={true}
                                />
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
