import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feedbackService from '../services/feedbackService';
import authService from '../services/authService';
import '../styles/FAQ.css';

const faqs = [
    {
        id: 1,
        question: 'How do I connect to the Robot Arm?',
        answer: 'Go to the "Vs Bot" game mode. Ensure your Robot Arm is powered on and Bluetooth is enabled on your device. The app will automatically scan for available robots.',
    },
    {
        id: 2,
        question: 'How do I top up points?',
        answer: 'Click on the Cart icon in the sidebar to visit the Store. Select a point package (Starter, Pro, or Grandmaster) and follow the payment instructions.',
    },
    {
        id: 3,
        question: 'Can I play offline?',
        answer: 'Yes, you can play against the built-in AI bot without an internet connection. However, online features like matchmaking and purchasing points require internet access.',
    },
    {
        id: 4,
        question: 'How is my ELO calculated?',
        answer: 'Your ELO rating is updated after every ranked match based on the result and your opponent\'s rating. Winning against a higher-rated opponent gives more points.',
    },
    {
        id: 5,
        question: 'What if the robot makes a wrong move?',
        answer: 'If the robot makes an invalid move or knocks over a piece, please pause the game using the pause button and manually adjust the board. You can then resume the game.',
    },
];

export default function FAQ() {
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    const user = authService.getCurrentUser();

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to submit feedback');
            navigate('/login');
            return;
        }

        if (feedbackMessage.trim().length < 10) {
            toast.error('Feedback must be at least 10 characters');
            return;
        }

        if (feedbackMessage.trim().length > 1000) {
            toast.error('Feedback cannot exceed 1000 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            await feedbackService.createFeedback(feedbackMessage.trim());
            toast.success('✓ Thank you for your feedback!');
            setFeedbackMessage('');
            setShowFeedbackForm(false);
        } catch (error: any) {
            console.error('Error submitting feedback:', error);
            toast.error(error.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="faq-container">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="faq-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Help & Support</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="faq-content">
                {/* Search Bar */}
                <div className="search-container">
                    <Search size={20} color="#9CA3AF" className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* FAQ List */}
                <div className="faq-list">
                    <h3 className="section-title">Frequently Asked Questions</h3>
                    {filteredFaqs.map((faq) => (
                        <div key={faq.id} className="faq-item">
                            <div
                                className="faq-header-item"
                                onClick={() => toggleExpand(faq.id)}
                            >
                                <span className={`faq-question ${expandedId === faq.id ? 'active-question' : ''}`}>
                                    {faq.question}
                                </span>
                                {expandedId === faq.id ? (
                                    <ChevronUp size={20} color="var(--color-primary)" />
                                ) : (
                                    <ChevronDown size={20} color="#9CA3AF" />
                                )}
                            </div>
                            {expandedId === faq.id && (
                                <div className="faq-body">
                                    <p className="faq-answer">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredFaqs.length === 0 && (
                        <p className="no-results-text">No results found.</p>
                    )}
                </div>

                {/* Feedback Form */}
                {showFeedbackForm && user && (
                    <div className="contact-card" style={{ marginTop: '24px' }}>
                        <h3 className="contact-title">Send us your feedback</h3>
                        <form onSubmit={handleSubmitFeedback}>
                            <textarea
                                className="feedback-textarea"
                                placeholder="Tell us what you think... (minimum 10 characters)"
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                rows={5}
                                maxLength={1000}
                                disabled={isSubmitting}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    marginBottom: '12px'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                    {feedbackMessage.length}/1000 characters
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowFeedbackForm(false);
                                            setFeedbackMessage('');
                                        }}
                                        disabled={isSubmitting}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            border: '1px solid #E5E7EB',
                                            backgroundColor: 'white',
                                            color: '#6B7280',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || feedbackMessage.trim().length < 10}
                                        className="contact-button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            opacity: isSubmitting || feedbackMessage.trim().length < 10 ? 0.5 : 1
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>Sending...</>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Feedback
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Contact Support */}
                {!showFeedbackForm && (
                    <div className="contact-card">
                        <div className="contact-icon-container">
                            <MessageCircle size={32} color="white" />
                        </div>
                        <h3 className="contact-title">Still need help?</h3>
                        <p className="contact-text">
                            {user
                                ? 'Share your feedback or report an issue. Our support team will review it as soon as possible.'
                                : 'Please login to send feedback or contact our support team.'}
                        </p>
                        <button
                            className="contact-button"
                            onClick={() => {
                                if (user) {
                                    setShowFeedbackForm(true);
                                } else {
                                    navigate('/login');
                                }
                            }}
                        >
                            {user ? 'Send Feedback' : 'Login to Send Feedback'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
