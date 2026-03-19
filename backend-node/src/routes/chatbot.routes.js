/**
 * Chatbot Routes — Module 8 (LLM Chatbot) + Module 10 (Mentorship + GMeet)
 * 
 * POST /api/chatbot/chat                → LLM-powered chat for career advice
 * POST /api/chatbot/schedule-meeting    → Schedule mentorship meeting (with Google Meet link)
 * POST /api/chatbot/mentor              → LLM-based mentorship conversation
 * GET  /api/chatbot/history             → Chat history
 * GET  /api/chatbot/model-metrics       → ML model metrics
 * GET  /api/chatbot/supported-roles     → Supported career roles
 */

const express = require('express');
const router = express.Router();
const { db, dbAsync } = require('../services/database');
const path = require('path');
const fs = require('fs');

// ── @google/genai SDK (matches CHAT BOT PLAN architecture) ──
const { GoogleGenAI } = require('@google/genai');

let geminiClient = null;
const MODEL_NAME = 'gemini-2.5-flash';   // newest Gemini model with available quota

// System prompts (from constants.ts in CHAT BOT PLAN)
const CORA_SYSTEM_PROMPT = `You are Cora — the AI career assistant built into the Smart Career Advisor platform.

ABOUT THE PLATFORM:
Smart Career Advisor is a web application that helps users discover their ideal career path. It uses:
- ML-based Resume Analyzer (SVM + Random Forest ensemble) that predicts the best-fit career role from a user's skills
- Skill Gap Analysis that compares user skills against role requirements and shows missing skills
- Personalized Learning Path generator that recommends real courses from Coursera, Udemy, LinkedIn Learning, edX, etc.
- Job Fit Score (percentage match between user skills and target role requirements)
- This chatbot (you) for real-time career guidance
- Mentorship Hub for deeper 1-on-1 guidance sessions

YOUR PERSONALITY:
- Warm, encouraging, and professional — like a senior friend who works in tech recruiting
- You speak naturally, not robotically. Use conversational language.
- You give specific, actionable advice — never vague generic tips
- You use emojis sparingly (1-2 per response max) to feel friendly
- You keep responses focused: 2-4 short paragraphs. No walls of text.

WHAT YOU CAN DO:
1. Career guidance: Suggest roles based on skills, explain what different tech roles do
2. Skill advice: Tell users what skills they need for specific roles, what to learn first
3. Resume tips: How to present skills, what recruiters look for, ATS optimization
4. Interview prep: Common questions for specific roles, how to answer behavioral questions, coding interview strategy
5. Salary insights: General salary ranges by role and experience level (always say "industry average" — don't guarantee numbers)
6. Learning paths: Suggest specific courses, certifications, books, and free resources
7. Career transitions: Help users switch careers (e.g., from testing to development)
8. Platform help: Explain how to use the Resume Analyzer, what the Fit Score means, how skill gaps work

SKILL-TO-ROLE KNOWLEDGE (use this when users ask about roles):
- Data Scientist: Python, R, SQL, Pandas, NumPy, Scikit-learn, TensorFlow, Statistics, Machine Learning, Deep Learning
- Full Stack Developer: JavaScript, React, Node.js, Express, MongoDB, SQL, HTML, CSS, Git, REST APIs
- DevOps Engineer: Docker, Kubernetes, AWS, CI/CD, Linux, Terraform, Jenkins, Git, Python, Monitoring
- Cybersecurity Analyst: Network Security, Penetration Testing, SIEM, Firewalls, Python, Linux, Encryption, Compliance
- Mobile Developer: React Native, Flutter, Swift, Kotlin, UI/UX, REST APIs, Firebase
- UI/UX Designer: Figma, Adobe XD, User Research, Wireframing, Prototyping, Design Systems, CSS
- Cloud Engineer: AWS, Azure, GCP, Terraform, Docker, Networking, Linux, IAM, Serverless
- AI/ML Engineer: Python, TensorFlow, PyTorch, NLP, Computer Vision, MLOps, Mathematics, Deep Learning
- Backend Developer: Node.js, Python, Java, SQL, PostgreSQL, Redis, REST APIs, Microservices, Docker
- QA Engineer: Selenium, Cypress, Jest, Test Planning, Automation, CI/CD, API Testing, Performance Testing
- Product Manager: Agile, JIRA, User Stories, Market Research, Data Analysis, Roadmapping, A/B Testing
- Blockchain Developer: Solidity, Ethereum, Smart Contracts, Web3.js, DeFi, Cryptography

RULES:
- If someone asks something completely unrelated to careers/tech/learning (like cooking or politics), be friendly but redirect: "That's a fun topic! But I'm best at career stuff — want to explore your next career move?"
- Never make up fake company names, fake job listings, or fake statistics
- If you don't know something specific, say so honestly and suggest where to find the answer
- Format your responses with line breaks for readability. Use **bold** for key terms.
- When listing items, use bullet points with - or •`;

const MENTOR_SYSTEM_PROMPT = `You are a senior tech industry mentor with 15+ years of experience in hiring, career development, and technical leadership. You're mentoring a student/professional through the Smart Career Advisor platform.

YOUR MENTORING STYLE:
- You speak like a caring senior colleague, not a textbook
- You give honest, realistic advice — not just encouragement
- You break big goals into small, achievable weekly steps
- You share practical "insider" knowledge about the tech industry
- You motivate without being fake — acknowledge challenges while showing the path forward
- Your responses are thorough but structured (use headers, bullets, numbered steps)

IN YOUR RESPONSE, INCLUDE:
1. **Where they stand** — honest assessment of their current position
2. **Immediate next step** — one specific thing they should do THIS WEEK
3. **30-day plan** — concrete skills to learn or projects to build in the next month
4. **Resources** — specific courses (Coursera, Udemy, freeCodeCamp), YouTube channels, books, or projects
5. **Reality check** — what companies actually look for in this role (from a hiring perspective)
6. **Encouragement** — genuine motivation based on their specific situation`;

// Initialize the Gemini client
// IMPORTANT: Remove any system-level GOOGLE_API_KEY so the SDK only uses our GEMINI_API_KEY
if (process.env.GOOGLE_API_KEY) {
    console.log('⚠️ Clearing system GOOGLE_API_KEY to prevent SDK conflict');
    delete process.env.GOOGLE_API_KEY;
}
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
    geminiClient = new GoogleGenAI({ apiKey });
    console.log('✅ Gemini AI client initialized (model:', MODEL_NAME, ')');
} else {
    console.warn('⚠️ GEMINI_API_KEY not set — chatbot will use fallback responses');
}


// ------------------------------------------------------------------
// POST /api/chatbot/chat — LLM-powered career chatbot (Module 8)
// ------------------------------------------------------------------
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        const userId = req.session?.userId || null;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        let botResponse = '';
        let responseSource = 'Rule-based fallback';

        if (geminiClient) {
            // Build user content with optional context
            let userContent = message;
            if (context) {
                userContent = `USER CONTEXT (from their analysis results): ${JSON.stringify(context)}\n\nUser says: ${message}`;
            }

            try {
                // Use @google/genai SDK: client.models.generateContent()
                // with config.systemInstruction (separates system prompt from user message)
                const response = await geminiClient.models.generateContent({
                    model: MODEL_NAME,
                    contents: userContent,
                    config: {
                        systemInstruction: CORA_SYSTEM_PROMPT,
                    }
                });
                botResponse = response.text || "I'm having trouble thinking of a response right now.";
                responseSource = 'Google Gemini';
                console.log('[Chatbot] Gemini response received successfully');
            } catch (geminiError) {
                console.error('[Chatbot] Gemini API error:', geminiError.message);
                botResponse = getFallbackResponse(message);
                responseSource = 'Fallback (Gemini error: ' + geminiError.message + ')';
            }
        } else {
            console.warn('[Chatbot] No Gemini client available, using fallback');
            botResponse = getFallbackResponse(message);
        }

        // Save to chat history
        if (userId) {
            try {
                await dbAsync.run(
                    'INSERT INTO chat_history (user_id, user_message, bot_response, intent) VALUES (?, ?, ?, ?)',
                    [userId, message, botResponse, detectIntent(message)]
                );
            } catch (dbErr) {
                console.error('Failed to save chat history:', dbErr.message);
            }
        }

        res.json({
            success: true,
            response: botResponse,
            intent: detectIntent(message),
            powered_by: responseSource
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: 'Chat service error' });
    }
});

// ------------------------------------------------------------------
// POST /api/chatbot/mentor — LLM-based mentorship (Module 10)
// ------------------------------------------------------------------
router.post('/mentor', async (req, res) => {
    try {
        const { message, career_context, conversation_history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        let mentorResponse = '';
        let responseSource = 'Rule-based mentor';

        if (geminiClient) {
            // Build user content with student profile context
            let userContent = message;
            if (career_context || conversation_history) {
                userContent = '';
                if (career_context) {
                    userContent += `\nSTUDENT'S PROFILE (from their resume analysis):\n` +
                        `- Best-fit Career Role: ${career_context.predicted_role || 'Not assessed yet'}\n` +
                        `- Current Skills: ${career_context.skills?.join(', ') || 'Not provided'}\n` +
                        `- Skill Gap: ${career_context.gap_percentage || 'Unknown'}% of required skills are missing\n` +
                        `- Job Fit Score: ${career_context.fit_percentage || 'Unknown'}%\n` +
                        `- Missing Skills: ${career_context.missing_skills?.join(', ') || 'Not analyzed'}\n`;
                }
                if (conversation_history) {
                    userContent += `\nCONVERSATION SO FAR:\n${conversation_history.map(h => `${h.role}: ${h.content}`).join('\n')}\n`;
                }
                userContent += `\nStudent asks: ${message}`;
            }

            try {
                // Use @google/genai SDK: client.models.generateContent()
                // with config.systemInstruction (same pattern as /chat)
                const response = await geminiClient.models.generateContent({
                    model: MODEL_NAME,
                    contents: userContent,
                    config: {
                        systemInstruction: MENTOR_SYSTEM_PROMPT,
                    }
                });
                mentorResponse = response.text || "I'm having trouble providing mentorship right now.";
                responseSource = 'Google Gemini';
                console.log('[Mentor] Gemini response received successfully');
            } catch (err) {
                console.error('[Mentor] Gemini API error:', err.message);
                mentorResponse = getMentorFallbackResponse(message, career_context);
                responseSource = 'Fallback (Gemini error: ' + err.message + ')';
            }
        } else {
            mentorResponse = getMentorFallbackResponse(message, career_context);
        }

        res.json({
            success: true,
            response: mentorResponse,
            type: 'mentorship',
            powered_by: responseSource
        });

    } catch (error) {
        console.error('Mentor error:', error);
        res.status(500).json({ success: false, message: 'Mentorship service error' });
    }
});

// ------------------------------------------------------------------
// POST /api/chatbot/schedule-meeting — Meeting + Google Meet link (Module 10)
// ------------------------------------------------------------------
router.post('/schedule-meeting', async (req, res) => {
    try {
        const { name, email, phone, preferredTime } = req.body;

        if (!name || !email || !phone || !preferredTime) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Generate a Google Meet-style meeting ID (simulated — real integration requires Google Calendar API + OAuth2)
        const meetId = generateMeetId();
        const meetLink = `https://meet.google.com/${meetId}`;

        // Save to database (SQLite)
        const result = await dbAsync.run(
            'INSERT INTO meeting_requests (name, email, phone, preferred_time, meet_link, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, preferredTime, meetLink, 'confirmed']
        );

        res.json({
            success: true,
            message: 'Meeting scheduled successfully!',
            bookingId: result.lastID,
            meetId,
            meetLink,
            name,
            email,
            preferredTime,
            status: 'confirmed'
        });

    } catch (error) {
        console.error('Schedule meeting error:', error);
        res.status(500).json({ success: false, message: 'Failed to schedule meeting' });
    }
});

// ------------------------------------------------------------------
// GET /api/chatbot/history — Chat history
// ------------------------------------------------------------------
router.get('/history', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.json({ success: true, history: [] });
        }

        const history = await dbAsync.all(
            'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

// ------------------------------------------------------------------
// GET /api/chatbot/model-metrics — ML model metrics (Module 9)
// ------------------------------------------------------------------
router.get('/model-metrics', (req, res) => {
    try {
        const metricsPath = path.join(__dirname, '..', '..', 'models', 'metrics.json');
        if (fs.existsSync(metricsPath)) {
            const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            res.json({ success: true, metrics });
        } else {
            res.json({ success: false, message: 'Metrics not found. Train models first.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load metrics' });
    }
});

// ------------------------------------------------------------------
// GET /api/chatbot/supported-roles
// ------------------------------------------------------------------
router.get('/supported-roles', (req, res) => {
    try {
        const metricsPath = path.join(__dirname, '..', '..', 'models', 'metrics.json');
        if (fs.existsSync(metricsPath)) {
            const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            res.json({
                success: true,
                roles: metrics.dataset?.roles || [],
                count: metrics.dataset?.num_roles || 0
            });
        } else {
            res.json({ success: true, roles: [], count: 0 });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load roles' });
    }
});

// ------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------

function detectIntent(message) {
    const msg = message.toLowerCase();
    if (msg.includes('skill') && (msg.includes('gap') || msg.includes('missing'))) return 'skill_gap';
    if (msg.includes('course') || msg.includes('learn') || msg.includes('study')) return 'course_recommendation';
    if (msg.includes('career') || msg.includes('role') || msg.includes('job')) return 'career_advice';
    if (msg.includes('resume') || msg.includes('cv')) return 'resume_help';
    if (msg.includes('meeting') || msg.includes('schedule') || msg.includes('book')) return 'schedule_meeting';
    if (msg.includes('mentor') || msg.includes('guide') || msg.includes('advice')) return 'mentorship';
    if (msg.includes('salary') || msg.includes('pay') || msg.includes('compensation')) return 'salary_info';
    if (msg.includes('interview') || msg.includes('preparation')) return 'interview_prep';
    return 'general';
}

function getFallbackResponse(message) {
    const intent = detectIntent(message);

    const responses = {
        skill_gap: "Based on your profile, I can help identify skill gaps. Please upload your resume or enter your skills in the Resume Analyzer section, and I'll compare them with the requirements for your predicted career role. The skill gap formula is: Gap = Required Skills - Your Skills.",
        course_recommendation: "I'd recommend checking the Course Recommendations section after completing your resume analysis. Our system uses Cosine Similarity and KNN algorithms to find the most relevant courses for your missing skills, with personalized learning paths from platforms like Coursera, Udemy, and more.",
        career_advice: "For personalized career advice, start by uploading your resume in the Resume Analyzer. Our ML models (SVM, Random Forest, and Ensemble) will predict the best-fit career roles for your skill set with over 99% accuracy across 97 career roles.",
        resume_help: "Upload your resume (PDF or TXT) in the Resume Analyzer section. Our NLP pipeline will tokenize, remove stopwords, and extract your skills using TF-IDF weighting. Then our ML models predict your best career match.",
        schedule_meeting: "You can schedule a mentorship meeting using the form on this page. Just provide your name, email, phone number, and preferred time. A Google Meet link will be generated for your session.",
        mentorship: "Our mentorship program provides personalized career guidance. You can chat with our AI mentor or schedule a 1-on-1 video call via Google Meet. The AI mentor considers your skill profile, career prediction, and learning goals.",
        salary_info: "While I don't have real-time salary data, I can help you understand the market expectations for your predicted role. The skills you develop directly impact your earning potential.",
        interview_prep: "To prepare for interviews, I'd suggest: 1) Review the skills listed for your predicted role, 2) Practice coding problems on platforms like LeetCode, 3) Study system design for senior roles, 4) Prepare behavioral stories using the STAR method.",
        general: "I'm your Smart Career Advisor! I can help with:\n• Career predictions based on your skills\n• Skill gap analysis\n• Course recommendations\n• Resume analysis\n• Mentorship guidance\n• Meeting scheduling\n\nWhat would you like to know more about?"
    };

    return responses[intent] || responses.general;
}

function getMentorFallbackResponse(message, context) {
    const role = context?.predicted_role || 'your target role';
    const gap = context?.gap_percentage || 'your identified';

    return `As your career mentor, I'd like to help you with your journey toward becoming a ${role}.\n\n` +
        `Based on your profile:\n` +
        `• Your current skill gap is around ${gap}%\n` +
        `• Focus on building the missing skills systematically\n` +
        `• Set achievable weekly goals (10-15 hours of learning)\n` +
        `• Practice with hands-on projects\n` +
        `• Join relevant communities and forums\n\n` +
        `Would you like specific recommendations for courses or a study plan? ` +
        `You can also schedule a 1-on-1 mentorship session via Google Meet for more personalized guidance.`;
}

function generateMeetId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segments = [3, 4, 3];
    return segments.map(len =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
}

module.exports = router;