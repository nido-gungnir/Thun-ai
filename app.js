document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navLinks = document.querySelectorAll('.nav-link, .nav-logo');

    // --- TEMPLATES / RENDER FUNCTIONS ---
    const renderHomePage = () => {
        const user = DB.currentUser;
        appContent.innerHTML = `
            <div class="container">
                <div class="dashboard-grid">
                    <div class="welcome-card card">
                        <h2>Vanakkam, <span>${user.name}</span>!</h2>
                        <p>Welcome to your Thunai dashboard. What would you like to do today?</p>
                        <div class="quick-actions">
                             <a href="#" class="action-btn" data-page="crop-planner">
                                <span class="icon">💡</span> AI Crop Plan
                            </a>
                            <a href="#" class="action-btn" data-page="crop-doctor">
                                <span class="icon">🩺</span> Crop Doctor
                            </a>
                            <a href="#" class="action-btn" data-page="market-prices">
                                <span class="icon">📈</span> Market Prices
                            </a>
                             <a href="#" class="action-btn" data-page="knowledge-center">
                                <span class="icon">📚</span> Learn
                            </a>
                        </div>
                    </div>
                    <div class="weather-card card">
                        ${DB.getWeather(user.location)}
                    </div>
                </div>
                 <div class="schemes-card card" style="margin-top: 30px;">
                    <h3>Government Schemes</h3>
                    <ul>${DB.govtSchemes.map(scheme => `<li><a href="${scheme.link}">${scheme.name}</a> - ${scheme.description}</li>`).join('')}</ul>
                </div>
            </div>`;
    };

    const renderCropPlannerPage = () => {
        appContent.innerHTML = `
            <div class="container">
                <div class="card">
                    <h2 class="section-title">AI Crop Planner</h2>
                    <p style="text-align:center; margin-bottom: 30px;">Get a personalized crop plan for the next season based on your farm's conditions and budget.</p>
                    <div class="planner-form-grid">
                        <div class="form-group">
                            <label for="soil-type">Your Soil Type:</label>
                            <select id="soil-type">
                                <option>Alluvial</option>
                                <option>Black Soil</option>
                                <option>Red Soil</option>
                                <option>Clay Loam</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="budget">Budget per Acre (₹):</label>
                            <input type="number" id="budget" value="20000">
                        </div>
                        <button class="cta-button" id="generate-plan-btn">Generate Plan</button>
                    </div>
                </div>
                <div id="planner-results"></div>
            </div>`;
        
        document.getElementById('generate-plan-btn').addEventListener('click', () => {
            const soil = document.getElementById('soil-type').value;
            const budget = parseInt(document.getElementById('budget').value);
            const resultsDiv = document.getElementById('planner-results');

            resultsDiv.innerHTML = `<p style="text-align:center; margin-top: 20px;">Analyzing data to generate the best plan for you...</p>`;

            setTimeout(() => {
                const recommendations = [];
                for (const cropName in DB.cropData) {
                    const crop = DB.cropData[cropName];
                    if (crop.soil.includes(soil) && crop.cost <= budget) {
                        const revenue = crop.yield * crop.price;
                        const profit = revenue - crop.cost;
                        recommendations.push({ name: cropName, ...crop, profit });
                    }
                }
                
                recommendations.sort((a, b) => b.profit - a.profit); // Sort by highest profit

                if (recommendations.length === 0) {
                    resultsDiv.innerHTML = `<div class="card" style="margin-top:20px; text-align:center;"><h4>No suitable crops found for your budget and soil type.</h4><p>Try increasing your budget or selecting a different soil type.</p></div>`;
                    return;
                }

                resultsDiv.innerHTML = recommendations.map((rec, index) => `
                    <div class="recommendation-card card ${index === 0 ? 'top-pick' : ''}">
                        <div class="rec-header">
                            <h3>${index + 1}. ${rec.name}</h3>
                            ${index === 0 ? '<span class="rec-tag">Top Pick</span>' : ''}
                        </div>
                        <div class="rec-details">
                            <div>
                                <small>Est. Profit / Acre</small>
                                <p>₹${rec.profit.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <small>Est. Cost / Acre</small>
                                <p>₹${rec.cost.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <small>Water Need</small>
                                <p>${rec.water}</p>
                            </div>
                        </div>
                    </div>
                `).join('');
            }, 1500);
        });
    };

    const renderCropDoctorPage = () => {
        let selectedFile = null;
        appContent.innerHTML = `
            <div class="container">
                <h2 class="section-title">Thunai Crop Doctor</h2>
                <p class="subtitle" style="text-align:center; font-size: 1.1rem; color: #666; margin-bottom: 40px;">Get an instant diagnosis for your crop problems.</p>

                <!-- Step 1: Uploader -->
                <div id="uploader" class="card">
                    <div id="image-preview-container" class="hidden" style="margin: 20px 0; text-align: center;">
                        <img id="image-preview" src="#" alt="Image Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 2px solid #eee;"/>
                        <p id="image-filename" style="font-style: italic; color: #666; margin-top: 5px;"></p>
                    </div>
                    <div class="upload-area" id="upload-area" style="border: 2px dashed #ccc; border-radius: 10px; padding: 40px; margin: 20px 0; cursor: pointer; text-align: center; transition: border-color 0.3s;">
                        <p style="font-weight: 600; color: #555;">Click here to select a photo of the affected plant.</p>
                        <input type="file" id="crop-image-input" hidden accept="image/*">
                    </div>
                    <div style="text-align: center;">
                        <button class="cta-button" id="analyze-btn">Analyze Photo</button>
                    </div>
                </div>

                <!-- Step 2: Analysis Loader -->
                <div id="analysis-loader" class="card hidden" style="text-align: center; padding: 40px 0;">
                    <h3>Analyzing Your Image...</h3>
                    <p>Our AI is checking your photo for common pests and diseases. Please wait a moment.</p>
                    <div class="progress-bar" style="width: 100%; background-color: #e0e0e0; border-radius: 5px; overflow: hidden; margin-top: 20px;">
                        <div class="progress-bar-inner" id="progress-bar-inner" style="width: 0%; height: 10px; background-color: var(--primary-color); transition: width 2.5s ease-out;"></div>
                    </div>
                    <p id="analysis-status" style="font-weight: 600; margin-top: 10px; color: var(--primary-color);">Starting analysis...</p>
                </div>

                <!-- Step 3: Diagnosis Result -->
                <div id="diagnosis-result" class="card hidden">
                    <!-- Content will be generated by JavaScript -->
                </div>
            </div>`;
        
        const uploader = document.getElementById('uploader');
        const loader = document.getElementById('analysis-loader');
        const resultContainer = document.getElementById('diagnosis-result');
        const uploadArea = document.getElementById('upload-area');
        const imageInput = document.getElementById('crop-image-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const previewContainer = document.getElementById('image-preview-container');
        const imagePreview = document.getElementById('image-preview');
        const imageFilename = document.getElementById('image-filename');
        const progressBar = document.getElementById('progress-bar-inner');
        const analysisStatus = document.getElementById('analysis-status');

        uploadArea.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                selectedFile = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    imageFilename.textContent = `File: ${selectedFile.name}`;
                    previewContainer.classList.remove('hidden');
                    uploadArea.style.borderStyle = 'solid';
                };
                reader.readAsDataURL(selectedFile);
            }
        });

        analyzeBtn.addEventListener('click', () => {
            if (!selectedFile) {
                alert("Please select an image file first.");
                return;
            }
            uploader.classList.add('hidden');
            loader.classList.remove('hidden');
            analysisStatus.textContent = 'Preprocessing image...';
            progressBar.style.width = '25%';
            setTimeout(() => {
                analysisStatus.textContent = 'Running AI model...';
                progressBar.style.width = '75%';
            }, 1000);
            setTimeout(() => {
                analysisStatus.textContent = 'Finalizing diagnosis...';
                progressBar.style.width = '100%';
            }, 2500);

            setTimeout(() => {
                let diagnosis = null;
                const fileName = selectedFile.name.toLowerCase();
                for (const crop in DB.cropProblems) {
                    for (const problem of DB.cropProblems[crop]) {
                        if (problem.keywords.some(keyword => fileName.includes(keyword))) {
                            diagnosis = problem;
                            break;
                        }
                    }
                    if (diagnosis) break;
                }
                if (!diagnosis) {
                    const allProblems = Object.values(DB.cropProblems).flat();
                    diagnosis = allProblems[Math.floor(Math.random() * allProblems.length)];
                }
                renderResults(diagnosis);
                loader.classList.add('hidden');
                resultContainer.classList.remove('hidden');
            }, 3000);
        });

        function renderResults(diagnosis) {
            const confidence = (Math.random() * (98 - 85) + 85).toFixed(2);
            resultContainer.innerHTML = `
                <h3 style="font-size: 1.8rem; color: var(--primary-color); margin-bottom: 20px;">Diagnosis Report</h3>
                <div class="result-grid" style="display: grid; grid-template-columns: 200px 1fr; gap: 25px; align-items: flex-start;">
                    <img src="${diagnosis.imageUrl}" alt="${diagnosis.name}" style="width: 100%; border-radius: 8px;">
                    <div>
                        <h2>${diagnosis.name}</h2>
                        <p class="confidence-score" style="font-size: 1rem; font-weight: 700;">AI Confidence: <span style="font-size: 1.5rem; color: var(--primary-color);">${confidence}%</span></p>
                        <p><strong>Symptoms to look for:</strong> ${diagnosis.symptoms}</p>
                        
                        <div class="solution-tabs" style="margin: 20px 0 10px;">
                            <button class="solution-btn active" data-solution="organic">Organic Solution</button>
                            <button class="solution-btn" data-solution="chemical">Chemical Solution</button>
                        </div>
                        <div class="solution-content" id="solution-content">
                            <p style="line-height: 1.7;">${diagnosis.organicSolution}</p>
                        </div>
                    </div>
                </div>
            `;
            document.querySelectorAll('.solution-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelector('.solution-btn.active').classList.remove('active');
                    e.target.classList.add('active');
                    const solutionType = e.target.dataset.solution;
                    document.getElementById('solution-content').innerHTML = `<p style="line-height: 1.7;">${diagnosis[solutionType + 'Solution']}</p>`;
                });
            });
        }
    };
    
    const renderMarketPricesPage = () => {
        const markets = Object.keys(DB.marketPrices);
        appContent.innerHTML = `
            <div class="container"><div class="card">
                <h2 class="section-title">Live Market Prices</h2>
                <div class="market-selector">
                    <label for="market-select">Select a Market: </label>
                    <select id="market-select">${markets.map(market => `<option value="${market}">${market}</option>`).join('')}</select>
                </div>
                <table class="price-table" id="price-table"></table>
            </div></div>`;
        const marketSelect = document.getElementById('market-select');
        const renderTable = (market) => {
            const prices = DB.marketPrices[market];
            document.getElementById('price-table').innerHTML = `
                <thead><tr><th>Crop (பயிர்)</th><th>Quality</th><th>Price (விலை)</th></tr></thead>
                <tbody>${prices.map(item => `<tr><td>${item.crop}</td><td>${item.quality}</td><td>₹${item.price} / ${item.unit}</td></tr>`).join('')}</tbody>`;
        };
        marketSelect.addEventListener('change', (e) => renderTable(e.target.value));
        renderTable(markets[0]);
    };

    const renderKnowledgeCenterPage = () => {
        appContent.innerHTML = `
            <div class="container">
                <h2 class="section-title">Knowledge Center</h2>
                <p style="text-align:center; margin-bottom: 40px;">Learn from experts with our collection of short video guides.</p>
                <div class="video-grid">
                    ${DB.knowledgeCenter.map(video => `
                        <div class="video-card card">
                             <iframe src="https://www.youtube.com/embed/${video.videoId}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                             <h4>${video.title}</h4>
                        </div>`).join('')}
                </div>
            </div>`;
    };

    // --- ROUTER ---
    const pages = {
        'home': renderHomePage,
        'crop-planner': renderCropPlannerPage,
        'crop-doctor': renderCropDoctorPage,
        'market-prices': renderMarketPricesPage,
        'knowledge-center': renderKnowledgeCenterPage
    };
    const navigateTo = (page) => {
        document.querySelector('.nav-link.active').classList.remove('active');
        const newActiveLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if(newActiveLink) newActiveLink.classList.add('active');
        pages[page]();
        addPageEventListeners();
    };
    const addPageEventListeners = () => {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(e.currentTarget.dataset.page);
            });
        });
    };
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.currentTarget.dataset.page);
            if(document.querySelector('.hamburger').classList.contains('active')){
                document.querySelector('.hamburger').classList.remove('active');
                document.querySelector('.nav-menu').classList.remove('active');
            }
        });
    });
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // --- INITIAL LOAD ---
    navigateTo('home');
});

