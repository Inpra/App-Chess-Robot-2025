import { X, AlertCircle } from 'lucide-react';
import '../../styles/ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    icon?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({ 
    isOpen, 
    title, 
    message, 
    icon,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm, 
    onCancel,
    variant = 'warning'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getVariantColor = () => {
        switch (variant) {
            case 'danger':
                return '#EF4444';
            case 'warning':
                return '#F59E0B';
            case 'info':
                return '#3B82F6';
        }
    };

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal">
                {/* Close button */}
                <button 
                    className="confirm-modal-close"
                    onClick={onCancel}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* Icon */}
                <div className="confirm-modal-icon" style={{ color: getVariantColor() }}>
                    {icon || <AlertCircle size={64} />}
                </div>

                {/* Title */}
                <h2 className="confirm-modal-title">{title}</h2>

                {/* Message */}
                <p className="confirm-modal-message">{message}</p>

                {/* Actions */}
                <div className="confirm-modal-actions">
                    <button 
                        className="confirm-modal-button confirm-modal-button-cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className="confirm-modal-button confirm-modal-button-confirm"
                        onClick={onConfirm}
                        style={{ backgroundColor: getVariantColor() }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
