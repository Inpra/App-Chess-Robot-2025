import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Mock Data
const PAYMENTS = [
  { id: '1', date: '2023-11-20', package: 'Pro Pack', amount: '100,000 VND', status: 'Success', points: '+1200' },
  { id: '2', date: '2023-11-15', package: 'Starter Pack', amount: '50,000 VND', status: 'Success', points: '+500' },
  { id: '3', date: '2023-11-10', package: 'Grandmaster Pack', amount: '200,000 VND', status: 'Failed', points: '0' },
];

const USAGE = [
  { id: '1', date: '2023-11-22', activity: 'Vs Bot (Hard)', points: '-50' },
  { id: '2', date: '2023-11-21', activity: 'Puzzle #42', points: '-10' },
  { id: '3', date: '2023-11-21', activity: 'Vs Bot (Medium)', points: '-20' },
  { id: '4', date: '2023-11-20', activity: 'Tournament Entry', points: '-100' },
];

export default function PointsHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'payments' | 'usage'>('payments');

  const renderPaymentItem = ({ item }: { item: typeof PAYMENTS[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.status === 'Success' ? '#D1FAE5' : '#FEE2E2' }]}>
          <Ionicons 
            name={item.status === 'Success' ? 'checkmark-circle' : 'alert-circle'} 
            size={24} 
            color={item.status === 'Success' ? '#10B981' : '#EF4444'} 
          />
        </View>
        <View>
          <Text style={styles.cardTitle}>{item.package}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amountText}>{item.amount}</Text>
        <Text style={[styles.statusText, { color: item.status === 'Success' ? '#10B981' : '#EF4444' }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const renderUsageItem = ({ item }: { item: typeof USAGE[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="game-controller" size={24} color="#3B82F6" />
        </View>
        <View>
          <Text style={styles.cardTitle}>{item.activity}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.amountText, { color: '#EF4444' }]}>{item.points}</Text>
        <Text style={styles.pointsLabel}>Points</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]} 
          onPress={() => setActiveTab('payments')}
        >
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'usage' && styles.activeTab]} 
          onPress={() => setActiveTab('usage')}
        >
          <Text style={[styles.tabText, activeTab === 'usage' && styles.activeTabText]}>Point Usage</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'payments' ? (
          <FlatList
            data={PAYMENTS}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No payment history found.</Text>}
          />
        ) : (
          <FlatList
            data={USAGE}
            renderItem={renderUsageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No usage history found.</Text>}
          />
        )}
      </View>
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
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        android: { elevation: 2 },
    }),
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 16,
  },
});
