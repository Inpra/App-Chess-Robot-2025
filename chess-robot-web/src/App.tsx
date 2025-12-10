import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bannerRobot from './assets/FPT.VN_BIG.D-b2da87b8.png';
import authService from './services/authService';
import type { UserResponse } from './services/authService';
import rankingService, { type RankingUser } from './services/rankingService';
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
  Cpu,
  Coins,
  Plus,
  Crown,
  Medal
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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import PersonalInformation from './pages/PersonalInformation';
import SecurityPassword from './pages/SecurityPassword';
import EloSelection from './pages/EloSelection';
import AvatarSelection from './pages/AvatarSelection';

import ProtectedRoute from './components/ProtectedRoute';

function Dashboard() {
  const navigate = useNavigate();
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [topPlayers, setTopPlayers] = useState<RankingUser[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  useEffect(() => {
    // Get user from localStorage or API
    const localUser = authService.getCurrentUser();
    if (localUser) {
      setUser(localUser);

      // Fetch fresh data from API only if user is logged in
      authService.getProfile().then(profile => {
        if (profile) {
          setUser(profile);
          setPointsBalance((profile as any).pointsBalance || 0);

          // Check if we need to offer initial Elo selection
          const eloSetKey = `initial_elo_set_${profile.id}`;
          if (profile.totalGamesPlayed === 0 && !localStorage.getItem(eloSetKey)) {
            navigate('/elo-selection');
          }
        }
      });
    }

    // Fetch top 4 players (public)
    loadTopRankings();
  }, []);

  const loadTopRankings = async () => {
    try {
      setLoadingRanking(true);
      const rankings = await rankingService.getGlobalRanking(4);
      setTopPlayers(rankings);
    } catch (error) {
      console.error('Failed to load rankings:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
          onClick={() => user ? setShowDifficultyModal(true) : navigate('/login')}
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

        {user && (
          <div className="sidebar-icon" onClick={() => navigate('/profile')}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                style={{ width: 32, height: 32, borderRadius: 16 }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {getInitials(user?.fullName || user?.username)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-title">
            <h1>Dashboard</h1>
            {user && (
              <div className="header-subtitle">
                Welcome back, {user?.fullName || user?.username || 'Player'}!
              </div>
            )}
          </div>

          <div className="header-actions">
            {user ? (
              <div
                onClick={() => navigate('/purchase-points')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  gap: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={20} color="#FFD700" />
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{pointsBalance.toLocaleString()}</span>
                </div>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={16} color="white" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '20px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '20px',
                    backgroundColor: '#667eea',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Banner */}
        <div className="banner">
          <div className="banner-content">
            <div className="banner-tag">CHALLENGE</div>
            <h2 className="banner-title">Welcome to Chess Robot</h2>
            <p className="banner-text">Can you beat the robot? Test your skills and climb the leaderboard!</p>
            <button
              className="banner-button"
              onClick={() => user ? setShowDifficultyModal(true) : navigate('/register')}
            >
              {user ? 'Play Now' : 'Register Now'}
            </button>
          </div>
          <img src={bannerRobot} alt="Chess Robot" style={{ height: '220px', objectFit: 'contain' }} />
        </div>

        {/* Dashboard Grid */}
        <div className="grid-container">
          {/* Quick Access */}
          <div className="card">
            <h3 className="card-title">Quick Access</h3>
            <div className="quick-play-grid">
              <div className="quick-play-item" onClick={() => user ? setShowDifficultyModal(true) : navigate('/login')}>
                <Cpu size={32} color="#8B5CF6" />
                <div className="quick-play-text">Vs Bot</div>
              </div>
              <div className="quick-play-item" onClick={() => navigate('/puzzles')}>
                <Puzzle size={32} color="#EC4899" />
                <div className="quick-play-text">Puzzles</div>
              </div>
              <div className="quick-play-item" onClick={() => navigate('/match-history')}>
                <Clock size={32} color="#10B981" />
                <div className="quick-play-text">History</div>
              </div>
              <div className="quick-play-item" onClick={() => navigate('/tutorial')}>
                <GraduationCap size={32} color="#F59E0B" />
                <div className="quick-play-text">Training</div>
              </div>
            </div>
          </div>

          {/* My Points Card - Removed */}

          {/* Your Stats - Only show if logged in */}
          {user && (
            <div className="card">
              <h3 className="card-title">Your Stats</h3>

              {/* Main Stats Grid */}
              <div className="stats-row" style={{ marginBottom: '20px' }}>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#667eea' }}>{(user as any)?.eloRating || 1200}</div>
                  <div className="stat-label">ELO Rating</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#10B981' }}>{(user as any)?.wins || 0}</div>
                  <div className="stat-label">Wins</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#F59E0B' }}>
                    {(user as any)?.totalGamesPlayed > 0
                      ? Math.round(((user as any)?.wins || 0) / (user as any)?.totalGamesPlayed * 100)
                      : 0}%
                  </div>
                  <div className="stat-label">Win Rate</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea', marginBottom: '4px' }}>
                    {(user as any)?.totalGamesPlayed || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Total Games</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }}>
                    {(user as any)?.wins || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Wins</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#EF4444', marginBottom: '4px' }}>
                    {(user as any)?.losses || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Losses</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }}>
                    {(user as any)?.draws || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>Draws</div>
                </div>
              </div>

              {/* Win/Loss/Draw Chart */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '12px' }}>
                  Performance Distribution
                </div>
                <div style={{ display: 'flex', height: '8px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                  {(() => {
                    const total = (user as any)?.totalGamesPlayed || 0;
                    const wins = (user as any)?.wins || 0;
                    const losses = (user as any)?.losses || 0;
                    const draws = (user as any)?.draws || 0;

                    if (total === 0) {
                      return <div style={{ width: '100%', backgroundColor: '#E5E7EB' }}></div>;
                    }

                    const winPercent = (wins / total) * 100;
                    const lossPercent = (losses / total) * 100;
                    const drawPercent = (draws / total) * 100;

                    return (
                      <>
                        {wins > 0 && <div style={{ width: `${winPercent}%`, backgroundColor: '#10B981' }}></div>}
                        {losses > 0 && <div style={{ width: `${lossPercent}%`, backgroundColor: '#EF4444' }}></div>}
                        {draws > 0 && <div style={{ width: `${drawPercent}%`, backgroundColor: '#F59E0B' }}></div>}
                      </>
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#6B7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10B981' }}></div>
                    <span>Wins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#EF4444' }}></div>
                    <span>Losses</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#F59E0B' }}></div>
                    <span>Draws</span>
                  </div>
                </div>
              </div>

              {/* Peak ELO Info */}
              {(user as any)?.peakElo && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '12px',
                  borderLeft: '3px solid #667eea'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Peak ELO</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>
                      {(user as any)?.peakElo}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Rankings */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Live Rankings</h3>
              <a onClick={() => navigate('/ranking')} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}>View All</a>
            </div>

            {loadingRanking ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                Loading rankings...
              </div>
            ) : topPlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                No rankings available
              </div>
            ) : (
              <div className="ranking-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topPlayers.map((player, index) => (
                  <div key={player.userId} className="ranking-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'white',
                    borderRadius: '12px',
                    border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid #F3F4F6',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="rank-number" style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: index === 0 ? '#D97706' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : '#6B7280'
                    }}>
                      {index === 0 ? <Crown size={24} fill="#FFD700" color="#D97706" /> :
                        index === 1 ? <Medal size={24} fill="#E5E7EB" color="#9CA3AF" /> :
                          index === 2 ? <Medal size={24} fill="#FEF3C7" color="#B45309" /> :
                            `#${player.rank}`}
                    </div>

                    <div className="rank-avatar" style={{ position: 'relative', marginRight: '12px' }}>
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {index === 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          backgroundColor: '#FFD700',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#B45309',
                          border: '1px solid white'
                        }}>1</div>
                      )}
                    </div>

                    <div className="rank-info" style={{ flex: 1 }}>
                      <div className="rank-name" style={{ fontWeight: '600', color: '#1F2937', fontSize: '14px' }}>
                        {player.fullName || player.username}
                      </div>
                      <div className="rank-stats" style={{ fontSize: '12px', color: '#6B7280' }}>
                        {player.wins} Wins • {player.winRate}% WR
                      </div>
                    </div>

                    <div className="rank-score" style={{
                      fontWeight: 'bold',
                      color: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      {player.eloRating}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/tutorial" element={<Tutorial />} />

        {/* Protected Routes */}
        <Route path="/game/vs-bot" element={
          <ProtectedRoute>
            <VsBot />
          </ProtectedRoute>
        } />
        <Route path="/match-history" element={
          <ProtectedRoute>
            <MatchHistory />
          </ProtectedRoute>
        } />
        <Route path="/match-history/:id" element={
          <ProtectedRoute>
            <MatchDetail />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/puzzles" element={
          <ProtectedRoute>
            <Puzzles />
          </ProtectedRoute>
        } />
        <Route path="/puzzles/:id" element={
          <ProtectedRoute>
            <PuzzleGame />
          </ProtectedRoute>
        } />
        <Route path="/purchase-points" element={
          <ProtectedRoute>
            <PurchasePoints />
          </ProtectedRoute>
        } />
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/payment/cancel" element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        } />
        <Route path="/points-history" element={
          <ProtectedRoute>
            <PointsHistory />
          </ProtectedRoute>
        } />
        <Route path="/personal-information" element={
          <ProtectedRoute>
            <PersonalInformation />
          </ProtectedRoute>
        } />
        <Route path="/security-password" element={
          <ProtectedRoute>
            <SecurityPassword />
          </ProtectedRoute>
        } />
        <Route path="/theme-settings" element={
          <ProtectedRoute>
            <ThemeSettings />
          </ProtectedRoute>
        } />
        <Route path="/elo-selection" element={
          <ProtectedRoute>
            <EloSelection />
          </ProtectedRoute>
        } />
        <Route path="/avatar-selection" element={
          <ProtectedRoute>
            <AvatarSelection />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
