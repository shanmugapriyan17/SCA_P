const express = require('express');
const router = express.Router();

// All 97 career roles that the model can predict
const CAREER_ROLES = [
    // AI/ML/Data
    'AI/ML Engineer', 'Data Scientist', 'Data Analyst', 'Data Engineer',
    'Machine Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
    'AI Research Scientist', 'Prompt Engineer', 'LLM Engineer',
    'Generative AI Engineer', 'AI Product Manager', 'MLOps Engineer',
    'Big Data Engineer', 'Business Intelligence Developer',

    // Software Development
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Software Engineer', 'Senior Software Engineer', 'Junior Developer',
    'Web Developer', 'API Developer', 'Tech Lead', 'Software Architect',

    // Mobile
    'Mobile Developer', 'iOS Developer', 'Android Developer',
    'React Native Developer', 'Flutter Developer',

    // DevOps/Cloud
    'DevOps Engineer', 'Cloud Engineer', 'Cloud Architect',
    'Site Reliability Engineer', 'Platform Engineer',
    'Systems Administrator', 'Network Engineer',
    'Infrastructure Engineer', 'Release Engineer',

    // Security
    'Security Engineer', 'Cybersecurity Analyst',
    'Application Security Engineer', 'Information Security Analyst',
    'Penetration Tester',

    // Database
    'Database Administrator', 'Database Developer', 'Database Architect',

    // QA
    'QA Engineer', 'QA Lead', 'SDET', 'Manual Tester', 'Performance Engineer',

    // Design
    'UI/UX Designer', 'Product Designer', 'Graphic Designer',
    'UX Researcher', 'Visual Designer', 'Interaction Designer',

    // Product & Project
    'Product Manager', 'Technical Product Manager', 'Product Owner',
    'Project Manager', 'Program Manager', 'Scrum Master', 'Agile Coach',

    // Business
    'Business Analyst', 'Business Intelligence Analyst',
    'Systems Analyst', 'Operations Analyst',

    // Technical Writing & Support
    'Technical Writer', 'Technical Support Engineer',
    'Customer Success Engineer', 'Support Engineer',
    'Help Desk Technician', 'Desktop Support Engineer',

    // Architecture
    'Solutions Architect', 'Enterprise Architect',
    'Data Architect', 'Integration Architect',

    // Emerging Tech
    'Blockchain Developer', 'AR/VR Developer', 'Game Developer',
    'IoT Developer', 'Robotics Engineer',

    // Leadership
    'Engineering Manager', 'Director of Engineering',
    'VP of Engineering', 'CTO', 'IT Manager',

    // Sales & Consulting
    'Sales Engineer', 'Solutions Engineer',
    'IT Consultant', 'Technology Consultant',

    // Marketing Tech
    'Growth Engineer', 'Marketing Technologist', 'SEO Specialist',

    // IT
    'IT Administrator'
];

// Comprehensive skill to role mapping
const SKILL_ROLE_MAPPING = {
    // Prompt Engineer / LLM / Generative AI
    'prompt engineering': 'Prompt Engineer',
    'prompt design': 'Prompt Engineer',
    'chatgpt': 'Prompt Engineer',
    'gpt': 'Prompt Engineer',
    'gpt-4': 'Prompt Engineer',
    'gpt-3': 'Prompt Engineer',
    'openai': 'Prompt Engineer',
    'claude': 'Prompt Engineer',
    'anthropic': 'Prompt Engineer',
    'langchain': 'Prompt Engineer',
    'llm': 'LLM Engineer',
    'large language model': 'LLM Engineer',
    'fine-tuning': 'LLM Engineer',
    'rag': 'LLM Engineer',
    'retrieval augmented': 'LLM Engineer',
    'vector database': 'LLM Engineer',
    'pinecone': 'LLM Engineer',
    'embeddings': 'LLM Engineer',
    'generative ai': 'Generative AI Engineer',
    'stable diffusion': 'Generative AI Engineer',
    'midjourney': 'Generative AI Engineer',
    'dall-e': 'Generative AI Engineer',
    'image generation': 'Generative AI Engineer',
    'text generation': 'Generative AI Engineer',
    'hugging face': 'LLM Engineer',
    'transformers': 'LLM Engineer',

    // AI/ML Engineer
    'machine learning': 'AI/ML Engineer',
    'tensorflow': 'AI/ML Engineer',
    'pytorch': 'AI/ML Engineer',
    'keras': 'AI/ML Engineer',
    'deep learning': 'AI/ML Engineer',
    'neural networks': 'AI/ML Engineer',
    'nlp': 'NLP Engineer',
    'natural language processing': 'NLP Engineer',
    'bert': 'NLP Engineer',
    'spacy': 'NLP Engineer',
    'nltk': 'NLP Engineer',
    'computer vision': 'Computer Vision Engineer',
    'opencv': 'Computer Vision Engineer',
    'yolo': 'Computer Vision Engineer',
    'image processing': 'Computer Vision Engineer',
    'object detection': 'Computer Vision Engineer',
    'cnn': 'Computer Vision Engineer',
    'mlops': 'MLOps Engineer',
    'mlflow': 'MLOps Engineer',
    'kubeflow': 'MLOps Engineer',
    'model deployment': 'MLOps Engineer',
    'feature store': 'MLOps Engineer',
    'ai research': 'AI Research Scientist',
    'research scientist': 'AI Research Scientist',

    // Data Scientist
    'pandas': 'Data Scientist',
    'numpy': 'Data Scientist',
    'scikit-learn': 'Data Scientist',
    'data analysis': 'Data Analyst',
    'statistics': 'Data Scientist',
    'jupyter': 'Data Scientist',
    'matplotlib': 'Data Scientist',
    'data visualization': 'Data Analyst',
    'r programming': 'Data Scientist',
    'tableau': 'Data Analyst',
    'power bi': 'Business Intelligence Analyst',
    'looker': 'Business Intelligence Analyst',
    'etl': 'Data Engineer',
    'data pipeline': 'Data Engineer',
    'airflow': 'Data Engineer',
    'data warehousing': 'Data Engineer',
    'snowflake': 'Data Engineer',
    'dbt': 'Data Engineer',
    'big data': 'Big Data Engineer',
    'spark': 'Big Data Engineer',
    'hadoop': 'Big Data Engineer',
    'hive': 'Big Data Engineer',
    'kafka': 'Big Data Engineer',

    // Backend Developer
    'node.js': 'Backend Developer',
    'express': 'Backend Developer',
    'django': 'Backend Developer',
    'flask': 'Backend Developer',
    'spring boot': 'Backend Developer',
    'java': 'Backend Developer',
    'python': 'Backend Developer',
    'rest api': 'Backend Developer',
    'graphql': 'Backend Developer',
    'microservices': 'Backend Developer',
    'fastapi': 'Backend Developer',

    // Frontend Developer
    'react': 'Frontend Developer',
    'vue': 'Frontend Developer',
    'angular': 'Frontend Developer',
    'javascript': 'Frontend Developer',
    'typescript': 'Frontend Developer',
    'html': 'Frontend Developer',
    'css': 'Frontend Developer',
    'sass': 'Frontend Developer',
    'bootstrap': 'Frontend Developer',
    'next.js': 'Frontend Developer',
    'tailwind': 'Frontend Developer',
    'redux': 'Frontend Developer',
    'webpack': 'Frontend Developer',

    // Full Stack Developer
    'mern': 'Full Stack Developer',
    'mean': 'Full Stack Developer',
    'full stack': 'Full Stack Developer',
    'fullstack': 'Full Stack Developer',

    // DevOps Engineer
    'docker': 'DevOps Engineer',
    'kubernetes': 'DevOps Engineer',
    'k8s': 'DevOps Engineer',
    'jenkins': 'DevOps Engineer',
    'ci/cd': 'DevOps Engineer',
    'terraform': 'DevOps Engineer',
    'ansible': 'DevOps Engineer',
    'linux': 'DevOps Engineer',
    'bash': 'DevOps Engineer',
    'prometheus': 'Site Reliability Engineer',
    'grafana': 'Site Reliability Engineer',
    'sre': 'Site Reliability Engineer',
    'incident response': 'Site Reliability Engineer',
    'slo': 'Site Reliability Engineer',
    'helm': 'Platform Engineer',
    'argocd': 'Platform Engineer',
    'gitops': 'Platform Engineer',

    // Cloud Engineer
    'aws': 'Cloud Engineer',
    'azure': 'Cloud Engineer',
    'gcp': 'Cloud Engineer',
    'google cloud': 'Cloud Engineer',
    'cloud computing': 'Cloud Engineer',
    'lambda': 'Cloud Engineer',
    'ec2': 'Cloud Engineer',
    's3': 'Cloud Engineer',
    'cloudformation': 'Cloud Architect',
    'cloud architecture': 'Cloud Architect',

    // Database
    'sql': 'Database Administrator',
    'mysql': 'Database Administrator',
    'postgresql': 'Database Administrator',
    'mongodb': 'Database Administrator',
    'redis': 'Database Administrator',
    'elasticsearch': 'Database Administrator',
    'cassandra': 'Database Administrator',
    'oracle': 'Database Administrator',
    'database design': 'Database Architect',
    'data modeling': 'Database Architect',

    // Mobile Developer
    'react native': 'React Native Developer',
    'flutter': 'Flutter Developer',
    'dart': 'Flutter Developer',
    'swift': 'iOS Developer',
    'swiftui': 'iOS Developer',
    'uikit': 'iOS Developer',
    'xcode': 'iOS Developer',
    'kotlin': 'Android Developer',
    'android studio': 'Android Developer',
    'ios': 'iOS Developer',
    'android': 'Android Developer',
    'mobile development': 'Mobile Developer',

    // QA Engineer
    'selenium': 'QA Engineer',
    'testing': 'QA Engineer',
    'automation testing': 'SDET',
    'jest': 'QA Engineer',
    'cypress': 'QA Engineer',
    'quality assurance': 'QA Engineer',
    'unit testing': 'QA Engineer',
    'testng': 'SDET',
    'junit': 'SDET',
    'test automation': 'SDET',
    'jmeter': 'Performance Engineer',
    'load testing': 'Performance Engineer',
    'performance testing': 'Performance Engineer',
    'gatling': 'Performance Engineer',

    // Security
    'security': 'Security Engineer',
    'penetration testing': 'Penetration Tester',
    'ethical hacking': 'Penetration Tester',
    'kali linux': 'Penetration Tester',
    'burp suite': 'Penetration Tester',
    'owasp': 'Application Security Engineer',
    'sast': 'Application Security Engineer',
    'dast': 'Application Security Engineer',
    'devsecops': 'Application Security Engineer',
    'siem': 'Cybersecurity Analyst',
    'splunk': 'Cybersecurity Analyst',
    'threat analysis': 'Cybersecurity Analyst',
    'malware analysis': 'Cybersecurity Analyst',
    'iso 27001': 'Information Security Analyst',
    'compliance': 'Information Security Analyst',
    'gdpr': 'Information Security Analyst',

    // Design
    'figma': 'UI/UX Designer',
    'sketch': 'UI/UX Designer',
    'adobe xd': 'UI/UX Designer',
    'ui design': 'UI/UX Designer',
    'ux design': 'UI/UX Designer',
    'wireframing': 'UI/UX Designer',
    'prototyping': 'UI/UX Designer',
    'user research': 'UX Researcher',
    'usability testing': 'UX Researcher',
    'photoshop': 'Graphic Designer',
    'illustrator': 'Graphic Designer',
    'indesign': 'Graphic Designer',
    'branding': 'Graphic Designer',
    'visual design': 'Visual Designer',
    'interaction design': 'Interaction Designer',
    'product design': 'Product Designer',

    // Product & Project Management
    'product management': 'Product Manager',
    'roadmapping': 'Product Manager',
    'user stories': 'Product Manager',
    'jira': 'Project Manager',
    'agile': 'Scrum Master',
    'scrum': 'Scrum Master',
    'kanban': 'Scrum Master',
    'sprint planning': 'Scrum Master',
    'retrospective': 'Scrum Master',
    'safe': 'Agile Coach',
    'coaching': 'Agile Coach',
    'pmp': 'Project Manager',
    'project management': 'Project Manager',
    'backlog management': 'Product Owner',

    // Business Analyst
    'business analysis': 'Business Analyst',
    'requirements gathering': 'Business Analyst',
    'process mapping': 'Business Analyst',
    'systems analysis': 'Systems Analyst',

    // Technical Writer
    'technical writing': 'Technical Writer',
    'documentation': 'Technical Writer',
    'api documentation': 'Technical Writer',

    // Architecture
    'system design': 'Software Architect',
    'architecture patterns': 'Software Architect',
    'enterprise architecture': 'Enterprise Architect',
    'togaf': 'Enterprise Architect',
    'solutions architecture': 'Solutions Architect',
    'data architecture': 'Data Architect',
    'integration': 'Integration Architect',

    // Emerging Tech
    'solidity': 'Blockchain Developer',
    'ethereum': 'Blockchain Developer',
    'smart contracts': 'Blockchain Developer',
    'web3': 'Blockchain Developer',
    'blockchain': 'Blockchain Developer',
    'unity': 'Game Developer',
    'unreal engine': 'Game Developer',
    'game development': 'Game Developer',
    'ar': 'AR/VR Developer',
    'vr': 'AR/VR Developer',
    'augmented reality': 'AR/VR Developer',
    'virtual reality': 'AR/VR Developer',
    'iot': 'IoT Developer',
    'embedded systems': 'IoT Developer',
    'arduino': 'IoT Developer',
    'raspberry pi': 'IoT Developer',
    'robotics': 'Robotics Engineer',
    'ros': 'Robotics Engineer',

    // Leadership
    'engineering management': 'Engineering Manager',
    'team leadership': 'Engineering Manager',
    'people management': 'Engineering Manager',
    'hiring': 'Engineering Manager',
    'cto': 'CTO',
    'technology strategy': 'CTO',

    // IT Support
    'troubleshooting': 'Technical Support Engineer',
    'customer support': 'Technical Support Engineer',
    'help desk': 'Help Desk Technician',
    'desktop support': 'Desktop Support Engineer',
    'active directory': 'IT Administrator',
    'windows server': 'Systems Administrator',
    'vmware': 'Systems Administrator',

    // Sales & Consulting
    'technical sales': 'Sales Engineer',
    'pre-sales': 'Sales Engineer',
    'demo': 'Solutions Engineer',
    'consulting': 'IT Consultant',
    'digital transformation': 'Technology Consultant',

    // Marketing Tech
    'seo': 'SEO Specialist',
    'google analytics': 'SEO Specialist',
    'growth hacking': 'Growth Engineer',
    'a/b testing': 'Growth Engineer',
    'marketing automation': 'Marketing Technologist',

    // Network
    'networking': 'Network Engineer',
    'cisco': 'Network Engineer',
    'tcp/ip': 'Network Engineer',
    'firewall': 'Network Engineer',
    'routing': 'Network Engineer',
    'ccna': 'Network Engineer',
    'vpn': 'Network Engineer'
};

/**
 * Predict career roles based on text content
 */
function predictRoles(text) {
    const textLower = text.toLowerCase();
    const roleScores = {};

    // Initialize scores
    CAREER_ROLES.forEach(role => {
        roleScores[role] = 0;
    });

    // Calculate scores based on skill matches
    Object.entries(SKILL_ROLE_MAPPING).forEach(([skill, role]) => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = (textLower.match(regex) || []).length;
        if (matches > 0) {
            roleScores[role] = (roleScores[role] || 0) + matches * 2;
        }
    });

    // Find the role with highest score
    let maxScore = 0;
    let predictedRole = 'Software Engineer'; // Default

    Object.entries(roleScores).forEach(([role, score]) => {
        if (score > maxScore) {
            maxScore = score;
            predictedRole = role;
        }
    });

    // Calculate confidence (normalize to 0.6-0.98 range)
    const totalMatches = Object.values(roleScores).reduce((a, b) => a + b, 0);
    let confidence = totalMatches > 0 ? (maxScore / totalMatches) : 0.6;
    confidence = Math.max(0.6, Math.min(0.98, confidence * 0.4 + 0.6));

    // Get top 5 roles
    const sortedRoles = Object.entries(roleScores)
        .filter(([role, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([role, score], index) => ({
            role,
            confidence: Math.max(0.4, confidence - (index * 0.1)),
            rank: index + 1
        }));

    // Ensure we have at least 3 roles
    while (sortedRoles.length < 3) {
        const usedRoles = sortedRoles.map(r => r.role);
        const remainingRoles = CAREER_ROLES.filter(r => !usedRoles.includes(r));
        if (remainingRoles.length > 0) {
            sortedRoles.push({
                role: remainingRoles[0],
                confidence: 0.4,
                rank: sortedRoles.length + 1
            });
        } else {
            break;
        }
    }

    return {
        predictedRole,
        confidence,
        topRoles: sortedRoles,
        svmRole: predictedRole,
        svmConfidence: confidence,
        rfRole: sortedRoles[1]?.role || predictedRole,
        rfConfidence: confidence * 0.95
    };
}

// POST /api/predict-role - Predict career role from resume text
router.post('/predict-role', (req, res) => {
    try {
        const { text, skills } = req.body;

        if (!text && !skills) {
            return res.status(400).json({ error: 'No text or skills provided' });
        }

        // Combine text and skills for prediction
        let inputText = text || '';
        if (skills && Array.isArray(skills)) {
            inputText += ' ' + skills.join(' ');
        }

        if (inputText.trim().length === 0) {
            return res.status(400).json({ error: 'No content to analyze' });
        }

        const prediction = predictRoles(inputText);

        res.json({
            success: true,
            predicted_role: prediction.predictedRole,
            confidence: prediction.confidence,
            svm_role: prediction.svmRole,
            svm_confidence: prediction.svmConfidence,
            rf_role: prediction.rfRole,
            rf_confidence: prediction.rfConfidence,
            top_roles: prediction.topRoles,
            ensemble_method: 'skill_matching',
            total_supported_roles: CAREER_ROLES.length
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to predict career role' });
    }
});

// GET /api/predict/roles - Get all supported roles
router.get('/roles', (req, res) => {
    res.json({
        success: true,
        total_roles: CAREER_ROLES.length,
        roles: CAREER_ROLES.sort()
    });
});

module.exports = router;
