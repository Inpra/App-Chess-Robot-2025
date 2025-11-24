import { PackageModal } from '@/components/tutorial/PackageModal';
import { PromotionModal } from '@/components/tutorial/PromotionModal';
import { TutorialBoard } from '@/components/tutorial/TutorialBoard';
import {
    createStandardBoard,
    lessonBoards,
    lessonPackages,
    lessonStartPositions,
    lessonValidMoves
} from '@/constants/lessonData';
import { Colors } from '@/constants/theme';
import { getTutorialStyles } from '@/styles/tutorial.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export function TutorialScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getTutorialStyles(dimensions), [dimensions]);
    const router = useRouter();

    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [displayBoard, setDisplayBoard] = useState<any[]>(createStandardBoard());
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [promotedPiece, setPromotedPiece] = useState<'q' | 'r' | 'b' | 'n'>('q');

    // Get lessons from selected package
    const lessons = selectedPackage ? lessonPackages.find(p => p.id === selectedPackage)?.lessons || [] : [];

    // Get current lesson label
    const currentLessonLabel = activeLessonId ? lessons.find(l => l.id === activeLessonId)?.label || '' : '';
    const validMoves = currentLessonLabel ? lessonValidMoves[currentLessonLabel] || [] : [];

    // Check if current lesson is the last one
    const currentLessonIndex = activeLessonId ? lessons.findIndex(l => l.id === activeLessonId) : -1;
    const isLastLesson = currentLessonIndex !== -1 && currentLessonIndex === lessons.length - 1;

    // Animation Effect
    useEffect(() => {
        // If no lesson selected, show standard board
        if (!currentLessonLabel || !activeLessonId) {
            setDisplayBoard(createStandardBoard());
            return;
        }

        const label = currentLessonLabel;
        const startPos = lessonStartPositions[label];
        const moves = lessonValidMoves[label] || [];
        const baseBoard = lessonBoards[label];

        // Reset to initial state immediately when lesson changes
        setDisplayBoard([...baseBoard]);

        if (!moves.length) return;

        let moveIndex = 0;
        let showingStart = true;

        const timer = setInterval(() => {
            if (showingStart) {
                // Move piece to the next valid target
                const target = moves[moveIndex];
                // Copy the base board to keep all other pieces
                const nextBoard = [...baseBoard];
                // Clear the start position
                nextBoard[startPos] = null;
                // Move the piece to target position
                nextBoard[target] = baseBoard[startPos];

                // Special case for En Passant: remove the captured pawn
                if (label === 'En Passant' && target === 20) {
                    // Remove Black pawn at e5 (position 28)
                    nextBoard[28] = null;
                }

                // Special case for Promotion: show modal and change piece
                if (label === 'Promotion' && target === 0) {
                    setShowPromotionModal(true);
                    // Change pawn to promoted piece
                    nextBoard[target] = { type: promotedPiece, color: 'w' };
                }

                setDisplayBoard(nextBoard);

                showingStart = false;
            } else {
                // Return piece to start position
                setDisplayBoard([...baseBoard]);

                showingStart = true;
                // Advance to next move index
                moveIndex = (moveIndex + 1) % moves.length;
            }
        }, 2000); // Switch every 2000ms (2 seconds)

        return () => clearInterval(timer);
    }, [activeLessonId, currentLessonLabel, promotedPiece]);

    const handleLessonSelect = (id: number) => {
        setActiveLessonId(id);
    };

    const handlePackageSelect = (packageId: string) => {
        setSelectedPackage(packageId);
        setShowPackageModal(false);
        // Reset to first lesson of the new package
        const newPackage = lessonPackages.find(p => p.id === packageId);
        if (newPackage && newPackage.lessons.length > 0) {
            setActiveLessonId(newPackage.lessons[0].id);
        }
    };

    const handlePromotionSelect = (pieceType: 'q' | 'r' | 'b' | 'n') => {
        setPromotedPiece(pieceType);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tutorial</Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            {/* Package Selection Modal */}
            <PackageModal
                visible={showPackageModal}
                packages={lessonPackages}
                selectedPackage={selectedPackage || ''}
                onClose={() => setShowPackageModal(false)}
                onSelectPackage={handlePackageSelect}
            />

            {/* Promotion Modal */}
            <PromotionModal
                visible={showPromotionModal}
                onClose={() => setShowPromotionModal(false)}
                onSelectPiece={handlePromotionSelect}
            />

            {/* Main Content Container */}
            <View style={styles.mainContainer}>
                {/* Chess Board */}
                <TutorialBoard board={displayBoard} validMoves={validMoves} />

                {/* Tutorial Content */}
                <View style={styles.tutorialSection}>
                    {selectedPackage ? (
                        <ScrollView contentContainerStyle={styles.lessonPathContainer} showsVerticalScrollIndicator={false}>
                            {lessons.map((lesson, index) => {
                                const isActive = lesson.id === activeLessonId;
                                const isCompleted = activeLessonId ? lesson.id < activeLessonId : false;
                                const isLast = index === lessons.length - 1;

                                return (
                                    <TouchableOpacity
                                        key={lesson.id}
                                        style={styles.lessonPathItem}
                                        onPress={() => handleLessonSelect(lesson.id)}
                                        activeOpacity={0.8}
                                    >
                                        {!isLast && (
                                            <View style={[
                                                styles.lessonLine,
                                                (isCompleted || isActive) && styles.lessonLineActive
                                            ]} />
                                        )}

                                        <View style={[
                                            styles.lessonTile,
                                            isActive && styles.lessonTileActive,
                                            isCompleted && styles.lessonTileCompleted
                                        ]}>
                                            <Ionicons
                                                name={lesson.icon as any}
                                                size={24}
                                                color={isActive ? '#FFF' : (isCompleted ? Colors.light.primary : Colors.light.icon)}
                                            />
                                        </View>

                                        {isActive && (
                                            <View style={{ position: 'absolute', right: -80, backgroundColor: Colors.light.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.light.border }}>
                                                <Text style={{ color: Colors.light.text, fontWeight: '600', fontSize: 14 }}>{lesson.label}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                            <Ionicons name="school-outline" size={64} color={Colors.light.icon} style={{ opacity: 0.3, marginBottom: 16 }} />
                            <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.light.text, marginBottom: 8, textAlign: 'center' }}>Chào mừng đến với Tutorial</Text>
                            <Text style={{ fontSize: 14, color: Colors.light.icon, textAlign: 'center', marginBottom: 24 }}>Nhấn vào icon danh sách bên dưới để chọn khóa học</Text>
                        </View>
                    )}

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <Text style={styles.actionTitle}>{selectedPackage ? 'Learn To Play Chess' : 'Chọn khóa học để bắt đầu'}</Text>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setShowPackageModal(true)}
                            >
                                <Ionicons name="list" size={24} color={Colors.light.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    (!selectedPackage || !activeLessonId || isLastLesson) && { opacity: 0.5 }
                                ]}
                                onPress={() => {
                                    if (activeLessonId && lessons.length > 0 && !isLastLesson) {
                                        // Find current lesson index
                                        const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
                                        // Check if there's a next lesson
                                        if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
                                            handleLessonSelect(lessons[currentIndex + 1].id);
                                        }
                                    }
                                }}
                                disabled={!selectedPackage || !activeLessonId || isLastLesson}
                            >
                                <Text style={styles.nextButtonText}>
                                    {isLastLesson ? 'Completed' : 'Next Lesson'}
                                </Text>
                                <Ionicons
                                    name={isLastLesson ? 'checkmark-circle' : 'arrow-forward'}
                                    size={20}
                                    color="#FFF"
                                    style={{ marginLeft: 8 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
