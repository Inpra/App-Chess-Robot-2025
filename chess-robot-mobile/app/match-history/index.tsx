import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Mock Data for Match History
const MATCH_HISTORY = [
  {
    id: '1',
    opponent: 'Robot Arm (Level 1)',
    result: 'Win',
    date: '2023-11-23',
    time: '14:30',
    duration: '15m 20s',
    eloChange: '+12',
    moves: 34,
    avatar: 'https://i.pravatar.cc/100?img=1',
  },
  {
    id: '2',
    opponent: 'Grandmaster Bot',
    result: 'Loss',
    date: '2023-11-22',
    time: '09:15',
    duration: '22m 10s',
    eloChange: '-8',
    moves: 45,
    avatar: 'https://i.pravatar.cc/100?img=2',
  },
  {
    id: '3',
    opponent: 'Robot Arm (Level 2)',
    result: 'Draw',
    date: '2023-11-20',
    time: '18:45',
    duration: '45m 00s',
    eloChange: '+2',
    moves: 60,
    avatar: 'https://i.pravatar.cc/100?img=3',
  },
  {
    id: '4',
    opponent: 'Online Player 123',
    result: 'Win',
    date: '2023-11-18',
    time: '10:00',
    duration: '12m 05s',
    eloChange: '+15',
    moves: 28,
    avatar: 'https://i.pravatar.cc/100?img=4',
  },
  {
    id: '5',
    opponent: 'Robot Arm (Level 3)',
    result: 'Loss',
    date: '2023-11-15',
    time: '20:30',
    duration: '30m 15s',
    eloChange: '-10',
    moves: 52,
    avatar: 'https://i.pravatar.cc/100?img=5',
  },
];

export default function MatchHistoryScreen() {
  const router = useRouter();

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return '#10B981';
      case 'Loss': return '#EF4444';
      case 'Draw': return '#F59E0B';
      default: return Colors.light.text;
    }
  };

  const renderItem = ({ item }: { item: typeof MATCH_HISTORY[0] }) => (
    <Link href={`/match-history/${item.id}`} asChild>
      <TouchableOpacity style={styles.matchCard}>
        <View style={styles.matchHeader}>
            <View style={styles.opponentInfo}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={20} color="#6B7280" />
                </View>
                <View>
                    <Text style={styles.opponentName}>{item.opponent}</Text>
                    <Text style={styles.matchDate}>{item.date} • {item.time}</Text>
                </View>
            </View>
            <View style={[styles.resultBadge, { backgroundColor: getResultColor(item.result) + '20' }]}>
                <Text style={[styles.resultText, { color: getResultColor(item.result) }]}>{item.result}</Text>
            </View>
        </View>
        
        <View style={styles.matchStats}>
            <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statText}>{item.duration}</Text>
            </View>
            <View style={styles.statItem}>
                <Ionicons name="swap-vertical-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statText}>{item.moves} Moves</Text>
            </View>
            <View style={styles.statItem}>
                <Ionicons name="trending-up-outline" size={16} color={item.eloChange.startsWith('+') ? '#10B981' : '#EF4444'} />
                <Text style={[styles.statText, { color: item.eloChange.startsWith('+') ? '#10B981' : '#EF4444' }]}>
                    {item.eloChange} ELO
                </Text>
            </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MATCH_HISTORY}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
            <View style={styles.listHeader}>
                <View style={styles.statsSummary}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>142</Text>
                        <Text style={styles.summaryLabel}>Total Games</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>58%</Text>
                        <Text style={styles.summaryLabel}>Win Rate</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>2450</Text>
                        <Text style={styles.summaryLabel}>Current ELO</Text>
                    </View>
                </View>
                <Text style={styles.sectionTitle}>Recent Matches</Text>
            </View>
        }
      />
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
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 20,
  },
  listHeader: {
      marginBottom: 20,
  },
  statsSummary: {
      flexDirection: 'row',
      backgroundColor: Colors.light.card,
      borderRadius: 16,
      padding: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
        android: { elevation: 2 },
    }),
  },
  summaryItem: {
      alignItems: 'center',
      flex: 1,
  },
  summaryValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#111827',
      marginBottom: 4,
  },
  summaryLabel: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
  },
  divider: {
      width: 1,
      height: 30,
      backgroundColor: '#E5E7EB',
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 12,
  },
  matchCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        android: { elevation: 2 },
    }),
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  matchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
  },
  opponentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.light.background,
      justifyContent: 'center',
      alignItems: 'center',
  },
  opponentName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 2,
  },
  matchDate: {
      fontSize: 12,
      color: '#9CA3AF',
  },
  resultBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  resultText: {
      fontSize: 12,
      fontWeight: '700',
  },
  matchStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: Colors.light.border,
  },
  statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  statText: {
      fontSize: 13,
      color: '#6B7280',
      fontWeight: '500',
  },
});
