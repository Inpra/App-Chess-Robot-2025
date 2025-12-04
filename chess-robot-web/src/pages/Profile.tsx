import React, { useState } from 'react';
import {
    ArrowLeft, Camera, User, Lock, CreditCard, Moon, Bell, Globe,
    HelpCircle, FileText, Shield, LogOut, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

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
            <div className="profile-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px', margin: 0 }}>Profile & Settings</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar-container">
                        <img
                            src="https://i.pravatar.cc/100?img=12"
                            alt="Profile"
                            className="profile-avatar"
                        />
                        <div className="edit-avatar-button">
                            <Camera size={16} />
                        </div>
                    </div>
                    <div className="user-name">John Doe</div>
                    <div className="user-email">john.doe@example.com</div>
                    <button className="edit-profile-button">Edit Profile</button>
                </div>

                <div className="stats-container">
                    <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>2450</div>
                        <div className="stat-label" style={{ fontSize: '12px', color: '#6B7280' }}>ELO</div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>142</div>
                        <div className="stat-label" style={{ fontSize: '12px', color: '#6B7280' }}>Wins</div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item" style={{ flex: 1, textAlign: 'center' }}>
                        <div className="stat-value" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>#42</div>
                        <div className="stat-label" style={{ fontSize: '12px', color: '#6B7280' }}>Rank</div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">Account</div>
                    <div className="section-content">
                        {renderSettingItem(User, 'Personal Information')}
                        {renderSettingItem(Lock, 'Security & Password')}
                        {renderSettingItem(CreditCard, 'Payment Methods')}
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

                <button className="logout-button" onClick={() => navigate('/login')}>
                    <LogOut size={20} color="#EF4444" />
                    <span className="logout-text">Log Out</span>
                </button>

                <div className="version-text">Version 1.0.0</div>
            </div>
        </div>
    );
}
