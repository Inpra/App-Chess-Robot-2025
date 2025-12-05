import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { editProfileStyles as styles } from '@/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import authService, { type UserResponse } from '@/services/authService';

export default function EditProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const profile = await authService.getProfile();
            if (profile) {
                setUser(profile);
                setFullName(profile.fullName || '');
                setEmail(profile.email || '');
                setPhoneNumber(profile.phoneNumber || '');
            } else {
                Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
                router.back();
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Lỗi', 'Lỗi khi tải thông tin người dùng');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setSaving(true);
        try {
            const result = await authService.updateProfile({
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim() || undefined,
            });

            if (result.success) {
                Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Lỗi', result.error || 'Không thể cập nhật thông tin');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Lỗi', 'Lỗi khi cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const getAvatarUrl = () => {
        if (user?.avatarUrl) return user.avatarUrl;
        const name = fullName || user?.username || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=100`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <NavigationHeader title="Chỉnh sửa thông tin" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader
                title="Chỉnh sửa thông tin"
                rightComponent={
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color={Colors.light.primary} />
                        ) : (
                            <Text style={{ color: Colors.light.primary, fontSize: 16, fontWeight: '600' }}>Lưu</Text>
                        )}
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Avatar Display */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: getAvatarUrl() }}
                                style={styles.avatar}
                            />
                        </View>
                        <Text style={styles.changePhotoText}>Avatar tự động từ tên của bạn</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Họ và tên *</Text>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nhập họ và tên"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Nhập email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Nhập số điện thoại"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tên đăng nhập</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#F3F4F6' }]}
                                value={user?.username || ''}
                                editable={false}
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                                Tên đăng nhập không thể thay đổi
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
