import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const getTutorialStyles = ({ width, height }: { width: number, height: number }) => {
    const isLandscape = width > height;
    // In landscape, board takes 2/3. In portrait, it takes top part.
    const boardSize = isLandscape
        ? Math.min(width * 0.55, height - 140)
        : Math.min(width - 32, height * 0.5); // Added padding for portrait

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.light.background,
        },
        mainContainer: {
            flex: 1,
            flexDirection: isLandscape ? 'row' : 'column',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: Colors.light.background,
            borderBottomWidth: 0,
            zIndex: 10,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.light.text,
        },
        // Board Area
        boardContainer: {
            width: isLandscape ? '66.66%' : '100%',
            height: isLandscape ? '100%' : 'auto',
            backgroundColor: Colors.light.card, // Light card background
            justifyContent: 'center',
            alignItems: 'center',
            borderRightWidth: 0,
            padding: 20,
        },
        boardWrapper: {
            width: boardSize,
            height: boardSize,
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 8,
            },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
        },
        board: {
            width: '100%',
            height: '100%',
        },

        // Tutorial/Lesson Area
        tutorialSection: {
            flex: 1,
            backgroundColor: Colors.light.background,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: isLandscape ? 80 : 24,
            justifyContent: 'space-between',
        },

        // Lesson Path
        lessonPathContainer: {
            flexGrow: 1,
            alignItems: 'center',
            paddingVertical: 20,
            paddingBottom: 100, // Add extra padding at bottom for scrolling
        },
        lessonPathItem: {
            alignItems: 'center',
            marginBottom: 24,
            position: 'relative',
            zIndex: 1,
        },
        // Connecting line
        lessonLine: {
            position: 'absolute',
            top: 20, // Center of the tile
            bottom: -30, // Extend to next item
            width: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            zIndex: -1,
        },
        lessonLineActive: {
            backgroundColor: Colors.light.primary,
        },

        lessonTile: {
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: Colors.light.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: 'rgba(0, 0, 0, 0.06)',
        },
        lessonTileActive: {
            backgroundColor: Colors.light.primary,
            borderColor: Colors.light.primary,
            shadowColor: Colors.light.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
            transform: [{ scale: 1.1 }],
        },
        lessonTileCompleted: {
            backgroundColor: Colors.light.card,
            borderColor: Colors.light.primary,
        },

        // Action Bar
        actionBar: {
            marginTop: 'auto',
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.05)',
        },
        actionTitle: {
            color: Colors.light.text,
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 16,
            letterSpacing: 0.5,
        },
        actionRow: {
            flexDirection: 'row',
            gap: 12,
        },
        menuButton: {
            width: 52,
            height: 52,
            backgroundColor: Colors.light.card,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.06)',
        },
        nextButton: {
            flex: 1,
            height: 52,
            backgroundColor: Colors.light.primary,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            shadowColor: Colors.light.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 4,
        },
        nextButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },

        // Board Grid Overlay
        gridOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        square: {
            width: '12.5%',
            height: '12.5%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        selectedSquare: {
            backgroundColor: 'rgba(59, 130, 246, 0.4)', // Blue selection
        },
        possibleMoveDot: {
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            position: 'absolute',
        },

        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContent: {
            backgroundColor: Colors.light.card,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: Colors.light.text,
            marginBottom: 20,
            textAlign: 'center',
        },
        packageItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 16,
            backgroundColor: Colors.light.background,
            marginBottom: 12,
            borderWidth: 1.5,
            borderColor: 'rgba(0, 0, 0, 0.04)',
        },
        packageItemActive: {
            borderColor: Colors.light.primary,
            backgroundColor: Colors.light.primary + '10',
        },
        packageIcon: {
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: Colors.light.card,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        packageInfo: {
            flex: 1,
        },
        packageName: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.light.text,
            marginBottom: 4,
        },
        packageNameActive: {
            color: Colors.light.primary,
        },
        packageDescription: {
            fontSize: 14,
            color: Colors.light.icon,
            marginBottom: 4,
        },
        packageLessonCount: {
            fontSize: 12,
            color: Colors.light.icon,
            fontWeight: '500',
        },
    });
};
