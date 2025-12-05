import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Camera, User, Lock, Moon, Bell, Globe,
    HelpCircle, FileText, Shield, LogOut, ChevronRight, History, Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../services/authService';
import type { UserResponse } from '../services/authService';
import '../styles/Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const profile = await authService.getProfile();
            if (profile) {
                setUser(profile);
            } else {
                // If failed to get profile, try from localStorage
                const localUser = authService.getCurrentUser();
                if (localUser) {
                    setUser(localUser);
                } else {
                    toast.error('Không thể tải thông tin người dùng');
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Lỗi khi tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
        if (confirmed) {
            await authService.logout();
            toast.success('Đã đăng xuất thành công');
            navigate('/login');
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

    const calculateWinRate = () => {
        if (!user) return 0;
        const totalGames = (user as any).totalGamesPlayed || 0;
        const wins = (user as any).wins || 0;
        if (totalGames === 0) return 0;
        return Math.round((wins / totalGames) * 100);
    };

    const renderSettingItem = (
        Icon: React.ElementType,
        title: string,
        type: 'link' | 'switch' = 'link',
        value?: boolean,
        onValueChange?: (val: boolean) => void,
        color: string = 'var(--color-text)'
    ) => (
        <div className="setting-item" onClick={() => type === 'switch' && onValueChange && onValueChange(!value)}>
            <div className="setting-left">
                <div className="setting-icon-container">
                    <Icon size={20} color={color} />
                </div>
                <div className="setting-title" style={{ color }}>{title}</div>
            </div>
            {type === 'switch' ? (
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onValueChange && onValueChange(e.target.checked)}
                    />
                    <span className="slider"></span>
                </label>
            ) : (
                <ChevronRight size={20} color="#9CA3AF" />
            )}
        </div>
    );

    return (
        <div className="profile-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="profile-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px', margin: 0 }}>Profile & Settings</h2>
                <div style={{ width: 40 }}></div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    Đang tải...
                </div>
            ) : (
                <div className="profile-content">
                    <div className="profile-card">
                        <div className="profile-avatar-container">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="Profile"
                                    className="profile-avatar"
                                />
                            ) : (
                                <div 
                                    className="profile-avatar"
                                    style={{
                                        backgroundColor: '#667eea',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '32px',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}
                                >
                                    {getInitials(user?.fullName || user?.username)}
                                </div>
                            )}
                            <div className="edit-avatar-button">
                                <Camera size={16} />
                            </div>
                        </div>
                        <div className="user-name">{user?.fullName || user?.username || 'User'}</div>
                        <div className="user-email">{user?.email || 'No email'}</div>
                        <button 
                            className="edit-profile-button"
                            onClick={() => navigate('/personal-information')}
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="stats-container">
                        <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                            <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
                                {(user as any)?.eloRating || 1200}
                            </div>
                            <div className="stat-label" style={{ fontSize: '12px', color: '#6B7280' }}>ELO</div>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                            <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
                                {(user as any)?.wins || 0}
                            </div>
                            <div className="stat-label" style={{ fontSize: '12px', color: '#6B7280' }}>Wins</div>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                            <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
                                {calculateWinRate()}%
                            </div>
                            <div className="stat-label" style={{ fontSize: '12px', color: '#6B7280' }}>Win Rate</div>
                        </div>
                    </div>

                <div className="section">
                    <div className="section-header">Account</div>
                    <div className="section-content">
                        <div className="setting-item" onClick={() => navigate('/personal-information')}>
                            <div className="setting-left">
                                <div className="setting-icon-container">
                                    <User size={20} color="var(--color-text)" />
                                </div>
                                <div className="setting-title">Personal Information</div>
                            </div>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </div>
                        <div className="setting-item" onClick={() => navigate('/security-password')}>
                            <div className="setting-left">
                                <div className="setting-icon-container">
                                    <Lock size={20} color="var(--color-text)" />
                                </div>
                                <div className="setting-title">Security & Password</div>
                            </div>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </div>
                        <div className="setting-item" onClick={() => navigate('/purchase-points')}>
                            <div className="setting-left">
                                <div className="setting-icon-container">
                                    <Coins size={20} color="var(--color-text)" />
                                </div>
                                <div className="setting-title">Purchase Points</div>
                            </div>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </div>
                        <div className="setting-item" onClick={() => navigate('/points-history')}>
                            <div className="setting-left">
                                <div className="setting-icon-container">
                                    <History size={20} color="var(--color-text)" />
                                </div>
                                <div className="setting-title">Points History</div>
                            </div>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">Preferences</div>
                    <div className="section-content">
                        {renderSettingItem(Moon, 'Dark Mode', 'switch', isDarkMode, setIsDarkMode)}
                        {renderSettingItem(Bell, 'Notifications', 'switch', isNotificationsEnabled, setIsNotificationsEnabled)}
                        {renderSettingItem(Globe, 'Language')}
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">Support</div>
                    <div className="section-content">
                        {renderSettingItem(HelpCircle, 'Help Center')}
                        {renderSettingItem(FileText, 'Terms of Service')}
                        {renderSettingItem(Shield, 'Privacy Policy')}
                    </div>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={20} color="#EF4444" />
                    <span className="logout-text">Log Out</span>
                </button>

                <div className="version-text">Version 1.0.0</div>
            </div>
            )}
        </div>
    );
}
