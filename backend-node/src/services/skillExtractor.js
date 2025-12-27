/**
 * Smart Career Advisor - Skill Extractor Service
 * Uses case-insensitive matching for common tech skills
 */

// Comprehensive tech skills list with variations
const TECH_SKILLS = [
    // Programming Languages
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Scala', 'Kotlin', 'Swift', 'Perl', 'R', 'MATLAB',

    // Web Technologies
    'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'jQuery',
    'React', 'ReactJS', 'React.js', 'Vue', 'VueJS', 'Vue.js', 'Angular', 'AngularJS', 'Svelte', 'Next.js', 'NextJS', 'Nuxt',
    'Node.js', 'NodeJS', 'Express', 'ExpressJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'ASP.NET', 'Laravel', 'Rails',

    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Firebase',

    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'DevOps',
    'Linux', 'Unix', 'Bash', 'Shell', 'PowerShell', 'Git', 'GitHub', 'GitLab', 'Bitbucket',

    // Data Science & ML
    'Machine Learning', 'ML', 'Deep Learning', 'AI', 'Artificial Intelligence', 'Data Science', 'Data Analysis', 'Data Analytics',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Sklearn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'NLP', 'Natural Language Processing', 'Computer Vision', 'OpenCV', 'Neural Networks',

    // Big Data
    'Spark', 'Hadoop', 'Kafka', 'Hive', 'Pig', 'Flink', 'Airflow', 'ETL',

    // Mobile
    'Android', 'iOS', 'React Native', 'Flutter', 'Xamarin', 'Swift', 'Kotlin',

    // APIs & Architecture
    'REST', 'RESTful', 'REST API', 'GraphQL', 'API', 'Microservices', 'Serverless',

    // Testing
    'Selenium', 'Jest', 'Cypress', 'JUnit', 'Pytest', 'Mocha', 'Testing', 'QA', 'Unit Testing',

    // Methodologies & Tools
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',

    // Other common skills
    'Frontend', 'Backend', 'Full Stack', 'Full-Stack', 'Fullstack', 'Web Development', 'Software Development',
    'Object-Oriented', 'OOP', 'Functional Programming', 'Design Patterns',
    'Problem Solving', 'Communication', 'Leadership', 'Team Player', 'Analytical'
];

// Create a lowercase lookup map for faster matching
const skillsLowercase = TECH_SKILLS.map(skill => skill.toLowerCase());

/**
 * Extract tech skills from text using case-insensitive matching
 */
function extractSkills(text) {
    if (!text || typeof text !== 'string') {
        console.log('extractSkills: No text provided');
        return [];
    }

    console.log('extractSkills: Processing text of length', text.length);

    const textLower = text.toLowerCase();
    const foundSkills = new Set();

    for (let i = 0; i < TECH_SKILLS.length; i++) {
        const skill = TECH_SKILLS[i];
        const skillLower = skillsLowercase[i];

        // Check if the skill appears in the text
        if (textLower.includes(skillLower)) {
            // For short skills (2-3 chars), use word boundary check
            if (skillLower.length <= 3) {
                const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(`\\b${escapedSkill}\\b`, 'i');
                if (pattern.test(text)) {
                    foundSkills.add(skill);
                }
            } else {
                // For longer skills, simple includes is sufficient
                foundSkills.add(skill);
            }
        }
    }

    // Remove duplicates (e.g., 'React' and 'ReactJS' both found -> keep 'React')
    const result = Array.from(foundSkills);

    // Deduplicate similar skills
    const dedupedSkills = [];
    const seen = new Set();

    for (const skill of result) {
        const normalized = skill.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(normalized)) {
            // Check for variations like 'react' matching 'reactjs'
            const baseSkill = normalized.replace(/(js|jsx)$/i, '');
            if (!seen.has(baseSkill)) {
                dedupedSkills.push(skill);
                seen.add(normalized);
                seen.add(baseSkill);
            }
        }
    }

    console.log('extractSkills: Found', dedupedSkills.length, 'skills:', dedupedSkills);

    return dedupedSkills.sort();
}

/**
 * Extract skills with frequency count
 */
function extractSkillsWithFrequency(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const textLower = text.toLowerCase();
    const skillCounts = {};

    for (const skill of TECH_SKILLS) {
        const skillLower = skill.toLowerCase();
        const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSkill, 'gi');
        const matches = text.match(regex);

        if (matches && matches.length > 0) {
            skillCounts[skill] = (skillCounts[skill] || 0) + matches.length;
        }
    }

    const result = Object.entries(skillCounts).map(([skill, frequency]) => ({
        skill,
        frequency
    }));

    result.sort((a, b) => b.frequency - a.frequency);

    return result;
}

module.exports = {
    extractSkills,
    extractSkillsWithFrequency,
    TECH_SKILLS
};
