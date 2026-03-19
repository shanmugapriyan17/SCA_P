/**
 * Skill Extractor — Module 1: Resume Skill Extraction using NLP
 * 
 * Features:
 * - NLP preprocessing (tokenization, stopword removal, stemming)
 * - Expanded skill dictionary (250+ skills)
 * - Case-insensitive matching with n-gram support
 * - TF-IDF weight computation for each extracted skill
 * - Frequency counting + deduplication
 */

const { preprocessText, computeTfIdfWeights } = require('./nlpProcessor');

// Expanded skill dictionary: 250+ tech skills organized by category
const TECH_SKILLS = [
    // Programming Languages
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Scala', 'Kotlin', 'Swift', 'Perl', 'R', 'MATLAB',
    'Dart', 'Lua', 'Haskell', 'Elixir', 'Clojure', 'F#', 'Objective-C', 'Assembly', 'COBOL', 'Fortran', 'Groovy', 'Julia',

    // Web Technologies
    'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind', 'jQuery',
    'React', 'ReactJS', 'React.js', 'Vue', 'VueJS', 'Vue.js', 'Angular', 'AngularJS', 'Svelte', 'Next.js', 'NextJS', 'Nuxt',
    'Node.js', 'NodeJS', 'Express', 'ExpressJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'ASP.NET', 'Laravel', 'Rails',
    'Gatsby', 'Remix', 'Astro', 'Vite', 'Webpack', 'Babel', 'Redux', 'MobX', 'Zustand',

    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Firebase',
    'MariaDB', 'CouchDB', 'Neo4j', 'InfluxDB', 'Supabase', 'PlanetScale', 'Snowflake', 'BigQuery',

    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'DevOps',
    'Linux', 'Unix', 'Bash', 'Shell', 'PowerShell', 'Git', 'GitHub', 'GitLab', 'Bitbucket',
    'ArgoCD', 'Helm', 'Prometheus', 'Grafana', 'CloudFormation', 'Pulumi',
    'Lambda', 'EC2', 'S3', 'ECS', 'EKS', 'Fargate', 'SageMaker',
    'Nginx', 'Apache', 'HAProxy', 'Traefik', 'Vault', 'Consul',

    // Data Science & ML
    'Machine Learning', 'ML', 'Deep Learning', 'AI', 'Artificial Intelligence', 'Data Science', 'Data Analysis', 'Data Analytics',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Sklearn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'NLP', 'Natural Language Processing', 'Computer Vision', 'OpenCV', 'Neural Networks',
    'BERT', 'GPT', 'Transformers', 'Hugging Face', 'SpaCy', 'NLTK',
    'XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'SVM', 'Regression', 'Classification',
    'Feature Engineering', 'Model Deployment', 'MLOps', 'MLflow', 'Kubeflow',
    'Reinforcement Learning', 'GANs', 'Autoencoders', 'Transfer Learning',

    // LLM & Generative AI
    'LLM', 'Large Language Model', 'ChatGPT', 'OpenAI', 'Claude', 'Anthropic', 'Langchain', 'LlamaIndex',
    'Prompt Engineering', 'Fine-tuning', 'RAG', 'Retrieval Augmented Generation',
    'Vector Database', 'Pinecone', 'Weaviate', 'ChromaDB', 'Embeddings',
    'Stable Diffusion', 'Midjourney', 'DALL-E', 'Generative AI',

    // Big Data
    'Spark', 'Hadoop', 'Kafka', 'Hive', 'Pig', 'Flink', 'Airflow', 'ETL',
    'Data Pipeline', 'Data Warehousing', 'Data Lake', 'dbt',

    // Mobile
    'Android', 'iOS', 'React Native', 'Flutter', 'Xamarin', 'SwiftUI', 'UIKit', 'Jetpack Compose',
    'Expo', 'Ionic', 'Capacitor', 'Cordova', 'Mobile Development',

    // APIs & Architecture
    'REST', 'RESTful', 'REST API', 'GraphQL', 'API', 'Microservices', 'Serverless',
    'gRPC', 'WebSocket', 'SOAP', 'OAuth', 'JWT', 'Swagger', 'OpenAPI',
    'Event-Driven', 'CQRS', 'Domain-Driven Design', 'System Design',

    // Testing
    'Selenium', 'Jest', 'Cypress', 'JUnit', 'Pytest', 'Mocha', 'Testing', 'QA', 'Unit Testing',
    'TestNG', 'JMeter', 'Gatling', 'Playwright', 'Puppeteer', 'Load Testing', 'Performance Testing',
    'Test Automation', 'BDD', 'TDD', 'Integration Testing',

    // Security
    'Penetration Testing', 'Ethical Hacking', 'OWASP', 'SIEM', 'Splunk', 'Kali Linux',
    'Burp Suite', 'Metasploit', 'Encryption', 'SSL/TLS', 'OAuth2', 'SAML',
    'SAST', 'DAST', 'DevSecOps', 'Vulnerability Assessment', 'Threat Analysis',
    'Compliance', 'GDPR', 'ISO 27001', 'SOC 2',

    // Design
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign',
    'UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'Design Systems',
    'User Research', 'Usability Testing', 'Interaction Design', 'Product Design',

    // Methodologies & Tools
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Trello',
    'Product Management', 'Project Management', 'Roadmapping', 'Sprint Planning',

    // Blockchain & Emerging
    'Blockchain', 'Solidity', 'Ethereum', 'Smart Contracts', 'Web3', 'DeFi', 'NFT',
    'IoT', 'Embedded Systems', 'Arduino', 'Raspberry Pi', 'MQTT',
    'AR', 'VR', 'Augmented Reality', 'Virtual Reality', 'Unity', 'Unreal Engine',
    'ROS', 'Robotics',

    // Other common skills
    'Frontend', 'Backend', 'Full Stack', 'Full-Stack', 'Fullstack', 'Web Development', 'Software Development',
    'Object-Oriented', 'OOP', 'Functional Programming', 'Design Patterns',
    'Problem Solving', 'Communication', 'Leadership', 'Team Player', 'Analytical',
    'Data Structures', 'Algorithms', 'System Architecture', 'Code Review', 'Mentoring',
    'Technical Writing', 'Documentation', 'API Documentation',
    'Troubleshooting', 'Monitoring', 'Logging', 'Debugging', 'Profiling'
];

// Skill normalization map for deduplication
const SKILL_ALIASES = {
    'reactjs': 'React', 'react.js': 'React', 'react native': 'React Native',
    'vuejs': 'Vue', 'vue.js': 'Vue', 'vue3': 'Vue',
    'angularjs': 'Angular', 'angular2': 'Angular',
    'nodejs': 'Node.js', 'node.js': 'Node.js', 'node': 'Node.js',
    'expressjs': 'Express', 'express.js': 'Express',
    'nextjs': 'Next.js', 'next.js': 'Next.js',
    'sklearn': 'Scikit-learn', 'scikit-learn': 'Scikit-learn', 'scikit': 'Scikit-learn',
    'k8s': 'Kubernetes', 'kube': 'Kubernetes',
    'html5': 'HTML', 'css3': 'CSS',
    'fullstack': 'Full Stack', 'full-stack': 'Full Stack', 'full stack': 'Full Stack',
    'ml': 'Machine Learning', 'machine learning': 'Machine Learning',
    'ai': 'Artificial Intelligence', 'artificial intelligence': 'Artificial Intelligence',
    'nlp': 'Natural Language Processing',
    'oop': 'Object-Oriented Programming',
    'ci/cd': 'CI/CD', 'cicd': 'CI/CD',
    'rest api': 'REST API', 'restful': 'REST API', 'rest': 'REST API',
    'gcp': 'Google Cloud', 'google cloud platform': 'Google Cloud',
    'aws': 'AWS', 'amazon web services': 'AWS',
    'azure': 'Azure', 'microsoft azure': 'Azure',
    'sass': 'SASS', 'scss': 'SASS',
    'golang': 'Go',
    'postgres': 'PostgreSQL', 'postgresql': 'PostgreSQL',
    'ts': 'TypeScript',
    'js': 'JavaScript', 'es6': 'JavaScript',
    'dv': 'Data Visualization', 'viz': 'Data Visualization'
};

/**
 * Normalize a skill name using aliases
 * @param {string} skill - Skill name
 * @returns {string} Normalized skill name
 */
function normalizeSkill(skill) {
    const lower = skill.toLowerCase().trim();
    return SKILL_ALIASES[lower] || skill;
}

/**
 * Extract skills from text using NLP preprocessing + dictionary matching
 * @param {string} text - Raw resume text
 * @returns {string[]} Array of unique normalized skill names
 */
function extractSkills(text) {
    if (!text || typeof text !== 'string') return [];

    const textLower = text.toLowerCase();
    const foundSkills = new Map(); // skill -> normalized name

    // Single-letter skills (like "R", "C") need extra context to avoid matching name initials
    const SINGLE_CHAR_SKILLS = new Set(['r', 'c']);
    const PROGRAMMING_CONTEXT = /(?:programming|language|using|with|in|learn|code|coding|develop|script)/i;

    // Match each skill in the dictionary
    for (const skill of TECH_SKILLS) {
        const skillLower = skill.toLowerCase();
        // Use word boundary matching for accuracy
        const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
        if (regex.test(textLower)) {
            // For single-char skills, require programming context nearby to avoid name initials
            if (SINGLE_CHAR_SKILLS.has(skillLower)) {
                // Check for patterns like "R programming", "using R", "R language", "R,"  followed by another skill
                const contextRegex = new RegExp(
                    `(?:${escapedSkill}\\s+(?:programming|language|studio|shiny|markdown))|(?:(?:using|with|in|learn|know)\\s+${escapedSkill}\\b)|(?:\\b${escapedSkill}\\s*[,;/]\\s*(?:python|matlab|julia|sas|spss|pandas))`,
                    'gi'
                );
                if (!contextRegex.test(textLower)) continue; // Skip — likely a name initial
            }
            const normalized = normalizeSkill(skill);
            foundSkills.set(normalized.toLowerCase(), normalized);
        }
    }

    return [...foundSkills.values()];
}

/**
 * Extract skills with frequency count and TF-IDF weight
 * Uses full NLP pipeline: tokenization → stopword removal → matching → TF-IDF
 * @param {string} text - Raw resume text
 * @returns {Object} { skills, nlp_stats, processing_pipeline }
 */
function extractSkillsWithFrequency(text) {
    if (!text || typeof text !== 'string') {
        return { skills: [], nlp_stats: null, processing_pipeline: [] };
    }

    const pipeline = [];

    // Step 1: NLP Preprocessing
    const nlpResult = preprocessText(text);
    pipeline.push({
        step: 'tokenization',
        description: 'Split text into individual tokens',
        token_count: nlpResult.stats.original_word_count
    });
    pipeline.push({
        step: 'stopword_removal',
        description: 'Remove common English words and resume-specific terms',
        tokens_removed: nlpResult.stats.original_word_count - nlpResult.stats.after_stopword_removal,
        tokens_remaining: nlpResult.stats.after_stopword_removal
    });

    // Step 2: Skill extraction with frequency counting
    const textLower = text.toLowerCase();
    const skillFrequency = {};

    for (const skill of TECH_SKILLS) {
        const skillLower = skill.toLowerCase();
        const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches && matches.length > 0) {
            const normalized = normalizeSkill(skill);
            const key = normalized.toLowerCase();
            if (!skillFrequency[key]) {
                skillFrequency[key] = { skill: normalized, frequency: 0 };
            }
            skillFrequency[key].frequency += matches.length;
        }
    }

    pipeline.push({
        step: 'skill_matching',
        description: 'Dictionary-based skill matching with regex word boundaries',
        skills_found: Object.keys(skillFrequency).length
    });

    // Step 3: Compute TF-IDF weights
    const skillNames = Object.values(skillFrequency).map(s => s.skill);
    const tfidfWeights = computeTfIdfWeights(text, skillNames);

    // Merge frequency + TF-IDF
    const tfidfMap = {};
    tfidfWeights.forEach(w => {
        tfidfMap[w.skill.toLowerCase()] = w.tfidf_weight;
    });

    const skills = Object.values(skillFrequency).map(s => ({
        skill: s.skill,
        frequency: s.frequency,
        tfidf_weight: tfidfMap[s.skill.toLowerCase()] || 0
    })).sort((a, b) => b.tfidf_weight - a.tfidf_weight);

    pipeline.push({
        step: 'tfidf_weighting',
        description: 'TF-IDF weight computed for each skill',
        top_skill: skills[0]?.skill || 'none',
        top_weight: skills[0]?.tfidf_weight || 0
    });

    return {
        skills,
        nlp_stats: nlpResult.stats,
        processing_pipeline: pipeline
    };
}

module.exports = {
    extractSkills,
    extractSkillsWithFrequency,
    TECH_SKILLS,
    SKILL_ALIASES,
    normalizeSkill
};
