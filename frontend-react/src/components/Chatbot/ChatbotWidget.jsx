import { useState, useEffect, useRef } from 'react';
import './ChatbotWidget.css';
import jsPDF from 'jspdf';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState('initial');
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        phone: '',
        preferredTime: ''
    });
    const [modelMetrics, setModelMetrics] = useState(null);
    const [isTraining, setIsTraining] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                addBotMessage(
                    "👋 Hi! I'm your Smart Career Advisor assistant. I can help you:\n\n" +
                    "1️⃣ Schedule a meeting with our career advisor\n" +
                    "2️⃣ Learn about our project\n" +
                    "3️⃣ Know about the creator\n" +
                    "4️⃣ View Model Accuracy (ML Metrics)\n" +
                    "5️⃣ Export Metrics Report (PDF)\n\n" +
                    "What would you like to do?"
                );
            }, 500);
        }
    }, [isOpen]);

    const addBotMessage = (text, delay = 1000) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { text, sender: 'bot', timestamp: new Date() }]);
            setIsTyping(false);
        }, delay);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userInput = inputValue.trim();
        addUserMessage(userInput);
        setInputValue('');

        processUserInput(userInput);
    };

    // Fetch model metrics from API
    const fetchModelMetrics = async () => {
        try {
            const response = await fetch('/api/chatbot/model-metrics');
            const data = await response.json();
            if (data.success && data.metrics) {
                setModelMetrics(data.metrics);
                return data.metrics;
            }
            return null;
        } catch (error) {
            console.error('Error fetching metrics:', error);
            return null;
        }
    };

    // Display model metrics in chat
    const showModelMetrics = async () => {
        addBotMessage("📊 Fetching model metrics...", 500);

        const metrics = await fetchModelMetrics();

        if (metrics) {
            const svmAcc = (metrics.svm_metrics?.accuracy * 100).toFixed(2);
            const rfAcc = (metrics.rf_metrics?.accuracy * 100).toFixed(2);
            const svmPrec = (metrics.svm_metrics?.precision * 100).toFixed(2);
            const rfPrec = (metrics.rf_metrics?.precision * 100).toFixed(2);
            const svmRecall = (metrics.svm_metrics?.recall * 100).toFixed(2);
            const rfRecall = (metrics.rf_metrics?.recall * 100).toFixed(2);
            const svmF1 = (metrics.svm_metrics?.f1_score * 100).toFixed(2);
            const rfF1 = (metrics.rf_metrics?.f1_score * 100).toFixed(2);
            const numRoles = metrics.dataset?.num_roles || 0;
            const totalSamples = metrics.dataset?.total_samples || 0;
            const bestModel = metrics.best_model?.name || 'SVM';

            addBotMessage(
                `📈 **Model Performance Report**\n\n` +
                `🗓️ Last Trained: ${metrics.timestamp}\n` +
                `📊 Dataset: ${totalSamples} samples, ${numRoles} roles\n\n` +
                `**SVM Model:**\n` +
                `• Accuracy: ${svmAcc}%\n` +
                `• Precision: ${svmPrec}%\n` +
                `• Recall: ${svmRecall}%\n` +
                `• F1-Score: ${svmF1}%\n\n` +
                `**Random Forest Model:**\n` +
                `• Accuracy: ${rfAcc}%\n` +
                `• Precision: ${rfPrec}%\n` +
                `• Recall: ${rfRecall}%\n` +
                `• F1-Score: ${rfF1}%\n\n` +
                `🏆 **Best Model: ${bestModel}**\n\n` +
                `Would you like to export this as a PDF? Type "5" or "export pdf"`,
                1500
            );
        } else {
            addBotMessage(
                "❌ No model metrics found. The model hasn't been trained yet.\n\n" +
                "Please run the training script first:\n" +
                "`python scripts/train_and_evaluate.py`",
                1000
            );
        }
    };

    // Export metrics as PDF
    const exportMetricsPDF = async () => {
        addBotMessage("📄 Generating PDF report...", 500);

        const metrics = modelMetrics || await fetchModelMetrics();

        if (!metrics) {
            addBotMessage("❌ No metrics available to export. Please view metrics first (option 4).", 1000);
            return;
        }

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Title
            doc.setFontSize(24);
            doc.setTextColor(79, 70, 229); // Indigo
            doc.text('Smart Career Advisor', pageWidth / 2, 25, { align: 'center' });

            doc.setFontSize(16);
            doc.setTextColor(100, 116, 139);
            doc.text('Model Performance Report', pageWidth / 2, 35, { align: 'center' });

            // Timestamp
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 45, { align: 'center' });
            doc.text(`Last Trained: ${metrics.timestamp}`, pageWidth / 2, 52, { align: 'center' });

            // Dataset Info
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('Dataset Information', 20, 70);

            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            doc.text(`• Total Samples: ${metrics.dataset?.total_samples || 'N/A'}`, 25, 80);
            doc.text(`• Training Set: ${metrics.dataset?.train_samples || 'N/A'}`, 25, 87);
            doc.text(`• Testing Set: ${metrics.dataset?.test_samples || 'N/A'}`, 25, 94);
            doc.text(`• Number of Roles: ${metrics.dataset?.num_roles || 'N/A'}`, 25, 101);

            // SVM Model
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('SVM Model Performance', 20, 118);

            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            const svmMetrics = metrics.svm_metrics || {};
            doc.text(`• Accuracy: ${(svmMetrics.accuracy * 100).toFixed(2)}%`, 25, 128);
            doc.text(`• Precision: ${(svmMetrics.precision * 100).toFixed(2)}%`, 25, 135);
            doc.text(`• Recall: ${(svmMetrics.recall * 100).toFixed(2)}%`, 25, 142);
            doc.text(`• F1-Score: ${(svmMetrics.f1_score * 100).toFixed(2)}%`, 25, 149);
            doc.text(`• Training Time: ${svmMetrics.training_time_seconds?.toFixed(3)}s`, 25, 156);

            // Random Forest Model
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('Random Forest Model Performance', 20, 173);

            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            const rfMetrics = metrics.rf_metrics || {};
            doc.text(`• Accuracy: ${(rfMetrics.accuracy * 100).toFixed(2)}%`, 25, 183);
            doc.text(`• Precision: ${(rfMetrics.precision * 100).toFixed(2)}%`, 25, 190);
            doc.text(`• Recall: ${(rfMetrics.recall * 100).toFixed(2)}%`, 25, 197);
            doc.text(`• F1-Score: ${(rfMetrics.f1_score * 100).toFixed(2)}%`, 25, 204);
            doc.text(`• Training Time: ${rfMetrics.training_time_seconds?.toFixed(3)}s`, 25, 211);

            // Best Model
            doc.setFontSize(14);
            doc.setTextColor(79, 70, 229);
            doc.text(`Best Model: ${metrics.best_model?.name || 'SVM'} (${(metrics.best_model?.accuracy * 100).toFixed(2)}% accuracy)`, 20, 230);

            // Supported Roles (Page 2)
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text('Supported Job Roles', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);

            const roles = metrics.dataset?.roles || [];
            const columns = 2;
            const rolesPerColumn = Math.ceil(roles.length / columns);

            roles.forEach((role, index) => {
                const column = Math.floor(index / rolesPerColumn);
                const row = index % rolesPerColumn;
                const x = 20 + (column * 95);
                const y = 35 + (row * 6);

                if (y < 280) {
                    doc.text(`${index + 1}. ${role}`, x, y);
                }
            });

            // Footer
            doc.setFontSize(9);
            doc.setTextColor(156, 163, 175);
            doc.text('Smart Career Advisor - AI-Powered Career Guidance Platform', pageWidth / 2, 290, { align: 'center' });

            // Open PDF in new tab (better for mobile)
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            addBotMessage(
                "✅ **PDF Report Generated!**\n\n" +
                "📥 The report has been opened in a new tab.\n\n" +
                "The report includes:\n" +
                "• Dataset information\n" +
                "• SVM model metrics\n" +
                "• Random Forest model metrics\n" +
                "• All 97 supported job roles\n\n" +
                "Is there anything else I can help you with?",
                1500
            );
        } catch (error) {
            console.error('Error generating PDF:', error);
            addBotMessage("❌ Error generating PDF. Please try again.", 1000);
        }
    };

    const processUserInput = (input) => {
        const lowerInput = input.toLowerCase();

        // Check for model metrics request
        if (lowerInput === '4' || lowerInput.includes('accuracy') || lowerInput.includes('metrics') || lowerInput.includes('model')) {
            showModelMetrics();
            setCurrentStep('initial');
            return;
        }

        // Check for PDF export request
        if (lowerInput === '5' || lowerInput.includes('export') || lowerInput.includes('pdf') || lowerInput.includes('download')) {
            exportMetricsPDF();
            setCurrentStep('initial');
            return;
        }

        // Check for project info request
        if (lowerInput.includes('project') || lowerInput.includes('about') && lowerInput.includes('this')) {
            addBotMessage(
                "📊 **Smart Career Advisor** is an AI-powered career guidance platform that:\n\n" +
                "✅ Analyzes your resume using Machine Learning\n" +
                "✅ Predicts best-fit career paths\n" +
                "✅ Uses dual ML models (SVM & Random Forest)\n" +
                "✅ Supports 97 different job roles\n" +
                "✅ Provides job fit analysis and recommendations\n\n" +
                "Is there anything else I can help you with?"
            );
            setCurrentStep('initial');
            return;
        }

        // Check for creator info request
        if (lowerInput.includes('creator') || lowerInput.includes('who created') || lowerInput.includes('developer')) {
            addBotMessage(
                "👩‍💻 **About the Creator**\n\n" +
                "This project was created by **Rathidevi S**, an AI/ML Engineer from Christian College of Engineering and Technology, Oddanchatram.\n\n" +
                "**Expertise:**\n" +
                "• Machine Learning & Deep Learning\n" +
                "• Natural Language Processing\n" +
                "• Resume Analysis Systems\n" +
                "• Web Application Development\n\n" +
                "Anything else you'd like to know?"
            );
            setCurrentStep('initial');
            return;
        }

        // Meeting scheduling flow
        if (currentStep === 'initial') {
            if (lowerInput.includes('schedule') || lowerInput.includes('meeting') || lowerInput.includes('meet') || lowerInput === '1') {
                setCurrentStep('askName');
                addBotMessage("Great! I'll help you schedule a meeting. What's your name?");
            } else if (lowerInput === '2') {
                processUserInput('project');
            } else if (lowerInput === '3') {
                processUserInput('creator');
            } else {
                addBotMessage(
                    "I didn't quite understand that. Could you please choose:\n\n" +
                    "1️⃣ Schedule a meeting\n" +
                    "2️⃣ Learn about project\n" +
                    "3️⃣ Know about creator\n" +
                    "4️⃣ View Model Accuracy\n" +
                    "5️⃣ Export Metrics PDF"
                );
            }
        } else if (currentStep === 'askName') {
            setUserDetails(prev => ({ ...prev, name: input }));
            setCurrentStep('askEmail');
            addBotMessage(`Nice to meet you, ${input}! What's your email address?`);
        } else if (currentStep === 'askEmail') {
            if (validateEmail(input)) {
                setUserDetails(prev => ({ ...prev, email: input }));
                setCurrentStep('askPhone');
                addBotMessage("Got it! And your phone number?");
            } else {
                addBotMessage("That doesn't look like a valid email. Please enter a valid email address.");
            }
        } else if (currentStep === 'askPhone') {
            if (validatePhone(input)) {
                setUserDetails(prev => ({ ...prev, phone: input }));
                setCurrentStep('askTime');
                addBotMessage("Perfect! When would you prefer to meet? (e.g., 'Tomorrow 3 PM' or 'This Friday')");
            } else {
                addBotMessage("Please enter a valid phone number (10 digits).");
            }
        } else if (currentStep === 'askTime') {
            setUserDetails(prev => ({ ...prev, preferredTime: input }));
            setCurrentStep('confirm');
            scheduleMeeting({ ...userDetails, preferredTime: input });
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
        return /^\d{10}$/.test(phone.replace(/\D/g, ''));
    };

    const scheduleMeeting = async (details) => {
        try {
            const response = await fetch('/api/chatbot/schedule-meeting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details)
            });

            if (response.ok) {
                addBotMessage(
                    `✅ **Meeting Scheduled!**\n\n` +
                    `We will reach you at **${details.email}** and **${details.phone}** to confirm.\n\n` +
                    `Our career advisor will contact you soon.\n\n` +
                    `Is there anything else I can help you with?`,
                    1500
                );
            } else {
                addBotMessage("Sorry, there was an error scheduling your meeting. Please try again or contact us directly.");
            }
        } catch (error) {
            addBotMessage("Sorry, there was an error scheduling your meeting. Please try again or contact us directly.");
        }
        setCurrentStep('initial');
        setUserDetails({ name: '', email: '', phone: '', preferredTime: '' });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chatbot-container">
            {/* Floating Button */}
            {!isOpen && (
                <button className="chatbot-floating-btn" onClick={() => setIsOpen(true)} aria-label="Open chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">🤖</div>
                            <div>
                                <h4>Career Assistant</h4>
                                <span className="chatbot-status">Online</span>
                            </div>
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chatbot-message ${msg.sender}`}>
                                {msg.sender === 'bot' && <div className="message-avatar">🤖</div>}
                                <div className="message-bubble">
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chatbot-message bot">
                                <div className="message-avatar">🤖</div>
                                <div className="message-bubble typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-container">
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="chatbot-send-btn" onClick={handleSend} aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
