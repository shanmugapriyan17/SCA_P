#!/usr/bin/env python3
"""
Generate a comprehensive job roles dataset with 80+ roles
Covers all tech, business, design, data, and other domains
"""

import csv
import random
import os

# Comprehensive job roles with skills (80+ roles)
ROLES = {
    # ==================== SOFTWARE DEVELOPMENT ====================
    "Full Stack Developer": {
        "core": ["JavaScript", "React", "Node.js", "SQL", "HTML/CSS"],
        "common": ["TypeScript", "Vue.js", "MongoDB", "REST API", "Git", "Docker", "Python", "PostgreSQL"],
    },
    "Frontend Developer": {
        "core": ["JavaScript", "React", "HTML/CSS", "CSS", "Vue.js"],
        "common": ["TypeScript", "Angular", "SASS", "Redux", "Webpack", "Git", "Figma"],
    },
    "Backend Developer": {
        "core": ["Python", "Java", "SQL", "REST API", "PostgreSQL"],
        "common": ["Django", "Spring Boot", "Node.js", "MongoDB", "Redis", "Docker", "Microservices"],
    },
    "Software Engineer": {
        "core": ["Python", "Java", "C++", "Algorithms", "Data Structures"],
        "common": ["Git", "Linux", "SQL", "Docker", "AWS", "CI/CD", "Testing", "Agile"],
    },
    "Senior Software Engineer": {
        "core": ["System Design", "Architecture", "Python", "Java", "Leadership"],
        "common": ["Microservices", "Cloud", "Mentoring", "Code Review", "Agile", "Kubernetes"],
    },
    "Junior Developer": {
        "core": ["JavaScript", "HTML/CSS", "Python", "Git", "SQL"],
        "common": ["React", "Node.js", "Learning", "Problem Solving", "Team Work"],
    },
    "Web Developer": {
        "core": ["HTML/CSS", "JavaScript", "PHP", "WordPress", "MySQL"],
        "common": ["CSS", "jQuery", "Bootstrap", "Responsive Design", "SEO"],
    },
    "API Developer": {
        "core": ["REST API", "GraphQL", "Node.js", "Python", "JSON"],
        "common": ["Express.js", "FastAPI", "Swagger", "OAuth", "API Design", "Postman"],
    },
    
    # ==================== MOBILE DEVELOPMENT ====================
    "Mobile Developer": {
        "core": ["Swift", "Kotlin", "iOS", "Android", "React Native"],
        "common": ["Flutter", "Java", "Objective-C", "Firebase", "REST API", "Git"],
    },
    "iOS Developer": {
        "core": ["Swift", "iOS", "Xcode", "UIKit", "SwiftUI"],
        "common": ["Objective-C", "Core Data", "REST API", "CocoaPods", "Firebase"],
    },
    "Android Developer": {
        "core": ["Kotlin", "Android", "Android Studio", "Java", "XML"],
        "common": ["Jetpack Compose", "Firebase", "REST API", "Gradle", "MVVM"],
    },
    "React Native Developer": {
        "core": ["React Native", "JavaScript", "TypeScript", "Mobile", "Redux"],
        "common": ["iOS", "Android", "REST API", "Firebase", "Expo"],
    },
    "Flutter Developer": {
        "core": ["Flutter", "Dart", "Mobile", "iOS", "Android"],
        "common": ["Firebase", "REST API", "State Management", "UI/UX"],
    },
    
    # ==================== AI/ML/DATA ====================
    "AI/ML Engineer": {
        "core": ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "NumPy"],
        "common": ["PyTorch", "Pandas", "Scikit-learn", "Keras", "Computer Vision", "NLP"],
    },
    "Data Scientist": {
        "core": ["Python", "SQL", "Statistics", "Machine Learning", "Pandas"],
        "common": ["R", "Tableau", "Power BI", "NumPy", "Scikit-learn", "Excel", "Jupyter"],
    },
    "Data Analyst": {
        "core": ["SQL", "Excel", "Tableau", "Python", "Statistics"],
        "common": ["Power BI", "Data Visualization", "R", "Google Analytics", "Reporting"],
    },
    "Data Engineer": {
        "core": ["Python", "SQL", "ETL", "Apache Spark", "Airflow"],
        "common": ["Kafka", "Hadoop", "AWS", "Data Warehousing", "PostgreSQL", "Snowflake"],
    },
    "Machine Learning Engineer": {
        "core": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "MLOps"],
        "common": ["Kubernetes", "Docker", "AWS SageMaker", "Model Deployment", "Feature Engineering"],
    },
    "NLP Engineer": {
        "core": ["Python", "NLP", "BERT", "Transformers", "Deep Learning"],
        "common": ["Hugging Face", "SpaCy", "NLTK", "Text Classification", "GPT"],
    },
    "Computer Vision Engineer": {
        "core": ["Python", "OpenCV", "Deep Learning", "TensorFlow", "Image Processing"],
        "common": ["PyTorch", "YOLO", "Object Detection", "CNN", "Image Segmentation"],
    },
    "AI Research Scientist": {
        "core": ["Python", "Deep Learning", "Research", "Machine Learning", "Mathematics"],
        "common": ["PyTorch", "TensorFlow", "Publications", "NLP", "Computer Vision"],
    },
    "Prompt Engineer": {
        "core": ["Prompt Engineering", "LLM", "ChatGPT", "GPT", "AI"],
        "common": ["Python", "NLP", "OpenAI", "Claude", "Langchain", "Fine-tuning", "Prompt Design"],
    },
    "LLM Engineer": {
        "core": ["LLM", "Python", "Transformers", "Fine-tuning", "NLP"],
        "common": ["OpenAI", "Hugging Face", "RAG", "Vector Database", "Langchain", "GPT"],
    },
    "Generative AI Engineer": {
        "core": ["Generative AI", "Python", "LLM", "Stable Diffusion", "Deep Learning"],
        "common": ["PyTorch", "Transformers", "Image Generation", "Text Generation", "Fine-tuning"],
    },
    "AI Product Manager": {
        "core": ["AI Product", "Product Management", "Machine Learning", "Strategy", "Roadmapping"],
        "common": ["LLM", "Data Science", "Stakeholder Management", "Analytics", "User Research"],
    },
    "MLOps Engineer": {
        "core": ["MLOps", "Python", "Docker", "Kubernetes", "CI/CD"],
        "common": ["MLflow", "Kubeflow", "AWS SageMaker", "Model Monitoring", "Feature Store"],
    },
    "Big Data Engineer": {
        "core": ["Apache Spark", "Hadoop", "Python", "SQL", "Scala"],
        "common": ["Hive", "Kafka", "AWS EMR", "Data Lake", "ETL"],
    },
    "Business Intelligence Developer": {
        "core": ["SQL", "ETL", "Data Warehousing", "Reporting", "Tableau"],
        "common": ["Power BI", "SSIS", "SSRS", "Data Modeling", "Dashboards"],
    },
    
    # ==================== DEVOPS/CLOUD/INFRASTRUCTURE ====================
    "DevOps Engineer": {
        "core": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],
        "common": ["Terraform", "Jenkins", "Ansible", "Git", "Python", "Bash", "Prometheus"],
    },
    "Cloud Engineer": {
        "core": ["AWS", "Azure", "Terraform", "Kubernetes", "Linux"],
        "common": ["Google Cloud", "Docker", "Networking", "Security", "CloudFormation"],
    },
    "Site Reliability Engineer": {
        "core": ["Linux", "Kubernetes", "Monitoring", "Python", "Automation"],
        "common": ["Prometheus", "Grafana", "Terraform", "Incident Response", "SLOs"],
    },
    "Platform Engineer": {
        "core": ["Kubernetes", "Docker", "CI/CD", "Infrastructure as Code", "Cloud"],
        "common": ["ArgoCD", "Helm", "Terraform", "GitOps", "Service Mesh"],
    },
    "Systems Administrator": {
        "core": ["Linux", "Windows Server", "Networking", "Active Directory", "VMware"],
        "common": ["Bash", "PowerShell", "Backup", "Security", "DNS", "DHCP"],
    },
    "Network Engineer": {
        "core": ["Networking", "Cisco", "TCP/IP", "Firewall", "Routing"],
        "common": ["CCNA", "VPN", "DNS", "Load Balancing", "Switching", "Security"],
    },
    "Cloud Architect": {
        "core": ["AWS", "Azure", "Architecture", "Cloud Design", "Security"],
        "common": ["Terraform", "Kubernetes", "Microservices", "Cost Optimization"],
    },
    "Infrastructure Engineer": {
        "core": ["Linux", "Networking", "Virtualization", "Automation", "Cloud"],
        "common": ["VMware", "Docker", "Ansible", "Terraform", "Monitoring"],
    },
    "Release Engineer": {
        "core": ["CI/CD", "Git", "Jenkins", "Deployment", "Automation"],
        "common": ["Docker", "Kubernetes", "Build Systems", "Release Management"],
    },
    
    # ==================== SECURITY ====================
    "Security Engineer": {
        "core": ["Security", "Penetration Testing", "SIEM", "Firewalls", "Linux"],
        "common": ["Vulnerability Assessment", "IDS/IPS", "SOC", "OWASP", "Encryption"],
    },
    "Cybersecurity Analyst": {
        "core": ["Security", "Threat Analysis", "SIEM", "Incident Response", "Malware Analysis"],
        "common": ["Splunk", "Wireshark", "Forensics", "Compliance", "Risk Assessment"],
    },
    "Application Security Engineer": {
        "core": ["Application Security", "OWASP", "Code Review", "Penetration Testing", "Security"],
        "common": ["SAST", "DAST", "DevSecOps", "Secure Coding", "Vulnerability Management"],
    },
    "Information Security Analyst": {
        "core": ["Information Security", "Risk Assessment", "Compliance", "Security Policies", "Audit"],
        "common": ["ISO 27001", "GDPR", "SOC 2", "Security Awareness", "Incident Response"],
    },
    "Penetration Tester": {
        "core": ["Penetration Testing", "Ethical Hacking", "Kali Linux", "Security", "Vulnerability"],
        "common": ["Burp Suite", "Metasploit", "Web Security", "Network Security", "Reporting"],
    },
    
    # ==================== DATABASE ====================
    "Database Administrator": {
        "core": ["SQL", "PostgreSQL", "MySQL", "Database Design", "Performance Tuning"],
        "common": ["Oracle", "MongoDB", "Redis", "Backup", "Replication", "Linux"],
    },
    "Database Developer": {
        "core": ["SQL", "Stored Procedures", "Database Design", "PostgreSQL", "Query Optimization"],
        "common": ["T-SQL", "PL/SQL", "ETL", "Data Modeling", "Performance Tuning"],
    },
    "Database Architect": {
        "core": ["Database Design", "Data Modeling", "SQL", "Architecture", "Performance"],
        "common": ["PostgreSQL", "MySQL", "NoSQL", "Data Warehousing", "Scalability"],
    },
    
    # ==================== QUALITY ASSURANCE ====================
    "QA Engineer": {
        "core": ["Testing", "Selenium", "Automation", "Test Cases", "Bug Tracking"],
        "common": ["Python", "Java", "JUnit", "TestNG", "Cypress", "API Testing", "Git"],
    },
    "SDET": {
        "core": ["Automation", "Java", "Python", "Selenium", "CI/CD"],
        "common": ["REST API Testing", "Performance Testing", "Test Frameworks", "Docker"],
    },
    "Performance Engineer": {
        "core": ["Performance Testing", "JMeter", "Load Testing", "Monitoring", "Analysis"],
        "common": ["Gatling", "New Relic", "APM", "Optimization", "Profiling"],
    },
    "QA Lead": {
        "core": ["Test Management", "Team Leadership", "Testing", "Strategy", "Quality"],
        "common": ["Automation", "Selenium", "Reporting", "Agile", "Test Planning"],
    },
    "Manual Tester": {
        "core": ["Manual Testing", "Test Cases", "Bug Tracking", "Regression Testing", "QA"],
        "common": ["Jira", "Test Plans", "Exploratory Testing", "Documentation"],
    },
    
    # ==================== DESIGN ====================
    "UI/UX Designer": {
        "core": ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping"],
        "common": ["Adobe XD", "Sketch", "User Testing", "Design Systems", "Accessibility"],
    },
    "Product Designer": {
        "core": ["Product Design", "Figma", "User Research", "Prototyping", "Design Thinking"],
        "common": ["Interaction Design", "Visual Design", "Design Systems", "A/B Testing"],
    },
    "Graphic Designer": {
        "core": ["Adobe Photoshop", "Adobe Illustrator", "Typography", "Branding", "Visual Design"],
        "common": ["InDesign", "Logo Design", "Print Design", "Digital Design", "Color Theory"],
    },
    "UX Researcher": {
        "core": ["User Research", "Usability Testing", "Interviews", "Data Analysis", "UX"],
        "common": ["Surveys", "A/B Testing", "Personas", "User Journey", "Analytics"],
    },
    "Visual Designer": {
        "core": ["Visual Design", "Adobe Creative Suite", "Branding", "UI Design", "Typography"],
        "common": ["Figma", "Illustration", "Motion Graphics", "Design Systems"],
    },
    "Interaction Designer": {
        "core": ["Interaction Design", "Prototyping", "Animation", "UX", "User Flows"],
        "common": ["Figma", "After Effects", "Micro-interactions", "Design Systems"],
    },
    
    # ==================== PRODUCT & PROJECT MANAGEMENT ====================
    "Product Manager": {
        "core": ["Product Management", "Roadmapping", "User Stories", "Stakeholder Management", "Analytics"],
        "common": ["Jira", "Agile", "Scrum", "Market Research", "A/B Testing", "SQL"],
    },
    "Technical Product Manager": {
        "core": ["Product Management", "Technical Knowledge", "API", "System Design", "Roadmapping"],
        "common": ["SQL", "Agile", "Data Analysis", "Stakeholder Management", "Jira"],
    },
    "Project Manager": {
        "core": ["Project Management", "Agile", "Scrum", "Stakeholder Management", "Risk Management"],
        "common": ["Jira", "MS Project", "Budget Management", "Resource Planning", "PMP"],
    },
    "Scrum Master": {
        "core": ["Scrum", "Agile", "Facilitation", "Sprint Planning", "Retrospectives"],
        "common": ["Jira", "Kanban", "Team Coaching", "Impediment Removal", "SAFe"],
    },
    "Agile Coach": {
        "core": ["Agile", "Scrum", "Kanban", "Coaching", "Transformation"],
        "common": ["SAFe", "Facilitation", "Lean", "Team Building", "Organizational Change"],
    },
    "Program Manager": {
        "core": ["Program Management", "Strategy", "Stakeholder Management", "Portfolio", "Leadership"],
        "common": ["Agile", "Risk Management", "Budget", "Resource Planning", "Reporting"],
    },
    "Product Owner": {
        "core": ["Product Ownership", "Backlog Management", "User Stories", "Agile", "Prioritization"],
        "common": ["Jira", "Scrum", "Stakeholder Management", "Roadmapping", "Analytics"],
    },
    
    # ==================== BUSINESS & ANALYTICS ====================
    "Business Analyst": {
        "core": ["Business Analysis", "Requirements Gathering", "SQL", "Data Analysis", "Documentation"],
        "common": ["Jira", "Excel", "Stakeholder Management", "User Stories", "Process Mapping"],
    },
    "Business Intelligence Analyst": {
        "core": ["SQL", "Tableau", "Power BI", "Data Visualization", "Reporting"],
        "common": ["Excel", "ETL", "Data Warehousing", "Dashboards", "KPIs"],
    },
    "Systems Analyst": {
        "core": ["Systems Analysis", "Requirements", "Documentation", "Process Modeling", "SQL"],
        "common": ["UML", "Business Process", "Technical Writing", "Stakeholder Management"],
    },
    "Operations Analyst": {
        "core": ["Operations", "Data Analysis", "Process Improvement", "Excel", "Reporting"],
        "common": ["SQL", "Dashboards", "KPIs", "Automation", "Documentation"],
    },
    
    # ==================== TECHNICAL WRITING & SUPPORT ====================
    "Technical Writer": {
        "core": ["Technical Writing", "Documentation", "API Documentation", "Markdown", "Content Strategy"],
        "common": ["Git", "DITA", "Confluence", "ReadTheDocs", "Developer Experience"],
    },
    "Technical Support Engineer": {
        "core": ["Troubleshooting", "Customer Support", "Technical Knowledge", "Communication", "Ticketing"],
        "common": ["Jira", "Linux", "Networking", "SQL", "API", "Documentation"],
    },
    "Customer Success Engineer": {
        "core": ["Customer Success", "Technical Support", "Communication", "Problem Solving", "Product Knowledge"],
        "common": ["API", "SQL", "Onboarding", "Training", "Relationship Management"],
    },
    "Support Engineer": {
        "core": ["Technical Support", "Troubleshooting", "Customer Service", "Documentation", "Communication"],
        "common": ["Linux", "SQL", "Ticketing Systems", "Escalation Management"],
    },
    
    # ==================== ARCHITECTURE ====================
    "Solutions Architect": {
        "core": ["System Design", "Architecture", "Cloud", "AWS", "Technical Leadership"],
        "common": ["Azure", "Microservices", "Security", "Integration", "Cost Optimization"],
    },
    "Enterprise Architect": {
        "core": ["Enterprise Architecture", "TOGAF", "Strategy", "Cloud", "Digital Transformation"],
        "common": ["Solution Design", "Governance", "Integration", "Business Analysis"],
    },
    "Software Architect": {
        "core": ["System Design", "Architecture Patterns", "Microservices", "Cloud", "Technical Leadership"],
        "common": ["API Design", "Security", "Performance", "Code Review", "Documentation"],
    },
    "Data Architect": {
        "core": ["Data Architecture", "Data Modeling", "Data Warehousing", "SQL", "ETL"],
        "common": ["Big Data", "Cloud", "Data Governance", "Master Data Management"],
    },
    "Integration Architect": {
        "core": ["Integration", "API", "Middleware", "ESB", "Architecture"],
        "common": ["Microservices", "Cloud", "REST", "SOAP", "Event-Driven"],
    },
    
    # ==================== EMERGING TECH ====================
    "Blockchain Developer": {
        "core": ["Solidity", "Ethereum", "Smart Contracts", "Web3", "Blockchain"],
        "common": ["JavaScript", "Truffle", "DeFi", "NFT", "Cryptography"],
    },
    "AR/VR Developer": {
        "core": ["Unity", "C#", "3D Development", "AR", "VR"],
        "common": ["Unreal Engine", "ARKit", "ARCore", "Oculus", "3D Modeling"],
    },
    "Game Developer": {
        "core": ["Unity", "C#", "Game Design", "3D Development", "Graphics"],
        "common": ["Unreal Engine", "C++", "Physics", "AI", "Animation"],
    },
    "IoT Developer": {
        "core": ["IoT", "Embedded Systems", "Python", "C", "Sensors"],
        "common": ["MQTT", "Arduino", "Raspberry Pi", "Cloud", "Edge Computing"],
    },
    "Robotics Engineer": {
        "core": ["Robotics", "ROS", "Python", "C++", "Control Systems"],
        "common": ["Computer Vision", "Sensors", "Embedded Systems", "Machine Learning"],
    },
    
    # ==================== MANAGEMENT & LEADERSHIP ====================
    "Engineering Manager": {
        "core": ["Team Leadership", "People Management", "Technical Background", "Agile", "Hiring"],
        "common": ["Performance Reviews", "Career Development", "Project Planning", "Stakeholder Management"],
    },
    "CTO": {
        "core": ["Technology Strategy", "Leadership", "Architecture", "Team Building", "Innovation"],
        "common": ["Budget Management", "Vendor Management", "Digital Transformation", "Security"],
    },
    "VP of Engineering": {
        "core": ["Engineering Leadership", "Strategy", "Organization Building", "Technical Vision", "Hiring"],
        "common": ["Process Improvement", "Cross-functional Collaboration", "Budget", "OKRs"],
    },
    "Tech Lead": {
        "core": ["Technical Leadership", "Code Review", "Architecture", "Mentoring", "Development"],
        "common": ["Agile", "System Design", "Best Practices", "Team Collaboration"],
    },
    "Director of Engineering": {
        "core": ["Engineering Leadership", "Strategy", "Team Building", "Process", "Hiring"],
        "common": ["Agile", "Budget", "Stakeholder Management", "OKRs", "Cross-functional"],
    },
    
    # ==================== MARKETING & GROWTH (Tech) ====================
    "Growth Engineer": {
        "core": ["Growth", "A/B Testing", "Analytics", "Python", "SQL"],
        "common": ["Marketing Automation", "Data Analysis", "Experimentation", "JavaScript"],
    },
    "Marketing Technologist": {
        "core": ["Marketing Technology", "Analytics", "Automation", "CRM", "Data"],
        "common": ["SQL", "Marketing Platforms", "Integration", "Reporting"],
    },
    "SEO Specialist": {
        "core": ["SEO", "Analytics", "Content Strategy", "Keyword Research", "Technical SEO"],
        "common": ["Google Analytics", "Search Console", "HTML", "Link Building"],
    },
    
    # ==================== SALES & CUSTOMER (Tech) ====================
    "Sales Engineer": {
        "core": ["Technical Sales", "Product Demo", "Solution Design", "Communication", "Technical Knowledge"],
        "common": ["API", "Cloud", "Pre-sales", "POC", "Stakeholder Management"],
    },
    "Solutions Engineer": {
        "core": ["Solutions Design", "Technical Pre-sales", "Product Knowledge", "Demo", "Integration"],
        "common": ["API", "Cloud", "Architecture", "Customer Success"],
    },
    
    # ==================== CONSULTANT ====================
    "IT Consultant": {
        "core": ["IT Consulting", "Project Management", "Technical Knowledge", "Business Analysis", "Communication"],
        "common": ["Cloud", "Digital Transformation", "Strategy", "Stakeholder Management"],
    },
    "Technology Consultant": {
        "core": ["Technology Consulting", "Strategy", "Digital Transformation", "Architecture", "Business"],
        "common": ["Cloud", "Agile", "Project Management", "Analytics"],
    },
    
    # ==================== OTHER IT ROLES ====================
    "IT Manager": {
        "core": ["IT Management", "Team Leadership", "Infrastructure", "Budget", "Operations"],
        "common": ["Project Management", "Vendor Management", "Security", "Strategy"],
    },
    "IT Administrator": {
        "core": ["IT Administration", "Windows", "Active Directory", "Networking", "Support"],
        "common": ["Linux", "Office 365", "Troubleshooting", "Security"],
    },
    "Help Desk Technician": {
        "core": ["Technical Support", "Troubleshooting", "Customer Service", "Windows", "Ticketing"],
        "common": ["Active Directory", "Hardware", "Software Installation", "Documentation"],
    },
    "Desktop Support Engineer": {
        "core": ["Desktop Support", "Windows", "Hardware", "Troubleshooting", "Customer Service"],
        "common": ["Active Directory", "Networking", "Software Installation", "Remote Support"],
    }
}

COMPANIES = ["TechCorp", "InnovateTech", "DataDriven", "CloudFirst", "StartupX", 
             "MegaSoft", "DevHub", "CodeFactory", "DigitalEdge", "SmartSolutions",
             "AIVentures", "WebWorks", "AppMasters", "SysTech", "NetPro",
             "GlobalTech", "NextGen", "FutureSoft", "DataMind", "CloudNine"]

LOCATIONS = ["San Francisco", "New York", "Austin", "Seattle", "Remote", 
             "Boston", "Denver", "Chicago", "Los Angeles", "Miami",
             "London", "Berlin", "Toronto", "Singapore", "Bangalore"]

LEVELS = ["Junior", "Mid-level", "Senior", "Lead", "Principal"]

def generate_skills(role_data, add_noise=True):
    """Generate skill set with rich randomness for diverse training data"""
    skills = []
    
    # Take a random subset of core skills (don't always include all of them)
    # E.g., if there are 5 core skills, take anywhere from 1 to 4 of them
    if len(role_data["core"]) > 1:
        core_count = random.randint(1, len(role_data["core"]) - 1)
    else:
        core_count = 1
    skills.extend(random.sample(role_data["core"], min(core_count, len(role_data["core"]))))
    
    # Take a random, smaller subset of common skills
    if len(role_data["common"]) > 0:
        common_count = random.randint(0, min(3, len(role_data["common"])))
        skills.extend(random.sample(role_data["common"], common_count))
    
    # Aggressive noise injection for realism (users put random stuff on resumes)
    if add_noise:
        noise_skills = [
            "Communication", "Problem Solving", "Team Work", "Agile", "Leadership",
            "Time Management", "Critical Thinking", "Adaptability", "Creativity",
            "Attention to Detail", "Collaboration", "Self-Motivated", "Organization",
            "Interpersonal Skills", "Multitasking", "Decision Making", "Analytical Skills",
            "Work Ethic", "Conflict Resolution", "Negotiation", "Presentation Skills",
            "Strategic Planning", "Emotional Intelligence", "Remote Work", "Cross-functional",
            "Mentoring", "Project Coordination", "Documentation", "Research",
            "Continuous Learning", "Innovation", "Customer Focus",
            
            # Cross-domain technical noise (simulates transitioners or generalists)
            "Microsoft Office", "Excel", "Data Entry", "Social Media", "Customer Service",
            "Trello", "Asana", "Slack", "Zoom", "Google Workspace", "Public Speaking",
            "Writing", "Editing", "Data Analysis", "Basic HTML", "WordPress"
        ]
        
        # Add 3 to 8 random noise skills
        num_noise = random.randint(3, 8)
        skills.extend(random.sample(noise_skills, num_noise))
    
    return list(set(skills))

def generate_description(role):
    # Introduce completely generic descriptions that give NO hint about the role
    # This forces the model to rely solely on the noisy skills list
    templates = [
        f"Looking for a skilled {role} to join our team.",
        f"We need an experienced {role} for exciting projects.",
        f"{role} position with growth opportunities.",
        f"Join us as a {role} and work on cutting-edge technology.",
        f"Exciting opportunity for a {role} to make an impact.",
        f"We are hiring a talented {role} for our growing team.",
        f"Seeking a passionate {role} to drive innovation.",
        f"Open position: {role} with competitive compensation.",
        "Looking for a motivated professional to join our fast-paced environment.",
        "Experienced individual needed to help scale our operations globally.",
        "Join our team to work on cross-functional, high-impact deliverables.",
        "Seeking a detail-oriented expert with a proven track record of success.",
        "We are hiring! Come build the future with our industry leading team.",
        "Strategic thinker required for this dynamic, challenging position."
    ]
    return random.choice(templates)

def generate_dataset(samples_per_role=103):
    """Generate ~10,000 samples (97 roles × 103 samples each)"""
    data = []
    id_counter = 1
    for role, role_data in ROLES.items():
        for i in range(samples_per_role):
            level = random.choice(LEVELS)
            company = random.choice(COMPANIES)
            location = random.choice(LOCATIONS)
            description = generate_description(role)
            skills = generate_skills(role_data, add_noise=random.random() > 0.2)
            data.append({
                "id": id_counter,
                "title": f"{role} ({level})",
                "company": company,
                "location": location,
                "job_description": description,
                "skills": ", ".join(skills),
                "role": role
            })
            id_counter += 1
    random.shuffle(data)
    return data

# Generate 10,000+ samples
random.seed(42)
dataset = generate_dataset(samples_per_role=103)

# Save
output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'jobs_dataset_comprehensive.csv')
main_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'jobs_dataset_10roles.csv')
os.makedirs(os.path.dirname(output_path), exist_ok=True)

for path in [output_path, main_path]:
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "title", "company", "location", "job_description", "skills", "role"])
        writer.writeheader()
        writer.writerows(dataset)

# Print summary
print(f"=" * 60)
print(f"Generated comprehensive job roles dataset")
print(f"=" * 60)
print(f"Total samples: {len(dataset)}")
print(f"Total roles: {len(ROLES)}")
print(f"Samples per role: 103")
print(f"\nClass distribution:")
role_counts = {}
for d in dataset:
    role_counts[d['role']] = role_counts.get(d['role'], 0) + 1
for role in sorted(role_counts.keys()):
    print(f"  {role}: {role_counts[role]}")
print(f"\nBalance check: {'BALANCED' if len(set(role_counts.values())) == 1 else 'IMBALANCED'}")

