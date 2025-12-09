import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { styles } from '@/styles/points-history.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { 
    getMyPaymentHistory, 
    getMyPointTransactions, 
    type PaymentHistory, 
    type PointTransaction 
} from '@/services/paymentService';
import { formatPrice } from '@/services/pointPackageService';

export default function PointsHistory() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'payments' | 'usage'>('payments');
    const [payments, setPayments] = useState<PaymentHistory[]>([]);
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'payments') {
                const data = await getMyPaymentHistory();
                setPayments(data);
            } else {
                const data = await getMyPointTransactions();
                setTransactions(data);
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            Alert.alert('Lỗi', 'Không thể tải lịch sử. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return { name: 'add-circle' as const, color: '#23b249', bg: '#D1FAE5' };
            case 'service_usage':
                return { name: 'game-controller' as const, color: '#f16f23', bg: '#FED7AA' };
            case 'ai_suggestion':
                return { name: 'bulb' as const, color: '#1567b1', bg: '#DBEAFE' };
            case 'adjustment':
                return { name: 'settings' as const, color: '#8B5CF6', bg: '#EDE9FE' };
            default:
                return { name: 'help-circle' as const, color: '#6B7280', bg: '#F3F4F6' };
        }
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'deposit':
                return 'Nạp điểm';
            case 'service_usage':
                return 'Sử dụng dịch vụ';
            case 'ai_suggestion':
                return 'Gợi ý AI';
            case 'adjustment':
                return 'Điều chỉnh';
            default:
                return type;
        }
    };

    const renderPaymentItem = ({ item }: { item: PaymentHistory }) => {
        const isSuccess = item.status?.toLowerCase() === 'success';
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: isSuccess ? '#D1FAE5' : '#FEE2E2' }]}>
                        <Ionicons
                            name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
                            size={24}
                            color={isSuccess ? '#23b249' : '#EF4444'}
                        />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>
                            {item.package?.name || `Gói ${item.packageId}`}
                        </Text>
                        <Text style={styles.cardDate}>{formatDate(item.createdAt || '')}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.amountText}>{formatPrice(item.amount)}</Text>
                    <Text style={[styles.statusText, { color: isSuccess ? '#23b249' : '#EF4444' }]}>
                        {isSuccess ? 'Thành công' : 'Thất bại'}
                    </Text>
                </View>
            </View>
        );
    };

    const renderUsageItem = ({ item }: { item: PointTransaction }) => {
        const iconConfig = getTransactionTypeIcon(item.transactionType);
        const isPositive = item.amount > 0;
        
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
                        <Ionicons name={iconConfig.name} size={24} color={iconConfig.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>
                            {item.description || getTransactionTypeLabel(item.transactionType)}
                        </Text>
                        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <Text style={[styles.amountText, { color: isPositive ? '#23b249' : '#EF4444' }]}>
                        {isPositive ? '+' : ''}{item.amount}
                    </Text>
                    <Text style={styles.pointsLabel}>Điểm</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <NavigationHeader title="Lịch sử điểm" />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
                    onPress={() => setActiveTab('payments')}
                >
                    <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
                        Thanh toán
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'usage' && styles.activeTab]}
                    onPress={() => setActiveTab('usage')}
                >
                    <Text style={[styles.tabText, activeTab === 'usage' && styles.activeTabText]}>
                        Sử dụng điểm
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.light.primary} />
                        <Text style={styles.loadingText}>Đang tải...</Text>
                    </View>
                ) : activeTab === 'payments' ? (
                    <FlatList
                        data={payments}
                        renderItem={renderPaymentItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyText}>Chưa có lịch sử thanh toán</Text>
                            </View>
                        }
                    />
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderUsageItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="time-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyText}>Chưa có lịch sử sử dụng điểm</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
