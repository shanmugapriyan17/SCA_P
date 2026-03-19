/**
 * Skill Gap Analyzer — Module 6: Skill Gap Analysis
 * 
 * Formula: gap = required_skills - user_skills
 * Gap Percentage = (missing / required) × 100
 */

// Required skills per role — comprehensive mapping
const ROLE_REQUIRED_SKILLS = {
    'AI/ML Engineer': ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NumPy', 'Pandas', 'Scikit-learn', 'Statistics', 'Linear Algebra', 'Git'],
    'Data Scientist': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'R', 'Jupyter'],
    'Data Analyst': ['SQL', 'Excel', 'Tableau', 'Python', 'Statistics', 'Power BI', 'Data Visualization', 'Reporting', 'Google Analytics'],
    'Data Engineer': ['Python', 'SQL', 'ETL', 'Apache Spark', 'Airflow', 'Kafka', 'AWS', 'PostgreSQL', 'Docker', 'Snowflake'],
    'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'MLOps', 'Docker', 'Kubernetes', 'AWS SageMaker', 'Feature Engineering', 'Model Deployment'],
    'NLP Engineer': ['Python', 'NLP', 'BERT', 'Transformers', 'Deep Learning', 'SpaCy', 'NLTK', 'Hugging Face', 'Text Classification', 'PyTorch'],
    'Computer Vision Engineer': ['Python', 'OpenCV', 'Deep Learning', 'TensorFlow', 'Image Processing', 'PyTorch', 'CNN', 'Object Detection', 'YOLO'],
    'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'SQL', 'HTML/CSS', 'Git', 'Docker', 'REST API', 'MongoDB', 'TypeScript'],
    'Frontend Developer': ['JavaScript', 'React', 'HTML/CSS', 'CSS', 'TypeScript', 'Angular', 'Redux', 'Webpack', 'Git', 'Figma'],
    'Backend Developer': ['Python', 'Java', 'SQL', 'REST API', 'PostgreSQL', 'Docker', 'Microservices', 'Node.js', 'Git', 'Linux'],
    'Software Engineer': ['Python', 'Java', 'Algorithms', 'Data Structures', 'Git', 'Linux', 'SQL', 'Docker', 'CI/CD', 'Testing'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform', 'Jenkins', 'Ansible', 'Git', 'Python', 'Bash', 'Prometheus'],
    'Cloud Engineer': ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Linux', 'Docker', 'Networking', 'Security', 'CloudFormation', 'Python'],
    'iOS Developer': ['Swift', 'iOS', 'Xcode', 'UIKit', 'SwiftUI', 'Core Data', 'REST API', 'CocoaPods', 'Git'],
    'Android Developer': ['Kotlin', 'Android', 'Android Studio', 'Java', 'Jetpack Compose', 'Firebase', 'REST API', 'Git', 'MVVM'],
    'React Native Developer': ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'iOS', 'Android', 'REST API', 'Firebase', 'Expo'],
    'Flutter Developer': ['Flutter', 'Dart', 'iOS', 'Android', 'Firebase', 'REST API', 'State Management', 'Git'],
    'Security Engineer': ['Security', 'Penetration Testing', 'SIEM', 'Firewalls', 'Linux', 'OWASP', 'Encryption', 'Python', 'Networking'],
    'Cybersecurity Analyst': ['Security', 'Threat Analysis', 'SIEM', 'Incident Response', 'Splunk', 'Wireshark', 'Forensics', 'Compliance'],
    'Database Administrator': ['SQL', 'PostgreSQL', 'MySQL', 'Database Design', 'Performance Tuning', 'Backup', 'Replication', 'Redis', 'Linux'],
    'QA Engineer': ['Testing', 'Selenium', 'Automation', 'Test Cases', 'Python', 'Java', 'CI/CD', 'API Testing', 'Git'],
    'UI/UX Designer': ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'Adobe XD', 'User Testing', 'Design Systems'],
    'Product Manager': ['Product Management', 'Roadmapping', 'User Stories', 'Stakeholder Management', 'Analytics', 'Agile', 'Scrum', 'SQL'],
    'Project Manager': ['Project Management', 'Agile', 'Scrum', 'Stakeholder Management', 'Risk Management', 'Jira', 'MS Project', 'Budget'],
    'Business Analyst': ['Business Analysis', 'Requirements Gathering', 'SQL', 'Data Analysis', 'Documentation', 'Jira', 'Process Mapping'],
    'Blockchain Developer': ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3', 'Blockchain', 'JavaScript', 'Cryptography'],
    'Game Developer': ['Unity', 'C#', 'Game Design', '3D Development', 'Graphics', 'Unreal Engine', 'C++', 'Physics'],
    'LLM Engineer': ['LLM', 'Python', 'Transformers', 'Fine-tuning', 'NLP', 'OpenAI', 'Hugging Face', 'RAG', 'Vector Database', 'Langchain'],
    'Generative AI Engineer': ['Generative AI', 'Python', 'LLM', 'Deep Learning', 'PyTorch', 'Transformers', 'Image Generation', 'Fine-tuning'],
    'MLOps Engineer': ['MLOps', 'Python', 'Docker', 'Kubernetes', 'CI/CD', 'MLflow', 'AWS SageMaker', 'Model Monitoring'],
    'Solutions Architect': ['System Design', 'Architecture', 'Cloud', 'AWS', 'Azure', 'Microservices', 'Security', 'Integration'],
    'Technical Writer': ['Technical Writing', 'Documentation', 'API Documentation', 'Markdown', 'Git', 'Content Strategy'],
    'Scrum Master': ['Scrum', 'Agile', 'Facilitation', 'Sprint Planning', 'Retrospectives', 'Jira', 'Kanban'],
    'Site Reliability Engineer': ['Linux', 'Kubernetes', 'Monitoring', 'Python', 'Automation', 'Prometheus', 'Grafana', 'Terraform'],
    'Prompt Engineer': ['Prompt Engineering', 'LLM', 'ChatGPT', 'GPT', 'AI', 'Python', 'NLP'],
    'Big Data Engineer': ['Apache Spark', 'Hadoop', 'Python', 'SQL', 'Scala', 'Kafka', 'Hive', 'AWS EMR'],
    'Mobile Developer': ['Swift', 'Kotlin', 'iOS', 'Android', 'React Native', 'Flutter', 'Firebase', 'REST API'],
    'IoT Developer': ['IoT', 'Embedded Systems', 'Python', 'C', 'Sensors', 'MQTT', 'Arduino', 'Raspberry Pi'],
    'Robotics Engineer': ['Robotics', 'ROS', 'Python', 'C++', 'Control Systems', 'Computer Vision', 'Sensors'],
    'AR/VR Developer': ['Unity', 'C#', '3D Development', 'AR', 'VR', 'Unreal Engine', 'ARKit', 'ARCore'],
};

/**
 * Perform skill gap analysis
 * @param {string} predictedRole - The predicted career role
 * @param {string[]} userSkills - Array of user's extracted skills
 * @returns {Object} Skill gap analysis result
 */
function analyzeSkillGap(predictedRole, userSkills) {
    if (!predictedRole || !userSkills) {
        return { error: 'Invalid input: predicted role and user skills are required' };
    }

    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

    // Get required skills for the role
    let requiredSkills = ROLE_REQUIRED_SKILLS[predictedRole];
    if (!requiredSkills) {
        // Try case-insensitive match
        const roleKey = Object.keys(ROLE_REQUIRED_SKILLS).find(
            k => k.toLowerCase() === predictedRole.toLowerCase()
        );
        requiredSkills = roleKey ? ROLE_REQUIRED_SKILLS[roleKey] : null;
    }

    if (!requiredSkills) {
        // Return generic skills for unknown roles
        requiredSkills = ['Problem Solving', 'Communication', 'Team Work', 'Analytical Skills', 'Documentation'];
    }

    // Skill gap = required_skills - user_skills
    const matchedSkills = [];
    const missingSkills = [];

    for (const required of requiredSkills) {
        const normalizedRequired = required.toLowerCase().trim();
        const isMatched = normalizedUserSkills.some(
            us => us === normalizedRequired || us.includes(normalizedRequired) || normalizedRequired.includes(us)
        );

        if (isMatched) {
            matchedSkills.push(required);
        } else {
            missingSkills.push(required);
        }
    }

    // Gap percentage = (missing / required) × 100
    const totalRequired = requiredSkills.length;
    const gapPercentage = totalRequired > 0 ? (missingSkills.length / totalRequired) * 100 : 0;
    const fitPercentage = totalRequired > 0 ? (matchedSkills.length / totalRequired) * 100 : 0;

    return {
        success: true,
        predicted_role: predictedRole,
        total_required_skills: totalRequired,
        matched_skills: matchedSkills,
        matched_count: matchedSkills.length,
        missing_skills: missingSkills,
        missing_count: missingSkills.length,
        gap_percentage: Math.round(gapPercentage * 100) / 100,
        fit_percentage: Math.round(fitPercentage * 100) / 100,
        skill_gap_formula: 'gap = required_skills - user_skills',
        recommendation: getRecommendation(gapPercentage)
    };
}

/**
 * Get personalized recommendation based on gap percentage
 */
function getRecommendation(gapPercentage) {
    if (gapPercentage === 0) return 'Excellent! You have all the required skills for this role.';
    if (gapPercentage <= 20) return 'Great fit! You need to learn just a few more skills.';
    if (gapPercentage <= 40) return 'Good foundation! Focus on the missing skills to strengthen your profile.';
    if (gapPercentage <= 60) return 'Moderate gap. Consider taking structured courses in the missing areas.';
    if (gapPercentage <= 80) return 'Significant gap. You may need several months of dedicated learning.';
    return 'Large gap. Consider starting with foundational courses before targeting this role.';
}

module.exports = {
    analyzeSkillGap,
    ROLE_REQUIRED_SKILLS
};
