/* ==========================================================================
   IR_Aoutomations Landing Page - Script.js
   ========================================================================== */

/* ==========================================================================
   Automation & Integration Settings (n8n & Web3Forms)
   ========================================================================== */
const INTEGRATION_SETTINGS = {
    // 1. n8n Integration Webhook URLs:
    // If you have n8n running, paste your active webhook URLs here.
    // The landing page will automatically POST the data to n8n in JSON format.
    n8nContactWebhook: "", // e.g. "https://n8n.yourdomain.com/webhook/contact"
    n8nSurveyWebhook: "",  // e.g. "https://n8n.yourdomain.com/webhook/survey"
    n8nChatbotWebhook: "http://localhost:5678/webhook-test/chatbot", // e.g. "https://n8n.yourdomain.com/webhook/chatbot"

    // 2. Free Email Fallback (Web3Forms):
    // If you don't use n8n for email yet, you can get a free access key from https://web3forms.com/
    // It will send contact form submissions directly to iraoutomations@gmail.com for free (up to 10,000/mo).
    web3FormsAccessKey: "70df35d4-7450-40db-a1f2-240b7d0da6eb" // e.g. "12345678-abcd-1234-abcd-1234567890ab"
};

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
   Questionnaires Data Configuration
   ========================================================================== */
const surveyConfig = {
    clinics: {
        title: "שאלון אפיון קליניקות ומטפלים",
        colorClass: "clinics-color",
        steps: [
            {
                groupTitle: "חלק 1: רקע כללי ומערכות בעסק",
                questions: [
                    {
                        id: "clinic_name",
                        type: "text",
                        label: "שם הקליניקה / המטפל",
                        placeholder: "לדוגמה: קליניקת אור בראשית",
                        required: true
                    },
                    {
                        id: "specialty",
                        type: "text",
                        label: "תחום ההתמחות וסוג הטיפולים",
                        placeholder: "לדוגמה: פסיכותרפיה, רפואה משלימה, קוסמטיקה רפואית",
                        desc: "מהו תחום ההתמחות העיקרי של הקליניקה שלכם?",
                        required: true
                    },
                    {
                        id: "leads",
                        type: "text",
                        label: "פלטפורמות קבלת לקוחות ולידים",
                        placeholder: "לדוגמה: אינסטגרם, פייסבוק, מפה לאוזן, אתר אינטרנט",
                        desc: "כיצד מטופלים חדשים מוצאים אותך או פונים אליך לראשונה?",
                        required: false
                    },
                    {
                        id: "crm",
                        type: "text",
                        label: "מערכת CRM / ניהול יומן ותורים",
                        placeholder: "לדוגמה: Arbox, פריוריטי, יומן גוגל, מורביט, נייר",
                        desc: "באילו כלים אתה משתמש כיום לניהול התורים ותיקי המטופלים?",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 2: צלילה ליום העבודה (שיקוף תהליכים)",
                questions: [
                    {
                        id: "daily_routine",
                        type: "textarea",
                        label: "תיאור יום העבודה הטיפוסי בקליניקה",
                        placeholder: "ספר לנו בקצרה איך נראה היום שלך - ניהול הפסקות, מענה להודעות, תיעוד, הכנות...",
                        required: false
                    },
                    {
                        id: "robotic_tasks",
                        type: "textarea",
                        label: "משימות רפטטיביות \"רובוטיות\" (ללא מחשבה)",
                        placeholder: "לדוגמה: וידאו הגעה מול מטופלים, שליחת הוראות הגעה וחניה, גביית תשלומים, מעקב ביטולים...",
                        desc: "אילו פעולות טכניות גוזלות ממך זמן יקר במהלך היום?",
                        required: false
                    },
                    {
                        id: "cognitive_tasks",
                        type: "textarea",
                        label: "משימות רפטטיביות המצריכות מחשבה או קבלת החלטות מקצועית",
                        placeholder: "לדוגמה: כתיבת סיכומי טיפול, קריאת שאלונים רפואיים, התאמת תוכנית טיפול...",
                        desc: "אילו משימות חוזרות על עצמן אך עדיין דורשות את הידע המקצועי שלך?",
                        required: false
                    },
                    {
                        id: "bottlenecks",
                        type: "textarea",
                        label: "צווארי בקבוק ותסכולים מרכזיים",
                        placeholder: "מהו החלק המנהלתי או התפעולי שהכי מפריע לך להתמקד בטיפול עצמו?",
                        required: true
                    },
                    {
                        id: "automation_idea",
                        type: "text",
                        label: "הצעות אישיות לאוטומציה",
                        placeholder: "אם היית יכול להעביר משימה אחת למזכירה רובוטית אוטומטית, מה היא הייתה?",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 3: בחינת היתכנות לאוטומציות ממוקדות",
                questions: [
                    {
                        id: "rating_scheduling",
                        type: "rating",
                        label: "אוטומציה 1: ניהול תורים, ביטולים ורשימות המתנה חכמות",
                        desc: "שליחת תזכורות בוואטסאפ 24-48 שעות לפני. במקרה של ביטול, המערכת מזהה זאת ומציעה אוטומטית את התור שהתפנה למטופלים הבאים ברשימת ההמתנה ללא התערבות ידנית."
                    },
                    {
                        id: "rating_intake",
                        type: "rating",
                        label: "אוטומציה 2: שאלון אנמנזה והצהרת בריאות דיגיטלית אוטומטית",
                        desc: "ברגע שנקבע תור, נשלח שאלון רפואי חכם לוואטסאפ. הנתונים מתועדים ישירות בתיק המטופל ומגיעים מוכנים לקריאה למטפל עוד לפני כניסת המטופל לחדר."
                    },
                    {
                        id: "rating_followup",
                        type: "rating",
                        label: "אוטומציה 3: שימור לקוחות ופולו-אפ טיפולי מתוזמן",
                        desc: "שליחת הודעה אוטומטית מספר ימים לאחר הטיפול לבדיקת שלומם, או תזכורת אוטומטית חודש/חודשיים לאחר הטיפול האחרון להזמנה לקביעת טיפול משמר."
                    }
                ]
            }
        ]
    },
    lawyers: {
        title: "שאלון אפיון עורכי דין ומשרדי משפט",
        colorClass: "lawyers-color",
        steps: [
            {
                groupTitle: "חלק 1: רקע כללי ומערכות בעסק",
                questions: [
                    {
                        id: "office_name",
                        type: "text",
                        label: "שם המשרד / עורך הדין",
                        placeholder: "לדוגמה: כהן, לוי ושות' משרד עורכי דין",
                        required: true
                    },
                    {
                        id: "specialty",
                        type: "text",
                        label: "תחום התמחות מרכזי",
                        placeholder: "לדוגמה: מקרקעין, דיני עבודה, נזיקין, חברות, פלילי, משפחה",
                        desc: "מהו תחום הפעילות העיקרי של המשרד?",
                        required: true
                    },
                    {
                        id: "leads",
                        type: "text",
                        label: "פלטפורמות קבלת לקוחות ולידים",
                        placeholder: "לדוגמה: לינקדאין, פייסבוק, אתר אינטרנט, הפניות מקולגות, נטוורקינג",
                        desc: "באילו ערוצים מגיעים אליך פניות מלקוחות חדשים?",
                        required: false
                    },
                    {
                        id: "crm",
                        type: "text",
                        label: "מערכת CRM או ניהול תיקים משפטיים",
                        placeholder: "לדוגמה: עודכנית, קומטק, פאורלינק, תיקיות קבצים ידניות",
                        desc: "באיזו מערכת אתם משתמשים לניהול הלקוחות והתיקים?",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 2: צלילה ליום העבודה (שיקוף תהליכים)",
                questions: [
                    {
                        id: "daily_routine",
                        type: "textarea",
                        label: "תיאור יום העבודה הטיפוסי במשרד",
                        placeholder: "תאר את סדר היום של המשרד מרגע פתיחתו (מיילים, טלפונים, כתיבת כתבי טענות, פגישות...)",
                        required: false
                    },
                    {
                        id: "robotic_tasks",
                        type: "textarea",
                        label: "משימות רפטטיביות \"רובוטיות\" (ללא מחשבה)",
                        placeholder: "לדוגמה: תזכורות ללקוחות להביא מסמכים, הקלדת פרטי לקוח בחוזים, הפקת חשבוניות...",
                        desc: "אילו פעולות טכניות אתם מבצעים שוב ושוב שאינן דורשות השכלה משפטית, אלא רק זמן משרדי?",
                        required: false
                    },
                    {
                        id: "cognitive_tasks",
                        type: "textarea",
                        label: "משימות רפטטיביות המצריכות מחשבה או קבלת החלטות",
                        placeholder: "לדוגמה: סינון פניות ובדיקת היתכנות, ניסוח ראשוני של כתב הגנה, מעבר על חוזים סטנדרטיים...",
                        desc: "אילו משימות קבועות בעבודה שלכם עדיין דורשות חשיבה משפטית או ניתוח?",
                        required: false
                    },
                    {
                        id: "bottlenecks",
                        type: "textarea",
                        label: "צווארי בקבוק ותסכולים מרכזיים",
                        placeholder: "איזה חלק בעבודה המשפטית או המנהלתית גוזל מכם הכי הרבה זמן ומעכב התקדמות?",
                        required: true
                    },
                    {
                        id: "automation_idea",
                        type: "text",
                        label: "הצעות אישיות לאוטומציה",
                        placeholder: "אם היית יכול להפוך תהליך משרדי מעיק אחד לאוטומטי לחלוטין, מה הוא היה?",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 3: בחינת היתכנות לאוטומציות ממוקדות",
                questions: [
                    {
                        id: "rating_leads",
                        type: "rating",
                        label: "אוטומציה 1: מענה מיידי וסינון לידים חדשים",
                        desc: "שליחת הודעת וואטסאפ/מייל מיידית לליד עם שאלון סינון ראשוני, והתראה דחופה בטלפון לעורך הדין לחזור אליו מהר לפני שיעבור למתחרים."
                    },
                    {
                        id: "rating_courts",
                        type: "rating",
                        label: "אוטומציה 2: תזכורת ומעקב מועדי דיונים חכמים",
                        desc: "תזכורת אוטומטית 3 ימים ויום מראש על דיון קרוב בתיק, ושליחת עדכון אוטומטי מרגיע ללקוח בתום הדיון."
                    },
                    {
                        id: "rating_billing",
                        type: "rating",
                        label: "אוטומציה 3: תזכורות וגביית תשלומים אוטומטית",
                        desc: "שליחת חשבוניות ב-1 לחודש ותזכורות עדינות מבוססות תאריך בוואטסאפ עם לינק סליקה ישיר ללקוחות שטרם שילמו."
                    },
                    {
                        id: "rating_status",
                        type: "rating",
                        label: "אוטומציה 4: עדכון סטטוס תיק אוטומטי ללקוח",
                        desc: "ברגע שמשנים סטטוס תיק ב-CRM (למשל ל'הוגש כתב תביעה'), הלקוח מקבל מיד הודעה אוטומטית ומפורטת על השלב הבא."
                    },
                    {
                        id: "rating_docs",
                        type: "rating",
                        label: "אוטומציה 5: איסוף ומרדף מסמכים אוטומטי מלקוחות",
                        desc: "שליחת דרישת מסמכים מותאמת אישית לפי סוג תיק, ותזכורות מתוזמנות עד להעלאת כל המסמכים לתיקיית הענן."
                    },
                    {
                        id: "rating_generator",
                        type: "rating",
                        label: "אוטומציה 6: מחולל מסמכים וחוזים אוטומטי מתבניות",
                        desc: "מילוי טופס פרטים מהיר שמייצר באופן מיידי חוזה Word/PDF מדויק על בסיס תבנית המשרד ושולח אותו לחתימה דיגיטלית."
                    },
                    {
                        id: "rating_ai",
                        type: "rating",
                        label: "אוטומציה 7: תמלול, סיכום והזנת פגישות מבוסס AI",
                        desc: "הקלטת פגישה והפיכתה אוטומטית לסיכום משפטי מובנה, משימות מוגדרות בתיק והזנה ישירה של התקציר ל-CRM."
                    }
                ]
            }
        ]
    },
    realtors: {
        title: "שאלון אפיון מתווכי נדל\"ן",
        colorClass: "realtors-color",
        steps: [
            {
                groupTitle: "חלק 1: רקע כללי ומערכות בעסק",
                questions: [
                    {
                        id: "realtor_name",
                        type: "text",
                        label: "שם המשרד / הסוכן ותפקיד",
                        placeholder: "לדוגמה: איראל תיווך ונדל\"ן - אורי, סוכן בכיר",
                        required: true
                    },
                    {
                        id: "leads",
                        type: "text",
                        label: "פלטפורמות קבלת לקוחות ולידים",
                        placeholder: "לדוגמה: יד2, פייסבוק ממומן, אתר המשרד, קמפיין גוגל, שלטים, המלצות",
                        desc: "באילו ערוצים מגיעים אליך רוב הלידים בעסק?",
                        required: false
                    },
                    {
                        id: "crm",
                        type: "text",
                        label: "מערכת CRM לניהול לקוחות",
                        placeholder: "לדוגמה: Homely, BAM, תפוח, מניו, אקסל, דפים",
                        desc: "האם ואיזו מערכת CRM משמשת אתכם כרגע לניהול המאגר?",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 2: צלילה ליום העבודה (שיקוף תהליכים)",
                questions: [
                    {
                        id: "daily_routine",
                        type: "textarea",
                        label: "תיאור יום העבודה הטיפוסי",
                        placeholder: "תאר בקצרה את סדר היום שלך מרגע פתיחת הטלפון ועד סוף יום העבודה...",
                        required: false
                    },
                    {
                        id: "robotic_tasks",
                        type: "textarea",
                        label: "משימות רפטטיביות \"רובוטיות\" (ללא מחשבה)",
                        placeholder: "לדוגמה: העתקת נתונים, שליחת הודעות וואטסאפ זהות, הזנת נכסים באתרי פרסום...",
                        desc: "אילו פעולות אתה מבצע שוב ושוב ללא צורך בשיקול דעת מיוחד?",
                        required: false
                    },
                    {
                        id: "cognitive_tasks",
                        type: "textarea",
                        label: "משימות רפטטיביות המצריכות מחשבה או החלטות",
                        placeholder: "לדוגמה: התאמת נכס לדרישות קונה, סינון פניות ראשוני, ניתוח נתוני שוק...",
                        desc: "אילו משימות חוזרות על עצמן אך דורשות ריכוז או ניתוח מקצועי?",
                        required: false
                    },
                    {
                        id: "bottlenecks",
                        type: "textarea",
                        label: "צווארי בקבוק ותסכולים מרכזיים",
                        placeholder: "מהי המשימה שאתה הכי נוטה לדחות או שואבת ממך הכי הרבה זמן ואנרגיה?",
                        required: true
                    },
                    {
                        id: "automation_idea",
                        type: "text",
                        label: "הצעות אישיות לאוטומציה",
                        placeholder: "אם היית יכול להפוך פעולה אחת בעסק לאוטומטית בלחיצת כפתור, מה היית בוחר?",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 3: בחינת היתכנות לאוטומציות ממוקדות",
                questions: [
                    {
                        id: "rating_lead_routing",
                        type: "rating",
                        label: "אוטומציה 1: ניתוב וסינון לידים אוטומטי ממייל (קונה/מוכר)",
                        desc: "קליטת ליד ממייל, סיווג אוטומטי. למוכר - התראה מיידית למתווך. לקונה - שליחת שאלון וואטסאפ חכם לבירור צרכים ותקציב לפני שיחה."
                    },
                    {
                        id: "rating_dormant_leads",
                        type: "rating",
                        label: "אוטומציה 2: איתור יזום של לקוחות רדומים ובעלי נכסים למכירה (מבוסס Homely CRM)",
                        desc: "סריקה אוטומטית של מאגר הלקוחות לאיתור בעלי נכסים שהיו בעבר בתהליך מכירה ולא מכרו, ופנייה אוטומטית חכמה להחזרתם לתהליך."
                    },
                    {
                        id: "rating_investors",
                        type: "rating",
                        label: "אוטומציה 3: איתור משקיעים פוטנציאליים לשיפור עמדות (החלפת נכס)",
                        desc: "מציאת לקוחות ב-CRM שמחזיקים דירות להשקעה וגרים בשכירות יקרה, ויצירת פנייה ממוקדת עם הצעת ערך פיננסית למכירה ורכישה יעילה."
                    },
                    {
                        id: "rating_syndication",
                        type: "rating",
                        label: "אוטומציה 4: הפצה ואוטומציית \"קליטת נכס חדש\"",
                        desc: "הזנת נכס ותמונות בטופס יחיד, המפיץ אותו אוטומטית לכל הערוצים במקביל: אתר המשרד, רשתות חברתיות, וקבוצות וואטסאפ."
                    },
                    {
                        id: "rating_visit_followup",
                        type: "rating",
                        label: "אוטומציה 5: פולו-אפ אוטומטי לאחר סיור בנכס",
                        desc: "שליחת הודעת וואטסאפ מספר שעות לאחר סיור/פגישה בנכס עם קישור מהיר לקבלת פידבק או שליחת הצעה רשמית."
                    }
                ]
            }
        ]
    },
    general: {
        title: "שאלון אפיון כללי לעסקים",
        colorClass: "general-color",
        steps: [
            {
                groupTitle: "חלק 1: רקע כללי ומערכות בעסק",
                questions: [
                    {
                        id: "business_name",
                        type: "text",
                        label: "שם העסק והתעשייה",
                        placeholder: "לדוגמה: י.ה סחר ושיווק - קמעונאות",
                        required: true
                    },
                    {
                        id: "leads",
                        type: "text",
                        label: "כיצד מגיעים אליך לקוחות חדשים בדרך כלל?",
                        placeholder: "לדוגמה: פייסבוק ממומן, המלצות, חיפוש אורגני בגוגל",
                        required: false
                    },
                    {
                        id: "crm",
                        type: "text",
                        label: "באילו מערכות תוכנה (CRM, גיליונות, אימייל) העסק משתמש כרגע?",
                        placeholder: "לדוגמה: Salesforce, HubSpot, Google Sheets, Gmail",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 2: צלילה ליום העבודה (שיקוף תהליכים)",
                questions: [
                    {
                        id: "robotic_tasks",
                        type: "textarea",
                        label: "אילו משימות משרדיות חוזרות על עצמן וגוזלות לכם הכי הרבה זמן?",
                        placeholder: "תאר פעולות קבועות כמו שליחת מיילים ידנית, העתקת נתונים בין מערכות, הפקת דוחות...",
                        required: false
                    },
                    {
                        id: "bottlenecks",
                        type: "textarea",
                        label: "מהו צוואר הבקבוק המרכזי בעסק שמקשה עליכם לצמוח?",
                        placeholder: "איפה דברים נתקעים ביום-יום? (זמן תגובה ללידים, מעקב תשלומים, סנכרון צוות)",
                        required: true
                    },
                    {
                        id: "automation_idea",
                        type: "text",
                        label: "אם הייתם יכולים להפוך דבר אחד בעסק לאוטומטי לגמרי, מה הייתם בוחרים?",
                        placeholder: "רשמו את הפעולה שהיה הכי עוזר לכם להוריד מהראש בלחיצת כפתור.",
                        required: false
                    }
                ]
            },
            {
                groupTitle: "חלק 3: פוטנציאל לאוטומציה בעסק שלכם",
                questions: [
                    {
                        id: "rating_sales",
                        type: "rating",
                        label: "אוטומציה של שיווק ומכירות",
                        desc: "מענה אוטומטי מהיר ללידים חדשים מכל ערוצי הדיגיטל, וסנכרון של מערכות הפרסום עם ה-CRM."
                    },
                    {
                        id: "rating_service",
                        type: "rating",
                        label: "אוטומציה של שירות לקוחות ופולו-אפ",
                        desc: "הודעות WhatsApp מתוזמנות לשימור, שליחת מדריכים, ואיסוף חוות דעת מלקוחות מרוצים."
                    },
                    {
                        id: "rating_operations",
                        type: "rating",
                        label: "אוטומציה של תפעול ומשרד אחורי (Back Office)",
                        desc: "סנכרון נתונים בין מערכות שונות, הנפקת מסמכים/חשבוניות, ותיוק אוטומטי של קבצים."
                    }
                ]
            }
        ]
    }
};

/* ==========================================================================
   Interactive Survey Logic
   ========================================================================== */
let activeIndustry = null;
let currentStepIndex = 0;
let surveyAnswers = {};

function initSurveySystem() {
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
}

// Function triggered by clicking a footer link to start a specific survey directly
window.selectSurveyFromFooter = function(industry) {
    // Smooth scroll to the survey section
    const surveySection = document.getElementById('survey');
    if (surveySection) {
        surveySection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Give it a tiny moment to scroll before initiating the survey
    setTimeout(() => {
        startIndustrySurvey(industry);
    }, 400);
};

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

    // Visual transitions
    stepIndustrySelect.style.display = 'none';
    stepQuestions.style.display = 'block';
    progressContainer.style.display = 'block';

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
            // Rating 1-5 Custom buttons
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

    // Attach normal text/textarea listeners to save answers
    const inputs = container.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            surveyAnswers[e.target.id] = e.target.value;
        });
    });

    // Update navigation buttons text / display
    const btnNext = document.getElementById('btnNextStep');
    const totalSteps = config.steps.length;
    if (currentStepIndex === totalSteps - 1) {
        btnNext.innerHTML = `סיום והצגת תוצאות <i class="fa-solid fa-square-check"></i>`;
    } else {
        btnNext.innerHTML = `המשך <i class="fa-solid fa-arrow-left"></i>`;
    }
}

// Global scope helper for rating button selections
window.selectRatingRadio = function(questionId, value) {
    surveyAnswers[questionId] = value;
    
    // Manage class styling for siblings
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
};

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
        // Go back to industry selection
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
                // Add validation error styling to input if wanted
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
    
    // Scenario 1: n8n webhook takes priority
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
    // Scenario 2: Web3Forms free email delivery (JSON payload to ensure UTF-8 encoding)
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
        
        // Loop and add all questions/answers dynamically for the email body
        const config = surveyConfig[activeIndustry];
        config.steps.forEach(step => {
            step.questions.forEach(q => {
                const val = surveyAnswers[q.id];
                if (val && val !== '') {
                    let displayVal = val;
                    if (q.type === 'rating') {
                        displayVal = `⭐ ${val} / 5`;
                    }
                    // Clean key name to remove special chars or asterisks
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

    // Remove selection styling on industry cards
    const industryCards = document.querySelectorAll('.industry-selector-card');
    industryCards.forEach(card => card.classList.remove('selected'));
}

/* ==========================================================================
   Send via WhatsApp
   ========================================================================== */
function sendWhatsAppResults() {
    const phone = "972547171828"; // Replace with your actual WhatsApp business number
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
                    from_name: "אתר IR_Aoutomations",
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

/* ==========================================================================
   ROI Calculator Logic
   ========================================================================== */
function initROICalculator() {
    const inputEmployees = document.getElementById('inputEmployees');
    const inputHours = document.getElementById('inputHours');
    const inputCost = document.getElementById('inputCost');

    const valEmployees = document.getElementById('valEmployees');
    const valHours = document.getElementById('valHours');
    const valCost = document.getElementById('valCost');

    const resultHours = document.getElementById('resultHours');
    const resultMonthly = document.getElementById('resultMonthly');
    const resultYearly = document.getElementById('resultYearly');

    if (!inputEmployees || !inputHours || !inputCost) return;

    function calculateSavings() {
        const employees = parseInt(inputEmployees.value);
        const hours = parseInt(inputHours.value);
        const cost = parseInt(inputCost.value);

        // Update slider value displays
        valEmployees.textContent = employees;
        valHours.textContent = `${hours} שעות`;
        valCost.textContent = `₪${cost}`;

        // Calculations
        // Average weeks in month: 4.33
        const monthlyHoursSaved = Math.round(employees * hours * 4.33);
        const monthlyMoneySaved = Math.round(monthlyHoursSaved * cost);
        const yearlyMoneySaved = Math.round(monthlyMoneySaved * 12);

        // Format with thousand separator
        resultHours.textContent = monthlyHoursSaved.toLocaleString('he-IL');
        resultMonthly.textContent = `₪${monthlyMoneySaved.toLocaleString('he-IL')}`;
        resultYearly.textContent = `₪${yearlyMoneySaved.toLocaleString('he-IL')}`;

        // Trigger scale-pop animation on changes
        [resultHours, resultMonthly, resultYearly].forEach(el => {
            el.classList.remove('scale-pop');
            void el.offsetWidth; // Force reflow to restart CSS animation
            el.classList.add('scale-pop');
        });
    }

    inputEmployees.addEventListener('input', calculateSavings);
    inputHours.addEventListener('input', calculateSavings);
    inputCost.addEventListener('input', calculateSavings);

    // Initial calculation
    calculateSavings();
}

/* ==========================================================================
   AI Chatbot Widget Logic
   ========================================================================== */
function initAIChatbot() {
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

    // Helper: Formats bold and linebreaks nicely
    function formatMessageText(text) {
        // Escape HTML to prevent injection but allow basic bolding and linebreaks
        let formatted = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        // Parse markdown-style bold: **text** -> <strong>text</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Parse linebreaks: \n -> <br>
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    // Helper: Add message bubble
    function addMessage(text, sender = 'bot') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = formatMessageText(text);
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Helper: Add typing indicator
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

    // Helper: Render option chips
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

    // Bot response helper with typing simulation
    function botReply(text, chips = [], delay = 1000) {
        addTypingIndicator();
        chatInput.disabled = true; // Disable input while typing to keep focus clean
        if (chatOptions) chatOptions.innerHTML = ''; // Clear options while typing
        
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(text, 'bot');
            renderChips(chips);
            chatInput.disabled = false;
            chatInput.focus();
        }, delay);
    }

    // Email and Phone validators
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        const re = /^\+?[\d\s-]{9,15}$/;
        return re.test(phone) && phone.replace(/[^\d]/g, '').length >= 9;
    }

    // Submit lead details to Web3Forms or n8n
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

        // Send email via Web3Forms (always send email notification to iraoutomations@gmail.com if key is provided)
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

        // Optionally send a copy to a dedicated n8n leads/survey webhook if provided
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

    // Dynamic Solution Generator based on user inputs
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
            return `נוכל לבנות עבורכם מערכת פולו-אפ אוטומטית שתזהה פניות חדשות מפייסבוק או מהאתר ותחזור אליהן בוואטסאפ או במייל תוך פחות מדקה, מה שיגדיל משמעותית את אחוזי הסגירה שלכם!`;
        }
        if (text.includes('וואטסאפ') || text.includes('מענה') || text.includes('שירות') || text.includes('הודע') || text.includes('צ\'אט')) {
            return `נוכל לחבר סוכן AI חכם לוואטסאפ שלכם שיענה ללקוחות 24/7, יספק מידע רלוונטי על העסק, יפתור בעיות נפוצות ויעביר פניות מורכבות ישירות לטיפולכם!`;
        }
        
        // Industry-based defaults
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

    // Dynamic 3-Step DIY Action Plan Generator
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

        // Industry-based defaults
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

    // Start Chat/Reset
    function resetChat() {
        chatMessages.innerHTML = '';
        currentState = 'step1_niche';
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

    // Handles user typed message via input form
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text === '') return;

        chatInput.value = '';
        addMessage(text, 'user');

        handleUserInputText(text);
    });

    // Handle state transitions for text input
    function handleUserInputText(text) {
        if (currentState === 'ai_chat') {
            sendToN8nAI(text);
            return;
        }

        // Handle states
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
                currentState = 'collect_name_for_human';
                botReply(`הבנתי לגמרי! נוכל לחבר אותך לנציג אנושי. מה השם שלך כדי שנציג יחזור אליך בהקדם?`);
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
                // If they type something else, go to AI chat
                currentState = 'ai_chat';
                sendToN8nAI(text);
            }
        } else if (currentState.startsWith('collect_name_for_')) {
            userData.name = text;
            const flowType = currentState.split('_')[3]; // call, whatsapp, human
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

    // Ask challenge question with chips based on industry
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

    // Ask if wants call (Offer automated solution and scheduling)
    function askOfferCall() {
        const solution = getAutomatedSolutionExplanation(userData.industry, userData.challenge);
        botReply(`${solution}\n\nהפתרון הזה יחסוך לכם עשרות שעות עבודה חודשיות וימנע טעויות אנוש. ⏱️\n\n**בוא נתאם שיחת אפיון מלאה של 10 דקות ללא עלות בטלפון או בווטסאפ כדי שנתאים לכם את הפתרון. מה דעתך?**`, [
            { text: 'כן, אשמח לתאם שיחה! 📞', value: 'yes' },
            { text: 'מעדיף לעבור ישר לוואטסאפ 💬', value: 'whatsapp_direct' },
            { text: 'אני רוצה לדבר עם נציג אנושי בנייד 👤', value: 'human' },
            { text: 'לא כרגע, תודה 🤔', value: 'no' }
        ]);
    }

    // Show Nurture Mode: custom DIY action plan displayed directly in chat
    function showNurtureDIYPlan() {
        const diyPlan = getDIYActionPlan(userData.industry, userData.challenge);
        botReply(`מבין לגמרי, אין שום לחץ! 😊\n\nכדי לעזור לכם בכל מקרה, הנה **תוכנית פעולה לעבודה עצמית (DIY Automation Blueprint)** מותאמת אישית לפתרון האתגר:\n\n${diyPlan}\n\n---\n**איך תרצו להמשיך מכאן?**`, [
            { text: 'בכל זאת, אשמח לתאם שיחת אפיון! 📞', value: 'yes' },
            { text: 'מעבר לוואטסאפ של IR 💬', value: 'whatsapp_direct' },
            { text: 'שוחח עם סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' },
            { text: 'דבר עם נציג אנושי בטלפון 👤', value: 'human_phone' }
        ]);
    }

    // Lead capturing finalized
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

    // Send chat text input to n8n AI Agent endpoint
    function sendToN8nAI(text) {
        addTypingIndicator();
        chatInput.disabled = true;
        if (chatOptions) chatOptions.innerHTML = '';

        const payload = {
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
            
            // Read response from n8n structure (output, reply, response, or raw)
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

    // Handle clicks on option chips
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
            } else if (opt.value === 'human') {
                currentState = 'collect_name_for_human';
                botReply(`הבנתי לגמרי! נוכל לחבר אותך לנציג אנושי. מה השם שלך כדי שנציג יחזור אליך בהקדם?`);
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

    // Toggle Chat Window
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (badge) {
            badge.style.display = 'none'; // Hide notification badge on first open
        }
        
        // Start conversation if empty
        if (chatMessages.children.length === 0) {
            resetChat();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });
}

/* ==========================================================================
   Scroll Reveal Animation Engine
   ========================================================================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px -10px -40px -10px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-active');
            } else {
                entry.target.classList.remove('scroll-active');
            }
        });
    }, observerOptions);

    const revealSelectors = [
        '.service-card',
        '.calculator-card-wrapper',
        '.survey-card-wrapper',
        '.contact-card',
        '.hero-content',
        '.hero-mockup',
        '.section-header',
        '.tech-stack-section'
    ];

    revealSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });
    });
}

/* ==========================================================================
   Glowing Mouse Spotlight Tracker
   ========================================================================== */
function initMouseGlow() {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;

    window.addEventListener('mousemove', (e) => {
        // Use requestAnimationFrame for high performance 60fps movement
        window.requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            glow.style.opacity = '1';
        });
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });
}

/* ==========================================================================
   Interactive Canvas Neon Particle Trail
   ========================================================================== */
function initParticleTrail() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationFrameId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Site theme neon colors: violet, cyan, bright blue
    const colors = ['#8b5cf6', '#06b6d4', '#3b82f6'];

    function createParticles(x, y, count = 2, speedFactor = 1) {
        for (let i = 0; i < count; i++) {
            // If count is 1 (mouse movement trail), make velocity light and drifting upward
            const vx = count === 1 ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 3 * speedFactor;
            const vy = count === 1 ? (Math.random() - 0.5) * 1.5 - 0.6 : (Math.random() - 0.5) * 3 * speedFactor - 0.2;
            particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: Math.random() * 2.5 + 1.2, // small clean particles
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: count === 1 ? (Math.random() * 0.02 + 0.015) : (Math.random() * 0.03 + 0.02) // fade faster for bursts
            });
        }
        if (!animationFrameId) {
            animate();
        }
    }

    function animate() {
        // Clear canvas with transparent color to preserve performance
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            
            // Subtle neon glow styling
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            
            ctx.fill();
            ctx.restore();
        }

        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null; // Pause animation loop to save CPU when idle
        }
    }

    // Gentle trail on movement
    window.addEventListener('mousemove', (e) => {
        createParticles(e.clientX, e.clientY, 1, 0.4);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            createParticles(e.touches[0].clientX, e.touches[0].clientY, 1, 0.4);
        }
    });

    // Dopamine burst when clicking anywhere on the screen
    window.addEventListener('click', (e) => {
        createParticles(e.clientX, e.clientY, 15, 1.3);
    });

    // Dopamine spark burst when crossing boundary of interactive elements
    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('a, button, .chat-chip, .carousel-item, .service-card, input[type="range"]');
        if (interactive) {
            const now = Date.now();
            const lastHover = interactive.dataset.lastHover || 0;
            if (now - lastHover > 300) { // Throttled to prevent multiple triggers
                interactive.dataset.lastHover = now;
                createParticles(e.clientX, e.clientY, 6, 0.6);
            }
        }
    });
}
