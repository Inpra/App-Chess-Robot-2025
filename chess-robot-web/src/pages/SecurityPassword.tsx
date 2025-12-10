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
                required
                style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
            <button
                type="button"
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6B7280'
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
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <ArrowLeft size={24} color="#111827" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                    Security & Password
                </h2>
                <div style={{ width: 40 }}></div>
            </div>

            {/* Info Card */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto 16px',
                backgroundColor: '#EFF6FF',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                border: '1px solid #DBEAFE'
            }}>
                <Shield size={24} color="#3B82F6" style={{ flexShrink: 0 }} />
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF', margin: '0 0 4px' }}>
                        Account Security
                    </h3>
                    <p style={{ fontSize: '13px', color: '#1E40AF', margin: 0, lineHeight: '1.5' }}>
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
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                                Password strength:
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                                marginBottom: '4px'
                            }}>
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        style={{
                                            flex: 1,
                                            height: '4px',
                                            borderRadius: '2px',
                                            backgroundColor:
                                                formData.newPassword.length >= level * 3
                                                    ? level === 1 ? '#EF4444'
                                                        : level === 2 ? '#F59E0B'
                                                            : level === 3 ? '#10B981'
                                                                : '#059669'
                                                    : '#E5E7EB'
                                        }}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
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
                            backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.backgroundColor = '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.currentTarget.style.backgroundColor = '#3B82F6';
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
