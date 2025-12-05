import GameModeModal from '@/components/game/GameModeModal';
import ThemeSettingsModal from '@/components/theme/ThemeSettingsModal';
import { GameThemeProvider } from '@/components/theme/GameThemeContext';
import { Colors } from '@/constants/theme';
import { getDashboardStyles } from '@/styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService, { UserResponse } from '@/services/authService';
import rankingService, { RankingUser } from '@/services/rankingService';

export default function DashboardScreen() {
  const dimensions = useWindowDimensions();
  const styles = useMemo(() => getDashboardStyles(dimensions), [dimensions]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [topPlayers, setTopPlayers] = useState<RankingUser[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  useEffect(() => {
    // Get user from AsyncStorage
    const loadUser = async () => {
      const localUser = await authService.getCurrentUser();
      if (localUser) {
        setUser(localUser);
        
        // Fetch fresh data from API
        try {
          const profile = await authService.getProfile();
          if (profile) {
            setUser(profile);
            setPointsBalance(profile.pointsBalance || 0);
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      }
    };

    loadUser();
    loadTopRankings();
  }, []);

  const loadTopRankings = async () => {
    try {
      setLoadingRanking(true);
      const rankings = await rankingService.getGlobalRanking(4);
      setTopPlayers(rankings);
    } catch (error) {
      console.error('Failed to load rankings:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <GameThemeProvider>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Sidebar (Navigation) */}
        <View style={styles.sidebar}>
          <TouchableOpacity style={[styles.sidebarIcon, styles.sidebarIconActive]}>
            <Ionicons name="home" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sidebarIcon}
            onPress={() => setShowGameModal(true)}
          >
            <Ionicons name="game-controller" size={28} color={Colors.light.primary} />
          </TouchableOpacity>

          {/* Match History */}
          <Link href="/match-history" asChild>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons name="time" size={24} color={Colors.light.icon} />
            </TouchableOpacity>
          </Link>
          {/* Tutorial */}
          <Link href={"/tutorial" as any} asChild>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons name="school" size={24} color={Colors.light.icon} />
            </TouchableOpacity>
          </Link>
          {/* Puzzles */}
          <Link href="/puzzles" asChild>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons name="extension-puzzle" size={24} color={Colors.light.icon} />
            </TouchableOpacity>
          </Link>
          {/* View Ranking */}
          <Link href="/ranking" asChild>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons name="trophy" size={24} color={Colors.light.icon} />
            </TouchableOpacity>
          </Link>
          {/* Purchase Points */}
          <Link href="/purchase-points" asChild>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons name="cart" size={24} color={Colors.light.icon} />
            </TouchableOpacity>
          </Link>
          {/* Theme */}
          <TouchableOpacity style={styles.sidebarIcon} onPress={() => setShowThemeModal(true)}>
            <Ionicons name="color-palette" size={24} color={Colors.light.icon} />
          </TouchableOpacity>

          {/* FAQ/Support */}
          <Link href="/faq" asChild>
            <TouchableOpacity style={styles.sidebarIcon}>
              <Ionicons name="headset" size={24} color={Colors.light.icon} />
            </TouchableOpacity>
          </Link>
          <View style={{ flex: 1 }} />
          
          {/* Profile / Login Button */}
          {user ? (
            <Link href={"/profile" as any} asChild>
              <TouchableOpacity style={styles.sidebarIcon}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#667eea',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                      {getInitials(user?.fullName || user?.username)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Link>
          ) : (
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.sidebarIcon}>
                <Ionicons name="log-in" size={24} color={Colors.light.icon} />
              </TouchableOpacity>
            </Link>
          )}
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Dashboard</Text>
              {user && (
                <Text style={styles.headerSubtitle}>
                  Welcome back, {user?.fullName || user?.username || 'Player'}!
                </Text>
              )}
            </View>

            <View style={styles.headerActions}>
              {user ? (
                <Link href="/purchase-points" asChild>
                  <TouchableOpacity 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(102, 126, 234, 0.15)',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 24,
                      gap: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      shadowColor: '#667eea',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="diamond" size={20} color="#FFD700" />
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#FFF' }}>
                        {pointsBalance.toLocaleString()}
                      </Text>
                    </View>
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#667eea',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons name="add" size={16} color="white" />
                    </View>
                  </TouchableOpacity>
                </Link>
              ) : (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 24,
                        borderRadius: 20,
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Login</Text>
                    </TouchableOpacity>
                  </Link>
                  <Link href="/(auth)/register" asChild>
                    <TouchableOpacity
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 24,
                        borderRadius: 20,
                        backgroundColor: '#667eea',
                        borderWidth: 0
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>Register</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
            </View>
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerTag}>
                <Text style={styles.bannerTagText}>CHALLENGE</Text>
              </View>
              <Text style={styles.bannerTitle}>Welcome to Chess Robot</Text>
              <Text style={styles.bannerText}>Can you beat the robot? Test your skills and climb the leaderboard!</Text>
              {user ? (
                <TouchableOpacity 
                  style={styles.bannerButton}
                  onPress={() => setShowGameModal(true)}
                >
                  <Text style={styles.bannerButtonText}>Play Now</Text>
                </TouchableOpacity>
              ) : (
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>Register Now</Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
            <Ionicons name="trophy" size={100} color="#FFD700" style={styles.bannerImage} />
          </View>

          {/* Dashboard Grid */}
          <View style={styles.gridContainer}>
            {/* Quick Access */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quick Access</Text>
              <View style={styles.quickPlayGrid}>
                {user ? (
                  <TouchableOpacity
                    style={styles.quickPlayItem}
                    onPress={() => setShowGameModal(true)}
                  >
                    <Ionicons name="hardware-chip" size={32} color="#8B5CF6" />
                    <Text style={styles.quickPlayText}>Vs Bot</Text>
                  </TouchableOpacity>
                ) : (
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity style={styles.quickPlayItem}>
                      <Ionicons name="hardware-chip" size={32} color="#8B5CF6" />
                      <Text style={styles.quickPlayText}>Vs Bot</Text>
                    </TouchableOpacity>
                  </Link>
                )}
                <Link href="/puzzles" asChild>
                  <TouchableOpacity style={styles.quickPlayItem}>
                    <Ionicons name="extension-puzzle" size={32} color="#EC4899" />
                    <Text style={styles.quickPlayText}>Puzzles</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/match-history" asChild>
                  <TouchableOpacity style={styles.quickPlayItem}>
                    <Ionicons name="time" size={32} color="#10B981" />
                    <Text style={styles.quickPlayText}>History</Text>
                  </TouchableOpacity>
                </Link>
                <Link href={"/tutorial" as any} asChild>
                  <TouchableOpacity style={styles.quickPlayItem}>
                    <Ionicons name="school" size={32} color="#F59E0B" />
                    <Text style={styles.quickPlayText}>Training</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Your Stats - Only show if logged in */}
            {user && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Stats</Text>
                
                {/* Main Stats Grid */}
                <View style={[styles.statsRow, { marginBottom: 20 }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#667eea' }]}>
                      {user?.eloRating || 1200}
                    </Text>
                    <Text style={styles.statLabel}>ELO Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>
                      {user?.wins || 0}
                    </Text>
                    <Text style={styles.statLabel}>Wins</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                      {user?.totalGamesPlayed > 0 
                        ? `${Math.round((user?.wins || 0) / user?.totalGamesPlayed * 100)}%`
                        : '0%'}
                    </Text>
                    <Text style={styles.statLabel}>Win Rate</Text>
                  </View>
                </View>

                {/* Detailed Stats */}
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  gap: 12, 
                  marginBottom: 20 
                }}>
                  <View style={{ 
                    flex: 1, 
                    minWidth: '22%',
                    alignItems: 'center', 
                    padding: 12, 
                    backgroundColor: 'rgba(102, 126, 234, 0.1)', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#667eea', marginBottom: 4 }}>
                      {user?.totalGamesPlayed || 0}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}>Total Games</Text>
                  </View>
                  <View style={{ 
                    flex: 1, 
                    minWidth: '22%',
                    alignItems: 'center', 
                    padding: 12, 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>
                      {user?.wins || 0}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}>Wins</Text>
                  </View>
                  <View style={{ 
                    flex: 1, 
                    minWidth: '22%',
                    alignItems: 'center', 
                    padding: 12, 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>
                      {user?.losses || 0}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}>Losses</Text>
                  </View>
                  <View style={{ 
                    flex: 1, 
                    minWidth: '22%',
                    alignItems: 'center', 
                    padding: 12, 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                    borderRadius: 12 
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
                      {user?.draws || 0}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500' }}>Draws</Text>
                  </View>
                </View>

                {/* Win/Loss/Draw Chart */}
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>
                    Performance Distribution
                  </Text>
                  <View style={{ 
                    flexDirection: 'row', 
                    height: 8, 
                    borderRadius: 8, 
                    overflow: 'hidden', 
                    backgroundColor: '#F3F4F6' 
                  }}>
                    {(() => {
                      const total = user?.totalGamesPlayed || 0;
                      const wins = user?.wins || 0;
                      const losses = user?.losses || 0;
                      const draws = user?.draws || 0;
                      
                      if (total === 0) {
                        return <View style={{ width: '100%', backgroundColor: '#E5E7EB' }}></View>;
                      }
                      
                      const winPercent = `${(wins / total) * 100}%`;
                      const lossPercent = `${(losses / total) * 100}%`;
                      const drawPercent = `${(draws / total) * 100}%`;
                      
                      return (
                        <>
                          {wins > 0 && <View style={{ flex: (wins / total), backgroundColor: '#10B981' }}></View>}
                          {losses > 0 && <View style={{ flex: (losses / total), backgroundColor: '#EF4444' }}></View>}
                          {draws > 0 && <View style={{ flex: (draws / total), backgroundColor: '#F59E0B' }}></View>}
                        </>
                      );
                    })()}
                  </View>
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    marginTop: 8
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#10B981' }}></View>
                      <Text style={{ fontSize: 11, color: '#6B7280' }}>Wins</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#EF4444' }}></View>
                      <Text style={{ fontSize: 11, color: '#6B7280' }}>Losses</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#F59E0B' }}></View>
                      <Text style={{ fontSize: 11, color: '#6B7280' }}>Draws</Text>
                    </View>
                  </View>
                </View>

                {/* Peak ELO Info */}
                {user?.peakElo && (
                  <View style={{ 
                    marginTop: 16, 
                    padding: 12, 
                    backgroundColor: 'rgba(102, 126, 234, 0.05)', 
                    borderRadius: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: '#667eea'
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500' }}>Peak ELO</Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#667eea' }}>
                        {user?.peakElo}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Live Rankings */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Live Rankings</Text>
                <Link href="/ranking" asChild>
                  <TouchableOpacity>
                    <Text style={{ color: Colors.light.primary, fontWeight: '600' }}>View All</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {loadingRanking ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: '#6B7280' }}>Loading rankings...</Text>
                </View>
              ) : topPlayers.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: '#6B7280' }}>No rankings available</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {topPlayers.map((player, index) => (
                    <View
                      key={player.userId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 14,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 2
                      }}
                    >
                      {/* Rank with Crown/Medal */}
                      <View style={{
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        {index === 0 ? (
                          <Ionicons name="trophy" size={24} color="#D97706" />
                        ) : index === 1 ? (
                          <Ionicons name="medal" size={24} color="#9CA3AF" />
                        ) : index === 2 ? (
                          <Ionicons name="medal" size={24} color="#B45309" />
                        ) : (
                          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#6B7280' }}>
                            #{player.rank}
                          </Text>
                        )}
                      </View>

                      {/* Avatar */}
                      <View style={{ position: 'relative', marginRight: 12 }}>
                        {player.avatarUrl ? (
                          <Image
                            source={{ uri: player.avatarUrl }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              borderWidth: 2,
                              borderColor: 'white'
                            }}
                          />
                        ) : (
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#667eea',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: 'white'
                          }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                              {player.username.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        {index === 0 && (
                          <View style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            backgroundColor: '#FFD700',
                            borderRadius: 8,
                            width: 16,
                            height: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'white'
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#B45309' }}>1</Text>
                          </View>
                        )}
                      </View>

                      {/* Player Info */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: '#1F2937', fontSize: 14 }}>
                          {player.fullName || player.username}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {`${player.wins} Wins • ${player.winRate}% WR`}
                        </Text>
                      </View>

                      {/* ELO Score */}
                      <View style={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 6
                      }}>
                        <Text style={{ fontWeight: 'bold', color: '#667eea', fontSize: 14 }}>
                          {player.eloRating}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Game Mode Modal */}
        <GameModeModal
          visible={showGameModal}
          onClose={() => setShowGameModal(false)}
        />

        {/* Theme Settings Modal */}
        <ThemeSettingsModal
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
        />
      </SafeAreaView>
    </GameThemeProvider>
  );
}
