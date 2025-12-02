import { Clock, Target, Zap, TrendingUp } from 'lucide-react';
import '../../styles/GameStatistics.css';

interface GameStatisticsProps {
  statistics?: {
    totalMoves: number;
    whiteMoves: number;
    blackMoves: number;
    captures: number;
    checks: number;
    averageMoveTimeSeconds: number;
    longestThinkingMove?: string;
    longestThinkingTimeSeconds: number;
  };
  durationSeconds?: number;
}

export default function GameStatistics({ statistics, durationSeconds }: GameStatisticsProps) {
  if (!statistics) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="game-statistics">
      <h3 className="statistics-title">Game Statistics</h3>
      
      <div className="statistics-grid">
        {/* Duration */}
        {durationSeconds && (
          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Duration</div>
              <div className="stat-value">{formatDuration(durationSeconds)}</div>
            </div>
          </div>
        )}

        {/* Total Moves */}
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Moves</div>
            <div className="stat-value">{statistics.totalMoves}</div>
            <div className="stat-detail">
              White: {statistics.whiteMoves} | Black: {statistics.blackMoves}
            </div>
          </div>
        </div>

        {/* Captures */}
        <div className="stat-card">
          <div className="stat-icon capture">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Captures</div>
            <div className="stat-value">{statistics.captures}</div>
          </div>
        </div>

        {/* Checks */}
        <div className="stat-card">
          <div className="stat-icon check">
            <Zap size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Checks</div>
            <div className="stat-value">{statistics.checks}</div>
          </div>
        </div>

        {/* Average Move Time */}
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg Move Time</div>
            <div className="stat-value">{formatTime(statistics.averageMoveTimeSeconds)}</div>
          </div>
        </div>

        {/* Longest Thinking */}
        {statistics.longestThinkingMove && (
          <div className="stat-card full-width">
            <div className="stat-icon thinking">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Longest Thinking</div>
              <div className="stat-value">{statistics.longestThinkingMove}</div>
              <div className="stat-detail">
                {formatTime(statistics.longestThinkingTimeSeconds)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
