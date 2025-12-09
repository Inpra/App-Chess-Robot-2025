import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { styles } from '@/styles/purchase-points.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getActivePointPackages, formatPrice, type PointPackage } from '@/services/pointPackageService';
import { createPayment, checkPaymentStatus, type PaymentResponse } from '@/services/paymentService';

// Package display configuration
interface PackageDisplay extends PointPackage {
    color: string;
    accent: string;
    popular: boolean;
    icon: string;
}

const PACKAGE_STYLES = [
    { color: '#23b249', accent: '#D1FAE5', icon: 'star-outline' },
    { color: '#f16f23', accent: '#FED7AA', icon: 'trophy-outline' },
    { color: '#1567b1', accent: '#DBEAFE', icon: 'diamond-outline' },
    { color: '#8B5CF6', accent: '#EDE9FE', icon: 'rocket-outline' },
    { color: '#EF4444', accent: '#FEE2E2', icon: 'flash-outline' },
    { color: '#EC4899', accent: '#FCE7F3', icon: 'gift-outline' },
];

export default function PurchasePoints() {
    const router = useRouter();
    const [packages, setPackages] = useState<PackageDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<PackageDisplay | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        loadPackages();
    }, []);

    useEffect(() => {
        // Cleanup polling on unmount or modal close
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    const loadPackages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getActivePointPackages();
            
            // Transform API data to display format
            const displayPackages: PackageDisplay[] = data.map((pkg, index) => {
                const style = PACKAGE_STYLES[index % PACKAGE_STYLES.length];
                // Mark the middle package as popular if there are 3 or more packages
                const isPopular = data.length >= 3 && index === Math.floor(data.length / 2);
                
                return {
                    ...pkg,
                    color: style.color,
                    accent: style.accent,
                    icon: style.icon,
                    popular: isPopular,
                };
            });
            
            setPackages(displayPackages);
        } catch (err) {
            console.error('Error loading packages:', err);
            setError('Không thể tải danh sách gói điểm. Vui lòng thử lại sau.');
            Alert.alert('Lỗi', 'Không thể tải danh sách gói điểm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (pkg: PackageDisplay) => {
        setSelectedPackage(pkg);
        setModalVisible(true);
        setIsProcessingPayment(true);
        setPaymentData(null);
        setPaymentStatus('pending');
        
        // Clear any existing polling
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }

        try {
            // Create payment link
            console.log('Creating payment for package:', pkg.id, pkg);
            const payment = await createPayment(pkg.id);
            console.log('Payment response:', payment);
            setPaymentData(payment);
            
            // Get the transaction ID (handle both camelCase and PascalCase)
            const transactionId = payment.transactionId || payment.TransactionId;
            
            // Start polling for payment status
            if (transactionId) {
                startPollingPaymentStatus(transactionId);
            }
            
            setIsProcessingPayment(false);
        } catch (error: any) {
            console.error('Payment creation error:', error);
            setIsProcessingPayment(false);
            setPaymentStatus('failed');
            Alert.alert(
                'Lỗi thanh toán',
                error.message || 'Không thể tạo liên kết thanh toán. Vui lòng thử lại.'
            );
        }
    };

    const startPollingPaymentStatus = (transactionId: string) => {
        // Poll every 3 seconds
        const interval = setInterval(async () => {
            try {
                const status = await checkPaymentStatus(transactionId);
                const paymentStatus = status.status || status.Status;
                
                if (paymentStatus === 'success') {
                    setPaymentStatus('success');
                    if (pollingInterval) clearInterval(pollingInterval);
                    // Auto close modal after showing success for 2 seconds
                    setTimeout(() => {
                        setModalVisible(false);
                        setPaymentData(null);
                        setPaymentStatus('pending');
                        router.navigate('/(tabs)');
                    }, 2000);
                } else if (paymentStatus === 'failed') {
                    setPaymentStatus('failed');
                    if (pollingInterval) clearInterval(pollingInterval);
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        }, 3000);
        
        setPollingInterval(interval);
        
        // Stop polling after 5 minutes
        setTimeout(() => {
            if (interval) clearInterval(interval);
        }, 5 * 60 * 1000);
    };

    const handleCloseModal = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
        setModalVisible(false);
        setPaymentData(null);
        setPaymentStatus('pending');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <NavigationHeader
                title="Store"
                onBack={() => router.navigate('/(tabs)')}
                rightComponent={
                    <TouchableOpacity onPress={() => router.push('/points-history')}>
                        <Ionicons name="time-outline" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={styles.loadingText}>Đang tải gói điểm...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadPackages}>
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroSection}>
                        <Text style={styles.heroTitle}>Top Up Points</Text>
                        <Text style={styles.heroSubtitle}>Unlock premium features and join tournaments.</Text>
                    </View>

                    <View style={styles.cardsContainer}>
                        {packages.map((pkg) => (
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
                                        <Ionicons name={pkg.icon as any} size={28} color={pkg.color} />
                                    </View>
                                    <View style={styles.pointsContainer}>
                                        <Text style={[styles.pointsValue, { color: pkg.color }]}>{pkg.points}</Text>
                                        <Text style={styles.pointsLabel}>Points</Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={styles.packageName}>{pkg.name}</Text>
                                    <Text style={styles.packageDescription}>
                                        {pkg.description || 'Premium point package'}
                                    </Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={[styles.priceButton, { backgroundColor: pkg.color }]}>
                                        <Text style={styles.priceText}>{formatPrice(pkg.price)}</Text>
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
            )}

            {/* Payment Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {paymentStatus === 'success' ? 'Thanh toán thành công!' : 
                                 paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                                 'Thanh toán'}
                            </Text>
                            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.qrContainer}>
                            {isProcessingPayment ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={selectedPackage?.color || Colors.light.primary} />
                                    <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
                                </View>
                            ) : paymentStatus === 'success' ? (
                                <View style={styles.successContainer}>
                                    <Ionicons name="checkmark-circle" size={80} color="#23b249" />
                                    <Text style={styles.successText}>
                                        Điểm đã được cộng vào tài khoản của bạn!
                                    </Text>
                                </View>
                            ) : paymentStatus === 'failed' ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="close-circle" size={80} color="#EF4444" />
                                    <Text style={styles.errorText}>Vui lòng thử lại</Text>
                                </View>
                            ) : (
                                <>
                                    {/* QR Code */}
                                    <View style={styles.qrCodeWrapper}>
                                        {paymentData && (paymentData.qrCodeUrl || paymentData.QrCodeUrl) ? (
                                            <QRCode
                                                value={paymentData.qrCodeUrl || paymentData.QrCodeUrl || ''}
                                                size={220}
                                                backgroundColor="white"
                                            />
                                        ) : (
                                            <View style={styles.qrPlaceholder}>
                                                <ActivityIndicator size="large" color="#6B7280" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Package Info */}
                                    <View style={styles.packageInfo}>
                                        <Text style={styles.packageInfoTitle}>{selectedPackage?.name}</Text>
                                        <Text style={styles.packageInfoPoints}>{selectedPackage?.points} điểm</Text>
                                    </View>

                                    {/* Payment Status */}
                                    <View style={styles.statusBadge}>
                                        <ActivityIndicator size="small" color="#f16f23" style={{ marginRight: 8 }} />
                                        <Text style={styles.statusText}>Đang chờ thanh toán...</Text>
                                    </View>

                                    {/* Amount */}
                                    <View style={styles.amountContainer}>
                                        <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
                                        <Text style={styles.amountValue}>
                                            {selectedPackage ? formatPrice(selectedPackage.price) : ''}
                                        </Text>
                                    </View>

                                    {/* Transaction ID */}
                                    {paymentData && (paymentData.transactionId || paymentData.TransactionId) && (
                                        <View style={styles.transactionInfo}>
                                            <Text style={styles.transactionLabel}>Mã giao dịch:</Text>
                                            <Text style={styles.transactionId}>
                                                {(paymentData.transactionId || paymentData.TransactionId || '').slice(0, 20)}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Instructions */}
                                    <Text style={styles.payInstruction}>
                                        Quét mã QR bằng ứng dụng ngân hàng để thanh toán. Hệ thống sẽ tự động xác nhận và cộng điểm cho bạn.
                                    </Text>
                                </>
                            )}
                        </View>

                        {/* Only show close button for failed or if user wants to cancel */}
                        {(paymentStatus === 'failed' || paymentStatus === 'success') && (
                            <TouchableOpacity
                                style={[styles.doneButton, { 
                                    backgroundColor: paymentStatus === 'success' ? '#23b249' : '#EF4444'
                                }]}
                                onPress={handleCloseModal}
                            >
                                <Text style={styles.doneButtonText}>
                                    {paymentStatus === 'success' ? 'Hoàn tất' : 'Đóng'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
