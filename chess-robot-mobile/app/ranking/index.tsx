import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Mock Data
const globalRankings = [
  { id: '1', name: 'Grandmaster 1', elo: 2800, avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Grandmaster 2', elo: 2750, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', name: 'Grandmaster 3', elo: 2700, avatar: 'https://i.pravatar.cc/100?img=3' },
  { id: '4', name: 'Player 4', elo: 2650, avatar: 'https://i.pravatar.cc/100?img=4' },
  { id: '5', name: 'Player 5', elo: 2600, avatar: 'https://i.pravatar.cc/100?img=5' },
  { id: '6', name: 'Player 6', elo: 2550, avatar: 'https://i.pravatar.cc/100?img=6' },
  { id: '7', name: 'Player 7', elo: 2500, avatar: 'https://i.pravatar.cc/100?img=7' },
  { id: '8', name: 'Player 8', elo: 2450, avatar: 'https://i.pravatar.cc/100?img=8' },
  { id: '9', name: 'Player 9', elo: 2400, avatar: 'https://i.pravatar.cc/100?img=9' },
  { id: '10', name: 'Player 10', elo: 2350, avatar: 'https://i.pravatar.cc/100?img=10' },
];

const friendsRankings = [
  { id: '2', name: 'Grandmaster 2', elo: 2750, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '12', name: 'My Friend 1', elo: 1600, avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 'me', name: 'You', elo: 1200, avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: '13', name: 'My Friend 2', elo: 1100, avatar: 'https://i.pravatar.cc/100?img=13' },
];

export default function RankingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  const data = activeTab === 'global' ? globalRankings : friendsRankings;
  const topThree = data.slice(0, 3);
  const restOfList = data.slice(3);

  const renderPodiumItem = (item: any, rank: number) => {
    const isFirst = rank === 1;
    const size = isFirst ? 100 : 80;
    const crownColor = isFirst ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

    return (
      <View style={[styles.podiumItem, isFirst && styles.podiumItemFirst]}>
        <View style={styles.avatarWrapper}>
            <Image source={{ uri: item.avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />
            <View style={[styles.rankBadge, { backgroundColor: crownColor }]}>
                <Text style={styles.rankBadgeText}>{rank}</Text>
            </View>
        </View>
        <Text style={styles.podiumName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.podiumElo}>{item.elo}</Text>
      </View>
    );
  };

  const renderListItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.listItem}>
      <Text style={styles.listRank}>{index + 4}</Text>
      <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listElo}>{item.elo} ELO</Text>
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
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'global' && styles.activeTab]} 
            onPress={() => setActiveTab('global')}
        >
            <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]} 
            onPress={() => setActiveTab('friends')}
        >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Friends</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restOfList}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
            <View style={styles.podiumContainer}>
                {topThree.length > 1 && renderPodiumItem(topThree[1], 2)}
                {topThree.length > 0 && renderPodiumItem(topThree[0], 1)}
                {topThree.length > 2 && renderPodiumItem(topThree[2], 3)}
            </View>
        }
      />

      {/* User's Rank (Sticky Footer) */}
      <View style={styles.userRankFooter}>
        <Text style={styles.listRank}>156</Text>
        <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={styles.listAvatar} />
        <View style={styles.listInfo}>
            <Text style={styles.listName}>You</Text>
            <Text style={styles.listElo}>1200 ELO</Text>
        </View>
        <Ionicons name="chevron-up" size={20} color="#10B981" />
        <Text style={{ color: '#10B981', fontWeight: '600', marginLeft: 4 }}>12</Text>
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
      paddingVertical: 10,
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
  listContent: {
      paddingBottom: 100,
  },
  podiumContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingVertical: 24,
      marginBottom: 16,
  },
  podiumItem: {
      alignItems: 'center',
      width: 100,
  },
  podiumItemFirst: {
      marginBottom: 24,
      zIndex: 1,
  },
  avatarWrapper: {
      marginBottom: 8,
      position: 'relative',
  },
  rankBadge: {
      position: 'absolute',
      bottom: -10,
      alignSelf: 'center',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
  },
  rankBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '700',
  },
  podiumName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 4,
      textAlign: 'center',
  },
  podiumElo: {
      fontSize: 12,
      color: Colors.light.primary,
      fontWeight: '700',
  },
  listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: Colors.light.card,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.light.border,
  },
  listRank: {
      width: 30,
      fontSize: 16,
      fontWeight: '700',
      color: '#6B7280',
  },
  listAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
  },
  listInfo: {
      flex: 1,
  },
  listName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
  },
  listElo: {
      fontSize: 14,
      color: '#6B7280',
  },
  userRankFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: Colors.light.border,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8 },
        android: { elevation: 10 },
    }),
  },
});
