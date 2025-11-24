import { getPieceImageSource } from '@/constants/lessonData';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PromotionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPiece: (pieceType: 'q' | 'r' | 'b' | 'n') => void;
}

export function PromotionModal({ visible, onClose, onSelectPiece }: PromotionModalProps) {
    const pieces: Array<{ type: 'q' | 'r' | 'b' | 'n'; name: string }> = [
        { type: 'q', name: 'Queen' },
        { type: 'r', name: 'Rook' },
        { type: 'b', name: 'Bishop' },
        { type: 'n', name: 'Knight' },
    ];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Ionicons name="trophy" size={32} color={Colors.light.primary} />
                            <Text style={styles.title}>Pawn Promotion</Text>
                        </View>
                        <Text style={styles.subtitle}>Choose a piece to promote to:</Text>

                        <View style={styles.piecesContainer}>
                            {pieces.map((piece) => {
                                const imageSource = getPieceImageSource(piece.type, 'w');
                                return (
                                    <TouchableOpacity
                                        key={piece.type}
                                        style={styles.pieceButton}
                                        onPress={() => {
                                            onSelectPiece(piece.type);
                                            onClose();
                                        }}
                                    >
                                        <View style={styles.pieceImageContainer}>
                                            {imageSource && (
                                                <Image
                                                    source={imageSource}
                                                    style={styles.pieceImage}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        </View>
                                        <Text style={styles.pieceName}>{piece.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: Colors.light.card,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.icon,
        textAlign: 'center',
        marginBottom: 24,
    },
    piecesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 16,
        marginBottom: 24,
    },
    pieceButton: {
        alignItems: 'center',
        width: '45%',
        padding: 16,
        backgroundColor: Colors.light.background,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    pieceImageContainer: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    pieceImage: {
        width: '100%',
        height: '100%',
    },
    pieceName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    cancelButton: {
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.icon,
    },
});
