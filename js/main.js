/* ==========================================================================
   autoRI-studio - js/main.js
   ========================================================================== */
import { INTEGRATION_SETTINGS } from './config.js';
import { initROICalculator } from './calculator.js';
import { initSurveySystem } from './survey.js';
import { initAIChatbot } from './chatbot.js';
import { initScrollAnimations, initMouseGlow, initParticleTrail } from './animations.js';
import { saveLeadToCRM } from './crm-integration.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSurveySystem();
    initContactForm();
    initROICalculator();
    initAIChatbot();
    initScrollAnimations();
    initMouseGlow();
    initParticleTrail();
});

/* ==========================================================================
   Mobile Responsive Navigation
   ========================================================================== */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                navToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }

    // Header sticky styling on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.background = 'rgba(10, 11, 16, 0.9)';
        } else {
            header.style.padding = '0';
            header.style.background = 'rgba(10, 11, 16, 0.75)';
        }
    });
}

/* ==========================================================================
   General Contact Form Simulation
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('generalContactForm');
    const statusMsg = document.getElementById('contactFormStatus');

    if (contactForm && statusMsg) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `שולח פנייה... <i class="fa-solid fa-spinner fa-spin"></i>`;
            statusMsg.style.display = 'none';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            data.timestamp = new Date().toLocaleString('he-IL');

            // Save lead to CRM system
            saveLeadToCRM({
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.business || '',
                source: 'contact_form',
                notes: data.message || ''
            });

            // Scenario 1: n8n webhook takes priority
            if (INTEGRATION_SETTINGS.n8nContactWebhook) {
                fetch(INTEGRATION_SETTINGS.n8nContactWebhook, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(res => {
                    if (res.ok) {
                        showContactSuccess(submitBtn, originalBtnHtml, contactForm, statusMsg);
                    } else {
                        showContactError(submitBtn, originalBtnHtml, statusMsg, "שגיאה בשליחת הנתונים לשרת האוטומציה.");
                    }
                })
                .catch(err => {
                    showContactError(submitBtn, originalBtnHtml, statusMsg, "שגיאה בחיבור לשרת האוטומציה.");
                });
            }
            // Scenario 2: Web3Forms fallback (JSON payload to ensure UTF-8 encoding)
            else if (INTEGRATION_SETTINGS.web3FormsAccessKey) {
                const payload = {
                    access_key: INTEGRATION_SETTINGS.web3FormsAccessKey,
                    subject: `[צור קשר] השאירו פרטים באתר - ${data.name}`,
                    from_name: "אתר autoRI-studio",
                    "סוג הפנייה": "טופס השארת פרטים ליצירת קשר מהאתר",
                    "תאריך שליחה": data.timestamp,
                    "שם מלא": data.name,
                    "שם העסק / החברה": data.business || "לא צוין",
                    "כתובת אימייל": data.email,
                    "מספר טלפון": data.phone,
                    "תוכן ההודעה": data.message || "לא צוין"
                };
                
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
                        showContactSuccess(submitBtn, originalBtnHtml, contactForm, statusMsg);
                    } else {
                        showContactError(submitBtn, originalBtnHtml, statusMsg, resData.message || "שגיאה בשליחת המייל.");
                    }
                })
                .catch(err => {
                    showContactError(submitBtn, originalBtnHtml, statusMsg, "שגיאה בחיבור לשרת השליחה.");
                });
            }
            // Scenario 3: Local simulation fallback (if nothing is configured)
            else {
                setTimeout(() => {
                    showContactSuccess(submitBtn, originalBtnHtml, contactForm, statusMsg);
                }, 1200);
            }
        });
    }
}

function showContactSuccess(btn, originalHtml, form, statusElement) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    statusElement.className = "form-status-message success";
    statusElement.innerHTML = `<i class="fa-solid fa-check-double"></i> תודה על פנייתך! קיבלנו את הפרטים ונחזור אליך בתוך 24 שעות.`;
    statusElement.style.display = 'block';
    form.reset();
}

function showContactError(btn, originalHtml, statusElement, message) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    statusElement.className = "form-status-message error";
    statusElement.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${message}`;
    statusElement.style.display = 'block';
}
