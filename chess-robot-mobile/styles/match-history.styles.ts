import { Colors, Styles } from '@/constants/theme';
import { ScaledSize, StyleSheet } from 'react-native';

export const getMatchHistoryStyles = ({ width, height }: ScaledSize) => {
    const isTablet = width >= 600;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.light.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: isTablet ? 32 : 20,
            paddingVertical: isTablet ? 20 : 16,
            backgroundColor: Colors.light.card,
            borderBottomWidth: 1,
            borderBottomColor: Colors.light.border,
        },
        backButton: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: '#F3F4F6',
        },
        headerTitle: {
            fontSize: isTablet ? 22 : 18,
            fontWeight: '700',
            color: Colors.light.text,
        },
        listContent: {
            padding: isTablet ? 32 : 20,
        },
        listHeader: {
            marginBottom: 24,
        },
        statsSummary: {
            flexDirection: 'row',
            backgroundColor: Colors.light.card,
            borderRadius: 20,
            padding: isTablet ? 28 : 20,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Styles.shadow,
        },
        summaryItem: {
            alignItems: 'center',
            flex: 1,
        },
        summaryValue: {
            fontSize: isTablet ? 28 : 24,
            fontWeight: '800',
            color: Colors.light.text,
            marginBottom: 6,
        },
        summaryLabel: {
            fontSize: isTablet ? 14 : 12,
            color: Colors.light.icon,
            fontWeight: '600',
        },
        divider: {
            width: 1,
            height: 40,
            backgroundColor: Colors.light.border,
        },
        sectionTitle: {
            fontSize: isTablet ? 22 : 18,
            fontWeight: '700',
            color: Colors.light.text,
            marginBottom: 16,
        },
        matchCard: {
            backgroundColor: Colors.light.card,
            borderRadius: 20,
            padding: isTablet ? 20 : 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Styles.shadow,
        },
        matchHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
        },
        opponentInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flex: 1,
        },
        avatarContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
        },
        opponentName: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: '700',
            color: Colors.light.text,
            marginBottom: 4,
        },
        matchDate: {
            fontSize: 13,
            color: Colors.light.icon,
            fontWeight: '500',
        },
        resultBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
        },
        resultText: {
            fontSize: 13,
            fontWeight: '700',
        },
        matchStats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: Colors.light.border,
        },
        statItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        statText: {
            fontSize: 13,
            color: Colors.light.icon,
            fontWeight: '600',
        },
    });
};
