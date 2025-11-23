import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const faqs = [
  {
    id: 1,
    question: 'How do I connect to the Robot Arm?',
    answer: 'Go to the "Vs Bot" game mode. Ensure your Robot Arm is powered on and Bluetooth is enabled on your device. The app will automatically scan for available robots.',
  },
  {
    id: 2,
    question: 'How do I top up points?',
    answer: 'Click on the Cart icon in the sidebar to visit the Store. Select a point package (Starter, Pro, or Grandmaster) and follow the payment instructions.',
  },
  {
    id: 3,
    question: 'Can I play offline?',
    answer: 'Yes, you can play against the built-in AI bot without an internet connection. However, online features like matchmaking and purchasing points require internet access.',
  },
  {
    id: 4,
    question: 'How is my ELO calculated?',
    answer: 'Your ELO rating is updated after every ranked match based on the result and your opponent\'s rating. Winning against a higher-rated opponent gives more points.',
  },
  {
    id: 5,
    question: 'What if the robot makes a wrong move?',
    answer: 'If the robot makes an invalid move or knocks over a piece, please pause the game using the pause button and manually adjust the board. You can then resume the game.',
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search for help..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* FAQ List */}
        <View style={styles.faqList}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {filteredFaqs.map((faq) => (
                <View key={faq.id} style={styles.faqItem}>
                    <TouchableOpacity 
                        style={styles.faqHeader} 
                        onPress={() => toggleExpand(faq.id)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.faqQuestion, expandedId === faq.id && styles.activeQuestion]}>
                            {faq.question}
                        </Text>
                        <Ionicons 
                            name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={expandedId === faq.id ? Colors.light.primary : "#9CA3AF"} 
                        />
                    </TouchableOpacity>
                    {expandedId === faq.id && (
                        <View style={styles.faqBody}>
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        </View>
                    )}
                </View>
            ))}
            {filteredFaqs.length === 0 && (
                <Text style={styles.noResultsText}>No results found.</Text>
            )}
        </View>

        {/* Contact Support */}
        <View style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
                <Ionicons name="chatbubbles" size={32} color="white" />
            </View>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactText}>Our support team is available 24/7 to assist you with any issues.</Text>
            <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
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
    paddingBottom: 40,
  },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.light.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: Colors.light.border,
  },
  searchIcon: {
      marginRight: 8,
  },
  searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: '#111827',
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
  },
  faqList: {
      marginBottom: 32,
  },
  faqItem: {
      backgroundColor: Colors.light.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.light.border,
  },
  faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
  },
  faqQuestion: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      flex: 1,
      marginRight: 16,
  },
  activeQuestion: {
      color: Colors.light.primary,
  },
  faqBody: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      paddingTop: 12,
  },
  faqAnswer: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 22,
  },
  noResultsText: {
      textAlign: 'center',
      color: '#9CA3AF',
      marginTop: 20,
  },
  contactCard: {
      backgroundColor: Colors.light.primary,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      ...Platform.select({
        ios: { shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
        android: { elevation: 4 },
    }),
  },
  contactIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
  },
  contactTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: 'white',
      marginBottom: 8,
  },
  contactText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
  },
  contactButton: {
      backgroundColor: 'white',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
  },
  contactButtonText: {
      color: Colors.light.primary,
      fontWeight: '700',
      fontSize: 16,
  },
});
