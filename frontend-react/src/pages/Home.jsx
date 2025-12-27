import Header from '../components/Common/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function Home() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showSignupModal, setShowSignupModal] = useState(false);

    const scrollToModels = () => {
        document.querySelector('.models-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Header />

            <main className="main">
                {/* Hero Section */}
                <div className="hero">
                    <div className="hero-content">
                        <h1 className="hero-title">Discover Your Ideal Career Path</h1>
                        <p className="hero-subtitle">Upload your resume and get AI-powered career recommendations powered by machine learning</p>
                        <div className="hero-buttons">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
                                    <Link to="/resume-analyzer" className="btn btn-secondary btn-lg">Analyze Resume</Link>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>Get Started</button>
                                    <button className="btn btn-secondary btn-lg" onClick={scrollToModels}>Learn More</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <section className="features-section">
                    <h2>How It Works</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3>Upload Resume</h3>
                            <p>Share your resume in PDF or TXT format for analysis</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 21H3V3h18v18zm-2-2V5H5v14h14z"></path>
                                </svg>
                            </div>
                            <h3>NLP Analysis</h3>
                            <p>We extract and analyze your skills using advanced NLP techniques</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 3H5a2 2 0 0 0-2 2v4m0 0H3m4 0h12a2 2 0 0 1 2 2v4m0 0v4a2 2 0 0 1-2 2H9m0 0H5a2 2 0 0 1-2-2v-4m0 0H3"></path>
                                </svg>
                            </div>
                            <h3>ML Prediction</h3>
                            <p>Our models trained on 50,000+ job records predict your ideal role</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            </div>
                            <h3>Get Results</h3>
                            <p>Receive personalized career recommendations instantly</p>
                        </div>
                    </div>
                </section>

                {/* Models Section */}
                <section className="models-section">
                    <h2>Our AI Models</h2>
                    <p className="section-subtitle">Comparing two powerful machine learning algorithms</p>

                    <div className="models-comparison">
                        <div className="model-card">
                            <h3>Support Vector Machine (SVM)</h3>
                            <div className="metrics">
                                <div className="metric">
                                    <span className="metric-label">Accuracy</span>
                                    <span className="metric-value">98%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Precision</span>
                                    <span className="metric-value">89%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Recall</span>
                                    <span className="metric-value winner">92%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">F1-Score</span>
                                    <span className="metric-value winner">93%</span>
                                </div>
                            </div>
                            <p className="model-description">Linear SVM classifier trained on TF-IDF vectorized text features</p>
                        </div>

                        <div className="model-card selected">
                            <div className="badge">Best Model</div>
                            <h3>Random Forest</h3>
                            <div className="metrics">
                                <div className="metric">
                                    <span className="metric-label">Accuracy</span>
                                    <span className="metric-value winner">99.6%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Precision</span>
                                    <span className="metric-value winner">95%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Recall</span>
                                    <span className="metric-value">91%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">F1-Score</span>
                                    <span className="metric-value">90%</span>
                                </div>
                            </div>
                            <p className="model-description">Ensemble of 100 decision trees trained on 50,000 job records</p>
                        </div>
                    </div>
                </section>

                {/* Dataset Section */}
                <section className="dataset-section">
                    <h2>Powered by 50,000 Job Records</h2>
                    <div className="dataset-stats">
                        <div className="stat">
                            <h4>50,000</h4>
                            <p>Training Records</p>
                        </div>
                        <div className="stat">
                            <h4>44</h4>
                            <p>Job Roles</p>
                        </div>
                        <div className="stat">
                            <h4>5000</h4>
                            <p>Features (TF-IDF)</p>
                        </div>
                        <div className="stat">
                            <h4>100+</h4>
                            <p>Tech Skills</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <h2>Ready to Find Your Perfect Role?</h2>
                    <p>Start your career journey today with AI-powered insights</p>
                    <div>
                        {isAuthenticated ? (
                            <Link to="/resume-analyzer" className="btn btn-primary btn-lg">Upload Resume</Link>
                        ) : (
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>Sign Up Now</button>
                        )}
                    </div>
                </section>
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
                            <p>&copy; 2026 Smart Career Advisor. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Home;
