import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getThemeSettingsStyles = () => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionCard: {
        width: '48%',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        padding: 4,
        overflow: 'hidden',
    },
    selectedOption: {
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary + '10',
    },
    boardPreview: {
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    boardSquare: {
        width: '25%',
        height: '50%',
    },
    optionLabel: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 4,
    },
    piecePreview: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 8,
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        margin: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
