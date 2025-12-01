import { useState, useEffect } from 'react';
import { ArrowLeft, List, ArrowRight, CheckCircle, GraduationCap, PawPrint, Zap, Shield, Ribbon, Star, Trophy, ArrowLeftRight, ArrowUpCircle, XCircle, GitMerge, GitGraph, MinusCircle, Repeat, GitBranch, MapPin, CornerUpRight, Eye, Grid, Rocket, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tutorial.css';
import { TutorialBoard } from '../components/tutorial/TutorialBoard';
import { PackageModal } from '../components/tutorial/PackageModal';
import { PromotionModal } from '../components/tutorial/PromotionModal';
import {
    createStandardBoard,
    lessonBoards,
    lessonComplexMoves,
    lessonPackages,
    lessonStartPositions,
    lessonValidMoves
} from '../constants/lessonData';

export default function Tutorial() {
    const navigate = useNavigate();

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
        const baseBoard = lessonBoards[label];
        const complexMoves = lessonComplexMoves[label]; // Check for complex moves
        const startPos = lessonStartPositions[label];
        const moves = lessonValidMoves[label] || [];

        // Reset to initial state immediately when lesson changes
        setDisplayBoard([...baseBoard]);

        if (!complexMoves && !moves.length) return;

        let moveIndex = 0;
        let showingStart = true;

        const timer = setInterval(() => {
            if (complexMoves) {
                // Logic for complex moves (multiple pieces)

                if (moveIndex === -1) {
                    // Show start position (reset state)
                    setDisplayBoard([...baseBoard]);
                } else {
                    // Rebuild board state from baseBoard + moves up to moveIndex
                    const currentBoard = [...baseBoard];

                    // Apply moves up to current index
                    for (let i = 0; i <= moveIndex; i++) {
                        const m = complexMoves[i];
                        // Move piece
                        currentBoard[m.to] = currentBoard[m.from];
                        currentBoard[m.from] = null;
                    }
                    setDisplayBoard(currentBoard);
                }

                moveIndex++;
                if (moveIndex >= complexMoves.length) {
                    moveIndex = -1; // Reset loop to start position
                }

            } else {
                // Logic for simple single-piece moves (Old logic)
                if (showingStart) {
                    // Move piece to the next valid target
                    const target = moves[moveIndex];
                    // Copy the base board to keep all other pieces
                    const nextBoard = [...baseBoard];
                    // Clear the start position
                    nextBoard[startPos] = null;
                    // Move the piece to target position
                    nextBoard[target] = baseBoard[startPos];

                    // Special case for En Passant
                    if (label === 'En Passant' && target === 20) {
                        nextBoard[28] = null;
                    }

                    // Special case for Promotion
                    if (label === 'Promotion' && target === 0) {
                        setShowPromotionModal(true);
                        nextBoard[target] = { type: promotedPiece, color: 'w' };
                    }

                    // Special case for Short Castling
                    if (label === 'Short Castling' && target === 62) {
                        nextBoard[63] = null;
                        nextBoard[61] = { type: 'r', color: 'w' };
                    }

                    // Special case for Long Castling
                    if (label === 'Long Castling' && target === 58) {
                        nextBoard[56] = null;
                        nextBoard[59] = { type: 'r', color: 'w' };
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
            }
        }, 1500); // 1.5 seconds per move

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

    const getIcon = (iconName: string) => {
        const props = { size: 24 };
        switch (iconName) {
            case 'paw': return <PawPrint {...props} />;
            case 'flash': return <Zap {...props} />;
            case 'shield': return <Shield {...props} />;
            case 'ribbon': return <Ribbon {...props} />;
            case 'star': return <Star {...props} />;
            case 'trophy': return <Trophy {...props} />;
            case 'swap-horizontal': return <ArrowLeftRight {...props} />;
            case 'arrow-up-circle': return <ArrowUpCircle {...props} />;
            case 'close-circle': return <XCircle {...props} />;
            case 'git-merge': return <GitMerge {...props} />;
            case 'git-network': return <GitGraph {...props} />;
            case 'remove-circle': return <MinusCircle {...props} />;
            case 'repeat': return <Repeat {...props} />;
            case 'git-branch': return <GitBranch {...props} />;
            case 'pin': return <MapPin {...props} />;
            case 'arrow-redo': return <CornerUpRight {...props} />;
            case 'eye': return <Eye {...props} />;
            case 'grid': return <Grid {...props} />;
            case 'rocket': return <Rocket {...props} />;
            case 'shield-checkmark': return <ShieldCheck {...props} />;
            case 'checkmark-done-circle': return <CheckCircle {...props} />;
            case 'checkmark-circle': return <CheckCircle {...props} />;
            default: return <GraduationCap {...props} />;
        }
    };

    return (
        <div className="tutorial-container">
            <div className="tutorial-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px', margin: 0 }}>Tutorial</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <PackageModal
                visible={showPackageModal}
                packages={lessonPackages}
                selectedPackage={selectedPackage || ''}
                onClose={() => setShowPackageModal(false)}
                onSelectPackage={handlePackageSelect}
            />

            <PromotionModal
                visible={showPromotionModal}
                onClose={() => setShowPromotionModal(false)}
                onSelectPiece={handlePromotionSelect}
            />

            <div className="tutorial-main-container">
                {/* Board Area */}
                <TutorialBoard board={displayBoard} validMoves={validMoves} />

                {/* Tutorial Content */}
                <div className="tutorial-section">
                    <div className="tutorial-scroll-area">
                        {selectedPackage ? (
                            <div className="lesson-path-container">
                                {lessons.map((lesson, index) => {
                                    const isActive = lesson.id === activeLessonId;
                                    const isCompleted = activeLessonId ? lesson.id < activeLessonId : false;
                                    const isLast = index === lessons.length - 1;

                                    return (
                                        <div
                                            key={lesson.id}
                                            className="lesson-path-item"
                                            onClick={() => handleLessonSelect(lesson.id)}
                                        >
                                            <div className="lesson-left-col">
                                                {!isLast && (
                                                    <div className={`lesson-line ${isCompleted || isActive ? 'active' : ''}`} />
                                                )}
                                                <div className={`lesson-tile ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                                    <div style={{ color: isActive ? '#FFF' : (isCompleted ? 'var(--color-primary)' : 'var(--color-icon)') }}>
                                                        {getIcon(lesson.icon)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="lesson-content">
                                                {isActive ? (
                                                    <div className="lesson-card-active">
                                                        <div className="lesson-title-active">{lesson.label}</div>
                                                        <div className="lesson-desc">{lesson.description}</div>
                                                    </div>
                                                ) : (
                                                    <div className="lesson-title-inactive" style={{ color: isCompleted ? 'var(--color-text)' : 'var(--color-icon)', fontWeight: isCompleted ? 600 : 400 }}>
                                                        {lesson.label}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <GraduationCap size={64} color="var(--color-icon)" style={{ opacity: 0.3, marginBottom: 16 }} />
                                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8, textAlign: 'center' }}>Welcome to Tutorial</div>
                                <div style={{ fontSize: 14, color: 'var(--color-icon)', textAlign: 'center', marginBottom: 24 }}>Tap the list icon below to select a course</div>
                            </div>
                        )}
                    </div>

                    <div className="action-bar">
                        <div className="action-title">{selectedPackage ? 'Learn To Play Chess' : 'Select a course to start'}</div>
                        <div className="action-row">
                            <div
                                className="menu-button"
                                onClick={() => setShowPackageModal(true)}
                            >
                                <List size={24} color="var(--color-icon)" />
                            </div>
                            <button
                                className="next-button"
                                onClick={() => {
                                    if (activeLessonId && lessons.length > 0 && !isLastLesson) {
                                        const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
                                        if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
                                            handleLessonSelect(lessons[currentIndex + 1].id);
                                        }
                                    }
                                }}
                                disabled={!selectedPackage || !activeLessonId || isLastLesson}
                                style={{ opacity: (!selectedPackage || !activeLessonId || isLastLesson) ? 0.5 : 1 }}
                            >
                                {isLastLesson ? 'Completed' : 'Next Lesson'}
                                {isLastLesson ? <CheckCircle size={20} style={{ marginLeft: 8 }} /> : <ArrowRight size={20} style={{ marginLeft: 8 }} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
