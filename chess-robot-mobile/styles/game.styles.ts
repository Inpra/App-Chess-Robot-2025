import { Colors, Styles } from '@/constants/theme';
import { Platform, ScaledSize, StyleSheet } from 'react-native';

export const getGameStyles = ({ width, height }: ScaledSize) => {
    const isLandscape = width > height;
    const isTablet = width >= 600;
    const isCompact = !isLandscape && width < 600;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.light.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: isTablet ? 32 : 16,
            paddingVertical: isTablet ? 24 : 16,
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
            fontSize: isTablet ? 24 : 20,
            fontWeight: 'bold',
            color: Colors.light.text,
        },
        headerRight: {
            width: 40, // Balance the back button
        },
        contentContainer: {
            flex: 1,
            flexDirection: isLandscape ? 'row' : 'column',
            padding: isTablet ? 24 : 16,
            gap: isTablet ? 32 : 24,
        },
        boardSection: {
            flex: isLandscape ? 2 : 0,
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            width: isLandscape ? 'auto' : '100%',
        },
        matchHeader: {
            width: isLandscape ? height - 280 : '100%',
            maxWidth: 500,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors.light.card,
            borderRadius: 20,
            padding: 16,
            ...Styles.shadow,
        },
        playerSide: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flex: 1,
        },
        playerSideRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flex: 1,
            justifyContent: 'flex-end',
        },
        playerDetails: {
            justifyContent: 'center',
        },
        playerDetailsRight: {
            alignItems: 'flex-end',
        },
        avatarContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
        },
        playerName: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.light.text,
        },
        playerElo: {
            fontSize: 14,
            color: Colors.light.icon,
        },
        scoreContainer: {
            alignItems: 'center',
            paddingHorizontal: 16,
        },
        scoreText: {
            fontSize: 24,
            fontWeight: '800',
            color: Colors.light.text,
        },
        matchStatusText: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors.light.primary,
            marginTop: 4,
        },
        timerPill: {
            backgroundColor: '#F3F4F6',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            marginTop: 4,
        },
        timerText: {
            fontSize: 14,
            fontWeight: '700',
            color: Colors.light.text,
            fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
        },
        boardContainer: {
            width: '100%',
            aspectRatio: 1,
            maxHeight: isLandscape ? height - 280 : width - 32,
            maxWidth: 500,
            backgroundColor: Colors.light.card,
            borderRadius: 24,
            padding: 4,
            ...Styles.shadow,
        },
        boardPlaceholder: {
            width: '100%',
            height: '100%',
            position: 'relative',
        },
        gridOverlay: {
            ...StyleSheet.absoluteFillObject,
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        square: {
            width: '12.5%',
            height: '12.5%',
            alignItems: 'center',
            justifyContent: 'center',
        },
        selectedSquare: {
            backgroundColor: 'rgba(255, 255, 0, 0.5)', // Yellow highlight
        },
        possibleMove: {
            // Style for the square itself if needed, usually handled by the dot
        },
        possibleMoveDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
        checkSquare: {
            backgroundColor: 'rgba(255, 0, 0, 0.5)', // Red highlight
        },
        checkmateSquare: {
            backgroundColor: 'rgba(255, 0, 0, 0.8)', // Darker red
        },
        piece: {
            // Optional: add shadow or specific styling for pieces
        },

        playerInfoContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors.light.card,
            borderRadius: 16,
            padding: 16,
            marginHorizontal: isTablet ? 24 : 16,
            ...Styles.shadow,
        },
        playerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        timerContainer: {
            backgroundColor: '#F3F4F6',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        sidebar: {
            flex: 1,
            gap: 16,
            width: isLandscape ? 'auto' : '100%',
            maxWidth: isLandscape ? 400 : '100%',
        },
        controlsContainer: {
            flex: 1,
            gap: 24,
        },
        statusCard: {
            backgroundColor: Colors.light.card,
            padding: 20,
            borderRadius: 20,
            ...Styles.shadow,
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        statusTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: Colors.light.text,
        },
        statusText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.light.text,
        },
        statusIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        statusDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        dot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        actionsCard: {
            backgroundColor: Colors.light.card,
            padding: 20,
            borderRadius: 20,
            ...Styles.shadow,
            gap: 16,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: '#F8FAFC',
            gap: 12,
        },
        actionButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.light.text,
        },
        primaryButton: {
            backgroundColor: Colors.light.primary,
        },
        primaryButtonText: {
            color: '#FFFFFF',
        },
        historyContainer: {
            flex: 1,
            backgroundColor: Colors.light.card,
            borderRadius: 20,
            padding: 20,
            ...Styles.shadow,
            minHeight: 200,
        },
        historyTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: Colors.light.text,
        },
        historyList: {
            flex: 1,
        },
        historyItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#F1F5F9',
        },
        historyMove: {
            fontSize: 16,
            fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
            color: Colors.light.text,
        },
    });
};
