import { Colors, Styles } from '@/constants/theme';
import { Platform, ScaledSize, StyleSheet } from 'react-native';

export const getMatchDetailStyles = ({ width, height }: ScaledSize) => {
    const isTablet = width >= 600;
    // Calculate board size for two-column layout (board now gets ~70% of width)
    const availableWidth = width - (isTablet ? 64 : 40); // Subtract padding
    const leftColumnWidth = availableWidth * 0.7; // Left column is 70% of available width
    const boardSize = Math.min(leftColumnWidth - (isTablet ? 32 : 24), isTablet ? 500 : 360);

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
            gap: isTablet ? 20 : 16,
            width: '100%',
            flex: 1,
        },
        leftColumn: {
            flex: 3,
            alignItems: 'center',
        },
        rightColumn: {
            flex: 1.2,
            minWidth: isTablet ? 200 : 150,
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
            marginBottom: 20,
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
            gap: isTablet ? 20 : 16,
            marginTop: isTablet ? 16 : 12,
            paddingHorizontal: isTablet ? 12 : 8,
        },
        controlButton: {
            width: isTablet ? 48 : 44,
            height: isTablet ? 48 : 44,
            borderRadius: isTablet ? 24 : 22,
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
            paddingHorizontal: isTablet ? 20 : 16,
            paddingVertical: isTablet ? 12 : 10,
            backgroundColor: Colors.light.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.light.border,
            minWidth: isTablet ? 100 : 90,
            alignItems: 'center',
            ...Styles.shadow,
        },
        moveText: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: '700',
            color: Colors.light.text,
            fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
        },
        moveListContainer: {
            width: '100%',
            maxHeight: isTablet ? 450 : 380,
            backgroundColor: Colors.light.card,
            borderRadius: 16,
            padding: isTablet ? 16 : 12,
            borderWidth: 1,
            borderColor: Colors.light.border,
            ...Styles.shadow,
        },
        moveListScroll: {
            flexGrow: 0,
            flexShrink: 1,
        },
        moveListTitle: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: '700',
            color: Colors.light.text,
            marginBottom: 12,
        },
        moveGrid: {
            flexDirection: 'column',
            gap: 6,
        },
        moveItem: {
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#F9FAFB',
            width: '100%',
        },
        activeMove: {
            backgroundColor: '#DBEAFE',
        },
        moveItemText: {
            fontSize: isTablet ? 14 : 13,
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
