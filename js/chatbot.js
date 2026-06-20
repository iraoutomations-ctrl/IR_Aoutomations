/* ==========================================================================
   autoRI-studio - js/chatbot.js
   ========================================================================== */
import { INTEGRATION_SETTINGS } from './config.js';
import { saveLeadToCRM } from './crm-integration.js';

export function initAIChatbot() {
    const chatToggle = document.getElementById('aiChatToggle');
    const chatWindow = document.getElementById('aiChatWindow');
    const chatClose = document.getElementById('aiChatClose');
    const chatMessages = document.getElementById('aiChatMessages');
    const chatOptions = document.getElementById('aiChatOptions');
    const chatForm = document.getElementById('aiChatInputForm');
    const chatInput = document.getElementById('aiChatInputField');
    const badge = chatToggle ? chatToggle.querySelector('.toggle-badge') : null;

    if (!chatToggle || !chatWindow || !chatMessages || !chatForm) return;

    let currentState = 'ai_chat';
    let chatSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    let chatHistory = [];
    let userData = {
        name: 'אורח',
        company: 'לא ידוע',
        industry: 'לא ידוע',
        challenge: 'לא ידוע',
        wantsCall: false,
        phone: '',
        email: '',
        contactMethod: ''
    };

    function formatMessageText(text) {
        let formatted = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    function addMessage(text, sender = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = formatMessageText(text);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatHistory.push({
            role: sender === 'bot' ? 'model' : 'user',
            parts: [
                { text: text }
            ]
        });
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chat-msg bot typing-indicator';
        indicator.id = 'chatTypingIndicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('chatTypingIndicator');
        if (indicator) indicator.remove();
    }

    function renderChips(options) {
        chatOptions.innerHTML = '';
        if (!options || options.length === 0) return;

        options.forEach(opt => {
            const chip = document.createElement('div');
            chip.className = 'chat-chip';
            chip.textContent = opt.text;
            chip.addEventListener('click', () => handleOptionClick(opt));
            chatOptions.appendChild(chip);
        });
    }

    function botReply(text, chips = [], delay = 1000) {
        addTypingIndicator();
        chatInput.disabled = true;
        if (chatOptions) chatOptions.innerHTML = '';
        
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(text, 'bot');
            renderChips(chips);
            chatInput.disabled = false;
            chatInput.focus();
        }, delay);
    }

    function submitChatbotLead(data) {
        // Save lead to CRM system
        saveLeadToCRM({
            name: data.name || "אורח בצ'אט",
            email: data.email && data.email !== 'לא צוין' ? data.email : '',
            phone: data.phone && data.phone !== 'לא צוין' ? data.phone : '',
            company: data.company && data.company !== 'לא ידוע' ? data.company : '',
            source: 'chatbot',
            chatbot_session: {
                industry: data.industry || 'לא צוין',
                challenge: data.challenge || 'לא צוין',
                contact_pref: data.contactMethod || 'whatsapp'
            }
        });

        const payload = {
            "שם מלא": data.name || "אורח",
            "תחום העסק": data.industry || "לא צוין",
            "אתגר תפעולי / צוואר בקבוק": data.challenge || "לא צוין",
            "מסלול פנייה": data.wantsCall ? (data.contactMethod === 'whatsapp' ? "מעבר לוואטסאפ 💬" : "תיאום שיחת אפיון 📞") : "תוכנית עבודה עצמית (DIY) 🛠️",
            "מספר טלפון": data.phone || "לא צוין",
            "כתובת אימייל": data.email || "לא צוין",
            "תאריך פנייה": new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
        };

        if (INTEGRATION_SETTINGS.web3FormsAccessKey) {
            let industryTag = "כללי";
            const ind = (data.industry || "").toLowerCase();
            if (ind.includes("נדלן") || ind.includes("נדל\"ן") || ind.includes("תיווך") || ind.includes("מתווך") || ind.includes("🏠")) {
                industryTag = "נדלן";
            } else if (ind.includes("עורך") || ind.includes("דין") || ind.includes("משפט") || ind.includes("⚖️")) {
                industryTag = "עורכי דין";
            } else if (ind.includes("קליניק") || ind.includes("מטפל") || ind.includes("רופא") || ind.includes("🩺")) {
                industryTag = "קליניקות";
            }

            const emailPayload = {
                access_key: INTEGRATION_SETTINGS.web3FormsAccessKey,
                subject: `[אפיון דיגיטלי - ${industryTag}] (סוכן AI) ${data.name || 'אורח'} - ${data.industry || 'אפיון מהיר'}`,
                from_name: "סוכן AI - autoRI-studio",
                "סוג הפנייה": "ליד מוסמך מסוכן ה-AI בצ'אט",
                ...payload
            };

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(emailPayload)
            })
            .then(res => res.json())
            .then(resData => {
                if (resData.success) {
                    console.log("Chatbot lead sent successfully via Web3Forms JSON");
                } else {
                    console.error("Failed to send chatbot lead via Web3Forms:", resData.message);
                }
            })
            .catch(err => {
                console.error("Error sending chatbot lead via Web3Forms:", err);
            });
        }

        if (INTEGRATION_SETTINGS.n8nSurveyWebhook) {
            fetch(INTEGRATION_SETTINGS.n8nSurveyWebhook, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                console.log("Chatbot lead sent to n8n Survey successfully:", response);
            })
            .catch(err => {
                console.error("Failed to send chatbot lead to n8n Survey:", err);
            });
        }
        else {
            console.log("Chatbot Lead (Simulation - no integration key):", payload);
        }
    }

    function parseRobustJSON(text) {
        if (typeof text !== 'string') return null;
        try {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
                const jsonString = text.substring(start, end + 1);
                return JSON.parse(jsonString);
            }
            // Check if it looks like a JSON array or simple primitive before parsing
            const trimmed = text.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('"') || trimmed === 'true' || trimmed === 'false' || trimmed === 'null' || (trimmed !== '' && !isNaN(Number(trimmed)))) {
                return JSON.parse(trimmed);
            }
            return null;
        } catch (e) {
            console.warn("Robust JSON parse failed:", e, text);
            return null;
        }
    }

    function parseResilientResponse(data) {
        // 1. If data itself is a string (e.g., from n8n response text)
        if (typeof data === 'string') {
            const parsed = parseRobustJSON(data);
            if (parsed) return parsed;
            return { reply: data, chips: [], lead_collected: false, lead_data: null };
        }
        
        // 2. If data is an object
        if (data && typeof data === 'object') {
            // Check if there's a primary text property containing stringified JSON
            const rawText = data.reply || data.output || data.response;
            if (typeof rawText === 'string') {
                const parsed = parseRobustJSON(rawText);
                if (parsed) {
                    return {
                        reply: parsed.reply || rawText,
                        chips: parsed.chips || data.chips || [],
                        lead_collected: parsed.lead_collected !== undefined ? parsed.lead_collected : (data.lead_collected || false),
                        lead_data: parsed.lead_data || data.lead_data || null
                    };
                }
                // It was just a plain text reply inside the object
                return {
                    reply: rawText,
                    chips: data.chips || [],
                    lead_collected: data.lead_collected || false,
                    lead_data: data.lead_data || null
                };
            }
            
            // Otherwise, read fields directly from the object
            return {
                reply: data.reply || JSON.stringify(data),
                chips: data.chips || [],
                lead_collected: data.lead_collected || false,
                lead_data: data.lead_data || null
            };
        }
        
        return { reply: "אירעה שגיאה בעיבוד תשובת השרת.", chips: [], lead_collected: false, lead_data: null };
    }

    function resetChat() {
        chatMessages.innerHTML = '';
        currentState = 'ai_chat';
        chatSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        userData = {
            name: '',
            company: 'לא ידוע',
            industry: 'לא ידוע',
            challenge: 'לא ידוע',
            wantsCall: false,
            phone: '',
            email: '',
            contactMethod: ''
        };
        chatHistory = [];
        botReply(`היי! אני סוכן ה-AI של **autoRI-studio** 👋 תפקידי הוא לעזור לך לחסוך המון זמן יקר ועלויות רישוי בעסק באמצעות אוטומציות חכמות.
 
בוא נתחיל באפיון קצר ומהיר של העסק שלך. 🚀
 
**באיזה תחום העסק שלך עוסק?**`, [
            { text: 'קליניקות ומטפלים 🩺', value: 'clinics' },
            { text: 'עורכי דין ומשרדי משפט ⚖️', value: 'lawyers' },
            { text: 'מתווכי נדל"ן 🏠', value: 'realtors' },
            { text: 'תחום אחר / עסק כללי 💼', value: 'general' },
            { text: 'שוחח ישירות עם נציג אנושי 👤', value: 'talk_to_human' }
        ]);
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text === '') return;

        chatInput.value = '';
        addMessage(text, 'user');

        handleUserInputText(text);
    });

    function handleUserInputText(text) {
        if (currentState === 'completed') {
            resetChat();
            return;
        }
        sendToN8nAI(text);
    }

    function sendToN8nAI(text) {
        addTypingIndicator();
        chatInput.disabled = true;
        if (chatOptions) chatOptions.innerHTML = '';

        const payload = {
            sessionId: chatSessionId,
            message: text,
            history: chatHistory,
            chatHistory: chatHistory
        };

        fetch(INTEGRATION_SETTINGS.n8nChatbotWebhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.json();
        })
        .then(data => {
            removeTypingIndicator();
            chatInput.disabled = false;
            
            const result = parseResilientResponse(data);
            
            // Handle lead collected signal
            if (result.lead_collected && result.lead_data) {
                // Populate lead info from agent response
                userData = {
                    name: result.lead_data.name || 'אורח',
                    industry: result.lead_data.industry || 'לא צוין',
                    challenge: result.lead_data.challenge || 'לא צוין',
                    phone: result.lead_data.phone || '',
                    email: result.lead_data.email || 'לא צוין',
                    wantsCall: true,
                    contactMethod: result.lead_data.phone ? 'phone' : 'whatsapp'
                };
                
                // Fire existing lead submission webhook/form
                submitChatbotLead(userData);
                
                currentState = 'completed';
                addMessage(result.reply || 'תודה רבה! פרטייך התקבלו ונשלחו בהצלחה.', 'bot');
                
                renderChips([
                    { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ]);
            } else {
                addMessage(result.reply, 'bot');
                
                const chips = result.chips && result.chips.length > 0 ? result.chips : [
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ];
                renderChips(chips);
            }
            
            chatInput.focus();
        })
        .catch(err => {
            removeTypingIndicator();
            chatInput.disabled = false;
            console.error("Error communicating with n8n AI Chatbot:", err);
            addMessage(`אני מצטער, אירעה שגיאה בתקשורת עם סוכן ה-AI. אנא נסה שוב.`, 'bot');
            renderChips([
                { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
            ]);
            chatInput.focus();
        });
    }

    function handleOptionClick(opt) {
        addMessage(opt.text, 'user');

        if (opt.value === 'reset') {
            resetChat();
        } else if (opt.value === 'whatsapp') {
            const phone = "972547171828";
            let text = `שלום autoRI-studio, שמי ${userData.name || 'אורח'}. `;
            if (userData.phone) {
                text += `הגשתי כעת אפיון מהיר באתר עבור עסק בתחום ${userData.industry || 'לא צוין'}. האתגר התפעולי המרכזי שלי הוא: ${userData.challenge || 'לא צוין'}. אשמח לתאם שיחת אפיון קצרה.`;
            } else {
                text += `ראיתי את תוכנית הפעולה שלכם לאוטומציה של העסק שלי בתחום ${userData.industry || 'לא צוין'}. אשמח לשאול מספר שאלות נוספות.`;
            }
            const encodedText = encodeURIComponent(text);
            window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
        } else {
            if (currentState === 'completed') {
                resetChat();
            } else {
                // For all other dynamic options, send the option text to the n8n AI agent
                sendToN8nAI(opt.text);
            }
        }
    }

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (badge) {
            badge.style.display = 'none';
        }
        
        if (chatMessages.children.length === 0) {
            resetChat();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });
}
