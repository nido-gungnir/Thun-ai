
const DB = {
    // --- Sample User Data (To Simulate a Logged-in Experience) ---
    currentUser: {
        name: "Adithiyan",
        location: "Pollachi, Coimbatore",
        primaryCrops: ["Cotton", "Paddy", "Coconut"],
        phone: "6374660651"
    },

    // --- AI Crop Planner Data ---
    cropData: {
        "Paddy": { season: "Kharif/Rabi", soil: ["Clay Loam", "Alluvial"], water: "High", cost: 15000, yield: 25, price: 1900, unit: "quintal" },
        "Cotton": { season: "Kharif", soil: ["Black Soil", "Red Soil"], water: "Medium", cost: 20000, yield: 10, price: 7100, unit: "quintal" },
        "Maize": { season: "Rabi", soil: ["Red Soil", "Alluvial"], water: "Medium", cost: 12000, yield: 30, price: 2100, unit: "quintal" },
        "Sugarcane": { season: "All", soil: ["Clay Loam", "Black Soil"], water: "High", cost: 40000, yield: 400, price: 315, unit: "quintal" },
        "Turmeric": { season: "Kharif", soil: ["Red Soil", "Clay Loam"], water: "Medium", cost: 25000, yield: 20, price: 8500, unit: "quintal" },
        "Onion": { season: "Rabi", soil: ["Alluvial", "Red Soil"], water: "Low", cost: 18000, yield: 100, price: 3000, unit: "quintal" }
    },

    // --- Market Price Data ---
    marketPrices: {
        "Coimbatore": [
            { crop: "Tomato (தக்காளி)", quality: "High", price: 28, unit: "kg" },
            { crop: "Onion (வெங்காயம்)", quality: "High", price: 32, unit: "kg" },
            { crop: "Coconut (தேங்காய்)", quality: "Medium", price: 15, unit: "piece" },
            { crop: "Cotton (பருத்தி)", quality: "Long-staple", price: 7100, unit: "quintal" }
        ],
        "Erode": [
            { crop: "Turmeric (மஞ்சள்)", quality: "High", price: 8500, unit: "quintal" },
            { crop: "Paddy (நெல்)", quality: "Ponni", price: 4600, unit: "quintal" },
            { crop: "Sugarcane (கரும்பு)", quality: "Medium", price: 320, unit: "quintal" }
        ],
        "Tiruppur": [
            { crop: "Cotton (பருத்தி)", quality: "Long-staple", price: 7250, unit: "quintal" },
            { crop: "Maize (மக்காச்சோளம்)", quality: "High", price: 2100, unit: "quintal" },
            { crop: "Onion (வெங்காயம்)", quality: "Medium", price: 28, unit: "kg" }
        ]
    },
 farmAccounts: {
        transactions: [
            { id: 1, type: 'Expense', category: 'Fertilizer', amount: 2500, date: '2025-09-15', description: 'Urea for cotton field' },
            { id: 2, type: 'Expense', category: 'Labour', amount: 5000, date: '2025-09-18', description: 'Weeding for paddy' },
            { id: 3, type: 'Income', category: 'Sales', amount: 12000, date: '2025-09-22', description: 'Sold 500 coconuts' },
            { id: 4, type: 'Expense', category: 'Seeds', amount: 1800, date: '2025-09-05', description: 'Paddy seeds for next season' },
        ]
    },
    
    // --- Crop Disease & Pest Information (with Keywords) ---
    cropProblems: {
        "Cotton": [
            {
                id: "cot01",
                name: "Bollworm (காய்ப்புழு)",
                type: "Pest",
                keywords: ['worm', 'hole', 'pulu', 'larva'],
                symptoms: "Holes in bolls, damaged squares and flowers, presence of larvae.",
                imageUrl: "bollworm.webp",
                organicSolution: "Spray a solution of Neem oil (3%). Encourage natural predators like birds.",
                chemicalSolution: "Use recommended pesticides like Emamectin Benzoate 5% SG. Always follow dosage instructions."
            },
            {
                id: "cot02",
                name: "Whitefly (வெள்ளை ஈ)",
                type: "Pest",
                keywords: ['white', 'fly', 'ee'],
                symptoms: "Yellowing of leaves, sticky 'honeydew' on leaves, presence of small white flies.",
                imageUrl: "whitefly.jpg",
                organicSolution: "Install yellow sticky traps. Spray soapy water or horticultural oils.",
                chemicalSolution: "Use insecticides containing Acetamiprid or Imidacloprid."
            }
        ],
        "Paddy": [
            {
                id: "pad01",
                name: "Rice Blast (குலை நோய்)",
                type: "Disease",
                keywords: ['blast', 'spot', 'pulli', 'lesion'],
                symptoms: "Spindle-shaped spots on leaves with gray centers and brown borders.",
                imageUrl: "riceblast.jpg",
                organicSolution: "Use disease-resistant varieties. Ensure balanced use of nitrogen fertilizer.",
                chemicalSolution: "Spray fungicides like Tricyclazole at the first sign of symptoms."
            }
        ],
        "Coconut": [
            {
                id: "coc01",
                name: "Eriophyid Mite (எரியோபிட் சிலந்தி)",
                type: "Pest",
                keywords: ['mite', 'silanthi', 'deformed'],
                symptoms: "Triangular patches on the husk, stunted and deformed nuts, reduced nut size.",
                imageUrl: "eriophyte.jpg",
                organicSolution: "Apply a Neem oil and garlic emulsion to the affected nuts.",
                chemicalSolution: "Root feeding of Tebuconazole is recommended for severe infestations."
            }
        ]
    },


    // --- Weather Forecast Simulation ---
    getWeather: function(location) {
        // This function simulates a weather forecast.
        const today = new Date();
        const forecast = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            forecast.push({ day: date.toLocaleDateString('en-IN', { weekday: 'long' }), temp: 28 + Math.floor(Math.random() * 5), condition: Math.random() > 0.6 ? "Light Rain 🌧️" : "Partly Cloudy ⛅", rainChance: Math.random() > 0.6 ? Math.floor(Math.random() * 40 + 50) : Math.floor(Math.random() * 30) });
        }
        return `<h4>5-Day Forecast for ${location}</h4>` + forecast.map(day => `
            <div class="weather-day">
                <strong>${day.day}</strong>
                <span>${day.temp}°C, ${day.condition}</span>
                <span>Rain: ${day.rainChance}%</span>
            </div>
        `).join('');
    },

    // --- Government Schemes ---
    govtSchemes: [
        { name: "PM-KISAN", description: "Provides income support of ₹6,000 per year to all farmer families.", link: "#" },
        { name: "PM Fasal Bima Yojana (Crop Insurance)", description: "Provides insurance coverage and financial support to farmers in the event of failure of any of the notified crops.", link: "#" },
        { name: "Soil Health Card Scheme", description: "A scheme to help farmers get their soil tested and receive a card with nutrient information.", link: "#" }
    ],

    // --- Knowledge Center Videos ---
    knowledgeCenter: [
        { title: "How to Prepare Panchagavya (பஞ்சகவ்யா தயாரிப்பது எப்படி)", videoId: "https://youtu.be/cpgWGgNVhvo?si=Ruz7thNKAfu3L7ES" },
        { title: "Introduction to Drip Irrigation (சொட்டு நீர் பாசனம்)", videoId: "https://youtu.be/0VnhuWbD8uI?si=I0DqR8tTZQAk9Lob" },
        { title: "Effective Pest Control with Neem Oil (வேப்பெண்ணெய் பயன்பாடு)", videoId: "dQw4w9WgXcQ" }
    ]
};

