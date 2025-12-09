import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import rankingService, { type RankingUser } from '@/services/rankingService';

export default function RankingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [userRanking, setUserRanking] = useState<RankingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch global rankings
      const allRankings = await rankingService.getGlobalRanking(100);
      setRankings(allRankings);

      // Fetch current user's ranking
      try {
        const myRanking = await rankingService.getMyRanking();
        setUserRanking(myRanking.userRanking);
      } catch (err) {
        console.log('User not logged in or no ranking data');
      }
    } catch (err: any) {
      console.error('Error fetching rankings:', err);
      const errorMessage = err.message || 'Không thể tải bảng xếp hạng';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRankings();
    setRefreshing(false);
  };

  const getAvatarUrl = (url?: string, name?: string) => {
    if (url) return url;
    const displayName = name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=100`;
  };

  const data = activeTab === 'global' ? rankings : [];
  const topThree = data.slice(0, 3);
  const restOfList = data.slice(3);

  const renderPodiumItem = (item: RankingUser, rank: number) => {
    const isFirst = rank === 1;
    const size = isFirst ? 100 : 80;
    const crownColor = isFirst ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';
    const displayName = item.fullName || item.username;

    return (
      <View style={[styles.podiumItem, isFirst && styles.podiumItemFirst]} key={item.userId}>
        <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: getAvatarUrl(item.avatarUrl, displayName) }} 
              style={{ width: size, height: size, borderRadius: size / 2 }} 
            />
            <View style={[styles.rankBadge, { backgroundColor: crownColor }]}>
                <Text style={styles.rankBadgeText}>{rank}</Text>
            </View>
        </View>
        <Text style={styles.podiumName} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.podiumElo}>{item.eloRating}</Text>
      </View>
    );
  };

  const renderListItem = ({ item, index }: { item: RankingUser, index: number }) => {
    const displayName = item.fullName || item.username;
    
    return (
      <View style={styles.listItem}>
        <Text style={styles.listRank}>{item.rank}</Text>
        <Image 
          source={{ uri: getAvatarUrl(item.avatarUrl, displayName) }} 
          style={styles.listAvatar} 
        />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{displayName}</Text>
          <Text style={styles.listElo}>{item.eloRating} ELO</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng Xếp Hạng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs - Hide friends tab for now */}
      {/* <View style={styles.tabsContainer}>
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
      </View> */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRankings}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : rankings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
        </View>
      ) : (
        <FlatList
          data={restOfList}
          keyExtractor={(item) => item.userId}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
            />
          }
          ListHeaderComponent={
            topThree.length > 0 ? (
              <View style={styles.podiumContainer}>
                  {topThree.length > 1 && renderPodiumItem(topThree[1], 2)}
                  {topThree.length > 0 && renderPodiumItem(topThree[0], 1)}
                  {topThree.length > 2 && renderPodiumItem(topThree[2], 3)}
              </View>
            ) : null
          }
        />
      )}

      {/* User's Rank (Sticky Footer) */}
      {userRanking && (
        <View style={styles.userRankFooter}>
          <Text style={styles.listRank}>{userRanking.rank}</Text>
          <Image 
            source={{ uri: getAvatarUrl(userRanking.avatarUrl, userRanking.fullName || userRanking.username) }} 
            style={styles.listAvatar} 
          />
          <View style={styles.listInfo}>
              <Text style={styles.listName}>{userRanking.fullName || userRanking.username}</Text>
              <Text style={styles.listElo}>{userRanking.eloRating} ELO</Text>
          </View>
          {/* <Ionicons name="chevron-up" size={20} color="#10B981" />
          <Text style={{ color: '#10B981', fontWeight: '600', marginLeft: 4 }}>12</Text> */}
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
