import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Home,
  Gamepad2,
  Clock,
  GraduationCap,
  Puzzle,
  Trophy,
  ShoppingCart,
  Palette,
  Headphones,
  Search,
  Bell,
  Zap,
  Cpu
} from 'lucide-react';
import './styles/Dashboard.css';
import MatchHistory from './pages/MatchHistory';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Puzzles from './pages/Puzzles';
import PuzzleGame from './pages/PuzzleGame';
import Tutorial from './pages/Tutorial';
import DifficultySelect from './pages/DifficultySelect';
import VsBot from './pages/VsBot';
import MatchDetail from './pages/MatchDetail';
import PurchasePoints from './pages/PurchasePoints';
import PointsHistory from './pages/PointsHistory';
import FAQ from './pages/FAQ';
import ThemeSettings from './pages/ThemeSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function Dashboard() {
  const navigate = useNavigate();
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div
          className="sidebar-icon active"
          onClick={() => navigate('/')}
        >
          <Home size={24} />
        </div>
        <div
          className="sidebar-icon"
          onClick={() => setShowDifficultyModal(true)}
        >
          <Gamepad2 size={28} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/match-history')}>
          <Clock size={24} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/tutorial')}>
          <GraduationCap size={24} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/puzzles')}>
          <Puzzle size={24} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/ranking')}>
          <Trophy size={24} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/purchase-points')}>
          <ShoppingCart size={24} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/theme-settings')}>
          <Palette size={24} />
        </div>
        <div className="sidebar-icon" onClick={() => navigate('/faq')}>
          <Headphones size={24} />
        </div>

        <div style={{ flex: 1 }}></div>

        <div className="sidebar-icon" onClick={() => navigate('/profile')}>
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="Profile"
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-title">
            <h1>Dashboard</h1>
            <div className="header-subtitle">Welcome back, John! You have 2 pending matches.</div>
          </div>

          <div className="header-actions">
            <div className="search-bar">
              <Search size={20} color="var(--color-icon)" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
            </div>
            <button className="notification-btn">
              <Bell size={24} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' }}></div>
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="banner">
          <div className="banner-content">
            <div className="banner-tag">SEASON 5</div>
            <h2 className="banner-title">Winter Championship</h2>
            <p className="banner-text">Join the tournament and win exclusive prizes.</p>
            <button className="banner-button">Register Now</button>
          </div>
          <Trophy size={140} color="#FFD700" style={{ opacity: 0.9 }} />
        </div>

        {/* Dashboard Grid */}
        <div className="grid-container">
          {/* Quick Play */}
          <div className="card">
            <h3 className="card-title">Quick Play</h3>
            <div className="quick-play-grid">
              <div className="quick-play-item">
                <Zap size={32} color="#F59E0B" />
                <div className="quick-play-text">Blitz</div>
              </div>
              <div className="quick-play-item">
                <Clock size={32} color="#10B981" />
                <div className="quick-play-text">Rapid</div>
              </div>
              <div className="quick-play-item">
                <Cpu size={32} color="#8B5CF6" />
                <div className="quick-play-text">Vs Bot</div>
              </div>
              <div className="quick-play-item" onClick={() => navigate('/puzzles')}>
                <Puzzle size={32} color="#EC4899" />
                <div className="quick-play-text">Puzzles</div>
              </div>
            </div>
          </div>

          {/* Your Stats */}
          <div className="card">
            <h3 className="card-title">Your Stats</h3>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-value">2450</div>
                <div className="stat-label">ELO</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">142</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">58%</div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>
            {/* Simple Graph Placeholder */}
            <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' }}>
              {[40, 60, 50, 80, 70, 90, 60].map((h, i) => (
                <div key={i} style={{ width: 8, height: `${h}%`, backgroundColor: 'var(--color-primary)', borderRadius: 4, opacity: 0.5 }}></div>
              ))}
            </div>
          </div>

          {/* Live Rankings */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Live Rankings</h3>
              <a onClick={() => navigate('/ranking')} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}>View All</a>
            </div>

            <div className="ranking-list">
              {[
                { rank: 1, name: 'Grandmaster 1', score: 2801 },
                { rank: 2, name: 'Grandmaster 2', score: 2802 },
                { rank: 3, name: 'Grandmaster 3', score: 2803 },
                { rank: 4, name: 'Grandmaster 4', score: 2804 },
              ].map((item, index) => (
                <div key={index} className="ranking-item">
                  <div className="rank-number">{item.rank}</div>
                  <div className="rank-avatar"></div>
                  <div className="rank-name">{item.name}</div>
                  <div className="rank-score">{item.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Select Modal */}
      {showDifficultyModal && (
        <DifficultySelect onClose={() => setShowDifficultyModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/game/vs-bot" element={<VsBot />} />
        <Route path="/match-history" element={<MatchHistory />} />
        <Route path="/match-history/:id" element={<MatchDetail />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/puzzles" element={<Puzzles />} />
        <Route path="/puzzles/:id" element={<PuzzleGame />} />
        <Route path="/purchase-points" element={<PurchasePoints />} />
        <Route path="/points-history" element={<PointsHistory />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/theme-settings" element={<ThemeSettings />} />
        <Route path="/tutorial" element={<Tutorial />} />
      </Routes>
    </Router>
  );
}

export default App;
