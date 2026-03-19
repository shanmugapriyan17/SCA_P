
require('dotenv').config({ path: '../.env' });
console.log('API Key present:', !!process.env.GEMINI_API_KEY);

try {
    const { GoogleGenAI } = require('@google/genai');
    console.log('@google/genai loaded successfully');

    if (process.env.GEMINI_API_KEY) {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log('Client initialized');
    }
} catch (error) {
    console.error('Error:', error);
}
