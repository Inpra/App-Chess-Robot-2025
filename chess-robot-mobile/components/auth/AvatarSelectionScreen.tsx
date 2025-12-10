import { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Image, 
    StyleSheet, 
    SafeAreaView, 
    ScrollView,
    ActivityIndicator,
    Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import authService from '@/services/authService';

export default function AvatarSelectionScreen() {
    const router = useRouter();
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const avatars = [
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340148/ava1_o13968.png',
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340147/ava2_cmdxpn.png',
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340148/ava3_z7wbrj.png',
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340148/ava4_mox4cg.png'
    ];

    const handleContinue = async () => {
        if (!selectedAvatar) return;

        setLoading(true);

        try {
            const response = await authService.updateAvatar(selectedAvatar);

            if (response.success) {
                // Navigate to Elo selection after avatar is set
                router.replace('/(auth)/elo-selection');
            } else {
                Alert.alert('Error', response.error || 'Failed to update avatar. Please try again.');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.replace('/(auth)/elo-selection');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose Your Avatar</Text>
                    <Text style={styles.subtitle}>Select an avatar that represents you</Text>
                </View>

                <View style={styles.avatarsGrid}>
                    {avatars.map((avatar, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedAvatar(avatar)}
                            style={[
                                styles.avatarCard,
                                selectedAvatar === avatar && styles.avatarCardSelected
                            ]}
                        >
                            {selectedAvatar === avatar && (
                                <View style={styles.checkIconContainer}>
                                    <Ionicons name="checkmark-circle" size={28} color={Colors.light.primary} />
                                </View>
                            )}

                            <View style={styles.avatarImageContainer}>
                                <Image
                                    source={{ uri: avatar }}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            (!selectedAvatar || loading) && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={loading || !selectedAvatar}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.continueButtonText}>Continue to Rank Selection</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    avatarsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 16,
    },
    avatarCard: {
        width: '47%',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
        position: 'relative',
    },
    avatarCardSelected: {
        borderColor: Colors.light.primary,
        backgroundColor: `${Colors.light.primary}10`,
    },
    checkIconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    avatarImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: 'white',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    actions: {
        alignItems: 'center',
    },
    continueButton: {
        backgroundColor: Colors.light.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        maxWidth: 350,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        marginTop: 16,
        paddingVertical: 12,
    },
    skipButtonText: {
        color: Colors.light.textSecondary,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});
