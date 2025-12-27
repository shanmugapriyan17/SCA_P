import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Common/Header';

function About() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'about-me');
    const searchTerm = searchParams.get('q') || '';

    // Update tab when URL parameter changes
    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Highlight ALL matching text on page
    useEffect(() => {
        if (searchTerm) {
            setTimeout(() => {
                highlightAllMatches(searchTerm);
            }, 300);
        }

        // Cleanup highlights when component unmounts or search changes
        return () => {
            const highlights = document.querySelectorAll('.search-text-highlight');
            highlights.forEach(el => {
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });
        };
    }, [searchTerm]);

    // Function to highlight ALL occurrences of search term
    const highlightAllMatches = (term) => {
        const container = document.querySelector('.about-container');
        if (!container) return;

        const termLower = term.toLowerCase();
        let firstMatch = null;

        const highlightNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.nodeValue;
                // Check if text contains the search term (case insensitive)
                if (text.toLowerCase().includes(termLower)) {
                    const span = document.createElement('span');
                    // Create regex fresh for replace to avoid lastIndex issues
                    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    span.innerHTML = text.replace(regex, '<mark class="search-text-highlight">$1</mark>');
                    node.parentNode.replaceChild(span, node);

                    if (!firstMatch) {
                        firstMatch = span.querySelector('.search-text-highlight');
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE &&
                !['SCRIPT', 'STYLE', 'MARK'].includes(node.tagName)) {
                Array.from(node.childNodes).forEach(child => highlightNode(child));
            }
        };

        highlightNode(container);

        // Scroll to first match
        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <>
            <Header />

            <main className="main">
                <div className="about-container">
                    <section className="about-hero">
                        <h1>About Smart Career Advisor</h1>
                        <p>Empowering careers through AI and machine learning</p>
                    </section>


                    <section className="about-layout">
                        <aside className="about-tabs-nav">
                            <nav className="tabs-list">
                                <button
                                    className={`tab-link ${activeTab === 'about-me' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('about-me')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>About Me</span>
                                </button>
                                <button
                                    className={`tab-link ${activeTab === 'about-project' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('about-project')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                        <path d="M2 17l10 5 10-5"></path>
                                        <path d="M2 12l10 5 10-5"></path>
                                    </svg>
                                    <span>About Project</span>
                                </button>
                                <button
                                    className={`tab-link ${activeTab === 'learning-platform' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('learning-platform')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5h16M6 12.328v4.872M12 12.328v4.872M18 12.328v4.872M5 8h14V4H5z"></path>
                                    </svg>
                                    <span>Learning Platform</span>
                                </button>
                                <button
                                    className={`tab-link ${activeTab === 'terms' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('terms')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                    </svg>
                                    <span>Terms & Conditions</span>
                                </button>
                            </nav>
                        </aside>

                        <main className="about-content">
                            {/* About Me Tab */}
                            <div className={`tab-content ${activeTab === 'about-me' ? 'active' : ''}`} id="about-me">
                                <h2>About the Creator</h2>
                                <div className="about-me-card">
                                    <div className="card-avatar">
                                        <img src="/IMG/rathideviIMG.jpg" alt="Rathidevi S" className="profile-image" />
                                    </div>
                                    <div className="card-info">
                                        <h3>Rathidevi S</h3>
                                        <p className="role">AI / ML Engineer</p>
                                        <p className="college">ME, Christian College of Engineering and Technology, Oddanchatram, India</p>
                                        <p className="focus">Focus: Machine Learning & Deep Learning</p>
                                    </div>
                                </div>

                                <div className="about-content-text">
                                    <p>Smart Career Advisor was created by Rathidevi S a passionate engineer and data scientist committed to revolutionizing how people discover their ideal careers.</p>

                                    <h4>Our Journey</h4>
                                    <p>We started with a simple vision: use the power of machine learning to match people with the careers where they'll thrive. By analyzing thousands of job descriptions and career trajectories, we've built intelligent models that understand the relationship between skills and career paths.</p>

                                    <h4>Our Expertise</h4>
                                    <ul>
                                        <li>Machine Learning and AI Model Development</li>
                                        <li>Natural Language Processing for Resume Analysis</li>
                                        <li>Web Application Development</li>
                                        <li>Data Science and Analytics</li>
                                        <li>Career Development and Mentoring</li>
                                    </ul>
                                </div>
                            </div>

                            {/* About Project Tab */}
                            <div className={`tab-content ${activeTab === 'about-project' ? 'active' : ''}`} id="about-project">
                                <h2>About This Project</h2>

                                <h4>Project Overview</h4>
                                <p>Smart Career Advisor is an innovative AI-powered platform that helps professionals discover their ideal career paths through resume analysis and machine learning. Our system processes your resume, extracts key skills, and recommends the most suitable career roles based on patterns learned from 50,000+ job records.</p>

                                <h4>Key Features</h4>
                                <div className="features-list">
                                    <div className="feature-item">
                                        <h5>Resume Analysis</h5>
                                        <p>Upload your resume in PDF or TXT format and let our NLP engine extract key skills and competencies automatically.</p>
                                    </div>
                                    <div className="feature-item">
                                        <h5>Dual ML Models</h5>
                                        <p>Compare predictions from Support Vector Machines (SVM) and Random Forest models for comprehensive career insights.</p>
                                    </div>
                                    <div className="feature-item">
                                        <h5>Intelligent Recommendations</h5>
                                        <p>Get personalized career recommendations ranked by relevance to your skills and experience level.</p>
                                    </div>
                                    <div className="feature-item">
                                        <h5>Job Fit Analysis</h5>
                                        <p>Analyze your compatibility with specific job roles and get detailed insights about skill gaps and opportunities.</p>
                                    </div>
                                </div>

                                <h4>Technology Stack</h4>
                                <div className="tech-stack">
                                    <div className="tech-category">
                                        <h5>Machine Learning</h5>
                                        <ul>
                                            <li>Support Vector Machine (SVM) - LinearSVC</li>
                                            <li>Random Forest Classifier (100 trees)</li>
                                            <li>TF-IDF Vectorization (5000 features)</li>
                                            <li>Natural Language Processing (NLTK)</li>
                                            <li>Scikit-learn Library</li>
                                        </ul>
                                    </div>
                                    <div className="tech-category">
                                        <h5>Backend</h5>
                                        <ul>
                                            <li>Node.js / Express</li>
                                            <li>React + Vite Frontend</li>
                                            <li>SQLite Database</li>
                                            <li>PDF Processing</li>
                                            <li>REST API Architecture</li>
                                        </ul>
                                    </div>
                                    <div className="tech-category">
                                        <h5>Frontend</h5>
                                        <ul>
                                            <li>React 18 with Hooks</li>
                                            <li>CSS3 with Variables & Gradients</li>
                                            <li>Responsive Mobile-First Design</li>
                                            <li>Dark Mode Support</li>
                                            <li>jsPDF for Report Generation</li>
                                        </ul>
                                    </div>
                                    <div className="tech-category">
                                        <h5>Data</h5>
                                        <ul>
                                            <li>50,000 Real Job Records</li>
                                            <li>44 Different Job Roles</li>
                                            <li>100+ Technical Skills</li>
                                            <li>Real-world Job Descriptions</li>
                                            <li>Verified Training Data</li>
                                        </ul>
                                    </div>
                                </div>

                                <h4>Performance Metrics</h4>
                                <div className="metrics-comparison">
                                    <div className="model-metrics">
                                        <h5>SVM Model</h5>
                                        <div className="metrics-display">
                                            <div className="metric-box">
                                                <h6>Accuracy</h6>
                                                <p className="metric-value">98%</p>
                                            </div>
                                            <div className="metric-box">
                                                <h6>Precision</h6>
                                                <p className="metric-value">89%</p>
                                            </div>
                                            <div className="metric-box">
                                                <h6>Recall</h6>
                                                <p className="metric-value winner">92%</p>
                                            </div>
                                            <div className="metric-box">
                                                <h6>F1-Score</h6>
                                                <p className="metric-value winner">93%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="model-metrics">
                                        <h5>Random Forest Model</h5>
                                        <div className="metrics-display">
                                            <div className="metric-box">
                                                <h6>Accuracy</h6>
                                                <p className="metric-value winner">99.6%</p>
                                            </div>
                                            <div className="metric-box">
                                                <h6>Precision</h6>
                                                <p className="metric-value winner">95%</p>
                                            </div>
                                            <div className="metric-box">
                                                <h6>Recall</h6>
                                                <p className="metric-value">91%</p>
                                            </div>
                                            <div className="metric-box">
                                                <h6>F1-Score</h6>
                                                <p className="metric-value">90%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="metrics-note">Random Forest has lower overfitting risk and higher accuracy, while SVM excels in Recall and F1-Score.</p>
                            </div>

                            {/* Learning Platform Tab */}
                            <div className={`tab-content ${activeTab === 'learning-platform' ? 'active' : ''}`} id="learning-platform">
                                <h2>Learning Platform</h2>

                                <h4>Educational Resources</h4>
                                <p>Smart Career Advisor isn't just a prediction tool—it's a learning platform designed to help you understand your career options and develop the skills you need to succeed.</p>

                                <h4>How to Maximize Your Results</h4>
                                <div className="learning-guide">
                                    <div className="learning-step">
                                        <h5>1. Optimize Your Resume</h5>
                                        <p>Include all relevant skills and experience. The more detailed your resume, the more accurate our analysis. Use industry-standard terminology for technical skills.</p>
                                    </div>
                                    <div className="learning-step">
                                        <h5>2. Understand Your Skills</h5>
                                        <p>Review the extracted skills. Our system identifies both technical and soft skills. Consider adding skills that might not have been obvious from your resume.</p>
                                    </div>
                                    <div className="learning-step">
                                        <h5>3. Analyze Recommendations</h5>
                                        <p>Study the predicted roles carefully. Each recommendation comes with confidence scores from multiple models, giving you confidence in the predictions.</p>
                                    </div>
                                    <div className="learning-step">
                                        <h5>4. Explore Career Paths</h5>
                                        <p>Use the job fit analysis tool to explore different roles and understand what additional skills you'd need to transition into those positions.</p>
                                    </div>
                                    <div className="learning-step">
                                        <h5>5. Create a Growth Plan</h5>
                                        <p>Based on your predictions and skill gaps, create a targeted learning plan to develop the skills needed for your ideal role.</p>
                                    </div>
                                    <div className="learning-step">
                                        <h5>6. Track Your Progress</h5>
                                        <p>Update your profile as you develop new skills. Re-run your analysis periodically to see how your career options evolve.</p>
                                    </div>
                                </div>

                                <h4>Understanding ML Predictions</h4>
                                <p>Our predictions come from two different machine learning models:</p>
                                <ul>
                                    <li><strong>Support Vector Machine (SVM):</strong> Excellent at finding decision boundaries in high-dimensional spaces. Best for clear classification tasks.</li>
                                    <li><strong>Random Forest:</strong> An ensemble method that captures complex non-linear relationships. Robust and generally less prone to overfitting.</li>
                                </ul>
                                <p>By comparing both models, you get a more complete picture of your career fit. If both models agree, you can have high confidence in the recommendation. If they differ, it might indicate a role that sits on a boundary between categories.</p>
                            </div>

                            {/* Terms & Conditions Tab */}
                            <div className={`tab-content ${activeTab === 'terms' ? 'active' : ''}`} id="terms">
                                <h2>Terms & Conditions</h2>

                                <div className="terms-content">
                                    <h4>1. Acceptance of Terms</h4>
                                    <p>By using Smart Career Advisor, you accept these terms and conditions. If you do not agree with any part of these terms, you must not use our service.</p>

                                    <h4>2. Use of Service</h4>
                                    <p>You agree to use Smart Career Advisor only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the service.</p>

                                    <h4>3. User Content</h4>
                                    <p>You retain all rights to any content you provide to Smart Career Advisor. By uploading your resume or other content, you grant us permission to process and analyze it for the purpose of providing career recommendations. We will not share your resume or personal information with third parties.</p>

                                    <h4>4. Limitation of Liability</h4>
                                    <p>Smart Career Advisor is provided on an "as-is" basis. We do not warrant that the service will be uninterrupted or error-free. The predictions and recommendations provided are based on machine learning models and should not be considered as professional career advice.</p>

                                    <h4>5. Intellectual Property</h4>
                                    <p>All content, features, and functionality are owned by Smart Career Advisor and are protected by copyright laws.</p>

                                    <h4>6. User Accounts</h4>
                                    <p>If you create an account on our platform, you are responsible for maintaining the confidentiality of your login credentials. You agree to accept responsibility for all activities that occur under your account.</p>

                                    <h4>7. Privacy Policy</h4>
                                    <p>We are committed to protecting your privacy. All data is encrypted during transmission and passwords are hashed using industry-standard algorithms. Your resume is processed securely and stored safely.</p>

                                    <h4>8. Contact Information</h4>
                                    <p>If you have questions about these Terms & Conditions, please contact us at:</p>
                                    <p><strong>Email:</strong> support@smartcareeradvisor.com</p>
                                </div>
                            </div>
                        </main>
                    </section>
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
                                    <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Terms & Conditions</a></li>
                                    <li><a href="mailto:rathideviruku@gmail.com">Contact Us</a></li>
                                    <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Privacy Policy</a></li>
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

export default About;
