import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { BOARD_THEMES, BoardThemeId, useGameTheme } from './GameThemeContext';
import { getThemeSettingsStyles } from '@/styles/theme.styles';

interface ThemeSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ThemeSettingsModal({ visible, onClose }: ThemeSettingsModalProps) {
    const { boardThemeId, pieceStyleId, setBoardTheme, setPieceStyle } = useGameTheme();

    const styles = useMemo(() => getThemeSettingsStyles(), []);

    const renderBoardPreview = (themeId: BoardThemeId) => {
        const theme = BOARD_THEMES[themeId];
        return (
            <View style={styles.boardPreview}>
                {[...Array(8)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.boardSquare,
                            { backgroundColor: (Math.floor(i / 4) + i) % 2 === 0 ? theme.light : theme.dark }
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Game Theme</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Board Theme Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Board Color</Text>
                            <View style={styles.optionsGrid}>
                                {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((themeId) => (
                                    <TouchableOpacity
                                        key={themeId}
                                        style={[
                                            styles.optionCard,
                                            boardThemeId === themeId && styles.selectedOption
                                        ]}
                                        onPress={() => setBoardTheme(themeId)}
                                    >
                                        {renderBoardPreview(themeId)}
                                        <Text style={[
                                            styles.optionLabel,
                                            boardThemeId === themeId && { color: Colors.light.primary, fontWeight: 'bold' }
                                        ]}>
                                            {BOARD_THEMES[themeId].name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Piece Style Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Piece Style</Text>
                            <View style={styles.optionsGrid}>
                                <TouchableOpacity
                                    style={[
                                        styles.optionCard,
                                        pieceStyleId === 'classic' && styles.selectedOption
                                    ]}
                                    onPress={() => setPieceStyle('classic')}
                                >
                                    <View style={styles.piecePreview}>
                                        <Ionicons name="person" size={32} color="black" />
                                    </View>
                                    <Text style={[
                                        styles.optionLabel,
                                        pieceStyleId === 'classic' && { color: Colors.light.primary, fontWeight: 'bold' }
                                    ]}>
                                        Classic
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.optionCard,
                                        pieceStyleId === 'silhouette' && styles.selectedOption
                                    ]}
                                    onPress={() => setPieceStyle('silhouette')}
                                >
                                    <View style={styles.piecePreview}>
                                        <Ionicons
                                            name="person"
                                            size={32}
                                            color="black"
                                            style={{
                                                color: '#000000',
                                                shadowColor: "#000",
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.5,
                                                shadowRadius: 3,
                                            }}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.optionLabel,
                                        pieceStyleId === 'silhouette' && { color: Colors.light.primary, fontWeight: 'bold' }
                                    ]}>
                                        Silhouette
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.saveButton} onPress={onClose}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
