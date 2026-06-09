/* ==========================================================================
   IR_Aoutomations - js/chatbot.js
   ========================================================================== */
import { INTEGRATION_SETTINGS } from './config.js';

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
    let userData = {
        name: 'אורח',
        company: 'לא ידוע',
        role: 'לא ידוע',
        challenge: 'לא ידוע',
        timeline: 'לא ידוע',
        qualified: false,
        wantsCall: false,
        phone: '',
        resource: '',
        email: ''
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

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        const re = /^\+?[\d\s-]{9,15}$/;
        return re.test(phone) && phone.replace(/[^\d]/g, '').length >= 9;
    }

    function submitChatbotLead(data) {
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
            const emailPayload = {
                access_key: INTEGRATION_SETTINGS.web3FormsAccessKey,
                subject: `[ליד סוכן AI] ${data.name || 'אורח'} - ${data.industry || 'אפיון מהיר'}`,
                from_name: "סוכן AI - IR_Aoutomations",
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

    function getAutomatedSolutionExplanation(industry, challenge) {
        const text = (challenge || '').toLowerCase();
        
        if (text.includes('תור') || text.includes('יומן') || text.includes('ביטול') || text.includes('קביעה')) {
            return `אנחנו יכולים לחבר את יומן התורים שלכם ישירות לוואטסאפ. המערכת תשלח תזכורות ואישורי הגעה אוטומטיים, ובמקרה של ביטול - תציע את התור שהתפנה באופן מיידי למטופלים הבאים ברשימת ההמתנה!`;
        }
        if (text.includes('נתון') || text.includes('קלדנ') || text.includes('קובץ') || text.includes('טופס') || text.includes('הזנה') || text.includes('אקסל') || text.includes('sheets')) {
            return `אנחנו מחברים את המערכות שלכם כך שכל נתון שמגיע מטופס, פייסבוק, או מייל יסווג ויוזן ישירות ל-CRM ולגיליונות העבודה באופן אוטומטי ומיידי, ללא קלדנות ידנית כלל!`;
        }
        if (text.includes('מסמך') || text.includes('חוזה') || text.includes('חתימ') || text.includes('הצהר') || text.includes('קובץ') || text.includes('איסוף')) {
            return `נוכל ליצור תהליך אוטומטי שמבקש מהלקוח את המסמכים והקבצים הדרושים בוואטסאפ או במייל, עוקב ומזכיר לו במקרה של עיכוב, ומעלה אותם ישירות לתיקייה מסודרת בענן או ב-CRM ברגע שהם מתקבלים!`;
        }
        if (text.includes('ליד') || text.includes('פולו') || text.includes('מעקב') || text.includes('שיווק') || text.includes('פייסבוק')) {
            return `נוכל לבנות עבורכם מערכת פולו-אפ אוטומטית שתזהה פניות חדשות מפייסבוק או מהאתר ותחזור אליהן בוואטסאפ או במייל תוך פחות מדקה, מה שיגדיל משמעותית את אחוזי סגירה שלכם!`;
        }
        if (text.includes('וואטסאפ') || text.includes('מענה') || text.includes('שירות') || text.includes('הודע') || text.includes('צ\'אט')) {
            return `נוכל לחבר סוכן AI חכם לוואטסאפ שלכם שיענה ללקוחות 24/7, יספק מידע רלוונטי על העסק, יפתור בעיות נפוצות ויעביר פניות מורכבות ישירות לטיפולכם!`;
        }
        
        if (industry === 'clinics' || (industry || '').includes('קליניקות')) {
            return `אנחנו יכולים לחבר את מערכת ניהול התורים וה-CRM שלכם ישירות לוואטסאפ כדי לשלוח תזכורות אוטומטיות, לאסוף הצהרות בריאות לפני הטיפול ולעשות פולו-אפ לשימור לקוחות ללא מגע יד אדם!`;
        }
        if (industry === 'lawyers' || (industry || '').includes('עורכי')) {
            return `נוכל להקים מערכת אוטומטית לאיסוף מסמכים חכמה מלקוחות, שליחת עדכונים אוטומטיים על תיקים ודיונים, והפקת הסכמים וחוזים בלחיצת כפתור היישר מה-CRM!`;
        }
        if (industry === 'realtors' || (industry || '').includes('נדל"ן')) {
            return `נחבר את מקורות הלידים שלכם (פייסבוק, יד2, הומלי) למערכת סינון אוטומטית בוואטסאפ שתסווג את הלידים לפי תקציב ואזור מגורים ותשלח להם נכסים מתאימים מיידית!`;
        }
        
        return `נוכל לבנות עבורכם תהליך אוטומטי המקשר בין פייסבוק, האתר, ה-CRM והוואטסאפ שלכם באמצעות n8n, כך שכל הפעולות התפעוליות הידניות יתבצעו מעצמן תוך שניות!`;
    }

    function getDIYActionPlan(industry, challenge) {
        const text = (challenge || '').toLowerCase();
        
        if (text.includes('תור') || text.includes('יומן') || text.includes('ביטול') || text.includes('קביעה')) {
            return `1. **שלב 1: הקמת סביבה** - פתחו חשבון חינמי ב-Make.com או n8n.cloud.\n2. **שלב 2: הגדרת טריגר** - הגדירו טריגר מסוג 'תור חדש' המקושר ל-Google Calendar או למערכת התורים שלכם.\n3. **שלב 3: שליחת ההודעה** - חברו פעולה של שליחת הודעת וואטסאפ דרך API של WhatsApp Business או Twilio עם פרטי התור.\n\n*טיפ שיווקי: שלבו גם שלב המתנה (Delay) של 24 שעות לפני התור לשליחת תזכורת אוטומטית!*`;
        }
        if (text.includes('נתון') || text.includes('קלדנ') || text.includes('קובץ') || text.includes('טופס') || text.includes('הזנה') || text.includes('אקסל') || text.includes('sheets')) {
            return `1. **שלב 1: כלי החיבור** - פתחו חשבון ב-n8n או Make.\n2. **שלב 2: הגדרת מקור** - חברו את טופס האתר (כמו Elementor Forms) או פייסבוק כטריגר לזרימת העבודה.\n3. **שלב 3: כתיבה אוטומטית** - הגדירו פעולת 'הוספת שורה' ב-Google Sheets או ב-CRM שלכם, ומפו את השדות הרלוונטיים.\n\n*בצורה זו, כל ליד חדש מתועד ומאוחסן מיידית ללא צורך בהקלדה ידנית!*`;
        }
        if (text.includes('מסמך') || text.includes('חוזה') || text.includes('חתימ') || text.includes('הצהר') || text.includes('קובץ') || text.includes('איסוף')) {
            return `1. **שלב 1: טופס מקוון** - צרו טופס מקוון חינמי ב-Tally.so או Google Forms עם שדה להעלאת קבצים.\n2. **שלב 2: תיקיית ענן** - חברו את הטופס ל-Google Drive או Dropbox באמצעות אינטגרציה ב-Make/n8n.\n3. **שלב 3: בקשה אוטומטית** - הגדירו שליחת וואטסאפ או מייל אוטומטי ללקוח עם הקישור לטופס מיד עם רישומו ב-CRM.\n\n*המערכת תרכז את כל הקבצים בתיקיות מסודרות על שם הלקוח באופן אוטומטי לחלוטין!*`;
        }
        if (text.includes('ליד') || text.includes('פולו') || text.includes('מעקב') || text.includes('שיווק') || text.includes('פייסבוק')) {
            return `1. **שלב 1: קליטת פניות** - חברו את Facebook Lead Ads ישירות ל-n8n או Zapier.\n2. **שלב 2: ניתוב חכם** - חברו שלב סינון (Filter/Router) שיבדוק את תשובות הלקוח (למשל תקציב או עניין).\n3. **שלב 3: התרעה מיידית** - נתבו את הלידים החמים ישירות לקבוצת וואטסאפ שלכם או ל-CRM, ושלחו להם הודעת פתיחה מיידית.\n\n*מענה מהיר בתוך פחות מדקה מגדיל את סיכויי הסגירה בעשרות אחוזים!*`;
        }
        if (text.includes('וואטסאפ') || text.includes('מענה') || text.includes('שירות') || text.includes('הודע') || text.includes('צ\'אט')) {
            return `1. **שלב 1: חיבור וואטסאפ** - פתחו חשבון ב-Make או n8n וחברו את ה-WhatsApp Business Cloud API שלכם.\n2. **שלב 2: שילוב AI** - שלבו מודל בינה מלאכותית של OpenAI (GPT-4o) או Google Gemini כשלב ביניים לניתוח הודעת הגולש.\n3. **שלב 3: בסיס ידע** - חברו את ה-AI לבסיס נתונים פשוט (כמו Google Sheets) המכיל תשובות נפוצות, והחזירו תשובה אוטומטית.\n\n*הלקוחות שלכם יקבלו מענה מדויק 24/7 ללא צורך בהתערבותכם!*`;
        }

        if (industry === 'clinics' || (industry || '').includes('קליניקות')) {
            return `1. **שלב 1: חיבור יומן** - חברו את Google Calendar ל-Make או n8n.\n2. **שלב 2: תזכורת אוטומטית** - הגדירו שליחת הודעת תזכורת אוטומטית בוואטסאפ 24 שעות לפני מועד הטיפול.\n3. **שלב 3: הצהרת בריאות** - שלבו קישור לשאלון הצהרת בריאות דיגיטלי בגוף ההודעה, ותעדו את התשובות בתיק המטופל.`;
        }
        if (industry === 'lawyers' || (industry || '').includes('עורכי')) {
            return `1. **שלב 1: טופס לקוח** - הגדירו טופס דיגיטלי ב-Tally לאיסוף פרטי לקוח חדש.\n2. **שלב 2: תיקיית לקוח** - חברו את הטופס באמצעות n8n ליצירת תיק לקוח אוטומטי ב-Google Drive.\n3. **שלב 3: הפקת הסכם** - חברו את המערכת למסמך תבנית ב-Google Docs המייצר הסכם שכר טרחה ראשוני אוטומטית עם פרטי הלקוח.`;
        }
        if (industry === 'realtors' || (industry || '').includes('נדל"ן')) {
            return `1. **שלב 1: קליטת נכסים** - חברו את טפסי הפייסבוק/יד2 שלכם ל-Zapier או Make.\n2. **שלב 2: סינון לידים** - סננו את הפניות לפי תקציב ומספר חדרים.\n3. **שלב 3: הפצה אוטומטית** - שלחו הודעת וואטסאפ אוטומטית עם רשימת הנכסים הרלוונטיים מתוך גיליון Google Sheets שלכם.`;
        }

        return `1. **שלב 1: כלי אינטגרציה** - בחרו כלי אינטגרציה חינמי להתחלה כמו n8n.io או Make.com.\n2. **שלב 2: הגדרת טריגר** - הגדירו את הפעולה שמפעילה את התהליך (למשל: לקוח חדש שפנה או טופס מולא).\n3. **שלב 3: הגדרת פעולה** - הגדירו מה תרצו שיקרה (למשל: יצירת כרטיס ב-CRM, שליחת הודעת וואטסאפ או עדכון טבלה).`;
    }

    function resetChat() {
        chatMessages.innerHTML = '';
        currentState = 'step1_niche';
        chatSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        userData = {
            name: '',
            company: 'לא ידוע',
            industry: '',
            challenge: '',
            timeline: 'לא ידוע',
            qualified: false,
            wantsCall: false,
            phone: '',
            resource: '',
            email: '',
            contactMethod: ''
        };
        botReply(`היי! אני סוכן ה-AI של **IR_Aoutomations** 👋 תפקידי הוא לעזור לך לחסוך המון זמן יקר ועלויות רישוי בעסק באמצעות אוטומציות חכמות.
 
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
        if (currentState === 'ai_chat') {
            sendToN8nAI(text);
            return;
        }

        if (currentState === 'step1_niche') {
            if (text.includes('אנושי') || text.includes('נציג') || text.includes('human')) {
                currentState = 'collect_name_for_human';
                botReply(`הבנתי לגמרי! נוכל לחבר אותך לנציג אנושי. מה השם שלך כדי שנציג יחזור אליך בהקדם?`);
            } else {
                userData.industry = text;
                currentState = 'step2_challenge';
                askChallengeQuestion();
            }
        } else if (currentState === 'step2_challenge') {
            userData.challenge = text;
            currentState = 'step3_offer_call';
            askOfferCall();
        } else if (currentState === 'step3_offer_call') {
            const lower = text.toLowerCase();
            if (lower.includes('כן') || lower.includes('רוצה') || lower.includes('אשמח') || lower.includes('yes') || lower.includes('שיחה') || lower.includes('תאום')) {
                currentState = 'collect_name_for_call';
                botReply(`מעולה! כדי שנוכל לחזור אליך, מה השם המלא שלך?`);
            } else if (lower.includes('וואטסאפ') || lower.includes('וסטאפ') || lower.includes('whatsapp') || lower.includes('וצאפ')) {
                userData.wantsCall = true;
                userData.contactMethod = 'whatsapp';
                currentState = 'collect_name_for_whatsapp';
                botReply(`מצוין! כדי שנשמור את הפרטים שלך ונכין את האפיון מראש, מה השם המלא שלך?`);
            } else if (lower.includes('אנושי') || lower.includes('נציג') || lower.includes('human') || lower.includes('דבר עם')) {
                currentState = 'completed';
                botReply(`אין בעיה בכלל! נשמח לעמוד לשירותך בכל עת. מספר הטלפון שלנו ליצירת קשר הוא **054-7171828** 📞\n\nתוכל גם לפנות אלינו בוואטסאפ בלחיצה על הכפתור מטה.`, [
                    { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ]);
            } else {
                currentState = 'step4_nurture';
                showNurtureDIYPlan();
            }
        } else if (currentState === 'step4_nurture') {
            const lower = text.toLowerCase();
            if (lower.includes('כן') || lower.includes('רוצה') || lower.includes('אשמח') || lower.includes('yes') || lower.includes('שיחה') || lower.includes('תאום')) {
                currentState = 'collect_name_for_call';
                botReply(`מעולה! שמח שהחלטת להתקדם. מה השם המלא שלך?`);
            } else if (lower.includes('וואטסאפ') || lower.includes('وצאפ') || lower.includes('whatsapp')) {
                userData.wantsCall = true;
                userData.contactMethod = 'whatsapp';
                currentState = 'collect_name_for_whatsapp';
                botReply(`מצוין! מה השם המלא שלך?`);
            } else if (lower.includes('אנושי') || lower.includes('נציג') || lower.includes('human') || lower.includes('מספר') || lower.includes('טלפון')) {
                currentState = 'completed';
                botReply(`אין בעיה בכלל! נשמח לעמוד לשירותך בכל עת. מספר הטלפון שלנו ליצירת קשר הוא **054-7171828** 📞\n\nתוכל גם לפנות אלינו בוואטסאפ בלחיצה על הכפתור מטה.`, [
                    { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ]);
            } else {
                currentState = 'ai_chat';
                sendToN8nAI(text);
            }
        } else if (currentState.startsWith('collect_name_for_')) {
            userData.name = text;
            const flowType = currentState.split('_')[3];
            currentState = `collect_phone_for_${flowType}`;
            botReply(`תודה, **${userData.name}**! מה מספר הטלפון שלך?`);
        } else if (currentState.startsWith('collect_phone_for_')) {
            if (!validatePhone(text)) {
                botReply(`נראה שמספר הטלפון שהזנת לא תקין. אנא הקלד מספר טלפון תקין (לדוגמה: 054-7171828):`);
            } else {
                userData.phone = text;
                const flowType = currentState.split('_')[3];
                currentState = `collect_email_for_${flowType}`;
                botReply(`תודה! ומה כתובת האימייל שלך לקבלת סיכום האפיון? (אופציונלי - הקלד או לחץ על 'דלג')`, [
                    { text: 'דלג ⏭️', value: 'skip' }
                ]);
            }
        } else if (currentState.startsWith('collect_email_for_')) {
            if (text === 'דלג' || text === 'skip' || text.includes('דלג')) {
                userData.email = 'לא צוין';
                completeLeadSubmission();
            } else if (!validateEmail(text)) {
                botReply(`נראה שכתובת האימייל לא תקינה. אנא הקלד אימייל תקין או לחץ על 'דלג':`, [
                    { text: 'דלג ⏭️', value: 'skip' }
                ]);
            } else {
                userData.email = text;
                completeLeadSubmission();
            }
        } else if (currentState === 'completed') {
            if (text.toLowerCase().includes('מחדש') || text.toLowerCase().includes('reset')) {
                resetChat();
            } else {
                resetChat();
            }
        }
    }

    function askChallengeQuestion() {
        let chips = [];
        if (userData.industry.includes('קליניקות') || userData.industry === 'clinics') {
            chips = [
                { text: 'ניהול תורים וביטולים 📅', value: 'scheduling' },
                { text: 'שאלון הצהרת בריאות 📝', value: 'intake' },
                { text: 'מעקב ופולו-אפ מטופלים 💬', value: 'followup' },
                { text: 'אחר (הקלד חופשי) ✍️', value: 'other' }
            ];
        } else if (userData.industry.includes('עורכי') || userData.industry === 'lawyers') {
            chips = [
                { text: 'איסוף מסמכים מלקוחות 📂', value: 'documents' },
                { text: 'עדכוני לקוחות ומעקב דיונים ⚖️', value: 'updates' },
                { text: 'גבייה והפקת מסמכים 💳', value: 'billing' },
                { text: 'אחר (הקלד חופשי) ✍️', value: 'other' }
            ];
        } else if (userData.industry.includes('נדל"ן') || userData.industry === 'realtors') {
            chips = [
                { text: 'סינון וסיווג לידים חכם 📞', value: 'leads' },
                { text: 'הפצת נכסים ומעקב סיורים 🏠', value: 'listings' },
                { text: 'ניהול משימות ופולו-אפ 🗓️', value: 'tasks' },
                { text: 'אחר (הקלד חופשי) ✍️', value: 'other' }
            ];
        } else {
            chips = [
                { text: 'הזנת נתונים וקלדנות 📂', value: 'data_entry' },
                { text: 'מענה אוטומטי בוואטסאפ 💬', value: 'whatsapp_support' },
                { text: 'סנכרון בין מערכות (CRM, מייל, Sheets) 🔗', value: 'sync' },
                { text: 'אחר (הקלד חופשי) ✍️', value: 'other' }
            ];
        }
        botReply(`מעולה! 🎯\n\n**מהי המשימה התפעולית הידנית שגוזלת לכם הכי הרבה זמן ועבודה כרגע?**`, chips);
    }

    function askOfferCall() {
        const solution = getAutomatedSolutionExplanation(userData.industry, userData.challenge);
        botReply(`${solution}\n\nהפתרון הזה יחסוך לכם עשרות שעות עבודה חודשיות וימנע טעויות אנוש. ⏱️\n\n**בוא נתאם שיחת אפיון מלאה של 10 דקות ללא עלות בטלפון או בווטסאפ כדי שנתאים לכם את הפתרון. מה דעתך?**`, [
            { text: 'כן, אשמח לתאם שיחה! 📞', value: 'yes' },
            { text: 'מעדיף לעבור ישר לוואטסאפ 💬', value: 'whatsapp_direct' },
            { text: 'אני רוצה לדבר עם נציג אנושי בנייד 👤', value: 'human_phone' },
            { text: 'לא כרגע, תודה 🤔', value: 'no' }
        ]);
    }

    function showNurtureDIYPlan() {
        const diyPlan = getDIYActionPlan(userData.industry, userData.challenge);
        botReply(`מבין לגמרי, אין שום לחץ! 😊\n\nכדי לעזור לכם בכל מקרה, הנה **תוכנית פעולה לעבודה עצמית (DIY Automation Blueprint)** מותאמת אישית לפתרון האתגר:\n\n${diyPlan}\n\n---\n**איך תרצו להמשיך מכאן?**`, [
            { text: 'בכל זאת, אשמח לתאם שיחת אפיון! 📞', value: 'yes' },
            { text: 'מעבר לוואטסאפ של IR 💬', value: 'whatsapp_direct' },
            { text: 'שוחח עם סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' },
            { text: 'דבר עם נציג אנושי בטלפון 👤', value: 'human_phone' }
        ]);
    }

    function completeLeadSubmission() {
        submitChatbotLead(userData);
        
        currentState = 'completed';
        
        const chips = [
            { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
            { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
        ];
        if (INTEGRATION_SETTINGS.n8nChatbotWebhook) {
            chips.splice(1, 0, { text: 'שאל את סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' });
        }
        
        let thanksMsg = `תודה רבה, **${userData.name}**! 🎉\n\nפרטייך התקבלו בהצלחה ונשלחו אלינו במייל.\n\n`;
        if (userData.contactMethod === 'whatsapp') {
            thanksMsg += `לזירוז המענה ותיאום מיידי, לחץ על הכפתור למטה כדי לעבור ישירות לשיחת וואטסאפ איתנו!`;
        } else {
            thanksMsg += `נציג מ-**IR_Aoutomations** יתקשר אליך בהקדם לתיאום שיחת האפיון.\n\nתוכל גם ליצור קשר ישירות בטלפון או בוואטסאפ: **054-7171828**!`;
        }
        
        botReply(thanksMsg, chips);
    }

    function sendToN8nAI(text) {
        addTypingIndicator();
        chatInput.disabled = true;
        if (chatOptions) chatOptions.innerHTML = '';

        const payload = {
            sessionId: chatSessionId,
            name: userData.name || 'אורח',
            company: userData.industry || 'לא ידוע',
            challenge: userData.challenge || 'לא ידוע',
            message: text
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
            
            const reply = data.reply || data.output || data.response || (typeof data === 'string' ? data : JSON.stringify(data));
            addMessage(reply, 'bot');
            
            renderChips([
                { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
            ]);
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

        if (currentState === 'step1_niche') {
            if (opt.value === 'talk_to_human') {
                currentState = 'collect_name_for_human';
                botReply(`הבנתי לגמרי! נוכל לחבר אותך לנציג אנושי. מה השם שלך כדי שנציג יחזור אליך בהקדם?`);
            } else {
                userData.industry = opt.text;
                currentState = 'step2_challenge';
                askChallengeQuestion();
            }
        } else if (currentState === 'step2_challenge') {
            userData.challenge = opt.text;
            currentState = 'step3_offer_call';
            askOfferCall();
        } else if (currentState === 'step3_offer_call') {
            if (opt.value === 'yes') {
                currentState = 'collect_name_for_call';
                botReply(`מעולה! כדי שנוכל לחזור אליך, מה השם המלא שלך?`);
            } else if (opt.value === 'whatsapp_direct') {
                userData.wantsCall = true;
                userData.contactMethod = 'whatsapp';
                currentState = 'collect_name_for_whatsapp';
                botReply(`מצוין! כדי שנשמור את הפרטים שלך ונכין את האפיון מראש, מה השם המלא שלך?`);
            } else if (opt.value === 'human_phone') {
                currentState = 'completed';
                botReply(`אין בעיה בכלל! נשמח לעמוד לשירותך בכל עת. מספר הטלפון שלנו ליצירת קשר הוא **054-7171828** 📞\n\nתוכל גם לפנות אלינו בוואטסאפ בלחיצה על הכפתור מטה.`, [
                    { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ]);
            } else if (opt.value === 'no') {
                currentState = 'step4_nurture';
                showNurtureDIYPlan();
            }
        } else if (currentState === 'step4_nurture') {
            if (opt.value === 'yes') {
                currentState = 'collect_name_for_call';
                botReply(`מעולה! שמח שהחלטת להתקדם. מה השם המלא שלך?`);
            } else if (opt.value === 'whatsapp_direct') {
                userData.wantsCall = true;
                userData.contactMethod = 'whatsapp';
                currentState = 'collect_name_for_whatsapp';
                botReply(`מצוין! מה השם המלא שלך?`);
            } else if (opt.value === 'start_ai_chat') {
                currentState = 'ai_chat';
                botReply(`מעולה! העברתי אותך כעת לסוכן ה-AI החי של **IR_Aoutomations** המופעל על ידי Gemini 🤖\n\nשאל אותי כל שאלה לגבי המערכות שלך, רעיונות לאוטומציה, או איך נוכל לייעל את העסק שלך!`);
            } else if (opt.value === 'human_phone') {
                currentState = 'completed';
                botReply(`אין בעיה בכלל! נשמח לעמוד לשירותך בכל עת. מספר הטלפון שלנו ליצירת קשר הוא **054-7171828** 📞\n\nתוכל גם לפנות אלינו בוואטסאפ בלחיצה על הכפתור מטה.`, [
                    { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ]);
            }
        } else if (currentState.startsWith('collect_email_for_')) {
            if (opt.value === 'skip') {
                userData.email = 'לא צוין';
                completeLeadSubmission();
            }
        } else if (currentState === 'completed') {
            if (opt.value === 'whatsapp') {
                const phone = "972547171828";
                let text = `שלום IR_Aoutomations, שמי ${userData.name}. `;
                if (userData.wantsCall) {
                    text += `הגשתי כעת אפיון מהיר באתר עבור עסק בתחום ${userData.industry}. האתגר התפעולי המרכזי שלי הוא: ${userData.challenge}. אשמח לתאם שיחת אפיון קצרה.`;
                } else {
                    text += `ראיתי את תוכנית הפעולה שלכם לאוטומציה של העסק שלי בתחום ${userData.industry}. אשמח לשאול מספר שאלות נוספות.`;
                }
                const encodedText = encodeURIComponent(text);
                window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
            } else if (opt.value === 'start_ai_chat') {
                currentState = 'ai_chat';
                botReply(`מעולה! העברתי אותך כעת לסוכן ה-AI החי של **IR_Aoutomations** המופעל על ידי Gemini 🤖\n\nשאל אותי כל שאלה לגבי המערכות שלך, רעיונות לאוטומציה, או איך נוכל לייעל את העסק שלך!`);
            } else if (opt.value === 'reset') {
                resetChat();
            }
        } else if (currentState === 'ai_chat') {
            if (opt.value === 'reset') {
                resetChat();
            }
        } else {
            if (opt.value === 'reset') {
                resetChat();
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
