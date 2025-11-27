import GameModeModal from '@/components/game/GameModeModal';
import { Colors } from '@/constants/theme';
import { getDashboardStyles } from '@/styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function DashboardScreen() {
  const dimensions = useWindowDimensions();
  const styles = useMemo(() => getDashboardStyles(dimensions), [dimensions]);
  const [showGameModal, setShowGameModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sidebar (Navigation) */}
      <View style={styles.sidebar}>
        <TouchableOpacity
          style={styles.sidebarIcon}
          onPress={() => setShowGameModal(true)}
        >
          <Ionicons name="game-controller" size={28} color={Colors.light.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sidebarIcon, styles.sidebarIconActive]}>
          <Ionicons name="home" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        {/* Match History */}
        <Link href="/match-history" asChild>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="time" size={24} color={Colors.light.icon} />
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
        {/* Settings */}
        <TouchableOpacity style={styles.sidebarIcon}>
          <Ionicons name="settings" size={24} color={Colors.light.icon} />
        </TouchableOpacity>
        {/* Tutorial */}
        <TouchableOpacity style={styles.sidebarIcon}>
          <Ionicons name="school" size={24} color={Colors.light.icon} />
        </TouchableOpacity>
        {/* FAQ/Support */}
        <Link href="/faq" asChild>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="headset" size={24} color={Colors.light.icon} />
          </TouchableOpacity>
        </Link>
        <View style={{ flex: 1 }} />
        <Link href={"/profile" as any} asChild>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          </TouchableOpacity>
        </Link>
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
            <Text style={styles.headerSubtitle}>Welcome back, John! You have 2 pending matches.</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.light.icon} />
              <TextInput
                placeholder="Search..."
                style={styles.searchInput}
                placeholderTextColor={Colors.light.icon}
              />
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications" size={24} color={Colors.light.text} />
              <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>SEASON 5</Text>
            </View>
            <Text style={styles.bannerTitle}>Winter Championship</Text>
            <Text style={styles.bannerText}>Join the tournament and win exclusive prizes.</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Register Now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="trophy" size={100} color="#FFD700" style={styles.bannerImage} />
        </View>

        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          {/* Quick Play */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Play</Text>
            <View style={styles.quickPlayGrid}>
              <TouchableOpacity style={styles.quickPlayItem}>
                <Ionicons name="flash" size={32} color="#F59E0B" />
                <Text style={styles.quickPlayText}>Blitz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickPlayItem}>
                <Ionicons name="time" size={32} color="#10B981" />
                <Text style={styles.quickPlayText}>Rapid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPlayItem}
                onPress={() => setShowGameModal(true)}
              >
                <Ionicons name="hardware-chip" size={32} color="#8B5CF6" />
                <Text style={styles.quickPlayText}>Vs Bot</Text>
              </TouchableOpacity>
              <Link href="/puzzles" asChild>
                <TouchableOpacity style={styles.quickPlayItem}>
                  <Ionicons name="extension-puzzle" size={32} color="#EC4899" />
                  <Text style={styles.quickPlayText}>Puzzles</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Your Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2450</Text>
                <Text style={styles.statLabel}>ELO</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>142</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>58%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
            {/* Simple Graph Placeholder */}
            <View style={{ height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 }}>
              {[40, 60, 50, 80, 70, 90, 60].map((h, i) => (
                <View key={i} style={{ width: 8, height: h, backgroundColor: Colors.light.primary, borderRadius: 4, opacity: 0.5 }} />
              ))}
            </View>
          </View>

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

            {[
              { rank: 1, name: 'Grandmaster 1', score: 2801 },
              { rank: 2, name: 'Grandmaster 2', score: 2802 },
              { rank: 3, name: 'Grandmaster 3', score: 2803 },
              { rank: 4, name: 'Grandmaster 4', score: 2804 },
            ].map((item, index) => (
              <View key={index} style={styles.rankingItem}>
                <Text style={styles.rankNumber}>{item.rank}</Text>
                <View style={styles.rankAvatar} />
                <Text style={styles.rankName}>{item.name}</Text>
                <Text style={styles.rankScore}>{item.score}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Game Mode Modal */}
      <GameModeModal
        visible={showGameModal}
        onClose={() => setShowGameModal(false)}
      />
    </SafeAreaView>
  );
}
