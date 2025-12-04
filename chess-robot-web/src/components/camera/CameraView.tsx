import { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import './CameraView.css';

export interface CameraViewProps {
    /** Camera stream URL */
    streamUrl: string;
    /** Title of camera view */
    title?: string;
    /** Enable fullscreen toggle */
    allowFullscreen?: boolean;
    /** Show refresh button */
    showRefresh?: boolean;
    /** Custom className */
    className?: string;
    /** Callback when connection status changes */
    onConnectionChange?: (connected: boolean) => void;
}

export const CameraView = ({
    streamUrl,
    title = 'Camera Feed',
    allowFullscreen = true,
    showRefresh = true,
    className = '',
    onConnectionChange,
}: CameraViewProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setIsConnected(false);
    }, [streamUrl, refreshKey]);

    const handleImageLoad = () => {
        setIsLoading(false);
        setIsConnected(true);
        setError(null);
        onConnectionChange?.(true);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setIsConnected(false);
        setError('Failed to connect to camera stream');
        onConnectionChange?.(false);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!isFullscreen) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`camera-view-container ${isFullscreen ? 'fullscreen' : ''} ${className}`}
        >
            {/* Header */}
            <div className="camera-view-header">
                <div className="camera-view-title">
                    {isConnected ? (
                        <Camera size={18} className="camera-icon connected" />
                    ) : (
                        <CameraOff size={18} className="camera-icon disconnected" />
                    )}
                    <span>{title}</span>
                </div>

                <div className="camera-view-controls">
                    {/* Connection Status */}
                    <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        <div className="status-dot" />
                        <span className="status-text">
                            {isConnected ? 'Live' : 'Offline'}
                        </span>
                    </div>

                    {/* Refresh Button */}
                    {showRefresh && (
                        <button
                            className="camera-control-btn"
                            onClick={handleRefresh}
                            title="Refresh stream"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}

                    {/* Fullscreen Toggle */}
                    {allowFullscreen && (
                        <button
                            className="camera-control-btn"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Video Stream */}
            <div className="camera-view-content">
                {isLoading && (
                    <div className="camera-view-overlay loading">
                        <div className="spinner" />
                        <p>Connecting to camera...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="camera-view-overlay error">
                        <CameraOff size={48} />
                        <p>{error}</p>
                        <button className="retry-btn" onClick={handleRefresh}>
                            Try Again
                        </button>
                    </div>
                )}

                <img
                    ref={imgRef}
                    src={streamUrl}
                    alt="Camera Stream"
                    className="camera-stream"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ display: isLoading || error ? 'none' : 'block' }}
                />
            </div>
        </div>
    );
};

export default CameraView;
