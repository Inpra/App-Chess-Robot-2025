import { Colors } from '@/constants/theme';
import { Platform, StyleSheet } from 'react-native';

export const puzzleListStyles = StyleSheet.create({
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
    listContent: {
        padding: 16,
    },
    puzzleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainerSolved: {
        backgroundColor: '#D1FAE5',
    },
    puzzleInfo: {
        flex: 1,
    },
    puzzleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    puzzleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    puzzleRating: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 8,
    },
    puzzleTheme: {
        fontSize: 14,
        color: Colors.light.primary,
        fontWeight: '500',
    },
    puzzleDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 18,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        backgroundColor: Colors.light.background,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: Colors.light.card,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
});
