import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../services/authService';
import apiClient from '../services/apiClient';

export default function PersonalInformation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!authService.getCurrentUser());
    const [saving, setSaving] = useState(false);

    // Initialize with cached data if available
    const [formData, setFormData] = useState(() => {
        const cachedUser = authService.getCurrentUser();
        return {
            username: cachedUser?.username || '',
            fullName: cachedUser?.fullName || '',
            email: cachedUser?.email || '',
            phoneNumber: (cachedUser as any)?.phoneNumber || '',
        };
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        // Only show loading if we don't have cached data
        if (!authService.getCurrentUser()) {
            setLoading(true);
        }

        try {
            const profile = await authService.getProfile();
            if (profile) {
                setFormData({
                    username: profile.username || '',
                    fullName: profile.fullName || '',
                    email: profile.email || '',
                    phoneNumber: (profile as any).phoneNumber || '',
                });
            }
        } catch (error) {
            if (!authService.getCurrentUser()) {
                toast.error('Unable to load user information');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.email) {
            toast.error('Username and Email are required');
            return;
        }

        setSaving(true);
        try {
            // Call API to update user profile
            await apiClient.put('/Auth/profile', {
                username: formData.username,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
            });

            toast.success('✓ Information updated successfully!');

            // Refresh profile
            await authService.getProfile();

            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error: any) {
            console.error('Update profile error:', error);
            toast.error(error.message || 'Unable to update information');
        } finally {
            setSaving(false);
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
                    Personal Information
                </h2>
                <div style={{ width: 40 }}></div>
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
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                        Loading...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
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
                                <User size={16} />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* Full Name */}
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
                                <User size={16} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* Email (Read-only) */}
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
                                <Mail size={16} />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#F3F4F6',
                                    color: '#6B7280',
                                    cursor: 'not-allowed'
                                }}
                            />
                            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                                Email cannot be changed
                            </p>
                        </div>

                        {/* Phone Number */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                <Phone size={16} />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="0123456789"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '16px',
                                background: saving ? '#9CA3AF' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '18px',
                                fontWeight: '700',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: saving ? 'none' : '0 4px 12px rgba(241, 111, 35, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                                if (!saving) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(241, 111, 35, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!saving) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(241, 111, 35, 0.3)';
                                }
                            }}
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
