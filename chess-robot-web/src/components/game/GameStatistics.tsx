import { Clock, Target, Zap } from 'lucide-react';
import '../../styles/GameStatistics.css';

interface GameStatisticsProps {
  statistics?: {
    totalMoves: number;
    whiteMoves: number;
    blackMoves: number;
    captures: number;
    checks: number;
  } | null;
  durationSeconds?: number | null;
}

export default function GameStatistics({ statistics, durationSeconds }: GameStatisticsProps) {
  // Don't render if no statistics
  if (!statistics && !durationSeconds) return null;

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

        {statistics && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
