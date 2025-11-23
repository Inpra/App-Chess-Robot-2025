import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
  card: {
      backgroundColor: Colors.light.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors.light.border,
  },
  inputGroup: {
      gap: 8,
      marginBottom: 16,
  },
  label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
  },
  passwordInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.light.background,
      borderWidth: 1,
      borderColor: Colors.light.border,
      borderRadius: 12,
      paddingHorizontal: 16,
  },
  passwordInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: '#111827',
  },
  divider: {
      height: 1,
      backgroundColor: Colors.light.border,
      marginVertical: 8,
  },
  updateButton: {
      backgroundColor: Colors.light.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
  },
  updateButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
  },
  rowTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#111827',
      marginBottom: 4,
  },
  rowSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
  },
});
