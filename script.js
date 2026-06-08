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

    let currentState = 'welcome';
    let userData = {
        name: '',
        company: '',
        role: '',
        challenge: '',
        timeline: '',
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
            "שם מלא": data.name,
            "חברה / עסק": data.company,
            "אתגר תפעולי / צוואר בקבוק": data.challenge,
            "לוח זמנים מתוכנן": data.timeline,
            "מסלול פנייה": data.wantsCall ? "תיאום שיחת אפיון 📞" : "משאב חינמי / טיפוח 📧",
            "מספר טלפון": data.phone || "לא צוין",
            "משאב מבוקש": data.resource || "לא צוין",
            "כתובת אימייל": data.email || "לא צוין",
            "תאריך פנייה": new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
        };

        // Send email via Web3Forms (always send email notification to iraoutomations@gmail.com if key is provided)
        if (INTEGRATION_SETTINGS.web3FormsAccessKey) {
            const emailPayload = {
                access_key: INTEGRATION_SETTINGS.web3FormsAccessKey,
                subject: `[ליד סוכן AI] ${data.name} - ${data.company}`,
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
            print("Chatbot Lead (Simulation - no integration key):", payload);
        }
    }

    // Start Chat/Reset
    function resetChat() {
        chatMessages.innerHTML = '';
        currentState = 'welcome';
        userData = {
            name: '',
            company: '',
            role: '',
            challenge: '',
            timeline: '',
            qualified: false,
            wantsCall: false,
            phone: '',
            resource: '',
            email: ''
        };
        botReply(`היי! אני סוכן ה-AI של **IR_Aoutomations** 👋 תפקידי הוא לעזור לך לזהות איך לפנות זמן יקר ולחסוך עלויות בעסק באמצעות אוטומציות חכמות.\n\nאיך קוראים לך?`);
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
        if (currentState === 'welcome') {
            userData.name = text;
            currentState = 'ask_company';
            botReply(`נעים להכיר, **${userData.name}**! מאיזו חברה או עסק אתה עובד?`);
        } else if (currentState === 'ask_company') {
            userData.company = text;
            currentState = 'ask_challenge';
            askChallengeQuestion();
        } else if (currentState === 'ask_challenge') {
            userData.challenge = text;
            currentState = 'ask_timeline';
            askTimelineQuestion();
        } else if (currentState === 'collect_phone') {
            if (validatePhone(text)) {
                userData.phone = text;
                userData.wantsCall = true;
                currentState = 'completed';
                submitChatbotLead(userData);
                showFinalCallThanks();
            } else {
                botReply(`נראה שמספר הטלפון שהזנת אינו תקין. אנא הזן מספר טלפון תקין (לדוגמה: 054-1234567 או 09-1234567).`);
            }
        } else {
            botReply(`תודה רבה! אם ברצונך להתחיל שיחה חדשה, לחץ על הכפתור למטה.`, [
                { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
            ]);
        }
    }

    // Ask challenge question with chips
    function askChallengeQuestion() {
        botReply(`הבנתי לגמרי.\nמהו צוואר הבקבוק או האתגר התפעולי המרכזי ב-**${userData.company}** ששואב מכם הכי הרבה זמן ועבודה ידנית?`, [
            { text: 'העתקת נתונים ידנית וקלדנות 📂', value: 'data_entry' },
            { text: 'סינון ומעקב אחר לידים (פולו-אפ) 📞', value: 'leads' },
            { text: 'סנכרון בין מערכות (CRM, וואטסאפ, מייל) 🔗', value: 'sync' },
            { text: 'מענה אוטומטי בוואטסאפ ושירות לקוחות 💬', value: 'whatsapp_support' },
            { text: 'ניהול משימות ופרויקטים (Monday, ClickUp) 🗓️', value: 'pm' },
            { text: 'הפקת מסמכים, חשבוניות ודוחות 💳', value: 'billing' },
            { text: 'תהליכי קליטה (Onboarding) של לקוחות/עובדים 👥', value: 'onboarding' },
            { text: 'אחר (הקלד חופשי) ✍️', value: 'other' }
        ]);
    }

    // Ask timeline question with chips
    function askTimelineQuestion() {
        botReply(`זהו אתגר מוכר מאוד, ובדיוק כאן אנחנו עוזרים! אנחנו ב-**IR_Aoutomations** מתמחים בפתרון צווארי בקבוק כאלה בדיוק באמצעות **n8n** - כלי האינטגרציה המוביל שחוסך את עלויות הרישוי היקרות של זאפייר.\n\nמהו לוח הזמנים המתוכנן שלך לבחינה ויישום של פתרון לעסק?`, [
            { text: 'מיידי (השבוע-שבועיים הקרובים) ⚡', value: 'immediate' },
            { text: 'במהלך החודש הקרוב 🗓️', value: 'next_month' },
            { text: 'רק בודק אופציות כרגע 🔍', value: 'browsing' }
        ]);
    }

    // Ask if wants call (qualified path)
    function askOfferCall() {
        botReply(`נשמע שאתה מוכן לעשות שינוי אמיתי שיפנה לכם המון זמן יקר. נוכל לעשות שיחת אפיון קצרה (ללא עלות) שבה נציג לך איך אוטומציה מבוססת n8n תפתור בדיוק את האתגר של **${userData.challenge}** אצלכם.\n\nהאם תרצה שנתאם שיחת אפיון קצרה?`, [
            { text: 'כן, אשמח לתאם שיחה! 📞', value: 'yes' },
            { text: 'עדיין לא מוכן לשיחה, אולי בהמשך 🤔', value: 'no' }
        ]);
    }

    // Show call path success
    function showFinalCallThanks() {
        const chips = [
            { text: 'מעבר לשיחה בוואטסאפ 💬', value: 'whatsapp' },
            { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
        ];
        if (INTEGRATION_SETTINGS.n8nChatbotWebhook) {
            chips.splice(1, 0, { text: 'שאל את סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' });
        }
        botReply(`תודה רבה, **${userData.name}**! 🎉\n\nפרטייך התקבלו בהצלחה. סוכן מ-**IR_Aoutomations** ייצור איתך קשר בהקדם לתיאום שיחת האפיון.\n\nלזירוז המענה ותיאום מיידי, תוכל לשלוח לנו הודעה ישירה בוואטסאפ!`, chips);
    }

    // Send chat text input to n8n AI Agent endpoint
    function sendToN8nAI(text) {
        addTypingIndicator();
        chatInput.disabled = true;
        if (chatOptions) chatOptions.innerHTML = '';

        const payload = {
            name: userData.name,
            company: userData.company,
            challenge: userData.challenge,
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

        if (currentState === 'ask_challenge') {
            userData.challenge = opt.text;
            currentState = 'ask_timeline';
            askTimelineQuestion();
        } else if (currentState === 'ask_timeline') {
            userData.timeline = opt.text;
            if (opt.value === 'browsing') {
                userData.qualified = false;
                userData.wantsCall = false;
                currentState = 'completed';
                submitChatbotLead(userData);
                
                const chips = [
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ];
                if (INTEGRATION_SETTINGS.n8nChatbotWebhook) {
                    chips.unshift({ text: 'שאל את סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' });
                }
                botReply(`הבנתי לגמרי, הכל בסדר ואין שום לחץ!\n\nנשמח לעמוד לרשותך בעתיד כשתרצה לבחון פתרונות אוטומציה לעסק שלכם. שיהיה יום נפלא ומוצלח! 🚀`, chips);
            } else {
                userData.qualified = true;
                currentState = 'offer_call';
                askOfferCall();
            }
        } else if (currentState === 'offer_call') {
            if (opt.value === 'yes') {
                currentState = 'collect_phone';
                botReply(`מעולה! מהו מספר הטלפון שלך ליצירת קשר ותיאום השיחה?`);
            } else {
                userData.qualified = false;
                userData.wantsCall = false;
                currentState = 'completed';
                submitChatbotLead(userData);
                
                const chips = [
                    { text: 'התחל שיחה מחדש 🔄', value: 'reset' }
                ];
                if (INTEGRATION_SETTINGS.n8nChatbotWebhook) {
                    chips.unshift({ text: 'שאל את סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' });
                }
                botReply(`הבנתי לגמרי, הכל בסדר ואין שום לחץ!\n\nנשמח לעמוד לרשותך בעתיד כשתהיה מוכן. שיהיה יום נפלא ומוצלח! 🚀`, chips);
            }
        } else if (currentState === 'completed') {
            if (opt.value === 'whatsapp') {
                const phone = "972547171828";
                const message = encodeURIComponent(`היי, שוחחתי עם סוכן ה-AI באתר שלכם. אשמח לתאם שיחת אפיון קצרה לאוטומציה של העסק שלי.`);
                window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
            } else if (opt.value === 'start_ai_chat') {
                currentState = 'ai_chat';
                botReply(`מעולה, **${userData.name}**! העברתי אותך כעת לסוכן ה-AI החי של **IR_Aoutomations** המופעל על ידי Gemini 🤖\n\nשאל אותי כל שאלה לגבי המערכות שלך, רעיונות לאוטומציה, או איך נוכל לייעל את העסק שלך!`);
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
