import { X } from 'lucide-react';
import { getPieceImageSource } from '../../constants/lessonData';

interface PromotionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectPiece: (piece: 'q' | 'r' | 'b' | 'n') => void;
}

export const PromotionModal = ({ visible, onClose, onSelectPiece }: PromotionModalProps) => {
    if (!visible) return null;

    const pieces: ('q' | 'r' | 'b' | 'n')[] = ['q', 'r', 'b', 'n'];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 className="modal-title" style={{ margin: 0 }}>Promote Pawn</h3>
                    <div onClick={onClose} style={{ cursor: 'pointer', padding: 4 }}>
                        <X size={24} color="var(--color-text)" />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16 }}>
                    {pieces.map((p) => (
                        <div
                            key={p}
                            onClick={() => {
                                onSelectPiece(p);
                                onClose();
                            }}
                            style={{
                                width: 64,
                                height: 64,
                                backgroundColor: '#F3F4F6',
                                borderRadius: 12,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <img
                                src={getPieceImageSource(p, 'w')}
                                alt={p}
                                style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
