import { PackageModal } from '@/components/tutorial/PackageModal';
import { TutorialBoard } from '@/components/tutorial/TutorialBoard';
import {
    createEmptyBoard,
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

    const [activeLessonId, setActiveLessonId] = useState(1);
    const [displayBoard, setDisplayBoard] = useState<any[]>(createEmptyBoard());
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState('basic');

    // Get lessons from selected package
    const lessons = lessonPackages.find(p => p.id === selectedPackage)?.lessons || [];

    // Get current lesson label
    const currentLessonLabel = lessons.find(l => l.id === activeLessonId)?.label || 'Pawn';
    const validMoves = lessonValidMoves[currentLessonLabel] || [];

    // Animation Effect
    useEffect(() => {
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
                const nextBoard = createEmptyBoard();
                // Move the piece from startPos to target
                nextBoard[target] = baseBoard[startPos];
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
    }, [activeLessonId, currentLessonLabel]);

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
                selectedPackage={selectedPackage}
                onClose={() => setShowPackageModal(false)}
                onSelectPackage={handlePackageSelect}
            />

            {/* Main Content Container */}
            <View style={styles.mainContainer}>
                {/* Chess Board */}
                <TutorialBoard board={displayBoard} validMoves={validMoves} />

                {/* Tutorial Content */}
                <View style={styles.tutorialSection}>
                    <ScrollView contentContainerStyle={styles.lessonPathContainer} showsVerticalScrollIndicator={false}>
                        {lessons.map((lesson, index) => {
                            const isActive = lesson.id === activeLessonId;
                            const isCompleted = lesson.id < activeLessonId;
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

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                        <Text style={styles.actionTitle}>Learn To Play Chess</Text>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setShowPackageModal(true)}
                            >
                                <Ionicons name="list" size={24} color={Colors.light.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={() => {
                                    if (activeLessonId < lessons.length) {
                                        handleLessonSelect(activeLessonId + 1);
                                    }
                                }}
                            >
                                <Text style={styles.nextButtonText}>Next Lesson</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
