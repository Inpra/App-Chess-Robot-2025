import { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../services/apiClient';

// Move PasswordInput outside to prevent re-creation on each render
interface PasswordInputProps {
    label: string;
    name: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = ({ label, name, value, show, onToggle, onChange }: PasswordInputProps) => (
    <div style={{ marginBottom: '20px' }}>
        <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '8px'
        }}>
            <Lock size={16} />
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                placeholder="••••••••"
                required
                style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: '#F9FAFB',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#F16F23';
                    e.target.style.boxShadow = '0 0 0 4px rgba(241, 111, 35, 0.1)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                }}
            />
            <button
                type="button"
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9CA3AF'
                }}
            >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    </div>
);

export default function SecurityPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validatePassword = () => {
        if (!formData.currentPassword) {
            toast.error('Please enter current password');
            return false;
        }

        if (!formData.newPassword) {
            toast.error('Please enter new password');
            return false;
        }

        if (formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return false;
        }

        if (formData.newPassword === formData.currentPassword) {
            toast.error('New password must be different from current password');
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Password confirmation does not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePassword()) {
            return;
        }

        setLoading(true);
        try {
            // Call API to change password
            await apiClient.post('/Auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            toast.success('✓ Password changed successfully!');

            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error: any) {
            console.error('Change password error:', error);
            if (error.message.includes('incorrect') || error.message.includes('wrong')) {
                toast.error('Current password is incorrect');
            } else {
                toast.error(error.message || 'Unable to change password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '20px' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '24px',
                maxWidth: '600px',
                margin: '0 auto 24px'
            }}>
                <div 
                    onClick={() => navigate('/profile')} 
                    style={{ 
                        cursor: 'pointer', 
                        padding: '8px', 
                        borderRadius: '12px', 
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px'
                    }}
                >
                    <ArrowLeft size={24} color="#111827" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#111827' }}>
                    Security & Password
                </h2>
                <div style={{ width: 40 }}></div>
            </div>

            {/* Info Card */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto 16px',
                backgroundColor: '#FFF3E0',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                border: '1px solid #FFE0B2'
            }}>
                <Shield size={24} color="#F16F23" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#E65100', margin: '0 0 4px' }}>
                        Account Security
                    </h3>
                    <p style={{ fontSize: '13px', color: '#E65100', margin: 0, lineHeight: '1.5' }}>
                        A strong password helps protect your account. Use at least 6 characters,
                        including uppercase, lowercase and numbers.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB'
            }}>
                <form onSubmit={handleSubmit}>
                    <PasswordInput
                        label="Current Password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        show={showCurrentPassword}
                        onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                        onChange={handleChange}
                    />

                    <PasswordInput
                        label="New Password"
                        name="newPassword"
                        value={formData.newPassword}
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword(!showNewPassword)}
                        onChange={handleChange}
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        onChange={handleChange}
                    />

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>
                                Password strength:
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                                marginBottom: '6px'
                            }}>
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                            flex: 1,
                                            height: '6px',
                                            borderRadius: '3px',
                                            backgroundColor:
                                                formData.newPassword.length >= level * 3
                                                    ? level === 1 ? '#EF4444'
                                                        : level === 2 ? '#F59E0B'
                                                            : level === 3 ? '#F16F23'
                                                                : '#10B981'
                                                    : '#E5E7EB',
                                            transition: 'background-color 0.3s'
                                        }}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontWeight: '500' }}>
                                {formData.newPassword.length < 6 && 'Weak'}
                                {formData.newPassword.length >= 6 && formData.newPassword.length < 9 && 'Medium'}
                                {formData.newPassword.length >= 9 && formData.newPassword.length < 12 && 'Strong'}
                                {formData.newPassword.length >= 12 && 'Very Strong'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px',
                            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #F16F23 0%, #4A5CF5 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(241, 111, 35, 0.2)',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(241, 111, 35, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(241, 111, 35, 0.2)';
                            }
                        }}
                    >
                        <Lock size={20} />
                        {loading ? 'Updating...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
