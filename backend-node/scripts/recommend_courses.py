#!/usr/bin/env python3
"""
Smart Career Advisor - Course Recommendation Service (Module 7)
Content-based recommendation using Cosine Similarity / KNN.

Usage:
    python scripts/recommend_courses.py '["Python", "Machine Learning", "Docker"]' "AI/ML Engineer"

Output: JSON to stdout with recommended courses for missing skills
"""

import os
import sys
import json

try:
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.neighbors import NearestNeighbors
except ImportError as e:
    print(json.dumps({"error": f"Missing package: {e}"}))
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

def load_courses():
    """Load course dataset."""
    json_path = os.path.join(DATA_DIR, 'courses_dataset.json')
    if not os.path.exists(json_path):
        return None, "Course dataset not found. Run generate_course_dataset.py first."
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f), None

def recommend_courses(missing_skills, target_role, courses):
    """
    Content-based recommendation using Cosine Similarity and KNN.
    
    For each missing skill:
    1. Find courses that match the skill (direct match)
    2. Use Cosine Similarity on skill text to find related courses
    3. Use KNN to find nearest neighbor courses
    """
    if not missing_skills:
        return {"success": True, "recommendations": [], "message": "No missing skills to recommend courses for."}
    
    # Build TF-IDF matrix from course skills
    course_skills = [c['skill'].lower() for c in courses]
    all_texts = course_skills + [s.lower() for s in missing_skills]
    
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Split: course vectors and missing skill vectors
    num_courses = len(courses)
    course_vectors = tfidf_matrix[:num_courses]
    skill_vectors = tfidf_matrix[num_courses:]
    
    recommendations = []
    recommended_course_names = set()
    
    for i, skill in enumerate(missing_skills):
        skill_lower = skill.lower().strip()
        skill_courses = []
        
        # Method 1: Direct match
        for j, course in enumerate(courses):
            if course['skill'].lower() == skill_lower:
                if course['course'] not in recommended_course_names:
                    skill_courses.append({
                        **course,
                        "match_method": "direct",
                        "similarity_score": 1.0
                    })
                    recommended_course_names.add(course['course'])
        
        # Method 2: Cosine Similarity (find related courses)
        if len(skill_courses) < 3 and skill_vectors.shape[0] > i:
            similarities = cosine_similarity(skill_vectors[i:i+1], course_vectors)[0]
            similar_indices = np.argsort(similarities)[-5:][::-1]
            
            for idx in similar_indices:
                if similarities[idx] > 0.1:
                    course = courses[idx]
                    if course['course'] not in recommended_course_names:
                        skill_courses.append({
                            **course,
                            "match_method": "cosine_similarity",
                            "similarity_score": float(round(similarities[idx], 4))
                        })
                        recommended_course_names.add(course['course'])
        
        # Method 3: KNN (k-nearest neighbors)
        if len(skill_courses) < 3 and course_vectors.shape[0] >= 3:
            try:
                k = min(3, course_vectors.shape[0])
                knn = NearestNeighbors(n_neighbors=k, metric='cosine')
                knn.fit(course_vectors)
                
                if skill_vectors.shape[0] > i:
                    distances, indices = knn.kneighbors(skill_vectors[i:i+1])
                    
                    for d, idx in zip(distances[0], indices[0]):
                        course = courses[idx]
                        if course['course'] not in recommended_course_names:
                            skill_courses.append({
                                **course,
                                "match_method": "knn",
                                "similarity_score": float(round(1 - d, 4))  # Convert distance to similarity
                            })
                            recommended_course_names.add(course['course'])
            except Exception:
                pass
        
        if skill_courses:
            # Sort by similarity score
            skill_courses.sort(key=lambda x: x['similarity_score'], reverse=True)
            recommendations.append({
                "skill": skill,
                "courses": skill_courses[:3],  # Top 3 per skill
                "total_found": len(skill_courses)
            })
    
    # Build personalized learning path
    learning_path = []
    for rec in recommendations:
        for course in rec['courses']:
            learning_path.append({
                "skill": rec['skill'],
                "course": course['course'],
                "platform": course['platform'],
                "level": course['level'],
                "duration_hours": course['duration_hours'],
                "url": course['url']
            })
    
    # Sort learning path: Beginner → Intermediate → Advanced
    level_order = {"Beginner": 0, "Intermediate": 1, "Advanced": 2}
    learning_path.sort(key=lambda x: level_order.get(x['level'], 1))
    
    total_hours = sum(c['duration_hours'] for c in learning_path)
    
    return {
        "success": True,
        "target_role": target_role,
        "missing_skills_count": len(missing_skills),
        "recommendations": recommendations,
        "personalized_learning_path": learning_path,
        "total_courses": len(learning_path),
        "total_learning_hours": total_hours,
        "estimated_weeks": round(total_hours / 10, 1),  # Assuming 10 hrs/week
        "algorithms_used": ["Direct Matching", "Cosine Similarity (TF-IDF)", "K-Nearest Neighbors"]
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python recommend_courses.py '[\"skill1\", \"skill2\"]' 'Target Role'"}))
        sys.exit(1)
    
    try:
        missing_skills = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        missing_skills = sys.argv[1].split(',')
    
    target_role = sys.argv[2]
    
    courses, error = load_courses()
    if error:
        print(json.dumps({"error": error}))
        sys.exit(1)
    
    result = recommend_courses(missing_skills, target_role, courses)
    print(json.dumps(result))
