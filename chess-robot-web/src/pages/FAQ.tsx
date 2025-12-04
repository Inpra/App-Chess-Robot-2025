import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="faq-container">
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

                {/* Contact Support */}
                <div className="contact-card">
                    <div className="contact-icon-container">
                        <MessageCircle size={32} color="white" />
                    </div>
                    <h3 className="contact-title">Still need help?</h3>
                    <p className="contact-text">Our support team is available 24/7 to assist you with any issues.</p>
                    <button className="contact-button">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}
