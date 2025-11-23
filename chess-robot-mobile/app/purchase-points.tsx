import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock Data for Packages
const PACKAGES = [
  {
    id: '1',
    name: 'Starter Pack',
    points: 500,
    price: '50,000 VND',
    color: '#10B981', // Emerald Green
    accent: '#D1FAE5',
    description: 'Perfect for beginners to start their journey.',
    popular: false,
    icon: 'star-outline' as const,
  },
  {
    id: '2',
    name: 'Pro Pack',
    points: 1200,
    price: '100,000 VND',
    color: '#3B82F6', // Royal Blue
    accent: '#DBEAFE',
    description: 'Best value for regular players.',
    popular: true,
    icon: 'trophy-outline' as const,
  },
  {
    id: '3',
    name: 'Grandmaster Pack',
    points: 3000,
    price: '200,000 VND',
    color: '#8B5CF6', // Violet
    accent: '#EDE9FE',
    description: 'For the serious competitors who want it all.',
    popular: false,
    icon: 'diamond-outline' as const,
  },
];

export default function PurchasePointsScreen() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePurchase = (pkg: typeof PACKAGES[0]) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/points-history')}>
            <Ionicons name="time-outline" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Top Up Points</Text>
            <Text style={styles.heroSubtitle}>Unlock premium features and join tournaments.</Text>
        </View>

        <View style={styles.cardsContainer}>
          {PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.card, 
                pkg.popular && styles.popularCard,
                { borderColor: pkg.popular ? pkg.color : 'transparent' }
              ]}
              onPress={() => handlePurchase(pkg)}
              activeOpacity={0.9}
            >
              {pkg.popular && (
                <View style={[styles.popularTag, { backgroundColor: pkg.color }]}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: pkg.accent }]}>
                    <Ionicons name={pkg.icon} size={28} color={pkg.color} />
                  </View>
                  <View style={styles.pointsContainer}>
                      <Text style={[styles.pointsValue, { color: pkg.color }]}>{pkg.points}</Text>
                      <Text style={styles.pointsLabel}>Points</Text>
                  </View>
              </View>

              <View style={styles.cardBody}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
              </View>

              <View style={styles.cardFooter}>
                  <View style={[styles.priceButton, { backgroundColor: pkg.color }]}>
                    <Text style={styles.priceText}>{pkg.price}</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 8 }} />
                  </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#9CA3AF" />
            <Text style={styles.footerNoteText}>Secure payment via PayOS</Text>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan to Pay</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                 <Ionicons name="qr-code-outline" size={120} color="#1F2937" />
              </View>
              <Text style={styles.payInstruction}>Open your banking app and scan the QR code to complete payment.</Text>
              
              <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amountValue}>{selectedPackage?.price}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.doneButton, { backgroundColor: selectedPackage?.color || Colors.light.primary }]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>I have paid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
        android: { elevation: 2 },
    }),
  },
  historyButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 24,
    paddingTop: 10,
  },
  heroSection: {
      marginBottom: 32,
  },
  heroTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: '#111827',
      marginBottom: 8,
      letterSpacing: -0.5,
  },
  heroSubtitle: {
      fontSize: 16,
      color: '#6B7280',
      lineHeight: 24,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
        android: { elevation: 4 },
    }),
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  popularCard: {
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  popularTag: {
    position: 'absolute',
    top: -12,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  popularText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsContainer: {
      alignItems: 'flex-end',
  },
  pointsValue: {
      fontSize: 24,
      fontWeight: '800',
  },
  pointsLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#9CA3AF',
      textTransform: 'uppercase',
  },
  cardBody: {
      marginBottom: 24,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  packageDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
  },
  priceText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  footerNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 32,
      gap: 8,
  },
  footerNoteText: {
      fontSize: 13,
      color: '#9CA3AF',
      fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backdropFilter: 'blur(4px)', // Works on some platforms
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
        android: { elevation: 10 },
    }),
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
      padding: 8,
      backgroundColor: Colors.light.background,
      borderRadius: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  payInstruction: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  amountContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: Colors.light.background,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
  },
  amountLabel: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
