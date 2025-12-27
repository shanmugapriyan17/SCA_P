import { useState, useRef } from 'react';
import Header from '../components/Common/Header';
import { Link } from 'react-router-dom';
import api from '../api/client';
import jsPDF from 'jspdf';

function ResumeAnalyzer() {
    const [activeTab, setActiveTab] = useState('step1');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState([]);
    const [resumeText, setResumeText] = useState('');
    const [error, setError] = useState('');
    const [predicting, setPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [showPercentages, setShowPercentages] = useState({});
    const [jobInput, setJobInput] = useState('');
    const [jobFitResult, setJobFitResult] = useState(null);
    const [analyzingFit, setAnalyzingFit] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Allowed: PDF, TXT');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File too large. Maximum size is 5MB');
            return;
        }

        setFile(selectedFile);
        setError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await api.post('/api/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setExtractedSkills(response.data.skills || []);
            setResumeText(response.data.preview_text || 'Resume text not available');
            setUploadSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const handlePredictRole = async () => {
        setPredicting(true);
        setError('');

        try {
            const response = await api.post('/api/predict-role', {
                text: resumeText,
                skills: extractedSkills
            });

            setPrediction(response.data);
            setShowPercentages({});
            goToStep('step3');
        } catch (err) {
            setError(err.message || 'Failed to predict career role');
        } finally {
            setPredicting(false);
        }
    };

    const goToStep = (step) => {
        setActiveTab(step);
    };

    const togglePercentage = (index) => {
        setShowPercentages(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Job Fit Analyzer - Skills required for different jobs (97 roles)
    const JOB_SKILLS_MAP = {
        // AI/ML/Data
        'prompt engineer': ['Prompt Engineering', 'ChatGPT', 'GPT', 'LLM', 'OpenAI', 'Claude', 'Langchain', 'AI', 'NLP'],
        'llm engineer': ['LLM', 'Python', 'Transformers', 'Fine-tuning', 'NLP', 'Hugging Face', 'RAG', 'Vector Database'],
        'generative ai engineer': ['Generative AI', 'Python', 'LLM', 'Stable Diffusion', 'Deep Learning', 'PyTorch'],
        'ai/ml engineer': ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NumPy', 'PyTorch', 'Keras'],
        'ai product manager': ['AI', 'Product Management', 'Machine Learning', 'Strategy', 'Roadmapping', 'Data Science'],
        'mlops engineer': ['MLOps', 'Python', 'Docker', 'Kubernetes', 'MLflow', 'Kubeflow', 'AWS SageMaker'],
        'data scientist': ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Statistics', 'Scikit-learn'],
        'data analyst': ['Python', 'SQL', 'Data Analysis', 'Pandas', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
        'data engineer': ['Python', 'SQL', 'ETL', 'Apache Spark', 'Airflow', 'Kafka', 'Snowflake', 'Data Warehousing'],
        'machine learning engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Docker', 'AWS'],
        'nlp engineer': ['Python', 'NLP', 'BERT', 'Transformers', 'Deep Learning', 'Hugging Face', 'SpaCy'],
        'computer vision engineer': ['Python', 'OpenCV', 'Deep Learning', 'TensorFlow', 'Image Processing', 'YOLO'],
        'ai research scientist': ['Python', 'Deep Learning', 'Research', 'Machine Learning', 'Mathematics', 'PyTorch'],
        'big data engineer': ['Apache Spark', 'Hadoop', 'Python', 'SQL', 'Scala', 'Kafka', 'Hive'],
        'business intelligence developer': ['SQL', 'ETL', 'Data Warehousing', 'Tableau', 'Power BI', 'Reporting'],

        // Software Development
        'software engineer': ['Python', 'Java', 'JavaScript', 'C++', 'Git', 'SQL', 'Docker', 'AWS', 'Algorithms'],
        'senior software engineer': ['System Design', 'Architecture', 'Python', 'Java', 'Leadership', 'Microservices'],
        'junior developer': ['JavaScript', 'HTML', 'CSS', 'Python', 'Git', 'SQL', 'React'],
        'frontend developer': ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Vue', 'Angular', 'SASS'],
        'backend developer': ['Python', 'Java', 'Node.js', 'SQL', 'MongoDB', 'REST API', 'Docker', 'Microservices'],
        'full stack developer': ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB', 'HTML', 'CSS', 'Docker'],
        'web developer': ['HTML', 'CSS', 'JavaScript', 'PHP', 'WordPress', 'MySQL', 'Bootstrap'],
        'api developer': ['REST API', 'GraphQL', 'Node.js', 'Python', 'Swagger', 'OAuth', 'Postman'],
        'tech lead': ['Technical Leadership', 'Code Review', 'Architecture', 'Mentoring', 'Agile', 'System Design'],
        'software architect': ['System Design', 'Architecture Patterns', 'Microservices', 'Cloud', 'API Design'],

        // Mobile
        'mobile developer': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'JavaScript'],
        'ios developer': ['Swift', 'iOS', 'Xcode', 'UIKit', 'SwiftUI', 'Core Data', 'REST API'],
        'android developer': ['Kotlin', 'Android', 'Android Studio', 'Java', 'Jetpack Compose', 'Firebase'],
        'react native developer': ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'iOS', 'Android'],
        'flutter developer': ['Flutter', 'Dart', 'Mobile', 'iOS', 'Android', 'Firebase', 'State Management'],

        // DevOps/Cloud
        'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform', 'Jenkins', 'Ansible'],
        'cloud engineer': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Networking'],
        'cloud architect': ['AWS', 'Azure', 'Architecture', 'Cloud Design', 'Security', 'Terraform'],
        'site reliability engineer': ['Linux', 'Kubernetes', 'Monitoring', 'Python', 'Prometheus', 'Grafana'],
        'platform engineer': ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'ArgoCD', 'Helm', 'GitOps'],
        'systems administrator': ['Linux', 'Windows Server', 'Networking', 'Active Directory', 'VMware', 'Bash'],
        'network engineer': ['Networking', 'Cisco', 'TCP/IP', 'Firewall', 'Routing', 'CCNA', 'VPN'],
        'infrastructure engineer': ['Linux', 'Networking', 'Virtualization', 'Docker', 'Ansible', 'Terraform'],
        'release engineer': ['CI/CD', 'Git', 'Jenkins', 'Deployment', 'Docker', 'Build Systems'],

        // Security
        'security engineer': ['Security', 'Penetration Testing', 'SIEM', 'Firewalls', 'Linux', 'OWASP'],
        'cybersecurity analyst': ['Security', 'Threat Analysis', 'SIEM', 'Incident Response', 'Splunk'],
        'application security engineer': ['Application Security', 'OWASP', 'Code Review', 'SAST', 'DAST'],
        'information security analyst': ['Information Security', 'Risk Assessment', 'Compliance', 'ISO 27001'],
        'penetration tester': ['Penetration Testing', 'Ethical Hacking', 'Kali Linux', 'Burp Suite', 'Metasploit'],

        // Database
        'database administrator': ['SQL', 'PostgreSQL', 'MySQL', 'Database Design', 'Performance Tuning', 'Oracle'],
        'database developer': ['SQL', 'Stored Procedures', 'Database Design', 'PostgreSQL', 'T-SQL', 'PL/SQL'],
        'database architect': ['Database Design', 'Data Modeling', 'SQL', 'Architecture', 'Scalability'],

        // QA
        'qa engineer': ['Testing', 'Selenium', 'Automation', 'Test Cases', 'Python', 'Java', 'Cypress'],
        'qa lead': ['Test Management', 'Team Leadership', 'Testing', 'Strategy', 'Automation'],
        'sdet': ['Automation', 'Java', 'Python', 'Selenium', 'CI/CD', 'Test Frameworks'],
        'manual tester': ['Manual Testing', 'Test Cases', 'Bug Tracking', 'Regression Testing', 'Jira'],
        'performance engineer': ['Performance Testing', 'JMeter', 'Load Testing', 'Monitoring', 'Gatling'],

        // Design
        'ui/ux designer': ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'Adobe XD'],
        'product designer': ['Product Design', 'Figma', 'User Research', 'Prototyping', 'Design Thinking'],
        'graphic designer': ['Adobe Photoshop', 'Adobe Illustrator', 'Typography', 'Branding', 'InDesign'],
        'ux researcher': ['User Research', 'Usability Testing', 'Interviews', 'Data Analysis', 'Surveys'],
        'visual designer': ['Visual Design', 'Adobe Creative Suite', 'Branding', 'UI Design', 'Typography'],
        'interaction designer': ['Interaction Design', 'Prototyping', 'Animation', 'UX', 'Figma'],

        // Product & Project
        'product manager': ['Product Management', 'Roadmapping', 'User Stories', 'Agile', 'Analytics', 'Jira'],
        'technical product manager': ['Product Management', 'Technical Knowledge', 'API', 'System Design', 'SQL'],
        'product owner': ['Product Ownership', 'Backlog Management', 'User Stories', 'Agile', 'Scrum'],
        'project manager': ['Project Management', 'Agile', 'Scrum', 'Risk Management', 'Jira', 'PMP'],
        'program manager': ['Program Management', 'Strategy', 'Stakeholder Management', 'Portfolio', 'Leadership'],
        'scrum master': ['Scrum', 'Agile', 'Facilitation', 'Sprint Planning', 'Jira', 'Kanban'],
        'agile coach': ['Agile', 'Scrum', 'Kanban', 'Coaching', 'SAFe', 'Lean', 'Facilitation'],

        // Business
        'business analyst': ['Business Analysis', 'Requirements Gathering', 'SQL', 'Data Analysis', 'Jira'],
        'business intelligence analyst': ['SQL', 'Tableau', 'Power BI', 'Data Visualization', 'Reporting'],
        'systems analyst': ['Systems Analysis', 'Requirements', 'Documentation', 'Process Modeling', 'SQL'],
        'operations analyst': ['Operations', 'Data Analysis', 'Process Improvement', 'Excel', 'Reporting'],

        // Technical Writing & Support
        'technical writer': ['Technical Writing', 'Documentation', 'API Documentation', 'Markdown', 'Git'],
        'technical support engineer': ['Troubleshooting', 'Customer Support', 'Linux', 'Networking', 'SQL'],
        'customer success engineer': ['Customer Success', 'Technical Support', 'API', 'Onboarding', 'SQL'],
        'support engineer': ['Technical Support', 'Troubleshooting', 'Customer Service', 'Documentation'],
        'help desk technician': ['Technical Support', 'Troubleshooting', 'Windows', 'Customer Service'],
        'desktop support engineer': ['Desktop Support', 'Windows', 'Hardware', 'Active Directory', 'Networking'],

        // Architecture
        'solutions architect': ['System Design', 'Architecture', 'Cloud', 'AWS', 'Microservices', 'Security'],
        'enterprise architect': ['Enterprise Architecture', 'TOGAF', 'Strategy', 'Cloud', 'Digital Transformation'],
        'data architect': ['Data Architecture', 'Data Modeling', 'Data Warehousing', 'SQL', 'ETL'],
        'integration architect': ['Integration', 'API', 'Middleware', 'ESB', 'Microservices', 'REST'],

        // Emerging Tech
        'blockchain developer': ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3', 'JavaScript', 'Blockchain'],
        'ar/vr developer': ['Unity', 'C#', '3D Development', 'AR', 'VR', 'Unreal Engine'],
        'game developer': ['Unity', 'C#', 'Game Design', 'C++', 'Unreal Engine', 'Graphics', '3D'],
        'iot developer': ['IoT', 'Embedded Systems', 'Python', 'C', 'Arduino', 'MQTT', 'Sensors'],
        'robotics engineer': ['Robotics', 'ROS', 'Python', 'C++', 'Control Systems', 'Computer Vision'],

        // Leadership
        'engineering manager': ['Team Leadership', 'People Management', 'Agile', 'Hiring', 'Technical Background'],
        'director of engineering': ['Engineering Leadership', 'Strategy', 'Team Building', 'Process', 'OKRs'],
        'vp of engineering': ['Engineering Leadership', 'Strategy', 'Organization Building', 'Technical Vision'],
        'cto': ['Technology Strategy', 'Leadership', 'Architecture', 'Team Building', 'Innovation'],
        'it manager': ['IT Management', 'Team Leadership', 'Infrastructure', 'Budget', 'Operations'],

        // Sales & Consulting
        'sales engineer': ['Technical Sales', 'Product Demo', 'Solution Design', 'Communication', 'API'],
        'solutions engineer': ['Solutions Design', 'Technical Pre-sales', 'Demo', 'Integration', 'Cloud'],
        'it consultant': ['IT Consulting', 'Project Management', 'Business Analysis', 'Cloud', 'Strategy'],
        'technology consultant': ['Technology Consulting', 'Strategy', 'Digital Transformation', 'Cloud'],

        // Marketing Tech
        'growth engineer': ['Growth', 'A/B Testing', 'Analytics', 'Python', 'SQL', 'Marketing Automation'],
        'marketing technologist': ['Marketing Technology', 'Analytics', 'Automation', 'CRM', 'SQL'],
        'seo specialist': ['SEO', 'Analytics', 'Google Analytics', 'Content Strategy', 'HTML'],

        // IT
        'it administrator': ['IT Administration', 'Windows', 'Active Directory', 'Networking', 'Linux']
    };

    // Job descriptions for each role (top 3 unsuitable roles)
    const JOB_DESCRIPTIONS = {
        'prompt engineer': 'A Prompt Engineer designs, optimizes, and evaluates prompts for large language models like GPT-4, Claude, and other LLMs to achieve desired outputs for various AI applications.',
        'llm engineer': 'An LLM Engineer builds and deploys large language model applications, implements RAG systems, fine-tunes models, and creates production-ready AI systems.',
        'generative ai engineer': 'A Generative AI Engineer develops applications using generative models for text, image, and content creation using technologies like Stable Diffusion and GPT.',
        'ai/ml engineer': 'An AI/ML Engineer builds and deploys machine learning models, develops AI solutions, and implements deep learning algorithms for production systems.',
        'data scientist': 'A Data Scientist analyzes complex datasets to extract insights and build predictive models using statistical methods and machine learning.',
        'software engineer': 'A Software Engineer designs, develops, and maintains software applications with clean, efficient code and collaborative development practices.',
        'frontend developer': 'A Frontend Developer builds user-facing web interfaces using HTML, CSS, and JavaScript frameworks with focus on responsive design.',
        'backend developer': 'A Backend Developer builds server-side applications, APIs, and databases, handling business logic and system integration.',
        'full stack developer': 'A Full Stack Developer works on both frontend and backend, building complete web applications from UI to database.',
        'devops engineer': 'A DevOps Engineer automates deployment pipelines, manages infrastructure, and ensures continuous integration and delivery.',
        'cloud engineer': 'A Cloud Engineer designs and manages cloud infrastructure on AWS, Azure, or GCP with focus on scalability and security.',
        'product manager': 'A Product Manager defines product vision, manages roadmaps, and works with teams to deliver valuable features to users.',
        'ui/ux designer': 'A UI/UX Designer creates intuitive user interfaces and experiences through research, wireframing, and prototyping.',
        'qa engineer': 'A QA Engineer ensures software quality through testing, automation, and quality assurance processes.'
    };

    const analyzeJobFit = () => {
        if (!jobInput.trim()) return;

        setAnalyzingFit(true);
        setJobFitResult(null);

        // Simulate analysis delay
        setTimeout(() => {
            const jobLower = jobInput.toLowerCase().trim();
            let requiredSkills = [];
            let matchedJob = null;

            // Find matching job (with fuzzy matching for typos)
            for (const [job, skills] of Object.entries(JOB_SKILLS_MAP)) {
                if (jobLower.includes(job) || job.includes(jobLower)) {
                    requiredSkills = skills;
                    matchedJob = job;
                    break;
                }
            }

            // If no exact match, try partial matching for typo correction
            if (!matchedJob) {
                const jobWords = jobLower.split(/[\s\-_]+/);
                for (const [job, skills] of Object.entries(JOB_SKILLS_MAP)) {
                    const jobParts = job.split(' ');
                    // Check for partial word matches (handles typos like "develper" -> "developer")
                    const hasMatch = jobWords.some(word => {
                        if (word.length < 3) return false;
                        return jobParts.some(part => {
                            // Check if words are similar (allows 2 char difference)
                            if (part.startsWith(word.slice(0, 3)) || word.startsWith(part.slice(0, 3))) {
                                return true;
                            }
                            // Check if one contains the other
                            return part.includes(word) || word.includes(part);
                        });
                    });
                    if (hasMatch) {
                        requiredSkills = skills;
                        matchedJob = job;
                        break;
                    }
                }
            }

            // Default to software engineer if no match
            if (!matchedJob) {
                matchedJob = 'software engineer';
                requiredSkills = JOB_SKILLS_MAP['software engineer'];
            }

            // Get job description
            const jobDescription = JOB_DESCRIPTIONS[matchedJob];

            // Format corrected job title (Title Case)
            const correctedJobTitle = matchedJob
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Calculate match percentage
            const userSkillsLower = extractedSkills.map(s => s.toLowerCase());
            const matchedSkills = requiredSkills.filter(skill =>
                userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
            );
            const missingSkills = requiredSkills.filter(skill =>
                !userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
            );

            const fitPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

            let fitLevel, fitColor, fitMessage;
            if (fitPercentage >= 70) {
                fitLevel = 'Excellent Fit';
                fitColor = '#10b981';
                fitMessage = 'You are highly qualified for this role!';
            } else if (fitPercentage >= 50) {
                fitLevel = 'Good Fit';
                fitColor = '#6366f1';
                fitMessage = 'You have good potential for this role with some skill development.';
            } else if (fitPercentage >= 30) {
                fitLevel = 'Partial Fit';
                fitColor = '#f59e0b';
                fitMessage = 'Consider building more relevant skills for this role.';
            } else {
                fitLevel = 'Needs Development';
                fitColor = '#ef4444';
                fitMessage = 'This role requires significant skill building.';
            }

            setJobFitResult({
                job: jobInput,
                matchedJob,
                correctedJobTitle,
                jobDescription,
                fitPercentage,
                fitLevel,
                fitColor,
                fitMessage,
                matchedSkills,
                missingSkills,
                requiredSkills
            });

            setAnalyzingFit(false);
        }, 800);
    };

    // Generate PDF Report
    const generateReport = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Colors
        const primaryColor = [99, 102, 241]; // Indigo
        const textDark = [31, 41, 55];
        const textGray = [107, 114, 128];

        // Header - Title
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Career Analysis Report', pageWidth / 2, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated by Smart Career Advisor', pageWidth / 2, 30, { align: 'center' });

        y = 50;

        // Section: Resume File
        doc.setTextColor(...textDark);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resume Information', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textGray);
        doc.text(`File: ${file?.name || 'N/A'}`, margin, y);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, y);
        y += 12;

        // Section: Extracted Skills
        doc.setTextColor(...textDark);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Extracted Skills', margin, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textGray);
        const skillsText = extractedSkills.length > 0 ? extractedSkills.join(', ') : 'No skills extracted';
        const skillsLines = doc.splitTextToSize(skillsText, pageWidth - (margin * 2));
        doc.text(skillsLines, margin, y);
        y += skillsLines.length * 5 + 10;

        // Section: AI Model Predictions
        if (prediction) {
            doc.setTextColor(...textDark);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('AI Model Predictions', margin, y);
            y += 8;

            // SVM & RF boxes
            doc.setFillColor(249, 250, 251);
            doc.roundedRect(margin, y, 75, 22, 3, 3, 'F');
            doc.roundedRect(margin + 80, y, 75, 22, 3, 3, 'F');

            doc.setFontSize(8);
            doc.setTextColor(...textGray);
            doc.text('SVM MODEL', margin + 5, y + 7);
            doc.text('RANDOM FOREST', margin + 85, y + 7);

            doc.setFontSize(10);
            doc.setTextColor(...textDark);
            doc.setFont('helvetica', 'bold');
            doc.text(prediction.svm_role || 'N/A', margin + 5, y + 16);
            doc.text(prediction.rf_role || 'N/A', margin + 85, y + 16);
            y += 30;

            // Top Recommended Roles
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Top Recommended Roles', margin, y);
            y += 8;

            prediction.top_roles?.slice(0, 3).forEach((role, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textDark);
                doc.text(`${index + 1}. ${role.role}`, margin + 5, y);
                doc.setTextColor(...textGray);
                doc.text(`${Math.round(role.confidence * 100)}%`, margin + 120, y);
                y += 7;
            });
            y += 8;
        }

        // Section: Job Fit Analysis (if available)
        if (jobFitResult) {
            doc.setTextColor(...textDark);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Job Fit Analysis', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Target Role: ${jobFitResult.correctedJobTitle}`, margin, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...textGray);
            const descLines = doc.splitTextToSize(jobFitResult.jobDescription, pageWidth - (margin * 2));
            doc.text(descLines.slice(0, 2), margin, y);
            y += descLines.slice(0, 2).length * 4 + 6;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...primaryColor);
            doc.text(`Fit Level: ${jobFitResult.fitLevel} (${jobFitResult.fitPercentage}%)`, margin, y);
            y += 10;

            // Matched Skills
            if (jobFitResult.matchedSkills?.length > 0) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(16, 185, 129); // Green
                doc.text(`Skills You Have (${jobFitResult.matchedSkills.length}):`, margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textGray);
                const matchedText = jobFitResult.matchedSkills.join(', ');
                const matchedLines = doc.splitTextToSize(matchedText, pageWidth - (margin * 2));
                doc.text(matchedLines.slice(0, 1), margin, y);
                y += 8;
            }

            // Missing Skills
            if (jobFitResult.missingSkills?.length > 0) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(239, 68, 68); // Red
                doc.text(`Skills to Develop (${jobFitResult.missingSkills.length}):`, margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textGray);
                const missingText = jobFitResult.missingSkills.join(', ');
                const missingLines = doc.splitTextToSize(missingText, pageWidth - (margin * 2));
                doc.text(missingLines.slice(0, 1), margin, y);
                y += 10;
            }
        }

        // Footer
        doc.setFillColor(249, 250, 251);
        doc.rect(0, 280, pageWidth, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...textGray);
        doc.text('Smart Career Advisor - AI-powered career guidance', pageWidth / 2, 288, { align: 'center' });

        // Save the PDF
        const fileName = `Career_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    return (
        <>
            <Header />

            <main className="main">
                <div className="resume-analyzer-container">
                    <h1>Resume Analyzer</h1>
                    <p className="subtitle">Upload your resume and get instant AI-powered career insights</p>

                    <div className="analyzer-tabs">
                        <div className="tab-navigation">
                            <button
                                className={`tab-btn ${activeTab === 'step1' ? 'active' : ''}`}
                                onClick={() => goToStep('step1')}
                            >
                                <span className="tab-number">1</span>
                                <span className="tab-label">Upload Resume</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'step2' ? 'active' : ''}`}
                                disabled={!uploadSuccess}
                                onClick={() => uploadSuccess && goToStep('step2')}
                            >
                                <span className="tab-number">2</span>
                                <span className="tab-label">Extract Skills</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'step3' ? 'active' : ''}`}
                                disabled={!prediction}
                                onClick={() => prediction && goToStep('step3')}
                            >
                                <span className="tab-number">3</span>
                                <span className="tab-label">Career Prediction</span>
                            </button>
                        </div>

                        {/* Step 1: Upload Resume */}
                        <div className={`tab-content ${activeTab === 'step1' ? 'active' : ''}`} id="step1">
                            <div className="analyzer-card">
                                <h2>Step 1: Upload Your Resume</h2>
                                <p>Upload a PDF or TXT file containing your resume. The system will extract skills and analyze your career fit.</p>

                                <div className="upload-area">
                                    <label htmlFor="resumeFile" className="upload-box large">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        <h3>Drop your resume here</h3>
                                        <p>or click to browse (PDF or TXT, max 5MB)</p>
                                    </label>
                                    <input
                                        type="file"
                                        id="resumeFile"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.txt"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                {uploading && (
                                    <div className="upload-status">
                                        <div className="spinner"></div>
                                        <p>Processing your resume...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="error-msg" style={{ marginTop: '1rem' }}>{error}</div>
                                )}

                                {uploadSuccess && (
                                    <div className="upload-success">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <p>Resume uploaded successfully! Click Next to continue.</p>
                                    </div>
                                )}

                                <div className="tab-actions">
                                    {uploadSuccess && (
                                        <button className="btn btn-primary" onClick={() => goToStep('step2')}>
                                            Next Step
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Extract Skills */}
                        <div className={`tab-content ${activeTab === 'step2' ? 'active' : ''}`} id="step2">
                            <div className="analyzer-card">
                                <h2>Step 2: Extracted Skills</h2>
                                <p>These are the key skills detected from your resume. You can edit them if needed.</p>

                                <div className="skills-section">
                                    <h4>Identified Skills</h4>
                                    <div className="skills-tags">
                                        {extractedSkills.length > 0 ? (
                                            extractedSkills.map((skill, index) => (
                                                <span key={index} className="skill-tag">{skill}</span>
                                            ))
                                        ) : (
                                            <p className="loading-msg">No skills found</p>
                                        )}
                                    </div>
                                </div>

                                <div className="resume-preview-section">
                                    <h4>Resume Text Preview</h4>
                                    <div className="preview-box">
                                        {resumeText || 'Resume text will appear here...'}
                                    </div>
                                </div>

                                <div className="tab-actions">
                                    <button className="btn btn-secondary" onClick={() => goToStep('step1')}>
                                        Back
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handlePredictRole}
                                        disabled={predicting}
                                    >
                                        {predicting ? 'Analyzing...' : 'Analyze & Predict'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Career Prediction */}
                        <div className={`tab-content ${activeTab === 'step3' ? 'active' : ''}`} id="step3">
                            <div className="analyzer-card">
                                <h2>Step 3: Career Prediction Analysis</h2>

                                {prediction && (
                                    <>
                                        <div className="model-comparison">
                                            <h3>AI Model Predictions</h3>

                                            {/* Compact Model Cards */}
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                                marginTop: '1rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <div style={{
                                                    flex: '1 1 120px',
                                                    background: '#ffffff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    padding: '0.75rem',
                                                    textAlign: 'center',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}>
                                                    <p style={{
                                                        margin: '0 0 0.25rem',
                                                        fontSize: '0.65rem',
                                                        color: '#6b7280',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>SVM</p>
                                                    <p style={{
                                                        margin: 0,
                                                        fontWeight: '600',
                                                        fontSize: '0.85rem',
                                                        color: '#1f2937'
                                                    }}>{prediction.svm_role}</p>
                                                </div>
                                                <div style={{
                                                    flex: '1 1 120px',
                                                    background: '#ffffff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    padding: '0.75rem',
                                                    textAlign: 'center',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                }}>
                                                    <p style={{
                                                        margin: '0 0 0.25rem',
                                                        fontSize: '0.65rem',
                                                        color: '#6b7280',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>Random Forest</p>
                                                    <p style={{
                                                        margin: 0,
                                                        fontWeight: '600',
                                                        fontSize: '0.85rem',
                                                        color: '#1f2937'
                                                    }}>{prediction.rf_role}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="top-roles-section" style={{ marginTop: '1.5rem' }}>
                                            <h3>Suitable Roles</h3>
                                            <div style={{ marginTop: '1rem' }}>
                                                {prediction.top_roles?.slice(0, 3).map((item, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.875rem',
                                                        background: index === 0 ? '#eef2ff' : '#ffffff',
                                                        border: index === 0 ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                                        borderRadius: '10px',
                                                        marginBottom: '0.75rem'
                                                    }}>
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            background: index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#d1d5db',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.1rem',
                                                            flexShrink: 0
                                                        }}>
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{
                                                                margin: 0,
                                                                fontSize: '1rem',
                                                                fontWeight: index === 0 ? '700' : '600',
                                                                color: '#1f2937'
                                                            }}>{item.role}</p>
                                                            {showPercentages[index] && (
                                                                <p style={{
                                                                    margin: '0.25rem 0 0',
                                                                    fontSize: '0.8rem',
                                                                    color: '#6366f1',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {Math.round(item.confidence * 100)}% match
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => togglePercentage(index)}
                                                            style={{
                                                                padding: '0.35rem 0.6rem',
                                                                fontSize: '0.7rem',
                                                                background: showPercentages[index] ? '#6366f1' : '#f3f4f6',
                                                                color: showPercentages[index] ? '#ffffff' : '#6b7280',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {showPercentages[index] ? 'Hide %' : 'Show %'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Job Fit Analyzer */}
                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '1.25rem',
                                            background: '#f9fafb',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <h3 style={{
                                                margin: '0 0 0.75rem',
                                                fontSize: '1rem',
                                                color: '#1f2937',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                🎯 Analyze Job Fit
                                            </h3>
                                            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                Enter a job title to see if you're a good fit based on your skills
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <input
                                                    type="text"
                                                    value={jobInput}
                                                    onChange={(e) => setJobInput(e.target.value)}
                                                    placeholder="e.g., Data Scientist, Frontend Developer..."
                                                    style={{
                                                        flex: '1 1 200px',
                                                        minWidth: '0',
                                                        padding: '0.75rem 1rem',
                                                        fontSize: '0.9rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        outline: 'none'
                                                    }}
                                                    onKeyPress={(e) => e.key === 'Enter' && analyzeJobFit()}
                                                />
                                                <button
                                                    onClick={analyzeJobFit}
                                                    disabled={analyzingFit || !jobInput.trim()}
                                                    style={{
                                                        flex: '0 0 auto',
                                                        padding: '0.75rem 1.25rem',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        background: '#6366f1',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: analyzingFit || !jobInput.trim() ? 'not-allowed' : 'pointer',
                                                        opacity: analyzingFit || !jobInput.trim() ? 0.6 : 1,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {analyzingFit ? 'Analyzing...' : 'Analyze Fit'}
                                                </button>
                                            </div>

                                            {/* Job Fit Results */}
                                            {jobFitResult && (
                                                <div style={{
                                                    marginTop: '1rem',
                                                    padding: '1rem',
                                                    background: '#ffffff',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${jobFitResult.fitColor}`
                                                }}>
                                                    {/* Corrected Job Title */}
                                                    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                            <span style={{ fontSize: '1.25rem' }}>💼</span>
                                                            <p style={{
                                                                margin: 0,
                                                                fontSize: '1.1rem',
                                                                fontWeight: '700',
                                                                color: '#1f2937'
                                                            }}>{jobFitResult.correctedJobTitle}</p>
                                                            {jobFitResult.job.toLowerCase() !== jobFitResult.matchedJob && (
                                                                <span style={{
                                                                    padding: '0.15rem 0.4rem',
                                                                    fontSize: '0.65rem',
                                                                    background: '#fef3c7',
                                                                    color: '#92400e',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '500'
                                                                }}>Corrected</span>
                                                            )}
                                                        </div>
                                                        <p style={{
                                                            margin: 0,
                                                            fontSize: '0.85rem',
                                                            color: '#6b7280',
                                                            lineHeight: '1.5'
                                                        }}>{jobFitResult.jobDescription}</p>
                                                    </div>

                                                    {/* Fit Level and Percentage */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '1rem',
                                                        flexWrap: 'wrap',
                                                        gap: '1rem'
                                                    }}>
                                                        <div style={{ flex: '1 1 auto', minWidth: '120px' }}>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Fit Level</p>
                                                            <p style={{
                                                                margin: '0.25rem 0 0',
                                                                fontSize: '1.25rem',
                                                                fontWeight: '700',
                                                                color: jobFitResult.fitColor
                                                            }}>{jobFitResult.fitLevel}</p>
                                                        </div>
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: '50%',
                                                            background: `conic-gradient(${jobFitResult.fitColor} ${jobFitResult.fitPercentage}%, #e5e7eb ${jobFitResult.fitPercentage}%)`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            <div style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                borderRadius: '50%',
                                                                background: '#ffffff',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '700',
                                                                color: jobFitResult.fitColor
                                                            }}>
                                                                {jobFitResult.fitPercentage}%
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#374151' }}>
                                                        {jobFitResult.fitMessage}
                                                    </p>

                                                    {jobFitResult.matchedSkills.length > 0 && (
                                                        <div style={{ marginBottom: '0.75rem' }}>
                                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
                                                                ✓ Skills You Have ({jobFitResult.matchedSkills.length})
                                                            </p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                                {jobFitResult.matchedSkills.map((skill, i) => (
                                                                    <span key={i} style={{
                                                                        padding: '0.25rem 0.5rem',
                                                                        fontSize: '0.75rem',
                                                                        background: '#d1fae5',
                                                                        color: '#065f46',
                                                                        borderRadius: '4px'
                                                                    }}>{skill}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {jobFitResult.missingSkills.length > 0 && (
                                                        <div>
                                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                                                                ✗ Skills to Develop ({jobFitResult.missingSkills.length})
                                                            </p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                                {jobFitResult.missingSkills.map((skill, i) => (
                                                                    <span key={i} style={{
                                                                        padding: '0.25rem 0.5rem',
                                                                        fontSize: '0.75rem',
                                                                        background: '#fee2e2',
                                                                        color: '#991b1b',
                                                                        borderRadius: '4px'
                                                                    }}>{skill}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="tab-actions">
                                    <button className="btn btn-secondary" onClick={() => goToStep('step2')}>
                                        Back
                                    </button>
                                    <button className="btn btn-primary" onClick={generateReport}>
                                        Download Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default ResumeAnalyzer;
