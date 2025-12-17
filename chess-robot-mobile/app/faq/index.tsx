import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
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
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import faqService, { type Faq } from '@/services/faqService';
import feedbackService from '@/services/feedbackService';
import authService from '@/services/authService';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}


export default function FAQScreen() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch user and FAQs from API
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const data = await faqService.getAllFaqs();
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => 
            (a.displayOrder || 999) - (b.displayOrder || 999)
          );
          setFaqs(sortedData);
        } else {
          console.warn('FAQ data is not an array:', data);
          setFaqs([]);
        }
      } catch (error: any) {
        console.error('Error loading FAQs:', error);
        Alert.alert('Error', 'Failed to load FAQs. Please try again later.');
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitFeedback = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit feedback');
      router.push('/login');
      return;
    }

    if (feedbackMessage.trim().length < 10) {
      Alert.alert('Invalid Input', 'Feedback must be at least 10 characters');
      return;
    }

    if (feedbackMessage.trim().length > 1000) {
      Alert.alert('Invalid Input', 'Feedback cannot exceed 1000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.createFeedback(feedbackMessage.trim());
      Alert.alert('Success', '✓ Thank you for your feedback!');
      setFeedbackMessage('');
      setShowFeedbackForm(false);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            
            {loading ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading FAQs...</Text>
              </View>
            ) : filteredFaqs.length === 0 ? (
              <Text style={styles.noResultsText}>
                {searchQuery ? 'No results found.' : 'No FAQs available at the moment.'}
              </Text>
            ) : (
              filteredFaqs.map((faq) => (
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
              ))
            )}
        </View>

        {/* Feedback Form */}
        {showFeedbackForm && user && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Send us your feedback</Text>
            <TextInput
              style={styles.feedbackTextarea}
              placeholder="Tell us what you think... (minimum 10 characters)"
              placeholderTextColor="#9CA3AF"
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              multiline
              numberOfLines={5}
              maxLength={1000}
              editable={!isSubmitting}
              textAlignVertical="top"
            />
            <View style={styles.feedbackFooter}>
              <Text style={styles.charCount}>{feedbackMessage.length}/1000 characters</Text>
              <View style={styles.feedbackActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowFeedbackForm(false);
                    setFeedbackMessage('');
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isSubmitting || feedbackMessage.trim().length < 10) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmitFeedback}
                  disabled={isSubmitting || feedbackMessage.trim().length < 10}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="white" />
                      <Text style={styles.submitButtonText}>Send</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Contact Support */}
        {!showFeedbackForm && (
          <View style={styles.contactCard}>
              <View style={styles.contactIconContainer}>
                  <Ionicons name="chatbubbles" size={32} color="white" />
              </View>
              <Text style={styles.contactTitle}>Still need help?</Text>
              <Text style={styles.contactText}>
                {user
                  ? 'Share your feedback or report an issue. Our support team will review it as soon as possible.'
                  : 'Please login to send feedback or contact our support team.'}
              </Text>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => {
                  if (user) {
                    setShowFeedbackForm(true);
                  } else {
                    router.push('/login');
                  }
                }}
              >
                  <Text style={styles.contactButtonText}>
                    {user ? 'Send Feedback' : 'Login to Send Feedback'}
                  </Text>
              </TouchableOpacity>
          </View>
        )}

      </ScrollView>
      </KeyboardAvoidingView>
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
  feedbackCard: {
      backgroundColor: Colors.light.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: Colors.light.border,
  },
  feedbackTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
  },
  feedbackTextarea: {
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: '#111827',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      minHeight: 120,
      marginBottom: 12,
  },
  feedbackFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  charCount: {
      fontSize: 12,
      color: '#6B7280',
  },
  feedbackActions: {
      flexDirection: 'row',
      gap: 8,
  },
  cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: 'white',
  },
  cancelButtonText: {
      color: '#6B7280',
      fontWeight: '600',
      fontSize: 14,
  },
  submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: Colors.light.primary,
  },
  submitButtonDisabled: {
      opacity: 0.5,
  },
  submitButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 14,
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
