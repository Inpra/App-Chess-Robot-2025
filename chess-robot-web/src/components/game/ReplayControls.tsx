import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react';
import '../../styles/ReplayControls.css';

interface ReplayControlsProps {
  isPlaying: boolean;
  currentMove: number;
  totalMoves: number;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  onSpeedChange: (speed: number) => void;
  onMoveSelect: (moveIndex: number) => void;
}

export default function ReplayControls({
  isPlaying,
  currentMove,
  totalMoves,
  playbackSpeed,
  onPlay,
  onPause,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onSpeedChange,
  onMoveSelect,
}: ReplayControlsProps) {
  const speeds = [0.5, 1, 1.5, 2];

  return (
    <div className="replay-controls">
      {/* Progress Bar */}
      <div className="replay-progress">
        <input
          type="range"
          min="0"
          max={totalMoves}
          value={currentMove}
          onChange={(e) => onMoveSelect(parseInt(e.target.value))}
          className="replay-slider"
        />
        <div className="replay-progress-text">
          Move {currentMove} / {totalMoves}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="replay-buttons">
        <button
          onClick={onFirst}
          className="replay-btn"
          disabled={currentMove === 0}
          title="First move"
        >
          <Rewind size={20} />
        </button>

        <button
          onClick={onPrevious}
          className="replay-btn"
          disabled={currentMove === 0}
          title="Previous move"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="replay-btn replay-btn-primary"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={onNext}
          className="replay-btn"
          disabled={currentMove >= totalMoves}
          title="Next move"
        >
          <SkipForward size={20} />
        </button>

        <button
          onClick={onLast}
          className="replay-btn"
          disabled={currentMove >= totalMoves}
          title="Last move"
        >
          <FastForward size={20} />
        </button>
      </div>

      {/* Speed Control */}
      <div className="replay-speed">
        <span className="replay-speed-label">Speed:</span>
        {speeds.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`replay-speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
