import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const difficulties = [
  {
    id: 'easy',
    title: 'Easy',
    subtitle: 'Beginner Friendly',
    elo: 800,
    color: '#10B981', // Green
    icon: 'leaf' as const,
    description: 'Perfect for learning the basics. The AI will make occasional mistakes.',
  },
  {
    id: 'medium',
    title: 'Medium',
    subtitle: 'Casual Player',
    elo: 1500,
    color: '#F59E0B', // Amber/Orange
    icon: 'flame' as const,
    description: 'A balanced challenge. Good for practicing tactics and strategy.',
  },
  {
    id: 'hard',
    title: 'Hard',
    subtitle: 'Grandmaster Challenge',
    elo: 2400,
    color: '#EF4444', // Red
    icon: 'skull' as const,
    description: 'Test your skills against a powerful engine. Expect no mercy.',
  },
];

export default function DifficultySelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Difficulty</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose Your Opponent</Text>
        <Text style={styles.subtitle}>Select a difficulty level to start the match.</Text>

        <View style={styles.cardsContainer}>
            {difficulties.map((level) => (
                <Link 
                    key={level.id} 
                    href={{
                        pathname: "/game/vs-bot",
                        params: { difficulty: level.id, elo: level.elo }
                    }} 
                    asChild
                >
                    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={[styles.iconContainer, { backgroundColor: level.color }]}>
                            <Ionicons name={level.icon} size={32} color="white" />
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{level.title}</Text>
                                <View style={[styles.eloTag, { backgroundColor: level.color + '20' }]}>
                                    <Text style={[styles.eloText, { color: level.color }]}>ELO {level.elo}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardSubtitle}>{level.subtitle}</Text>
                            <Text style={styles.cardDescription}>{level.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
                    </TouchableOpacity>
                </Link>
            ))}
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  title: {
      fontSize: 24,
      fontWeight: '800',
      color: '#111827',
      marginBottom: 8,
      textAlign: 'center',
  },
  subtitle: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: 32,
  },
  cardsContainer: {
      gap: 16,
  },
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.light.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: Colors.light.border,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
        android: { elevation: 3 },
    }),
  },
  iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  cardContent: {
      flex: 1,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
  },
  eloTag: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
  },
  eloText: {
      fontSize: 12,
      fontWeight: '700',
  },
  cardSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4B5563',
      marginBottom: 4,
  },
  cardDescription: {
      fontSize: 13,
      color: '#6B7280',
      lineHeight: 18,
  },
});
