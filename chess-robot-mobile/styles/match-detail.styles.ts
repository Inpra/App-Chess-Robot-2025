import { Colors, Styles } from '@/constants/theme';
import { Platform, ScaledSize, StyleSheet } from 'react-native';

export const getMatchDetailStyles = ({ width, height }: ScaledSize) => {
    const isTablet = width >= 600;
    // Calculate board size for two-column layout (right column gets ~60% of width)
    const availableWidth = width - (isTablet ? 64 : 40); // Subtract padding
    const rightColumnWidth = availableWidth * 0.6; // Right column is 60% of available width
    const boardSize = Math.min(rightColumnWidth - (isTablet ? 48 : 40), isTablet ? 450 : 320);

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
        shareButton: {
            padding: 8,
            borderRadius: 12,
            backgroundColor: '#F3F4F6',
        },
        headerTitle: {
            fontSize: isTablet ? 22 : 18,
            fontWeight: '700',
            color: Colors.light.text,
        },
        content: {
            padding: isTablet ? 32 : 20,
            alignItems: 'center',
        },
        matchInfoCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: Colors.light.card,
            paddingVertical: isTablet ? 16 : 12,
            paddingHorizontal: isTablet ? 24 : 20,
            borderRadius: 16,
            width: '100%',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Styles.shadow,
        },
        mainLayout: {
            flexDirection: 'row',
            gap: isTablet ? 24 : 20,
            width: '100%',
            flex: 1,
        },
        leftColumn: {
            flex: 2,
            alignItems: 'center',
        },
        rightColumn: {
            flex: 1,
            minWidth: isTablet ? 250 : 180,
        },
        playerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        avatarContainer: {
            width: isTablet ? 40 : 36,
            height: isTablet ? 40 : 36,
            borderRadius: isTablet ? 20 : 18,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
        },
        playerName: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: '700',
            color: Colors.light.text,
        },
        playerElo: {
            fontSize: isTablet ? 14 : 12,
            color: Colors.light.icon,
            fontWeight: '600',
        },
        scoreContainer: {
            alignItems: 'center',
        },
        score: {
            fontSize: isTablet ? 24 : 20,
            fontWeight: '800',
            color: Colors.light.text,
            marginBottom: 4,
        },
        resultText: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: '700',
            color: '#10B981',
        },
        boardContainer: {
            width: boardSize,
            height: boardSize,
            marginBottom: 28,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#EEE',
            ...Styles.shadow,
        },
        boardPlaceholder: {
            width: '100%',
            height: '100%',
        },
        gridOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        square: {
            width: '12.5%',
            height: '12.5%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        controlsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isTablet ? 32 : 24,
            width: '100%',
        },
        controlButton: {
            width: isTablet ? 56 : 48,
            height: isTablet ? 56 : 48,
            borderRadius: isTablet ? 28 : 24,
            backgroundColor: Colors.light.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Styles.shadow,
        },
        disabledButton: {
            opacity: 0.4,
            backgroundColor: '#F9FAFB',
        },
        moveDisplay: {
            paddingHorizontal: isTablet ? 32 : 24,
            paddingVertical: isTablet ? 16 : 12,
            backgroundColor: Colors.light.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.light.border,
            minWidth: isTablet ? 140 : 120,
            alignItems: 'center',
            ...Styles.shadow,
        },
        moveText: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: '700',
            color: Colors.light.text,
            fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
        },
        moveListContainer: {
            width: '100%',
            height: '100%',
            backgroundColor: Colors.light.card,
            borderRadius: 20,
            padding: isTablet ? 24 : 20,
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Styles.shadow,
        },
        moveListScroll: {
            flex: 1,
            maxHeight: isTablet ? 600 : 500,
        },
        moveListTitle: {
            fontSize: isTablet ? 20 : 18,
            fontWeight: '700',
            color: Colors.light.text,
            marginBottom: 16,
        },
        moveGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        moveItem: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: '#F9FAFB',
        },
        activeMove: {
            backgroundColor: '#DBEAFE',
        },
        moveItemText: {
            fontSize: isTablet ? 15 : 14,
            color: '#4B5563',
            fontWeight: '600',
            fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
        },
        activeMoveText: {
            color: '#1E40AF',
            fontWeight: '700',
        },
    });
};
