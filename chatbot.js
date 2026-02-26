document.addEventListener("DOMContentLoaded", () => {
    const chatWidget = document.querySelector('.chat-widget');
    const openChatBtn = document.querySelector('.chat-open-btn');
    const closeChatBtn = document.querySelector('.close-chat');
    const chatLog = document.querySelector('.chat-log');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    // --- KNOWLEDGE BASE (using the DB object from database.js) ---
    const knowledgeBase = [
        // Greetings
        { keywords: ['hello', 'hi', 'vanakkam'], answer: "Vanakkam! I am Thunai. How can I help?" },
        { keywords: ['how are you', 'eppadi irukeenga'], answer: "I am ready to help with your farming questions!" },
        { keywords: ['thank you', 'nanri'], answer: "You're welcome! (Magizhchi!)" },

        // Market Prices
        { keywords: ['price', 'vilai', 'rate'], patterns: [/tomato|thakkali/i, /coimbatore|kovai/i], answer: () => `Today in the Coimbatore market, the price for high-quality tomatoes is approximately ₹${DB.marketPrices.Coimbatore.find(c => c.crop.includes('Tomato')).price} per kilo.` },
        { keywords: ['price', 'vilai', 'rate'], patterns: [/onion|vengayam/i], answer: () => `In Coimbatore, onion is ₹${DB.marketPrices.Coimbatore.find(c => c.crop.includes('Onion')).price}/kg. In Tiruppur, it is ₹${DB.marketPrices.Tiruppur.find(c => c.crop.includes('Onion')).price}/kg. Which market do you prefer?` },
        { keywords: ['price', 'vilai', 'rate'], answer: "Which crop and market are you asking about? For example: 'What is the cotton price in Tiruppur?'" },

        // Weather
        { keywords: ['weather', 'vaanilai', 'rain', 'mazhai'], answer: () => `Here is the forecast for ${DB.currentUser.location}: ${DB.getWeather(DB.currentUser.location)}` },

        // Crop Doctor
        { keywords: ['disease', 'noi', 'pest', 'poochi', 'problem'], answer: "I can help with crop problems. Please describe the issue, or for the best result, go to the 'Crop Doctor' page and upload a photo." },
        
        // Schemes
        { keywords: ['scheme', 'thittam', 'insurance', 'subsidy'], answer: () => `The government offers several schemes. The main ones are PM-KISAN for income support and PMFBY for crop insurance. You can find more details on the home dashboard.` },
        
        // NEW: Crop Planner
        { keywords: ['plan', 'thittam', 'plant', 'sow'], answer: "I can help you plan your next crop. Please go to the 'Crop Planner' page to get a detailed, personalized recommendation based on your soil and budget." },

        // Fallback
        { keywords: [], answer: "Sorry, I don't have information on that. You can try asking about market prices, weather, or crop diseases." },
    ];

    // --- CHATBOT LOGIC ---
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        const messageText = document.createElement('div');
        messageText.classList.add('message-text');
        messageText.innerHTML = text; // Use innerHTML to render weather forecast
        messageElement.appendChild(messageText);
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function findAnswer(userInput) {
        userInput = userInput.toLowerCase().trim();
        let bestMatch = { score: 0, answer: null };
        if (!userInput) return null;
        knowledgeBase.forEach(rule => {
            let currentScore = 0;
            let matchedKeywords = 0;
            rule.keywords.forEach(keyword => {
                if (userInput.includes(keyword)) {
                    currentScore++;
                    matchedKeywords++;
                }
            });
            if (rule.patterns) {
                let patternsMatched = 0;
                rule.patterns.forEach(pattern => {
                    if (pattern.test(userInput)) patternsMatched++;
                });
                if (patternsMatched === rule.patterns.length && matchedKeywords > 0) {
                    currentScore += 10 * patternsMatched;
                } else {
                    currentScore = 0;
                }
            }
            if (currentScore > bestMatch.score) {
                bestMatch = { score: currentScore, answer: rule.answer };
            }
        });
        if (bestMatch.score === 0) {
            return knowledgeBase.find(rule => rule.keywords.length === 0).answer;
        }
        if (typeof bestMatch.answer === 'function') {
            return bestMatch.answer();
        }
        return bestMatch.answer;
    }

    function handleUserInput() {
        const userInput = chatInput.value;
        if (!userInput.trim()) return;
        addMessage(userInput, 'user');
        chatInput.value = '';
        setTimeout(() => {
            const botResponse = findAnswer(userInput);
            addMessage(botResponse, 'bot');
        }, 500);
    }

    // --- EVENT LISTENERS ---
    let isFirstOpen = true;
    openChatBtn.addEventListener('click', () => {
        chatWidget.classList.toggle('active');
        if (chatWidget.classList.contains('active') && isFirstOpen) {
            addMessage("Vanakkam! I am your Thunai Assistant. Ask me anything about your farm.", 'bot');
            isFirstOpen = false;
        }
    });
    closeChatBtn.addEventListener('click', () => chatWidget.classList.remove('active'));
    sendBtn.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserInput();
    });
});

