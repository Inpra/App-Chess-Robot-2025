import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getMatchHistoryStyles } from '@/styles/match-history.styles';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
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
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getMatchHistoryStyles(dimensions), [dimensions]);

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
                            <Ionicons name="person" size={24} color="#9CA3AF" />
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
                        <Ionicons name="time-outline" size={18} color="#9CA3AF" />
                        <Text style={styles.statText}>{item.duration}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="swap-vertical-outline" size={18} color="#9CA3AF" />
                        <Text style={styles.statText}>{item.moves} Moves</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons
                            name="trending-up-outline"
                            size={18}
                            color={item.eloChange.startsWith('+') ? '#10B981' : '#EF4444'}
                        />
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
            <NavigationHeader
                title="Match History"
                onBack={() => router.navigate('/(tabs)')}
            />

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
