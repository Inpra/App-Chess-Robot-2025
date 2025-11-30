import { useState } from 'react';
import { ArrowLeft, List, ArrowRight, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tutorial.css';

// Mock Data for Tutorial
const lessonPackages = [
    {
        id: 'basics',
        label: 'Chess Basics',
        description: 'Learn the rules and how pieces move.',
        lessons: [
            { id: 1, label: 'The Board', icon: 'grid', description: 'Understand the chessboard layout.' },
            { id: 2, label: 'The King', icon: 'crown', description: 'How the King moves and captures.' },
            { id: 3, label: 'The Queen', icon: 'diamond', description: 'The most powerful piece.' },
        ]
    },
    {
        id: 'tactics',
        label: 'Basic Tactics',
        description: 'Essential patterns to win games.',
        lessons: [
            { id: 4, label: 'Fork', icon: 'git-branch', description: 'Attacking two pieces at once.' },
            { id: 5, label: 'Pin', icon: 'map-pin', description: 'Immobilizing enemy pieces.' },
        ]
    }
];

export default function Tutorial() {
    const navigate = useNavigate();
    const selectedPackage = 'basics';
    const [activeLessonId, setActiveLessonId] = useState<number | null>(1);

    const currentPackage = lessonPackages.find(p => p.id === selectedPackage);
    const lessons = currentPackage ? currentPackage.lessons : [];

    return (
        <div className="tutorial-container">
            <div className="tutorial-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px', margin: 0 }}>Tutorial</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="tutorial-main-container">
                {/* Board Area */}
                <div className="board-container">
                    <div className="board-wrapper">
                        {/* Placeholder for Chess Board */}
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#EEE', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'url(https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png)', backgroundSize: 'cover' }}>
                            {/* Static image of a board for now */}
                        </div>
                    </div>
                </div>

                {/* Tutorial Content */}
                <div className="tutorial-section">
                    <div className="lesson-path-container">
                        {lessons.map((lesson, index) => {
                            const isActive = lesson.id === activeLessonId;
                            const isCompleted = activeLessonId ? lesson.id < activeLessonId : false;
                            const isLast = index === lessons.length - 1;

                            return (
                                <div
                                    key={lesson.id}
                                    className="lesson-path-item"
                                    onClick={() => setActiveLessonId(lesson.id)}
                                >
                                    <div className="lesson-left-col">
                                        {!isLast && (
                                            <div className={`lesson-line ${isCompleted || isActive ? 'active' : ''}`} />
                                        )}
                                        <div className={`lesson-tile ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                            <GraduationCap size={24} />
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

                    <div className="action-bar">
                        <div className="action-title">Learn To Play Chess</div>
                        <div className="action-row">
                            <div className="menu-button">
                                <List size={24} color="var(--color-icon)" />
                            </div>
                            <button className="next-button">
                                Next Lesson
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
