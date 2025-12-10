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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EloSelectionScreen() {
    const router = useRouter();
    const [selectedElo, setSelectedElo] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const eloOptions = [
        {
            value: 800,
            title: 'Beginner',
            description: 'I know the rules but have little experience.',
            image: require('@/assets/images/Beginner.png'),
            color: '#10B981'
        },
        {
            value: 1200,
            title: 'Intermediate',
            description: 'I play occasionally and know some basic tactics.',
            image: require('@/assets/images/Intermediate.png'),
            color: '#F59E0B'
        },
        {
            value: 1600,
            title: 'Advanced',
            description: 'I am an experienced player or have a club rating.',
            image: require('@/assets/images/Advanced.png'),
            color: '#EF4444'
        }
    ];

    const handleContinue = async () => {
        if (!selectedElo) return;

        setLoading(true);

        try {
            const response = await authService.setInitialElo(selectedElo);

            if (response.success) {
                const user = await authService.getCurrentUser();
                if (user?.id) {
                    await AsyncStorage.setItem(`initial_elo_set_${user.id}`, 'true');
                }
                router.replace('/(tabs)');
            } else {
                Alert.alert('Error', response.error || 'Failed to set level');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        const user = await authService.getCurrentUser();
        if (user?.id) {
            await AsyncStorage.setItem(`initial_elo_set_${user.id}`, 'true');
        }
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Your Level</Text>
                    <Text style={styles.subtitle}>Help us rank you better</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {eloOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => setSelectedElo(option.value)}
                            style={[
                                styles.optionCard,
                                selectedElo === option.value && {
                                    borderColor: option.color,
                                    backgroundColor: `${option.color}10`
                                }
                            ]}
                        >
                            {selectedElo === option.value && (
                                <View style={styles.checkIconContainer}>
                                    <Ionicons 
                                        name="checkmark-circle" 
                                        size={24} 
                                        color={option.color} 
                                    />
                                </View>
                            )}

                            <View style={[styles.imageContainer, { borderColor: option.color }]}>
                                <Image 
                                    source={option.image}
                                    style={styles.optionImage}
                                    resizeMode="cover"
                                />
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                
                                <Text style={[styles.optionElo, { color: option.color }]}>
                                    {option.value}
                                </Text>

                                <Text style={styles.optionDescription}>
                                    {option.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            (!selectedElo || loading) && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={loading || !selectedElo}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.continueButtonText}>Start Playing</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipButtonText}>Skip for now</Text>
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
    optionsContainer: {
        marginBottom: 32,
        gap: 16,
    },
    optionCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    checkIconContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        marginRight: 16,
        overflow: 'hidden',
    },
    optionImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        paddingRight: 24, // Space for check icon
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 2,
    },
    optionElo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        lineHeight: 18,
    },
    actions: {
        alignItems: 'center',
    },
    continueButton: {
        backgroundColor: Colors.light.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 18,
        fontWeight: 'bold',
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
