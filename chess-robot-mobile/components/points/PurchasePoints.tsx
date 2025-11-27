import { Colors } from '@/constants/theme';
import { styles } from '@/styles/purchase-points.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock Data for Packages
const PACKAGES = [
    {
        id: '1',
        name: 'Starter Pack',
        points: 500,
        price: '50,000 VND',
        color: '#10B981', // Emerald Green
        accent: '#D1FAE5',
        description: 'Perfect for beginners to start their journey.',
        popular: false,
        icon: 'star-outline' as const,
    },
    {
        id: '2',
        name: 'Pro Pack',
        points: 1200,
        price: '100,000 VND',
        color: '#3B82F6', // Royal Blue
        accent: '#DBEAFE',
        description: 'Best value for regular players.',
        popular: true,
        icon: 'trophy-outline' as const,
    },
    {
        id: '3',
        name: 'Grandmaster Pack',
        points: 3000,
        price: '200,000 VND',
        color: '#8B5CF6', // Violet
        accent: '#EDE9FE',
        description: 'For the serious competitors who want it all.',
        popular: false,
        icon: 'diamond-outline' as const,
    },
];

export default function PurchasePoints() {
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePurchase = (pkg: typeof PACKAGES[0]) => {
        setSelectedPackage(pkg);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Store</Text>
                <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/points-history')}>
                    <Ionicons name="time-outline" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Top Up Points</Text>
                    <Text style={styles.heroSubtitle}>Unlock premium features and join tournaments.</Text>
                </View>

                <View style={styles.cardsContainer}>
                    {PACKAGES.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.id}
                            style={[
                                styles.card,
                                pkg.popular && styles.popularCard,
                                { borderColor: pkg.popular ? pkg.color : 'transparent' }
                            ]}
                            onPress={() => handlePurchase(pkg)}
                            activeOpacity={0.9}
                        >
                            {pkg.popular && (
                                <View style={[styles.popularTag, { backgroundColor: pkg.color }]}>
                                    <Text style={styles.popularText}>MOST POPULAR</Text>
                                </View>
                            )}

                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: pkg.accent }]}>
                                    <Ionicons name={pkg.icon} size={28} color={pkg.color} />
                                </View>
                                <View style={styles.pointsContainer}>
                                    <Text style={[styles.pointsValue, { color: pkg.color }]}>{pkg.points}</Text>
                                    <Text style={styles.pointsLabel}>Points</Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.packageName}>{pkg.name}</Text>
                                <Text style={styles.packageDescription}>{pkg.description}</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <View style={[styles.priceButton, { backgroundColor: pkg.color }]}>
                                    <Text style={styles.priceText}>{pkg.price}</Text>
                                    <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 8 }} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footerNote}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.footerNoteText}>Secure payment via PayOS</Text>
                </View>
            </ScrollView>

            {/* Payment Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Scan to Pay</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.qrContainer}>
                            <View style={styles.qrPlaceholder}>
                                <Ionicons name="qr-code-outline" size={120} color="#1F2937" />
                            </View>
                            <Text style={styles.payInstruction}>Open your banking app and scan the QR code to complete payment.</Text>

                            <View style={styles.amountContainer}>
                                <Text style={styles.amountLabel}>Total Amount</Text>
                                <Text style={styles.amountValue}>{selectedPackage?.price}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: selectedPackage?.color || Colors.light.primary }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.doneButtonText}>I have paid</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
