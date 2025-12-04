import { X, Book, School, Lightbulb, Compass } from 'lucide-react';

interface PackageModalProps {
    visible: boolean;
    packages: any[];
    selectedPackage: string;
    onClose: () => void;
    onSelectPackage: (id: string) => void;
}

export const PackageModal = ({ visible, packages, selectedPackage, onClose, onSelectPackage }: PackageModalProps) => {
    if (!visible) return null;

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'school': return <School size={24} color="var(--color-primary)" />;
            case 'book': return <Book size={24} color="var(--color-primary)" />;
            case 'bulb': return <Lightbulb size={24} color="var(--color-primary)" />;
            case 'compass': return <Compass size={24} color="var(--color-primary)" />;
            default: return <School size={24} color="var(--color-primary)" />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 className="modal-title" style={{ margin: 0 }}>Select Course</h3>
                    <div onClick={onClose} style={{ cursor: 'pointer', padding: 4 }}>
                        <X size={24} color="var(--color-text)" />
                    </div>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {packages.map((pkg) => {
                        const isActive = pkg.id === selectedPackage;
                        return (
                            <div
                                key={pkg.id}
                                className={`package-item ${isActive ? 'active' : ''}`}
                                onClick={() => onSelectPackage(pkg.id)}
                            >
                                <div className="package-icon">
                                    {getIcon(pkg.icon)}
                                </div>
                                <div className="package-info">
                                    <div className={`package-name ${isActive ? 'active' : ''}`}>{pkg.name}</div>
                                    <div className="package-description">{pkg.description}</div>
                                    <div className="package-lesson-count">{pkg.lessons.length} Lessons</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
