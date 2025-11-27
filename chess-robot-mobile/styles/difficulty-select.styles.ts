import { Colors } from '@/constants/theme';
import { Platform, ScaledSize, StyleSheet } from 'react-native';

export const getDifficultySelectStyles = ({ width, height }: ScaledSize) => {
    const isTablet = width >= 600;

    return StyleSheet.create({
        // Full Screen Styles (for difficulty-select.tsx)
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

        // Modal Styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContainer: {
            backgroundColor: Colors.light.card,
            borderRadius: 24,
            width: '100%',
            maxWidth: 600,
            maxHeight: height * 0.8,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20
                },
                android: { elevation: 10 },
            }),
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: Colors.light.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#111827',
        },
        closeButton: {
            padding: 4,
        },
        modalContent: {
            padding: 24,
        },

        // Card Styles (shared between modal and full screen)
        cardsContainer: {
            gap: 16,
        },
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.light.background,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8
                },
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
};
