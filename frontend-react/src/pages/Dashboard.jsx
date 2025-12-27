import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Common/Header';
import { Link } from 'react-router-dom';
import api from '../api/client';

function Dashboard() {
    const { user, refreshProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [resumeResult, setResumeResult] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [resumeCount, setResumeCount] = useState(0);
    const [predictionCount, setPredictionCount] = useState(0);
    const avatarInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        full_name: '',
        initials: '',
        phone: '',
        dob: '',
        skills: ''
    });

    useEffect(() => {
        if (user) {
            setEditForm({
                full_name: user.full_name || '',
                initials: user.initials || '',
                phone: user.phone || '',
                dob: user.dob || '',
                skills: Array.isArray(user.skills) ? user.skills.join(', ') : ''
            });
        }
    }, [user]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Invalid file type. Allowed: JPG, PNG, WebP');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File too large. Maximum size is 5MB');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            await api.post('/api/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await refreshProfile();
        } catch (err) {
            setUploadError(err.message || 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Invalid file type. Allowed: PDF, TXT');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File too large. Maximum size is 5MB');
            return;
        }

        setUploading(true);
        setUploadError('');
        setPrediction(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/api/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Resume upload response:', response);
            console.log('Response data:', response.data);
            console.log('Skills in response:', response.data?.skills);
            setResumeResult(response.data);
            setResumeCount(prev => prev + 1);
            await refreshProfile();
        } catch (err) {
            console.error('Resume upload error:', err);
            setUploadError(err.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const skillsArray = editForm.skills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .slice(0, 5);

            await api.post('/api/profile', {
                ...editForm,
                skills: skillsArray
            });
            await refreshProfile();
            setShowEditModal(false);
        } catch (err) {
            setUploadError(err.message || 'Failed to update profile');
        } finally {
            setUploading(false);
        }
    };

    const handlePredictRole = async () => {
        if (!resumeResult) return;

        setPredicting(true);
        setUploadError('');

        try {
            const response = await api.post('/api/predict-role', {
                text: resumeResult.preview_text,
                skills: resumeResult.skills
            });
            setPrediction(response.data);
            setPredictionCount(prev => prev + 1);
        } catch (err) {
            setUploadError(err.message || 'Failed to predict career role');
        } finally {
            setPredicting(false);
        }
    };

    const getInitials = () => {
        if (user?.initials) return user.initials;
        if (user?.full_name) {
            return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        if (user?.username) return user.username[0].toUpperCase();
        return 'U';
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return ` (${age} years)`;
    };

    return (
        <>
            <Header />

            <main className="main">
                <div className="dashboard-container">
                    <div className="dashboard-layout">
                        {/* LEFT SIDE: User Profile Info */}
                        <div className="profile-left-panel">
                            <div className="profile-welcome">
                                <h2>Welcome, <strong>{user?.full_name || user?.username || 'User'}</strong></h2>
                            </div>

                            <div className="profile-avatar-section">
                                <div className="profile-avatar-container">
                                    {user?.avatar_filename ? (
                                        <img
                                            className="profile-avatar-img"
                                            src={`/uploads/avatars/${user.avatar_filename}`}
                                            alt="Avatar"
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">{getInitials()}</div>
                                    )}
                                    <label htmlFor="avatarInput" className="avatar-upload-label" title="Change avatar">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </label>
                                    <input
                                        type="file"
                                        id="avatarInput"
                                        ref={avatarInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleAvatarUpload}
                                    />
                                </div>
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(true)} style={{ marginTop: '1rem' }}>
                                    Edit Profile
                                </button>
                            </div>

                            <div className="profile-details">
                                <div className="detail-group">
                                    <label>Email:</label>
                                    <p className="detail-value">{user?.email || '-'}</p>
                                </div>
                                <div className="detail-group">
                                    <label>Name & Initial:</label>
                                    <p className="detail-value">
                                        {user?.full_name || '-'}{user?.initials ? ` (${user.initials})` : ''}
                                    </p>
                                </div>
                                <div className="detail-group">
                                    <label>Phone:</label>
                                    <p className="detail-value">{user?.phone || '-'}</p>
                                </div>
                                <div className="detail-group">
                                    <label>Date of Birth & Age:</label>
                                    <p className="detail-value">
                                        {user?.dob ? `${user.dob}${calculateAge(user.dob)}` : '-'}
                                    </p>
                                </div>
                                <div className="detail-group">
                                    <label>Skills:</label>
                                    <div className="user-skills">
                                        {user?.skills && user.skills.length > 0 ? (
                                            user.skills.map((skill, index) => (
                                                <span key={index} className="skill-tag">{skill}</span>
                                            ))
                                        ) : (
                                            <span className="empty-msg">No skills added yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE: Resume Upload and Preview */}
                        <div className="resume-right-panel">
                            <div className="resume-upload-card">
                                <h3>Resume Analyzer</h3>
                                <p>Upload your resume to extract skills and get career predictions</p>

                                <div className="resume-upload">
                                    <label htmlFor="resumeInput" className="upload-box">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        <h4>Upload Resume</h4>
                                        <p>PDF or TXT (Max 5MB)</p>
                                    </label>
                                    <input
                                        type="file"
                                        id="resumeInput"
                                        ref={resumeInputRef}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.txt"
                                        onChange={handleResumeUpload}
                                    />
                                </div>

                                {uploading && (
                                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                                        <p>Uploading and analyzing...</p>
                                    </div>
                                )}

                                {uploadError && (
                                    <div className="error-msg" style={{ marginTop: '1rem' }}>{uploadError}</div>
                                )}

                                {/* Resume Preview and Results */}
                                {resumeResult && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        {/* STEP 1: Full PDF Preview */}
                                        {resumeResult.file_url && (
                                            <div style={{
                                                background: 'var(--surface)',
                                                borderRadius: '12px',
                                                padding: '1rem',
                                                marginBottom: '1.5rem',
                                                border: '1px solid var(--border)'
                                            }}>
                                                <h4 style={{
                                                    margin: '0 0 1rem',
                                                    fontSize: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                    </svg>
                                                    Resume Preview
                                                </h4>
                                                <div style={{
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}>
                                                    <iframe
                                                        src={resumeResult.file_url}
                                                        style={{
                                                            width: '100%',
                                                            height: '500px',
                                                            border: 'none',
                                                            background: '#fff'
                                                        }}
                                                        title="Resume Preview"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 2: Extracted Skills */}
                                        <div style={{
                                            background: 'var(--surface)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            marginBottom: '1.5rem',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <h4 style={{
                                                margin: '0 0 1rem',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                                Extracted Skills
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {resumeResult.skills && resumeResult.skills.length > 0 ? (
                                                    resumeResult.skills.map((skill, index) => (
                                                        <span key={index} style={{
                                                            background: '#6366f1',
                                                            color: '#ffffff',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '20px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '500',
                                                            display: 'inline-block'
                                                        }}>{skill}</span>
                                                    ))
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)' }}>No skills extracted from resume</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* STEP 3: Analyze Button */}
                                        {!prediction && (
                                            <button
                                                onClick={handlePredictRole}
                                                disabled={predicting}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem 2rem',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    background: '#6366f1',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    cursor: predicting ? 'not-allowed' : 'pointer',
                                                    opacity: predicting ? 0.7 : 1,
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {predicting ? (
                                                    <>
                                                        <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
                                                        Analyzing Resume...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <path d="M12 16v-4M12 8h.01"></path>
                                                        </svg>
                                                        Get Career Prediction
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* STEP 4: Prediction Results */}
                                        {prediction && (
                                            <div style={{
                                                background: '#f0f4ff',
                                                borderRadius: '16px',
                                                padding: '1.5rem',
                                                border: '2px solid #6366f1',
                                                marginTop: '1rem'
                                            }}>
                                                <h4 style={{
                                                    margin: '0 0 1.5rem',
                                                    fontSize: '1.25rem',
                                                    textAlign: 'center',
                                                    color: '#4f46e5',
                                                    fontWeight: '700'
                                                }}>
                                                    🎯 Career Prediction Results
                                                </h4>

                                                {/* Model Predictions */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                                    gap: '1rem',
                                                    marginBottom: '1.5rem'
                                                }}>
                                                    <div style={{
                                                        background: '#ffffff',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                        textAlign: 'center',
                                                        border: '1px solid #e5e7eb',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                    }}>
                                                        <p style={{
                                                            margin: '0 0 0.5rem',
                                                            fontSize: '0.75rem',
                                                            color: '#6b7280',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '1px',
                                                            fontWeight: '600'
                                                        }}>SVM Model</p>
                                                        <p style={{
                                                            margin: 0,
                                                            fontWeight: '700',
                                                            fontSize: '1rem',
                                                            color: '#1f2937'
                                                        }}>{prediction.svm_role}</p>
                                                    </div>
                                                    <div style={{
                                                        background: '#ffffff',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                        textAlign: 'center',
                                                        border: '1px solid #e5e7eb',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                    }}>
                                                        <p style={{
                                                            margin: '0 0 0.5rem',
                                                            fontSize: '0.75rem',
                                                            color: '#6b7280',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '1px',
                                                            fontWeight: '600'
                                                        }}>Random Forest</p>
                                                        <p style={{
                                                            margin: 0,
                                                            fontWeight: '700',
                                                            fontSize: '1rem',
                                                            color: '#1f2937'
                                                        }}>{prediction.rf_role}</p>
                                                    </div>
                                                </div>

                                                {/* Top Recommended Roles */}
                                                <div style={{
                                                    background: '#ffffff',
                                                    borderRadius: '12px',
                                                    padding: '1.25rem',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}>
                                                    <p style={{
                                                        margin: '0 0 1rem',
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        color: '#1f2937'
                                                    }}>🏆 Top Recommended Roles</p>

                                                    {prediction.top_roles?.map((item, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '1rem',
                                                            padding: '0.875rem',
                                                            background: index === 0 ? '#eef2ff' : index === 1 ? '#f9fafb' : '#ffffff',
                                                            borderRadius: '10px',
                                                            marginBottom: index < 2 ? '0.75rem' : 0,
                                                            border: index === 0 ? '2px solid #6366f1' : '1px solid #e5e7eb'
                                                        }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                background: index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#d1d5db',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1.25rem',
                                                                flexShrink: 0
                                                            }}>
                                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{
                                                                    margin: 0,
                                                                    fontSize: index === 0 ? '1.1rem' : '1rem',
                                                                    fontWeight: index === 0 ? '700' : '600',
                                                                    color: '#1f2937'
                                                                }}>{item.role}</p>
                                                                <p style={{
                                                                    margin: '0.25rem 0 0',
                                                                    fontSize: '0.8rem',
                                                                    color: '#6b7280'
                                                                }}>
                                                                    {index === 0 ? 'Best Match' : index === 1 ? 'Strong Match' : 'Good Match'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Upload New Resume Button */}
                                                <button
                                                    onClick={() => {
                                                        setPrediction(null);
                                                        setResumeResult(null);
                                                        setTimeout(() => {
                                                            if (resumeInputRef.current) {
                                                                resumeInputRef.current.value = '';
                                                                resumeInputRef.current.click();
                                                            }
                                                        }, 100);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.875rem',
                                                        marginTop: '1.25rem',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '600',
                                                        background: '#ffffff',
                                                        color: '#6366f1',
                                                        border: '2px solid #6366f1',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    📄 Upload New Resume
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stats Card */}
                            <div className="stats-card">
                                <h3>Your Progress</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-number">{resumeCount}</span>
                                        <span className="stat-label">Resumes Uploaded</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{user?.skills?.length || 0}</span>
                                        <span className="stat-label">Skills Added</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{predictionCount}</span>
                                        <span className="stat-label">Predictions Made</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Modal */}
                    {showEditModal && (
                        <div className="modal" style={{ display: 'flex' }}>
                            <div className="modal-overlay" onClick={() => setShowEditModal(false)}></div>
                            <div className="modal-content">
                                <h2>Edit Profile</h2>
                                <form id="editProfileForm" onSubmit={handleEditSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            placeholder="Your full name"
                                            value={editForm.full_name}
                                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="initials">Initials</label>
                                            <input
                                                type="text"
                                                id="initials"
                                                placeholder="e.g., JD"
                                                maxLength={3}
                                                value={editForm.initials}
                                                onChange={(e) => setEditForm({ ...editForm, initials: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                placeholder="+1 (555) 000-0000"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="dob">Date of Birth</label>
                                        <input
                                            type="date"
                                            id="dob"
                                            value={editForm.dob}
                                            onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="skills">Skills (up to 5, comma separated)</label>
                                        <input
                                            type="text"
                                            id="skills"
                                            placeholder="Python, Machine Learning, Data Analysis"
                                            value={editForm.skills}
                                            onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                                            {uploading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-main">
                            <div className="footer-branding">
                                <h4>Smart Career Advisor</h4>
                                <p>AI-powered career guidance using machine learning and NLP</p>
                            </div>
                            <div className="footer-links-section">
                                <h5>Quick Links</h5>
                                <ul className="footer-links-list">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/dashboard">Dashboard</Link></li>
                                    <li><Link to="/resume-analyzer">Resume Analyzer</Link></li>
                                    <li><Link to="/about">About Us</Link></li>
                                </ul>
                            </div>
                            <div className="footer-links-section">
                                <h5>Resources</h5>
                                <ul className="footer-links-list">
                                    <li><Link to="/about?tab=terms">Terms & Conditions</Link></li>
                                    <li><a href="mailto:rathideviruku@gmail.com">Contact Us</a></li>
                                    <li><Link to="/about">Privacy Policy</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2024 Smart Career Advisor. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Dashboard;
