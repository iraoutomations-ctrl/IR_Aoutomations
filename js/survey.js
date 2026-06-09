/* ==========================================================================
   IR_Aoutomations - js/survey.js
   ========================================================================== */
import { INTEGRATION_SETTINGS } from './config.js';
import { surveyConfig } from './surveyData.js';

let activeIndustry = null;
let currentStepIndex = 0;
let surveyAnswers = {};

export function initSurveySystem() {
    const industryCards = document.querySelectorAll('.industry-selector-card');
    const stepIndustrySelect = document.getElementById('stepIndustrySelect');
    const stepQuestions = document.getElementById('stepQuestions');
    const stepThankYou = document.getElementById('stepThankYou');
    const progressContainer = document.getElementById('surveyProgressContainer');
    
    const btnNext = document.getElementById('btnNextStep');
    const btnPrev = document.getElementById('btnPrevStep');
    const btnReset = document.getElementById('btnResetSurvey');
    const btnWhatsApp = document.getElementById('btnSendWhatsApp');

    // Industry card selection
    industryCards.forEach(card => {
        card.addEventListener('click', () => {
            const industry = card.getAttribute('data-industry');
            startIndustrySurvey(industry);
        });
    });

    // Navigation buttons
    if (btnNext) btnNext.addEventListener('click', handleNextStep);
    if (btnPrev) btnPrev.addEventListener('click', handlePrevStep);
    if (btnReset) btnReset.addEventListener('click', resetSurvey);
    if (btnWhatsApp) btnWhatsApp.addEventListener('click', sendWhatsAppResults);

    // Bind global helpers to window
    window.selectSurveyFromFooter = selectSurveyFromFooter;
    window.selectRatingRadio = selectRatingRadio;
}

// Function triggered by clicking a footer link to start a specific survey directly
export function selectSurveyFromFooter(industry) {
    const surveySection = document.getElementById('survey');
    if (surveySection) {
        surveySection.scrollIntoView({ behavior: 'smooth' });
    }
    
    setTimeout(() => {
        startIndustrySurvey(industry);
    }, 400);
}

function startIndustrySurvey(industry) {
    activeIndustry = industry;
    currentStepIndex = 0;
    surveyAnswers = {
        industry: industry,
        timestamp: new Date().toLocaleString('he-IL')
    };

    const stepIndustrySelect = document.getElementById('stepIndustrySelect');
    const stepQuestions = document.getElementById('stepQuestions');
    const progressContainer = document.getElementById('surveyProgressContainer');

    if (stepIndustrySelect) stepIndustrySelect.style.display = 'none';
    if (stepQuestions) stepQuestions.style.display = 'block';
    if (progressContainer) progressContainer.style.display = 'block';

    renderStepQuestions();
    updateProgressBar();
}

function renderStepQuestions() {
    const config = surveyConfig[activeIndustry];
    const stepData = config.steps[currentStepIndex];
    const container = document.getElementById('surveyQuestionsContainer');
    
    if (!container || !stepData) return;

    let html = `<h4 class="survey-group-title">${stepData.groupTitle}</h4>`;

    stepData.questions.forEach(q => {
        const value = surveyAnswers[q.id] || '';
        const requiredAsterisk = q.required ? '<span class="required-star">*</span>' : '';
        const requiredAttr = q.required ? 'data-required="true"' : '';
        const descHtml = q.desc ? `<p class="question-desc">${q.desc}</p>` : '';

        html += `<div class="question-block" data-qid="${q.id}">
            <label class="question-text" for="${q.id}">${q.label} ${requiredAsterisk}</label>
            ${descHtml}`;

        if (q.type === 'text') {
            html += `<input type="text" class="survey-input" id="${q.id}" placeholder="${q.placeholder}" value="${value}" ${requiredAttr}>`;
        } else if (q.type === 'textarea') {
            html += `<textarea class="survey-input" id="${q.id}" rows="4" placeholder="${q.placeholder}" ${requiredAttr}>${value}</textarea>`;
        } else if (q.type === 'rating') {
            html += `<div class="rating-scale-wrapper">
                <div class="rating-container">`;
            for (let i = 1; i <= 5; i++) {
                const checked = Number(value) === i ? 'checked' : '';
                const selectedClass = Number(value) === i ? 'selected' : '';
                let text = '';
                if (i === 1) text = 'לא רלוונטי';
                if (i === 3) text = 'נחמד שיהיה';
                if (i === 5) text = 'הכרחי ביותר';

                html += `
                    <label class="rating-btn-label ${selectedClass}">
                        <input type="radio" name="${q.id}" value="${i}" ${checked} onchange="selectRatingRadio('${q.id}', ${i})">
                        <span class="rating-num">${i}</span>
                        <span class="rating-text">${text}</span>
                    </label>
                `;
            }
            html += `</div>
            </div>`;
        }

        html += `</div>`;
    });

    container.innerHTML = html;

    const inputs = container.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            surveyAnswers[e.target.id] = e.target.value;
        });
    });

    const btnNext = document.getElementById('btnNextStep');
    const totalSteps = config.steps.length;
    if (btnNext) {
        if (currentStepIndex === totalSteps - 1) {
            btnNext.innerHTML = `סיום והצגת תוצאות <i class="fa-solid fa-square-check"></i>`;
        } else {
            btnNext.innerHTML = `המשך <i class="fa-solid fa-arrow-left"></i>`;
        }
    }
}

export function selectRatingRadio(questionId, value) {
    surveyAnswers[questionId] = value;
    
    const questionBlock = document.querySelector(`.question-block[data-qid="${questionId}"]`);
    if (questionBlock) {
        const labels = questionBlock.querySelectorAll('.rating-btn-label');
        labels.forEach(label => {
            const input = label.querySelector('input');
            if (input && Number(input.value) === value) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    }
}

function handleNextStep() {
    if (!validateCurrentStep()) {
        alert("אנא מלא את כל שדות החובה המסומנים בכוכבית (*)");
        return;
    }

    const config = surveyConfig[activeIndustry];
    const totalSteps = config.steps.length;

    if (currentStepIndex < totalSteps - 1) {
        currentStepIndex++;
        renderStepQuestions();
        updateProgressBar();
    } else {
        submitSurvey();
    }
}

function handlePrevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStepQuestions();
        updateProgressBar();
    } else {
        resetSurvey();
    }
}

function validateCurrentStep() {
    const config = surveyConfig[activeIndustry];
    const stepData = config.steps[currentStepIndex];
    let isValid = true;

    stepData.questions.forEach(q => {
        if (q.required) {
            const val = surveyAnswers[q.id];
            if (!val || val.trim() === '') {
                isValid = false;
                const element = document.getElementById(q.id);
                if (element) {
                    element.style.borderColor = '#ef4444';
                    element.addEventListener('focus', () => {
                        element.style.borderColor = 'var(--accent-violet)';
                    }, { once: true });
                }
            }
        }
    });

    return isValid;
}

function updateProgressBar() {
    const config = surveyConfig[activeIndustry];
    const totalSteps = config.steps.length;
    const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
    
    const progressBar = document.getElementById('surveyProgressBar');
    const stepIndicator = document.getElementById('surveyStepIndicator');

    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (stepIndicator) stepIndicator.textContent = `שלב ${currentStepIndex + 1} מתוך ${totalSteps}`;
}

function submitSurvey() {
    const stepQuestions = document.getElementById('stepQuestions');
    const stepThankYou = document.getElementById('stepThankYou');
    const progressContainer = document.getElementById('surveyProgressContainer');

    if (stepQuestions) stepQuestions.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
    if (stepThankYou) stepThankYou.style.display = 'block';

    renderAnswersSummary();
    
    if (INTEGRATION_SETTINGS.n8nSurveyWebhook) {
        fetch(INTEGRATION_SETTINGS.n8nSurveyWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(surveyAnswers)
        })
        .then(response => {
            console.log("Survey data sent to n8n successfully:", response);
        })
        .catch(err => {
            console.error("Failed to send survey data to n8n:", err);
        });
    } 
    else if (INTEGRATION_SETTINGS.web3FormsAccessKey) {
        const industryShortNames = {
            clinics: "קליניקות",
            lawyers: "עורכי דין",
            realtors: "נדלן",
            general: "כללי"
        };
        const industryTag = industryShortNames[activeIndustry] || "כללי";

        const payload = {
            access_key: INTEGRATION_SETTINGS.web3FormsAccessKey,
            subject: `[אפיון דיגיטלי - ${industryTag}] ${surveyConfig[activeIndustry].title}`,
            from_name: "מערכת אפיון IR_Aoutomations",
            "סוג הפנייה": `שאלון אפיון דיגיטלי - ${surveyConfig[activeIndustry].title.replace("שאלון אפיון", "").trim()}`,
            "תאריך מילוי": surveyAnswers.timestamp,
            "סוג תעשייה": surveyConfig[activeIndustry].title
        };
        
        const config = surveyConfig[activeIndustry];
        config.steps.forEach(step => {
            step.questions.forEach(q => {
                const val = surveyAnswers[q.id];
                if (val && val !== '') {
                    let displayVal = val;
                    if (q.type === 'rating') {
                        displayVal = `⭐ ${val} / 5`;
                    }
                    const cleanLabel = q.label.replace(/\*/g, '').trim();
                    payload[cleanLabel] = displayVal;
                }
            });
        });

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                console.log("Survey data sent to email successfully via Web3Forms JSON");
            } else {
                console.error("Failed to send survey data via Web3Forms:", resData.message);
            }
        })
        .catch(err => {
            console.error("Error sending survey data via Web3Forms:", err);
        });
    }
    else {
        console.log("Submitted Survey Answers (Simulation):", surveyAnswers);
    }
}

function renderAnswersSummary() {
    const summaryBox = document.getElementById('answersSummaryBox');
    if (!summaryBox) return;

    const config = surveyConfig[activeIndustry];
    let html = `<h4 class="summary-title">סיכום אפיון העסק שלך:</h4>`;

    config.steps.forEach(step => {
        step.questions.forEach(q => {
            const val = surveyAnswers[q.id];
            if (val && val !== '') {
                let displayVal = val;
                if (q.type === 'rating') {
                    displayVal = `${val} מתוך 5`;
                }
                html += `
                    <div class="summary-item">
                        <strong>${q.label}:</strong> <span>${displayVal}</span>
                    </div>
                `;
            }
        });
    });

    summaryBox.innerHTML = html;
}

function resetSurvey() {
    activeIndustry = null;
    currentStepIndex = 0;
    surveyAnswers = {};

    const stepIndustrySelect = document.getElementById('stepIndustrySelect');
    const stepQuestions = document.getElementById('stepQuestions');
    const stepThankYou = document.getElementById('stepThankYou');
    const progressContainer = document.getElementById('surveyProgressContainer');

    if (stepIndustrySelect) stepIndustrySelect.style.display = 'block';
    if (stepQuestions) stepQuestions.style.display = 'none';
    if (stepThankYou) stepThankYou.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';

    const industryCards = document.querySelectorAll('.industry-selector-card');
    industryCards.forEach(card => card.classList.remove('selected'));
}

function sendWhatsAppResults() {
    const phone = "972547171828";
    const config = surveyConfig[activeIndustry];
    
    let text = `שלום IR_Aoutomations, הגשתי שאלון אפיון עסק מהאתר בתאריך ${surveyAnswers.timestamp}.\n\n`;
    text += `*פרטי אפיון עבור תעשיית:* ${config.title}\n`;
    text += `-------------------------------------------\n\n`;

    config.steps.forEach(step => {
        text += `*${step.groupTitle}*\n`;
        step.questions.forEach(q => {
            const val = surveyAnswers[q.id];
            if (val && val !== '') {
                let displayVal = val;
                if (q.type === 'rating') {
                    displayVal = `⭐ ${val}/5`;
                }
                text += `• *${q.label}:* ${displayVal}\n`;
            }
        });
        text += `\n`;
    });

    text += `-------------------------------------------\n`;
    text += `אשמח לקיים שיחת ייעוץ קצרה לזיהוי הזדמנויות האוטומציה שפירטתי. תודה!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
}
