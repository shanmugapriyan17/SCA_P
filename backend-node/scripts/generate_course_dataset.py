#!/usr/bin/env python3
"""
Generate course recommendation dataset for Module 7.
Contains personalized learning paths with courses for each skill.

Usage:
    python scripts/generate_course_dataset.py
"""

import csv
import os
import json

COURSES = [
    # Python
    {"skill": "Python", "course": "Python for Everybody", "platform": "Coursera", "level": "Beginner", "duration_hours": 40, "url": "https://coursera.org/specializations/python"},
    {"skill": "Python", "course": "Complete Python Bootcamp", "platform": "Udemy", "level": "Beginner", "duration_hours": 22, "url": "https://udemy.com/complete-python-bootcamp"},
    {"skill": "Python", "course": "Python Data Structures", "platform": "Coursera", "level": "Intermediate", "duration_hours": 15, "url": "https://coursera.org/learn/python-data"},
    
    # JavaScript
    {"skill": "JavaScript", "course": "JavaScript: Understanding the Weird Parts", "platform": "Udemy", "level": "Intermediate", "duration_hours": 12, "url": "https://udemy.com/understand-javascript"},
    {"skill": "JavaScript", "course": "The Complete JavaScript Course", "platform": "Udemy", "level": "Beginner", "duration_hours": 69, "url": "https://udemy.com/the-complete-javascript-course"},
    {"skill": "JavaScript", "course": "JavaScript Algorithms and Data Structures", "platform": "freeCodeCamp", "level": "Intermediate", "duration_hours": 300, "url": "https://freecodecamp.org/learn/javascript-algorithms-and-data-structures"},
    
    # React
    {"skill": "React", "course": "React - The Complete Guide", "platform": "Udemy", "level": "Beginner", "duration_hours": 48, "url": "https://udemy.com/react-the-complete-guide"},
    {"skill": "React", "course": "Full-Stack Web Development with React", "platform": "Coursera", "level": "Intermediate", "duration_hours": 30, "url": "https://coursera.org/specializations/full-stack-react"},
    
    # Node.js
    {"skill": "Node.js", "course": "The Complete Node.js Developer Course", "platform": "Udemy", "level": "Beginner", "duration_hours": 35, "url": "https://udemy.com/the-complete-nodejs-developer-course"},
    {"skill": "Node.js", "course": "Server-side Development with NodeJS", "platform": "Coursera", "level": "Intermediate", "duration_hours": 20, "url": "https://coursera.org/learn/server-side-nodejs"},
    
    # SQL
    {"skill": "SQL", "course": "The Complete SQL Bootcamp", "platform": "Udemy", "level": "Beginner", "duration_hours": 9, "url": "https://udemy.com/the-complete-sql-bootcamp"},
    {"skill": "SQL", "course": "SQL for Data Science", "platform": "Coursera", "level": "Beginner", "duration_hours": 15, "url": "https://coursera.org/learn/sql-for-data-science"},
    
    # Machine Learning
    {"skill": "Machine Learning", "course": "Machine Learning by Andrew Ng", "platform": "Coursera", "level": "Intermediate", "duration_hours": 60, "url": "https://coursera.org/learn/machine-learning"},
    {"skill": "Machine Learning", "course": "Hands-On Machine Learning", "platform": "O'Reilly", "level": "Advanced", "duration_hours": 40, "url": "https://oreilly.com/library/view/hands-on-machine-learning"},
    {"skill": "Machine Learning", "course": "Machine Learning A-Z", "platform": "Udemy", "level": "Beginner", "duration_hours": 44, "url": "https://udemy.com/machinelearning"},
    
    # Deep Learning
    {"skill": "Deep Learning", "course": "Deep Learning Specialization", "platform": "Coursera", "level": "Intermediate", "duration_hours": 80, "url": "https://coursera.org/specializations/deep-learning"},
    {"skill": "Deep Learning", "course": "Practical Deep Learning for Coders", "platform": "fast.ai", "level": "Intermediate", "duration_hours": 40, "url": "https://course.fast.ai"},
    
    # TensorFlow
    {"skill": "TensorFlow", "course": "TensorFlow Developer Certificate", "platform": "Coursera", "level": "Intermediate", "duration_hours": 50, "url": "https://coursera.org/professional-certificates/tensorflow-in-practice"},
    {"skill": "TensorFlow", "course": "Intro to TensorFlow for Deep Learning", "platform": "Udacity", "level": "Intermediate", "duration_hours": 20, "url": "https://udacity.com/course/intro-to-tensorflow-for-deep-learning"},
    
    # PyTorch
    {"skill": "PyTorch", "course": "Deep Learning with PyTorch", "platform": "Udacity", "level": "Intermediate", "duration_hours": 30, "url": "https://udacity.com/course/deep-learning-pytorch"},
    {"skill": "PyTorch", "course": "PyTorch for Deep Learning", "platform": "freeCodeCamp", "level": "Beginner", "duration_hours": 25, "url": "https://youtube.com/watch?v=pytorch-course"},
    
    # Docker
    {"skill": "Docker", "course": "Docker Mastery", "platform": "Udemy", "level": "Beginner", "duration_hours": 20, "url": "https://udemy.com/docker-mastery"},
    {"skill": "Docker", "course": "Docker for Beginners", "platform": "KodeKloud", "level": "Beginner", "duration_hours": 8, "url": "https://kodekloud.com/courses/docker-for-the-absolute-beginner"},
    
    # Kubernetes
    {"skill": "Kubernetes", "course": "Kubernetes for Beginners", "platform": "KodeKloud", "level": "Beginner", "duration_hours": 12, "url": "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners"},
    {"skill": "Kubernetes", "course": "Certified Kubernetes Administrator", "platform": "Udemy", "level": "Advanced", "duration_hours": 25, "url": "https://udemy.com/certified-kubernetes-administrator"},
    
    # AWS
    {"skill": "AWS", "course": "AWS Cloud Practitioner", "platform": "AWS", "level": "Beginner", "duration_hours": 30, "url": "https://aws.amazon.com/training/learn-about/cloud-practitioner"},
    {"skill": "AWS", "course": "AWS Solutions Architect Associate", "platform": "Udemy", "level": "Intermediate", "duration_hours": 27, "url": "https://udemy.com/aws-certified-solutions-architect-associate"},
    
    # Azure
    {"skill": "Azure", "course": "Azure Fundamentals AZ-900", "platform": "Microsoft Learn", "level": "Beginner", "duration_hours": 20, "url": "https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts"},
    
    # Git
    {"skill": "Git", "course": "Git Complete: The definitive guide", "platform": "Udemy", "level": "Beginner", "duration_hours": 6, "url": "https://udemy.com/git-complete"},
    {"skill": "Git", "course": "Version Control with Git", "platform": "Coursera", "level": "Beginner", "duration_hours": 10, "url": "https://coursera.org/learn/version-control-with-git"},
    
    # Pandas
    {"skill": "Pandas", "course": "Data Analysis with Pandas and Python", "platform": "Udemy", "level": "Beginner", "duration_hours": 20, "url": "https://udemy.com/data-analysis-with-pandas"},
    
    # NumPy
    {"skill": "NumPy", "course": "NumPy for Data Science", "platform": "Udemy", "level": "Beginner", "duration_hours": 5, "url": "https://udemy.com/numpy"},
    
    # Statistics
    {"skill": "Statistics", "course": "Statistics with Python", "platform": "Coursera", "level": "Intermediate", "duration_hours": 30, "url": "https://coursera.org/specializations/statistics-with-python"},
    
    # NLP
    {"skill": "NLP", "course": "NLP with Python", "platform": "Coursera", "level": "Intermediate", "duration_hours": 25, "url": "https://coursera.org/specializations/natural-language-processing"},
    {"skill": "NLP", "course": "Hugging Face NLP Course", "platform": "Hugging Face", "level": "Intermediate", "duration_hours": 15, "url": "https://huggingface.co/learn/nlp-course"},
    
    # Scikit-learn
    {"skill": "Scikit-learn", "course": "Scikit-learn Tutorial", "platform": "DataCamp", "level": "Beginner", "duration_hours": 6, "url": "https://datacamp.com/courses/supervised-learning-with-scikit-learn"},
    
    # CI/CD
    {"skill": "CI/CD", "course": "CI/CD with Jenkins", "platform": "Udemy", "level": "Intermediate", "duration_hours": 8, "url": "https://udemy.com/jenkins"},
    {"skill": "CI/CD", "course": "GitHub Actions - Complete Guide", "platform": "Udemy", "level": "Beginner", "duration_hours": 12, "url": "https://udemy.com/github-actions"},
    
    # Terraform
    {"skill": "Terraform", "course": "HashiCorp Certified Terraform Associate", "platform": "Udemy", "level": "Intermediate", "duration_hours": 14, "url": "https://udemy.com/terraform-beginner-to-advanced"},
    
    # Linux
    {"skill": "Linux", "course": "Linux Mastery", "platform": "Udemy", "level": "Beginner", "duration_hours": 12, "url": "https://udemy.com/linux-mastery"},
    
    # HTML/CSS
    {"skill": "HTML/CSS", "course": "Build Responsive Websites", "platform": "Udemy", "level": "Beginner", "duration_hours": 38, "url": "https://udemy.com/design-and-develop-a-killer-website-with-html5-and-css3"},
    
    # TypeScript
    {"skill": "TypeScript", "course": "Understanding TypeScript", "platform": "Udemy", "level": "Intermediate", "duration_hours": 15, "url": "https://udemy.com/understanding-typescript"},
    
    # REST API
    {"skill": "REST API", "course": "REST APIs with Flask and Python", "platform": "Udemy", "level": "Intermediate", "duration_hours": 17, "url": "https://udemy.com/rest-api-flask-and-python"},
    
    # Figma
    {"skill": "Figma", "course": "Master Figma", "platform": "Udemy", "level": "Beginner", "duration_hours": 10, "url": "https://udemy.com/figma-ux-ui-design-user-experience-tutorial-course"},
    
    # Security
    {"skill": "Security", "course": "CompTIA Security+", "platform": "Udemy", "level": "Intermediate", "duration_hours": 25, "url": "https://udemy.com/comptia-security-plus"},
    {"skill": "Penetration Testing", "course": "Ethical Hacking from Scratch", "platform": "Udemy", "level": "Beginner", "duration_hours": 25, "url": "https://udemy.com/learn-ethical-hacking-from-scratch"},
    
    # Agile
    {"skill": "Agile", "course": "Agile with Atlassian Jira", "platform": "Coursera", "level": "Beginner", "duration_hours": 10, "url": "https://coursera.org/learn/agile-atlassian-jira"},
    {"skill": "Scrum", "course": "Scrum Master Certification Prep", "platform": "Udemy", "level": "Intermediate", "duration_hours": 8, "url": "https://udemy.com/scrum-master-certification"},
    
    # Selenium
    {"skill": "Selenium", "course": "Selenium WebDriver with Java", "platform": "Udemy", "level": "Intermediate", "duration_hours": 22, "url": "https://udemy.com/selenium-webdriver-java"},
    
    # MongoDB
    {"skill": "MongoDB", "course": "MongoDB - The Complete Developer's Guide", "platform": "Udemy", "level": "Beginner", "duration_hours": 17, "url": "https://udemy.com/mongodb-the-complete-developers-guide"},
    
    # Java
    {"skill": "Java", "course": "Java Programming Masterclass", "platform": "Udemy", "level": "Beginner", "duration_hours": 80, "url": "https://udemy.com/java-the-complete-java-developer-course"},
    
    # Swift
    {"skill": "Swift", "course": "iOS & Swift - The Complete iOS App Development", "platform": "Udemy", "level": "Beginner", "duration_hours": 55, "url": "https://udemy.com/ios-13-app-development-bootcamp"},
    
    # Kotlin
    {"skill": "Kotlin", "course": "Android Kotlin Developer", "platform": "Udacity", "level": "Intermediate", "duration_hours": 40, "url": "https://udacity.com/course/developing-android-apps-with-kotlin"},
    
    # Flutter
    {"skill": "Flutter", "course": "Flutter & Dart - The Complete Guide", "platform": "Udemy", "level": "Beginner", "duration_hours": 42, "url": "https://udemy.com/learn-flutter-dart-to-build-ios-android-apps"},
    
    # Solidity / Blockchain
    {"skill": "Solidity", "course": "Ethereum and Solidity: The Complete Guide", "platform": "Udemy", "level": "Intermediate", "duration_hours": 24, "url": "https://udemy.com/ethereum-and-solidity-the-complete-developers-guide"},
    {"skill": "Blockchain", "course": "Blockchain Specialization", "platform": "Coursera", "level": "Intermediate", "duration_hours": 40, "url": "https://coursera.org/specializations/blockchain"},
    
    # LLM / GenAI
    {"skill": "LLM", "course": "LLM Course - Generative AI with LLMs", "platform": "Coursera", "level": "Intermediate", "duration_hours": 20, "url": "https://coursera.org/learn/generative-ai-with-llms"},
    {"skill": "Langchain", "course": "LangChain for LLM Application Development", "platform": "DeepLearning.AI", "level": "Intermediate", "duration_hours": 5, "url": "https://deeplearning.ai/short-courses/langchain-for-llm-application-development"},
    {"skill": "Prompt Engineering", "course": "ChatGPT Prompt Engineering for Developers", "platform": "DeepLearning.AI", "level": "Beginner", "duration_hours": 3, "url": "https://deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers"},
    
    # MLOps
    {"skill": "MLOps", "course": "Machine Learning Engineering for Production", "platform": "Coursera", "level": "Advanced", "duration_hours": 40, "url": "https://coursera.org/specializations/machine-learning-engineering-for-production-mlops"},
    {"skill": "MLflow", "course": "MLflow in Action", "platform": "DataCamp", "level": "Intermediate", "duration_hours": 4, "url": "https://datacamp.com/courses/mlflow"},
    
    # Data Viz
    {"skill": "Tableau", "course": "Tableau A-Z: Hands-On", "platform": "Udemy", "level": "Beginner", "duration_hours": 9, "url": "https://udemy.com/tableau-for-beginners"},
    {"skill": "Power BI", "course": "Microsoft Power BI Desktop", "platform": "Udemy", "level": "Beginner", "duration_hours": 12, "url": "https://udemy.com/microsoft-power-bi-up-running-with-power-bi-desktop"},
    
    # Apache Spark
    {"skill": "Apache Spark", "course": "Apache Spark with Python - Big Data with PySpark", "platform": "Udemy", "level": "Intermediate", "duration_hours": 12, "url": "https://udemy.com/spark-and-python-for-big-data-with-pyspark"},
    
    # OpenCV
    {"skill": "OpenCV", "course": "Computer Vision with OpenCV and Deep Learning", "platform": "Udemy", "level": "Intermediate", "duration_hours": 14, "url": "https://udemy.com/python-for-computer-vision-with-opencv-and-deep-learning"},
    
    # Transformers/BERT
    {"skill": "Transformers", "course": "NLP with Transformers", "platform": "Hugging Face", "level": "Advanced", "duration_hours": 20, "url": "https://huggingface.co/learn/nlp-course"},
    {"skill": "BERT", "course": "BERT and Transformers", "platform": "DeepLearning.AI", "level": "Advanced", "duration_hours": 8, "url": "https://deeplearning.ai/short-courses/"},
    
    # Unity
    {"skill": "Unity", "course": "Complete C# Unity Game Developer 3D", "platform": "Udemy", "level": "Beginner", "duration_hours": 30, "url": "https://udemy.com/unitycourse2"},
    
    # IoT
    {"skill": "IoT", "course": "Internet of Things Specialization", "platform": "Coursera", "level": "Intermediate", "duration_hours": 30, "url": "https://coursera.org/specializations/internet-of-things"},
    {"skill": "Arduino", "course": "Arduino Step by Step", "platform": "Udemy", "level": "Beginner", "duration_hours": 20, "url": "https://udemy.com/arduino-sbs-17gs"},
    
    # System Design
    {"skill": "System Design", "course": "Grokking System Design", "platform": "Educative", "level": "Advanced", "duration_hours": 25, "url": "https://educative.io/courses/grokking-the-system-design-interview"},
    
    # Data Structures & Algorithms
    {"skill": "Algorithms", "course": "Algorithms and Data Structures Masterclass", "platform": "Udemy", "level": "Intermediate", "duration_hours": 22, "url": "https://udemy.com/js-algorithms-and-data-structures-masterclass"},
    {"skill": "Data Structures", "course": "Data Structures & Algorithms in Python", "platform": "Udemy", "level": "Intermediate", "duration_hours": 16, "url": "https://udemy.com/data-structures-algorithms-python"},
    
    # Microservices
    {"skill": "Microservices", "course": "Microservices with Node JS and React", "platform": "Udemy", "level": "Intermediate", "duration_hours": 54, "url": "https://udemy.com/microservices-with-node-js-and-react"},
    
    # GraphQL
    {"skill": "GraphQL", "course": "The Modern GraphQL Bootcamp", "platform": "Udemy", "level": "Intermediate", "duration_hours": 23, "url": "https://udemy.com/graphql-bootcamp"},
    
    # Excel
    {"skill": "Excel", "course": "Excel Skills for Business", "platform": "Coursera", "level": "Beginner", "duration_hours": 20, "url": "https://coursera.org/specializations/excel"},
    
    # R
    {"skill": "R", "course": "R Programming", "platform": "Coursera", "level": "Beginner", "duration_hours": 20, "url": "https://coursera.org/learn/r-programming"},
    
    # OWASP
    {"skill": "OWASP", "course": "OWASP Top 10 Web Application Security", "platform": "Udemy", "level": "Intermediate", "duration_hours": 5, "url": "https://udemy.com/owasp-top-10"},
    
    # Compliance
    {"skill": "Compliance", "course": "GDPR Data Protection", "platform": "Udemy", "level": "Beginner", "duration_hours": 3, "url": "https://udemy.com/gdpr"},
]

# Save
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Save as CSV
csv_path = os.path.join(DATA_DIR, 'courses_dataset.csv')
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["skill", "course", "platform", "level", "duration_hours", "url"])
    writer.writeheader()
    writer.writerows(COURSES)

# Save as JSON for easy import
json_path = os.path.join(DATA_DIR, 'courses_dataset.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(COURSES, f, indent=2)

print(f"=" * 60)
print(f"Course Recommendation Dataset Generated")
print(f"=" * 60)
print(f"Total courses: {len(COURSES)}")
print(f"Skills covered: {len(set(c['skill'] for c in COURSES))}")
print(f"Platforms: {sorted(set(c['platform'] for c in COURSES))}")
print(f"\nSaved to:")
print(f"  CSV:  {csv_path}")
print(f"  JSON: {json_path}")
