import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { db } from './db';

// Pricing configuration maps matching PricingCalculator.jsx
const WEBSITE_TYPES = {
    landing: { name: 'דף נחיתה / כרטיס ביקור דיגיטלי', price: 2500 },
    image: { name: 'אתר תדמיתי מרובה עמודים', price: 5000 },
    ecommerce: { name: 'אתר חנות / איקומרס', price: 8000 },
    custom: { name: 'אתר פורטל / מערכת מותאמת אישית', price: 12000 }
};

const WEBSITE_ADDONS = {
    chatbot: { name: "צ'אטבוט AI מוטמע (Gemini)", price: 3000, monthly: 250 },
    calculator: { name: 'מחשבון ROI דינמי', price: 1500, monthly: 0 },
    survey: { name: 'שאלון אפיון מרובה שלבים', price: 2000, monthly: 0 },
    crm: { name: 'חיבור ל-CRM של העסק', price: 1000, monthly: 0 }
};

const WEBSITE_SLA = {
    basic: { name: 'אחסון ותחזוקה בסיסית', price: 150 },
    extended: { name: 'אחסון, תחזוקה ועדכוני תוכן', price: 300 },
    premium: { name: 'תמיכה מהירה ושינויים שוטפים', price: 600 }
};

const SLA_PACKAGES = {
    standard: { name: 'Standard', limit: 1000, price: 400 },
    premium: { name: 'Premium', limit: 5000, price: 1000 },
    enterprise: { name: 'Enterprise', limit: 20000, price: 3000 }
};

/**
 * Parses raw specification text and pricing into structured JSON data using Gemini API
 */
export async function parseSpecWithAI(rawSpec, setupCost, clientData) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        throw new Error('אנא הגדר מפתח API של Gemini בהגדרות ה-CRM כדי להשתמש במחולל המסמכים.');
    }

    const prompt = `
האפיון הטכנולוגי והעסקי הבא הוסכם עם הלקוח.
המטרה שלך היא לנתח אותו ולפרק למבנה נתונים מובנה בפורמט JSON בלבד בעברית.

פרטי הלקוח הידועים:
- איש קשר: ${clientData.name || 'לקוח'}
- שם עסק/חברה: ${clientData.company || 'הלקוח'}
- טלפון: ${clientData.phone || ''}
- אימייל: ${clientData.email || ''}

טקסט האפיון הגולמי:
"""
${rawSpec}
"""

עלות ההקמה שהוזנה: ${setupCost} ₪

עליך להפיק אובייקט JSON המכיל בדיוק את השדות הבאים (בשפה העברית למעט שמות השדות באנגלית):
{
  "business_name": "שם העסק/החברה כפי שעולה מהאפיון או מפרטי הלקוח",
  "contact_name": "שם איש הקשר",
  "components": [
    {
      "id": 1,
      "name": "שם רכיב/אוטומציה קצר ומקצועי (למשל: בוט מענה ראשוני חכם בוואטסאפ)",
      "description": "תיאור קצר ומקצועי בעברית של מטרת הרכיב ואיך הוא פותר את הבעיה ללקוח",
      "systems": ["רשימת מערכות מקושרות, למשל: WhatsApp, n8n, Supabase, Gemini"],
      "trigger": "תיאור קצר של הטריגר של האוטומציה",
      "flow": [
        "שלב 1 בזרימה",
        "שלב 2 בזרימה",
        "שלב 3 בזרימה"
      ],
      "estimated_runs_monthly": 500
    }
  ],
  "executions_summary": {
    "total_monthly_executions": 2200,
    "explanation": "הסבר מתמטי פשוט המחשב איך הגענו לסך הכל הריצות, למשל: מענה ראשוני: 10 פניות ביום * 2.5 שלבים = 750 ריצות; בוט הצעות מחיר: 800 ריצות וכו'."
  },
  "third_party_costs": [
    {
      "name": "שם השירות (למשל: WhatsApp Business API (Meta))",
      "estimated_cost": "הערכת עלות, למשל: כ-0.15 ₪ לשיחה",
      "explanation": "הסבר קצר על אופן החיוב"
    }
  ],
  "timeline": [
    {
      "phase": 1,
      "name": "איסוף חומרים, אפיון טכני וקבלת גישות",
      "days": 5
    },
    {
      "phase": 2,
      "name": "פיתוח מערך האוטומציות, אינטגרציות ובדיקות QA",
      "days": 14
    },
    {
      "phase": 3,
      "name": "הרצת פיילוט (UAT) ומסירה רשמית ללקוח",
      "days": 5
    }
  ]
}

הפלט חייב להיות אובייקט JSON תקין בלבד! אל תעטוף אותו ב-markdown (ללא \`\`\`json) ואל תוסיף שום טקסט לפני או אחרי.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        throw new Error(`שגיאה בפנייה ל-Gemini API: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
        throw new Error('לא התקבלה תשובה מ-Gemini API.');
    }

    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error('Error parsing JSON from Gemini response:', textResponse);
        throw new Error('התשובה מ-Gemini לא התקבלה במבנה JSON תקין. נסה שנית.');
    }
}

/**
 * Shared stylesheet for document styling
 */
const documentStyle = `
<style>
    .pdf-page {
        width: 794px;
        height: 1122px;
        box-sizing: border-box;
        padding: 50px 55px;
        position: relative;
        background-color: #ffffff !important;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        direction: rtl;
        text-align: right;
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.4;
        color: #0f172a !important;
        font-size: 11px;
    }
    
    /* Header Banner styling */
    .header-banner {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%) !important;
        padding: 16px 24px;
        margin: -50px -55px 25px -55px; /* Offset parent padding */
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #ffffff !important;
    }
    .header-logo {
        font-weight: 800;
        font-size: 15px;
        letter-spacing: 0.5px;
    }
    .header-title {
        font-weight: 700;
        font-size: 14px;
        opacity: 0.95;
    }
    
    /* Document elements */
    h1, h2, h3, h4 {
        color: #1e3a8a !important;
        margin-top: 0;
        margin-bottom: 8px;
    }
    h2 {
        font-size: 14.5px;
        font-weight: 700;
        border-bottom: 1.5px solid #e2e8f0 !important;
        padding-bottom: 4px;
        margin-top: 14px;
        color: #2563eb !important;
    }
    h3 {
        font-size: 12px;
        font-weight: 600;
        color: #1e3a8a !important;
        margin-bottom: 5px;
    }
    p, li, span:not([class]) {
        font-size: 11px;
        color: #334155 !important;
        margin-top: 0;
        margin-bottom: 5px;
    }
    
    /* Premium components cards */
    .comp-card {
        margin-bottom: 10px;
        padding: 8px 12px;
        background: #fafafa !important;
        border: 1px solid #f1f5f9 !important;
        border-right: 4px solid #6366f1 !important;
        border-radius: 6px;
    }
    
    /* Flex list RTL */
    .flex-list-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 5px;
    }
    .flex-list-num {
        color: #6366f1 !important;
        font-weight: bold;
        min-width: 22px;
        margin-left: 4px;
        font-size: 11px;
    }
    .flex-list-bullet {
        color: #6366f1 !important;
        font-weight: bold;
        margin-left: 6px;
        font-size: 11px;
    }
    
    /* Tables */
    table.data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
    }
    table.data-table th, table.data-table td {
        border: 1px solid #cbd5e1 !important;
        padding: 6px 10px;
        font-size: 10.5px;
        text-align: right;
        color: #0f172a !important;
        background-color: transparent !important;
    }
    table.data-table th {
        background-color: #eff6ff !important;
        color: #1e3a8a !important;
        font-weight: 700;
    }
    table.data-table tr.total-row td {
        font-weight: bold;
        background-color: #f1f5f9 !important;
    }
    
    .alert-box {
        background-color: #fef3c7 !important;
        border-right: 4px solid #d97706 !important;
        padding: 8px 12px;
        margin: 10px 0;
        border-radius: 4px;
    }
    .alert-box-title {
        font-weight: bold;
        color: #b45309 !important;
        font-size: 11px;
        margin-bottom: 4px;
    }
    
    /* Footer */
    .footer-note {
        position: absolute;
        bottom: 25px;
        left: 55px;
        right: 55px;
        font-size: 9px;
        color: #94a3b8 !important;
        text-align: center;
        border-top: 1px solid #f1f5f9 !important;
        padding-top: 6px;
    }
    
    /* Signature Section */
    .signature-section {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        gap: 30px;
    }
    .signature-box {
        flex: 1;
        border: 1px solid #e2e8f0 !important;
        border-radius: 6px;
        padding: 10px;
        background: #fafafa !important;
    }
    .signature-title {
        font-weight: bold;
        font-size: 11px;
        border-bottom: 1px solid #e2e8f0 !important;
        padding-bottom: 4px;
        margin-bottom: 16px;
        color: #1e3a8a !important;
    }
    .signature-line {
        border-bottom: 1px dashed #94a3b8 !important;
        height: 16px;
        margin-bottom: 6px;
    }
    
    /* Digital Signature Badge styling */
    .digital-sig-badge {
        border: 1px solid #10b981 !important;
        background-color: #ecfdf5 !important;
        border-radius: 5px;
        padding: 5px 8px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
        direction: rtl;
    }
    .sig-status-icon {
        color: #10b981 !important;
        font-size: 14px;
        font-weight: bold;
        margin-left: 4px;
    }
    .sig-details {
        display: flex;
        flex-direction: column;
        gap: 1px;
    }
    .sig-text {
        font-family: 'Brush Script MT', 'Courier New', Georgia, cursive, serif;
        font-style: italic;
        color: #065f46 !important;
        font-size: 13px;
        font-weight: bold;
        margin: 0;
        line-height: 1.1;
    }
    .sig-meta {
        font-size: 8px;
        color: #047857 !important;
        margin: 0;
        line-height: 1.2;
    }
</style>
`;

/**
 * Builds the HTML content for the Proposal
 */
export function buildProposalHtml(data) {
    const includeAutomation = data.pricing?.include_automation !== false;
    const includeWebsite = !!data.pricing?.include_website;
    const isWebsiteOnly = includeWebsite && !includeAutomation;
    const isAutomationOnly = includeAutomation && !includeWebsite;
    const isBoth = includeAutomation && includeWebsite;

    let secNum = 1;

    const pilotDays = data.pricing?.pilot_days || 14;
    const hasAdvance = data.pricing?.has_advance !== false;
    const setupCost = data.pricing?.setup_cost || 0;

    let docTitle = 'הצעת מחיר לפרויקט אוטומציות ואתר אינטרנט';
    if (isWebsiteOnly) docTitle = 'הצעת מחיר לבניית אתר לעסק';
    else if (isAutomationOnly) docTitle = 'הצעת מחיר לפרויקט אוטומציה ו-AI';

    // 1. Build components sections
    let componentsHtml = '';

    if (includeAutomation && data.components && data.components.length > 0) {
        componentsHtml += `
            <div class="pdf-section">
                <h2>${secNum++}. פירוט רכיבי האוטומציה והבינה המלאכותית (AI)</h2>
                <p>להלן פירוט המערכות החכמות וזרימות העבודה המתוכננות עבור העסק שלכם:</p>
            </div>
        `;
        data.components.forEach((c, index) => {
            componentsHtml += `
                <div class="pdf-section">
                    <div class="comp-card">
                        <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                            <span>רכיב אוטומציה ${index + 1}: <bdi>${c.name}</bdi></span>
                        </h3>
                        <p style="margin-bottom: 4px;"><bdi>${c.description}</bdi></p>
                        <p style="margin-bottom: 4px; font-size: 10px;"><strong>Trigger (טריגר):</strong> <bdi>${c.trigger}</bdi></p>
                        <p style="margin-bottom: 4px; font-size: 10px;"><strong>מערכות:</strong> <bdi>${c.systems.join(', ')}</bdi></p>
                        <p style="margin-bottom: 2px; font-size: 10px;"><strong>תהליך זרימה מתוכנן:</strong></p>
                        <div style="padding-right: 5px;">
                            ${c.flow.map((step, sIdx) => `
                                <div class="flex-list-item">
                                    <span class="flex-list-num">${sIdx + 1}.</span>
                                    <span style="font-size: 10px;"><bdi>${step}</bdi></span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    if (includeWebsite) {
        const websiteTypeName = WEBSITE_TYPES[data.pricing.website_type]?.name || 'אתר אינטרנט';
        componentsHtml += `
            <div class="pdf-section">
                <h2>${secNum++}. פירוט פלטפורמת האתר ותתי-הרכיבים</h2>
                <div class="comp-card" style="border-right-color: #3b82f6;">
                    <h3>בניית אתר אינטרנט - ${websiteTypeName}</h3>
                    <p>עיצוב ופיתוח אתר מקצועי, מותאם אישית ומותאם למובייל, המשקף את מיתוג העסק ומיועד להמרת גולשים ללקוחות.</p>
                </div>
            </div>
        `;
        
        let addonIndex = 1;
        const addons = data.pricing.website_addons || data.pricing.addons || {};
        if (addons.chatbot) {
            componentsHtml += `
                <div class="pdf-section">
                    <div class="comp-card" style="border-right-color: #3b82f6;">
                        <h3>תוספת אתר ${addonIndex++}: צ'אטבוט AI מוטמע (Gemini)</h3>
                        <p>צ'אטבוט חכם מבוסס בינה מלאכותית של Google המוטמע באתר ומעניק מענה ללקוחות 24/7, אוסף לידים ומסנכרן אותם.</p>
                    </div>
                </div>
            `;
        }
        if (addons.calculator) {
            componentsHtml += `
                <div class="pdf-section">
                    <div class="comp-card" style="border-right-color: #3b82f6;">
                        <h3>תוספת אתר ${addonIndex++}: מחשבון ROI דינמי</h3>
                        <p>מחשבון אינטראקטיבי המאפשר למבקרים לחשב את החיסכון והרווח שלהם בעבודה איתכם, כלי חזק להגדלת אחוזי המרה.</p>
                    </div>
                </div>
            `;
        }
        if (addons.survey) {
            componentsHtml += `
                <div class="pdf-section">
                    <div class="comp-card" style="border-right-color: #3b82f6;">
                        <h3>תוספת אתר ${addonIndex++}: שאלון אפיון מרובה שלבים</h3>
                        <p>שאלון דינמי מרובה שלבים לאפיון צרכי הלקוח ואיסוף מידע מקיף ומדויק בצורה חווייתית.</p>
                    </div>
                </div>
            `;
        }
        if (addons.crm) {
            componentsHtml += `
                <div class="pdf-section">
                    <div class="comp-card" style="border-right-color: #3b82f6;">
                        <h3>תוספת אתר ${addonIndex++}: חיבור למערכת CRM של העסק</h3>
                        <p>אינטגרציה מלאה של טפסי האתר והצ'אטבוט ישירות למערכת ניהול הלקוחות של העסק לשליטה ומעקב.</p>
                    </div>
                </div>
            `;
        }
    }

    // 2. Build pricing rows
    let pricingRowsHtml = '';
    let totalSetup = 0;
    let totalMonthly = 0;

    if (includeAutomation) {
        const autoSetup = data.pricing.automation_setup_price || 12500;
        const autoSlaKey = data.pricing.automation_sla || 'standard';
        const autoSlaInfo = SLA_PACKAGES[autoSlaKey] || { name: 'Standard', price: 400, limit: 1000 };
        
        totalSetup += autoSetup;
        totalMonthly += autoSlaInfo.price;

        pricingRowsHtml += `
            <tr>
                <td><strong>חבילת האוטומציות והבינה המלאכותית (AI)</strong><br><span style="font-size: 9.5px; color: #64748b;">פיתוח, אינטגרציה מלאה, בדיקות QA והדרכה.</span></td>
                <td style="text-align: left;">${autoSetup.toLocaleString('he-IL')} ₪</td>
                <td style="text-align: left;">₪ 0</td>
            </tr>
            <tr>
                <td><strong>ריטיינר ותחזוקת אוטומציות (SLA - ${autoSlaInfo.name})</strong><br><span style="font-size: 9.5px; color: #64748b;">שרת n8n מאובטח, ניטור שגיאות 24/7, עדכוני API ותמיכה שוטפת (עד ${autoSlaInfo.limit.toLocaleString('he-IL')} הרצות בחודש).</span></td>
                <td style="text-align: left;">כלול בהקמה</td>
                <td style="text-align: left;">${autoSlaInfo.price.toLocaleString('he-IL')} ₪ / חודש</td>
            </tr>
        `;
    }

    if (includeWebsite) {
        const baseType = data.pricing.website_type || 'landing';
        const baseInfo = WEBSITE_TYPES[baseType] || { name: 'בניית אתר אינטרנט', price: 2500 };
        const webSetup = data.pricing.website_setup_price || baseInfo.price;
        const webSlaKey = data.pricing.website_sla || 'basic';
        const webSlaInfo = WEBSITE_SLA[webSlaKey] || { name: 'אחסון ותחזוקה בסיסית', price: 150 };

        totalSetup += webSetup;
        totalMonthly += webSlaInfo.price;

        pricingRowsHtml += `
            <tr>
                <td><strong>בניית פלטפורמת האתר (${baseInfo.name})</strong><br><span style="font-size: 9.5px; color: #64748b;">עיצוב ייחודי, מותאם מובייל וחיבור טפסים.</span></td>
                <td style="text-align: left;">${webSetup.toLocaleString('he-IL')} ₪</td>
                <td style="text-align: left;">₪ 0</td>
            </tr>
        `;

        const addons = data.pricing.website_addons || data.pricing.addons || {};
        if (addons.chatbot) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת אתר: צ'אטבוט AI מוטמע (Gemini)</strong><br><span style="font-size: 9.5px; color: #64748b;">פיתוח בוט וחיבורו לאתר כולל שימוש במודל.</span></td>
                    <td style="text-align: left;">3,000 ₪</td>
                    <td style="text-align: left;">250 ₪ / חודש</td>
                </tr>
            `;
            totalSetup += 3000;
            totalMonthly += 250;
        }
        if (addons.calculator) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת אתר: מחשבון ROI דינמי</strong><br><span style="font-size: 9.5px; color: #64748b;">מנגנון מחשבון רווח מעוצב מבוסס קליינט.</span></td>
                    <td style="text-align: left;">1,500 ₪</td>
                    <td style="text-align: left;">₪ 0</td>
                </tr>
            `;
            totalSetup += 1500;
        }
        if (addons.survey) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת אתר: שאלון אפיון מרובה שלבים</strong><br><span style="font-size: 9.5px; color: #64748b;">טופס שאלון דינמי מרובה שלבים להזרמת לידים.</span></td>
                    <td style="text-align: left;">2,000 ₪</td>
                    <td style="text-align: left;">₪ 0</td>
                </tr>
            `;
            totalSetup += 2000;
        }
        if (addons.crm) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת אתר: חיבור למערכת CRM</strong><br><span style="font-size: 9.5px; color: #64748b;">אינטגרציה וסנכרון לידים מהאתר ישירות ל-CRM.</span></td>
                    <td style="text-align: left;">1,000 ₪</td>
                    <td style="text-align: left;">₪ 0</td>
                </tr>
            `;
            totalSetup += 1000;
        }

        pricingRowsHtml += `
            <tr>
                <td><strong>אחסון ותחזוקת אתר (SLA - ${webSlaInfo.name})</strong><br><span style="font-size: 9.5px; color: #64748b;">שרת אחסון מהיר, תעודת אבטחה SSL, גיבויים שוטפים ותמיכה.</span></td>
                <td style="text-align: left;">כלול בהקמה</td>
                <td style="text-align: left;">${webSlaInfo.price.toLocaleString('he-IL')} ₪ / חודש</td>
            </tr>
        `;
    }

    // 3. Build third-party costs html
    let thirdPartyHtml = '';
    const autoThird = includeAutomation ? parseFloat(data.pricing.automation_third_party || 0) : 0;
    const webThird = includeWebsite ? parseFloat(data.pricing.website_third_party || 0) : 0;
    const totalThird = autoThird + webThird;

    if (totalThird > 0 || (data.third_party_costs && data.third_party_costs.length > 0)) {
        let rows = '';
        if (data.third_party_costs && data.third_party_costs.length > 0) {
            data.third_party_costs.forEach(c => {
                rows += `
                    <tr>
                        <td><strong>${c.name}</strong></td>
                        <td>${c.estimated_cost}</td>
                        <td>${c.explanation}</td>
                    </tr>
                `;
            });
        } else {
            if (autoThird > 0) {
                rows += `
                    <tr>
                        <td><strong>עלויות צד ג' (אוטומציות)</strong><br><span style="font-size: 9px; color: #64748b;">OpenAI/Gemini tokens, רשיונות Make/n8n.</span></td>
                        <td>₪ ${autoThird} / חודש</td>
                        <td>בהתאם לצריכה בפועל בפרויקט.</td>
                    </tr>
                `;
            }
            if (webThird > 0) {
                rows += `
                    <tr>
                        <td><strong>עלויות צד ג' (אתר)</strong><br><span style="font-size: 9px; color: #64748b;">דומיין, Gemini API, שרתים מיוחדים.</span></td>
                        <td>₪ ${webThird} / חודש</td>
                        <td>בהתאם לצריכה בפועל באתר.</td>
                    </tr>
                `;
            }
        }
        thirdPartyHtml = `
            <div class="pdf-section">
                <h2>6. הערכת עלויות צד ג' חודשיות (משולמות ישירות לספקים)</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>שם שירות צד ג'</th>
                            <th width="35%">עלות משוערת חודשית</th>
                            <th>הסבר ואופן חיוב</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 4. Payment terms
    let paymentTermsHtml = '';
    if (hasAdvance) {
        paymentTermsHtml = `
            <div class="flex-list-item">
                <span class="flex-list-bullet">•</span>
                <span><strong>מקדמה לתחילת עבודה:</strong> ${data.pricing.advance_payment.toLocaleString('he-IL')} ₪ + מע"מ בלבד (משולם עם חתימת ההסכם לצורך התחלת עבודה, אפיון מפורט וקבלת גישות).</span>
            </div>
            <div class="flex-list-item">
                <span class="flex-list-bullet">•</span>
                <span><strong>יתרת תשלום סוגרת:</strong> ${data.pricing.final_payment.toLocaleString('he-IL')} ₪ + מע"מ (<strong>ישולמו רק לאחר ${pilotDays} ימים של הרצה מלאה ותקינה של המערכות באוויר (פיילוט פעיל), ורק לאחר שביעות רצון מלאה של הלקוח מהתוצאות המעשיות!</strong>).</span>
            </div>
        `;
    } else {
        paymentTermsHtml = `
            <div class="flex-list-item">
                <span class="flex-list-bullet">•</span>
                <span><strong>תשלום סופי ומלא:</strong> ${setupCost.toLocaleString('he-IL')} ₪ + מע"מ (<strong>ישולם במלואו רק לאחר ${pilotDays} ימים של הרצה מלאה ותקינה של המערכות באוויר (פיילוט פעיל), ורק לאחר שביעות רצון מלאה של הלקוח מהתוצאות המעשיות והסדר שנוצר בעסק!</strong>).</span>
            </div>
        `;
    }

    const totalExecutions = data.executions_summary?.total_monthly_executions.toLocaleString('he-IL') || '2,200';

    let executionsSectionHtml = '';
    if (includeAutomation) {
        executionsSectionHtml = `
            <div class="pdf-section">
                <h2>${secNum++}. ניתוח והערכת נפח הרצות (Executions) חודשי לעסק</h2>
                <div style="margin-bottom: 10px;">
                    <div class="flex-list-item">
                        <span class="flex-list-bullet">•</span>
                        <span><strong>סה"כ צפי חודשי לעסק:</strong> כ-${totalExecutions} הרצות בחודש.</span>
                    </div>
                    <div class="flex-list-item" style="margin-top: 4px;">
                        <span class="flex-list-bullet">•</span>
                        <span><strong>פירוט מתמטי של החישוב:</strong> ${data.executions_summary?.explanation || 'חישוב מפורט מבוסס רכיבים.'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    let slaPackagesHtml = '';
    if (includeAutomation || includeWebsite) {
        let automationTableHtml = '';
        if (includeAutomation) {
            const recomAutoPkg = (data.recommendations?.automation_package || 'Standard').trim();
            automationTableHtml = `
                <div style="margin-top: 10px; margin-bottom: 12px;">
                    <h3 style="color: #2563eb; margin-bottom: 6px;">מסלולי SLA - תחזוקת אוטומציות ושרת</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th width="20%">חבילה</th>
                                <th width="30%">נפח ריצות כלול</th>
                                <th width="20%">עלות חודשית</th>
                                <th>תיאור השירות ומענה לתקלות</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr ${recomAutoPkg.toLowerCase() === 'standard' ? 'style="background-color: #ecfdf5; font-weight: bold; border: 2px solid #10b981;"' : ''}>
                                <td><strong>Standard ${recomAutoPkg.toLowerCase() === 'standard' ? '⭐' : ''}</strong></td>
                                <td>עד 1,000 הרצות / חודש</td>
                                <td>400 ₪ / חודש</td>
                                <td>אירוח שרת, ניטור תקינות, עדכוני API בסיסיים ומענה לתקלות תוך 48 שעות.</td>
                            </tr>
                            <tr ${recomAutoPkg.toLowerCase() === 'premium' ? 'style="background-color: #ecfdf5; font-weight: bold; border: 2px solid #10b981;"' : ''}>
                                <td><strong>Premium ${recomAutoPkg.toLowerCase() === 'premium' ? '⭐' : ''}</strong></td>
                                <td>עד 5,000 הרצות / חודש</td>
                                <td>1,000 ₪ / חודש</td>
                                <td>אירוח שרת משודרג, ניטור יציבות אקטיבי, מענה לתקלות תוך 24 שעות ותעדוף בשינויים.</td>
                            </tr>
                            <tr ${recomAutoPkg.toLowerCase() === 'enterprise' ? 'style="background-color: #ecfdf5; font-weight: bold; border: 2px solid #10b981;"' : ''}>
                                <td><strong>Enterprise ${recomAutoPkg.toLowerCase() === 'enterprise' ? '⭐' : ''}</strong></td>
                                <td>עד 20,000 הרצות / חודש</td>
                                <td>3,000 ₪ / חודש</td>
                                <td>שרת ייעודי, ניטור שגיאות 24/7 מנוהל, תעדוף עליון ומענה לתקלות קריטיות תוך 4-8 שעות.</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="alert-box" style="background-color: #ecfdf5; border-right: 4px solid #10b981; color: #065f46; padding: 6px 10px; margin-top: 6px;">
                        <div style="font-weight: bold; color: #047857; font-size: 10.5px; margin-bottom: 2px;">🤖 המלצת ה-AI לחבילת אוטומציה: <bdi>${data.recommendations?.automation_package || 'Standard'}</bdi></div>
                        <p style="margin: 0; font-size: 10px; color: #065f46; line-height: 1.3;"><bdi>${data.recommendations?.automation_reason || 'בהתאם לצפי השימוש ומורכבות הרכיבים בפרויקט.'}</bdi></p>
                    </div>
                </div>
            `;
        }

        let websiteTableHtml = '';
        if (includeWebsite) {
            const recomWebPkg = (data.recommendations?.website_package || 'Basic').trim();
            websiteTableHtml = `
                <div style="margin-top: 10px; margin-bottom: 12px;">
                    <h3 style="color: #2563eb; margin-bottom: 6px;">מסלולי SLA - אחסון ותחזוקת אתר אינטרנט</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th width="20%">חבילה</th>
                                <th width="30%">שעות עדכונים / חודש</th>
                                <th width="20%">עלות חודשית</th>
                                <th>תיאור השירות ורמת התמיכה</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr ${recomWebPkg.toLowerCase() === 'basic' ? 'style="background-color: #ecfdf5; font-weight: bold; border: 2px solid #10b981;"' : ''}>
                                <td><strong>Basic ${recomWebPkg.toLowerCase() === 'basic' ? '⭐' : ''}</strong></td>
                                <td>ללא עדכוני קוד ידניים</td>
                                <td>150 ₪ / חודש</td>
                                <td>אחסון שרת מהיר ומאובטח, גיבויים שבועיים, תעודת אבטחה SSL ותחזוקת שרת שוטפת.</td>
                            </tr>
                            <tr ${recomWebPkg.toLowerCase() === 'extended' ? 'style="background-color: #ecfdf5; font-weight: bold; border: 2px solid #10b981;"' : ''}>
                                <td><strong>Extended ${recomWebPkg.toLowerCase() === 'extended' ? '⭐' : ''}</strong></td>
                                <td>עד 2 שעות עדכוני תוכן</td>
                                <td>300 ₪ / חודש</td>
                                <td>כולל חבילת Basic + העלאת פוסטים/תמונות/מוצרים חדשים ושינויי עיצוב קלים מדי חודש.</td>
                            </tr>
                            <tr ${recomWebPkg.toLowerCase() === 'premium' ? 'style="background-color: #ecfdf5; font-weight: bold; border: 2px solid #10b981;"' : ''}>
                                <td><strong>Premium ${recomWebPkg.toLowerCase() === 'premium' ? '⭐' : ''}</strong></td>
                                <td>תמיכה מהירה ועדכונים</td>
                                <td>600 ₪ / חודש</td>
                                <td>כולל חבילת Extended + תמיכה טלפונית בעדיפות גבוהה, פיתוח שיפורים קטנים וזמן תגובה מהיר.</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="alert-box" style="background-color: #ecfdf5; border-right: 4px solid #10b981; color: #065f46; padding: 6px 10px; margin-top: 6px;">
                        <div style="font-weight: bold; color: #047857; font-size: 10.5px; margin-bottom: 2px;">🤖 המלצת ה-AI לחבילת אתר: <bdi>${data.recommendations?.website_package || 'Basic'}</bdi></div>
                        <p style="margin: 0; font-size: 10px; color: #065f46; line-height: 1.3;"><bdi>${data.recommendations?.website_reason || 'בהתאם לרמת הפעילות הנדרשת ועדכוני התוכן המשוערים.'}</bdi></p>
                    </div>
                </div>
            `;
        }

        slaPackagesHtml = `
            <div class="pdf-section">
                <h2>${secNum++}. פירוט מסלולי שירות (SLA) והמלצות מערכת AI</h2>
                <p>להלן פירוט מסלולי הריטיינר והתחזוקה המוצעים עבור הפרויקט. מערכת הבינה המלאכותית ביצעה ניתוח של נפח הפניות וריצות האוטומציה הצפויות לעסק, והדגישה את החבילה המומלצת בעבורכם בסימן כוכב (⭐) ורקע ירוק. ההחלטה הסופית באיזה מסלול לבחור נתונה לשיקול דעתכם המלא:</p>
                ${automationTableHtml}
                ${websiteTableHtml}
            </div>
        `;
    }

    return `
        <div class="proposal-container">
            ${documentStyle}
            
            <div class="pdf-header-template" style="display:none;">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">${docTitle}</span>
                </div>
            </div>
            
            <div class="pdf-footer-template" style="display:none;">
                <div class="footer-note">
                    <span>עמוד <span class="pdf-page-num"></span> מתוך <span class="pdf-total-pages"></span> | autoRI-studio הצעת מחיר עבור <bdi>${data.business_name}</bdi></span>
                </div>
            </div>
            
            <!-- SECTION 1: Client details -->
            <div class="pdf-section">
                <h2>${secNum++}. פרטי ההצעה והלקוח</h2>
                <table class="data-table">
                    <tr>
                        <th width="35%">עבור לקוח / חברה:</th>
                        <td><strong><bdi>${data.business_name}</bdi></strong> (<bdi>${data.contact_name}</bdi>)</td>
                    </tr>
                    <tr>
                        <th>תאריך הפקה:</th>
                        <td>${new Date().toLocaleDateString('he-IL')}</td>
                    </tr>
                    <tr>
                        <th>תוקף ההצעה:</th>
                        <td>30 ימים (בתוקף עד: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')})</td>
                    </tr>
                    <tr>
                        <th>מנהלי פרויקט מטעם autoRI-studio:</th>
                        <td>רון ועילי</td>
                    </tr>
                </table>
            </div>
            
            <!-- SECTION 2: Exec Summary -->
            <div class="pdf-section">
                <h2>${secNum++}. תקציר מנהלים ומטרות העל</h2>
                <p>מטרת-העל של פרויקט זה היא לייצר לעסק שלך סדר מוחלט בעיניים, לחסוך לך שעות יקרות של עבודה ידנית יומיומית, ולהעלות משמעותית את אחוז סגירת העסקאות בעסק - הכל בצורה אוטומטית שרצה מאחורי הקלעים בזמן שאתה ממוקד בליבת הפעילות השוטפת.</p>
                <p>באמצעות שילוב של מערכות ניהול מתקדמות, כלי בינה מלאכותית (AI) וחיבור לערוצי התקשורת והרשתות החברתיות, נבנה עבורך מערך דיגיטלי חכם שיעבוד בשבילך 24/7.</p>
            </div>
            
            <!-- SECTION 3: Components Details -->
            ${componentsHtml}
            
            <!-- SECTION 4: Pricing Table -->
            <div class="pdf-section">
                <h2>${secNum++}. תמחור ועלויות פיתוח והקמה</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>תיאור השירות / רכיב בפרויקט</th>
                            <th width="25%" style="text-align: left;">עלות הקמה חד-פעמית</th>
                            <th width="25%" style="text-align: left;">ריטיינר חודשי לתחזוקה ושרת</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pricingRowsHtml}
                        <tr class="total-row">
                            <td>סה"כ פרויקט והקמה (ללא מע"מ):</td>
                            <td style="text-align: left;">${totalSetup.toLocaleString('he-IL')} ₪</td>
                            <td style="text-align: left;">${(totalMonthly + totalThird).toLocaleString('he-IL')} ₪ / חודש</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="alert-box">
                    <div class="alert-box-title">⚙️ שקט תעשייתי ומערכות יציבות 24/7</div>
                    <p style="margin: 0; font-size: 10px; line-height: 1.35;">המערכות הדיגיטליות והאתר שלכם הם המנוע השקט שמייצר לכם כסף. הריטיינר החודשי מבטיח יציבות מלאה וכולל: אירוח בשרתים פרטיים ייעודיים (Dedicated Cloud Hosting), ניטור שגיאות אקטיבי 24/7, ותחזוקת קוד שוטפת מול שינויי API של מטא, גוגל וספקי צד ג' כדי שהמערכת לעולם לא תישבר.</p>
                </div>
            </div>
            
            <!-- SECTION 5: Executions -->
            ${executionsSectionHtml}
            
            <!-- SECTION 6: SLA Packages & Recommendations -->
            ${slaPackagesHtml}
            
            <!-- SECTION 7: Third Party Costs -->
            ${thirdPartyHtml}
            
            <!-- SECTION 8: Payment Terms -->
            <div class="pdf-section">
                <h2>${secNum++}. תנאי תשלום ומדיניות שביעות רצון (Satisfaction Guarantee)</h2>
                <div style="margin-bottom: 10px;">
                    ${paymentTermsHtml}
                    <div class="flex-list-item" style="margin-top: 4px;">
                        <span class="flex-list-bullet">•</span>
                        <span><strong>עבודות מחוץ להיקף:</strong> כל שינוי או תוספת יתומחרו בנפרד לפי תעריף פיתוח שעתי של ${data.pricing.hourly_rate || 230} ₪ + מע"מ לשעה.</span>
                    </div>
                </div>
            </div>
            
            <!-- SECTION 9: Timeline -->
            <div class="pdf-section">
                <h2>${secNum++}. לוחות זמנים משוערים להקמה</h2>
                <div style="margin-bottom: 10px;">
                    ${data.timeline.map((t, index) => `
                        <div class="flex-list-item">
                            <span class="flex-list-num">${index + 1}.</span>
                            <span><strong>שלב <bdi>${t.name}</bdi>:</strong> כ-${t.days} ימי עסקים.</span>
                        </div>
                    `).join('')}
                </div>
                <p style="font-size: 10px; font-style: italic;">* סה"כ זמן משוער לעלייה מלאה לאוויר: כ-27 ימי עסקים ממועד קבלת המקדמה והגישות (נשאף לקצר ככל הניתן).</p>
            </div>
            
            <!-- SECTION 10: Signatures -->
            <div class="pdf-section">
                <div class="signature-section" style="margin-top: 15px;">
                    <div class="signature-box">
                        <div class="signature-title">מטעם autoRI-studio (הספק)</div>
                        <p style="font-size: 10px; margin-bottom: 8px;">נציגים: רון ועילי</p>
                        <div class="signature-line"></div>
                        <p style="font-size: 9px; margin: 0; color: #64748b;">חתימה וחותמת</p>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">מטעם הלקוח (המזמין)</div>
                        <p style="font-size: 10px; margin-bottom: 8px;">שם הנציג: _________________</p>
                        <div class="signature-line"></div>
                        <p style="font-size: 9px; margin: 0; color: #64748b;">חתימה וחותמת</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}


export function buildContractHtml(data) {
    const includeAutomation = data.pricing?.include_automation !== false;
    const includeWebsite = !!data.pricing?.include_website;
    const isWebsiteOnly = includeWebsite && !includeAutomation;
    const isAutomationOnly = includeAutomation && !includeWebsite;
    const isBoth = includeAutomation && includeWebsite;

    const pilotDays = data.pricing?.pilot_days || 14;
    const hasAdvance = data.pricing?.has_advance !== false;
    const setupCost = data.pricing?.setup_cost || 0;

    let docTitle = 'הסכם פיתוח, הקמה ותחזוקת מערכות';
    if (isWebsiteOnly) docTitle = 'הסכם פיתוח ותחזוקת אתר';
    else if (isAutomationOnly) docTitle = 'הסכם פיתוח והקמת מערכות אוטומציה';

    let componentsListHtml = '';
    let compIdx = 1;

    if (includeAutomation && data.components && data.components.length > 0) {
        data.components.forEach((c) => {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIdx++}.</span>
                    <span><strong><bdi>${c.name}</bdi> (אוטומציה):</strong> <bdi>${c.description}</bdi> (מערכות: <bdi>${c.systems.join(', ')}</bdi>).</span>
                </div>
            `;
        });
    }

    if (includeWebsite) {
        const websiteTypeName = WEBSITE_TYPES[data.pricing.website_type]?.name || 'אתר אינטרנט';
        componentsListHtml += `
            <div class="flex-list-item">
                <span class="flex-list-num">${compIdx++}.</span>
                <span><strong>בניית אתר אינטרנט (${websiteTypeName}):</strong> פיתוח פלטפורמה, עיצוב מותאם מובייל.</span>
            </div>
        `;
        const addons = data.pricing.website_addons || data.pricing.addons || {};
        if (addons.chatbot) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIdx++}.</span>
                    <span><strong>צ'אטבוט AI מוטמע (Gemini):</strong> חיבור מענה ללקוחות.</span>
                </div>
            `;
        }
        if (addons.calculator) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIdx++}.</span>
                    <span><strong>מחשבון ROI דינמי:</strong> מחשבון הערכת רווח ועלויות.</span>
                </div>
            `;
        }
        if (addons.survey) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIdx++}.</span>
                    <span><strong>שאלון אפיון מרובה שלבים:</strong> שאלון דינמי מרובה שלבים לאיסוף מידע.</span>
                </div>
            `;
        }
        if (addons.crm) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIdx++}.</span>
                    <span><strong>חיבור למערכת CRM:</strong> סנכרון וניהול לקוחות.</span>
                </div>
            `;
        }
    }

    // Retainer explanations
    let retainerHtml = '';
    
    if (includeAutomation) {
        const autoSlaKey = data.pricing.automation_sla || 'standard';
        const autoSlaInfo = SLA_PACKAGES[autoSlaKey] || { name: 'Standard', price: 400, limit: 1000 };
        const autoThird = parseFloat(data.pricing.automation_third_party || 0);
        const bonusRuns = data.pricing?.bonus_runs || 0;

        let limitText = `עד ${autoSlaInfo.limit.toLocaleString('he-IL')} הרצות בחודש`;
        if (bonusRuns > 0) {
            limitText = `עד ${autoSlaInfo.limit.toLocaleString('he-IL')} הרצות בחודש ובתוספת הטבה מיוחדת של ${bonusRuns.toLocaleString('he-IL')} הרצות בונוס חודשיות נוספות ללא עלות (סה"כ ${(autoSlaInfo.limit + bonusRuns).toLocaleString('he-IL')} הרצות בחודש)`;
        }

        retainerHtml += `
            <div style="margin-bottom: 8px;">
                <strong>א. תחזוקת אוטומציות ושרת (SLA - ${autoSlaInfo.name}):</strong>
                <p style="margin: 3px 0 0 0; font-size: 10.5px;">עבור אירוח המערכות בשרת n8n פרטי ומאובטח, ניטור אקטיבי של שגיאות 24/7, עדכוני API ותמיכה שוטפת, ישלם הלקוח סך של <strong>${autoSlaInfo.price.toLocaleString('he-IL')} ₪ + מע"מ לחודש</strong> (כולל ${limitText}). חריגה מעבר למכסה זו תחוייב בעלות של 0.20 ₪ לכל ריצה נוספת.</p>
                ${autoThird > 0 ? `<p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">* עלויות צד ג' צפויות (OpenAI, מנויים וכדומה): כ-₪${autoThird} בחודש (משולם ישירות לספקים/בפירוט הריטיינר).</p>` : ''}
            </div>
        `;
    }

    if (includeWebsite) {
        const webSlaKey = data.pricing.website_sla || 'basic';
        const webSlaInfo = WEBSITE_SLA[webSlaKey] || { name: 'אחסון ותחזוקה בסיסית', price: 150 };
        const webThird = parseFloat(data.pricing.website_third_party || 0);
        const addons = data.pricing.website_addons || data.pricing.addons || {};
        const hasChatbot = !!addons.chatbot;

        retainerHtml += `
            <div style="margin-bottom: 8px;">
                <strong>ב. אחסון ותחזוקת אתר (SLA - ${webSlaInfo.name}):</strong>
                <p style="margin: 3px 0 0 0; font-size: 10.5px;">עבור אירוח האתר בשרת מהיר ומאובטח, רישיון SSL, גיבויים, ניטור שוטף ותמיכה טכנית, ישלם הלקוח סך של <strong>${webSlaInfo.price.toLocaleString('he-IL')} ₪ + מע"מ לחודש</strong>.${hasChatbot ? ' הריטיינר כולל תוספת שוטפת עבור תחזוקת צ\'אטבוט ה-AI בסך 250 ₪ לחודש (סה"כ שוטף אתר: ' + (webSlaInfo.price + 250).toLocaleString('he-IL') + ' ₪).' : ''}</p>
                ${webThird > 0 ? `<p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">* עלויות שוטפות נוספות (שרתים, Gemini API): כ-₪${webThird} בחודש.</p>` : ''}
            </div>
        `;
    }

    // Payment milestones
    let paymentMilestonesHtml = '';
    if (hasAdvance) {
        paymentMilestonesHtml = `
            <div class="flex-list-item">
                <span class="flex-list-num">1.</span>
                <span><strong>תשלום ראשון (מקדמה):</strong> סך של <strong>${data.pricing.advance_payment.toLocaleString('he-IL')} ₪ + מע"מ בלבד</strong>, ישולם במעמד חתימת הסכם זה לצורך התחלת עבודה, תחילת האפיון המפורט וקבלת גישות למערכות.</span>
            </div>
            <div class="flex-list-item">
                <span class="flex-list-num">2.</span>
                <span><strong>תשלום שני (יתרת סגירה):</strong> סך של <strong>${data.pricing.final_payment.toLocaleString('he-IL')} ₪ + מע"מ</strong>, ישולם רק לאחר ${pilotDays} ימים של הרצה מלאה ותקינה של המערכות באוויר (פיילוט פעיל), <strong>ורק לאחר שביעות רצון מלאה של הלקוח מהתוצאות המעשיות ומהסדר שנוצר בעסק!</strong></span>
            </div>
        `;
    } else {
        paymentMilestonesHtml = `
            <div class="flex-list-item">
                <span class="flex-list-num">1.</span>
                <span><strong>תשלום סופי ומלא (לאחר פיילוט):</strong> סך של <strong>${setupCost.toLocaleString('he-IL')} ₪ + מע"מ</strong>, ישולם רק לאחר ${pilotDays} ימים של הרצה מלאה ותקינה של המערכות באוויר (פיילוט פעיל), <strong>ורק לאחר שביעות רצון מלאה של הלקוח מהתוצאות המעשיות ומהסדר שנוצר בעסק!</strong></span>
            </div>
        `;
    }

    return `
        <div class="contract-container">
            ${documentStyle}
            
            <div class="pdf-header-template" style="display:none;">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">${docTitle}</span>
                </div>
            </div>
            
            <div class="pdf-footer-template" style="display:none;">
                <div class="footer-note">
                    <span>עמוד <span class="pdf-page-num"></span> מתוך <span class="pdf-total-pages"></span> | autoRI-studio הסכם התקשרות עבור <bdi>${data.business_name}</bdi></span>
                </div>
            </div>
            
            <!-- SECTION 1: Header/Dates -->
            <div class="pdf-section">
                <p style="text-align: center; font-weight: 600; margin-bottom: 12px; font-size: 11.5px;">שנערך ונחתם ביום ${new Date().getDate()} בחודש ${new Date().toLocaleString('he-IL', { month: 'long' })} שנת ${new Date().getFullYear()}</p>
                
                <h2>בין הצדדים:</h2>
                <table class="data-table">
                    <tr>
                        <th width="35%">הספק (מפתח):</th>
                        <td><strong>autoRI-studio (רון ועילי)</strong><br>שותפות פיתוח פתרונות אינטגרציה</td>
                    </tr>
                    <tr>
                        <th>הלקוח (המזמין):</th>
                        <td><strong><bdi>${data.business_name}</bdi></strong> (<bdi>${data.contact_name}</bdi>)<br>ע.מ. / ח.פ.: ________________________</td>
                    </tr>
                </table>
            </div>

            <!-- SECTION 2: Whereas -->
            <div class="pdf-section">
                <p><strong>הואיל</strong> והספק עוסק בפיתוח, עיצוב, אינטגרציה ותחזוקה של אוטומציות עסקיות, כלי בינה מלאכותית, אתרי אינטרנט ובוטים עסקיים;</p>
                <p><strong>והואיל</strong> והלקוח מעוניין להסתייע בשירותי הספק לצורך בניית תשתית דיגיטלית חכמה, אוטומציות תקשורת ומכירות, דף נחיתה מעוצב ואיסוף נתונים (להלן: "הפרויקט"), כמפורט בהסכם זה;</p>
                <p><strong>לפיכך הוצהר, הותנה והוסכם בין הצדדים כדלקמן:</strong></p>
            </div>
            
            <!-- SECTION 3: Scope -->
            <div class="pdf-section">
                <h2>1. היקף השירותים והאפיון המוסכם</h2>
                <p>הספק יפתח, יעצב ויטמיע עבור הלקוח את הרכיבים הבאים, המהווים את גרעין הפרויקט והאפיון הטכנולוגי שלו:</p>
                <div style="margin-bottom: 10px;">
                    ${componentsListHtml}
                </div>
                <p>כל שינוי, תוספת או סטייה מהרכיבים המוגדרים מעלה יתומחרו בנפרד לפי תעריף פיתוח שעתי של ${data.pricing.hourly_rate || 230} ₪ + מע"מ לשעה (או לפי הצעת מחיר גלובלית וכתובה שתסוכם מראש).</p>
            </div>
            
            <!-- SECTION 4: Payments -->
            <div class="pdf-section">
                <h2>2. תמורה, אבני דרך ותנאי תשלום</h2>
                <h3>א. עלות הקמה ופיתוח חד-פעמית (חלוקה מבוססת שביעות רצון):</h3>
                <p>עבור אפיון, פיתוח, עיצוב והקמה של הרכיבים המפורטים לעיל, ישלם הלקוח לספק סך חד-פעמי של <strong>${setupCost.toLocaleString('he-IL')} ₪ + מע"מ כחוק</strong>. פריסת התשלומים תתבצע כדלקמן:</p>
                <div style="margin-bottom: 10px;">
                    ${paymentMilestonesHtml}
                </div>
            </div>

            <!-- SECTION 5: Retainer Details -->
            <div class="pdf-section">
                <h3>ב. ריטיינר חודשי לתחזוקה, שרת ותמיכה טכנית:</h3>
                <div style="margin-bottom: 10px;">
                    ${retainerHtml}
                </div>
                <h3>ג. עדכוני תוכן ידניים באתר ובתיק העבודות:</h3>
                <p>הריטיינר החודשי עוסק בתחזוקה טכנולוגית ותשתיתית בלבד. עדכוני תוכן ידניים יבוצעו בעלות קבועה של 300 ₪ + מע"מ עבור כל סבב עדכונים מבוקש (מכסה עד שעת עבודה אחת בפועל).</p>
                
                <h3>ד. ריבית פיגורים:</h3>
                <p>איחור בתשלום העולה על 14 ימים ממועד הפירעון המוסכם ישא ריבית פיגורים שבועית בשיעור של 1.5% מהסכום שבפיגור.</p>
            </div>
            
            <!-- SECTION 6: Intellectual Property -->
            <div class="pdf-section">
                <h2>3. קניין רוחני (Intellectual Property)</h2>
                <p>כל זכויות הקניין רוחני באוטומציות, במנגנונים ובאתר שהוקמו במיוחד עבור הלקוח, יעברו לבעלותו המלאה והבלעדית של הלקוח אך ורק לאחר פירעון מלא וסופי של כל התשלומים המגיעים לספק עבור שלב ההקמה.</p>
                <p>הספק שומר לעצמו את הזכות לעשות שימוש חוזר ברכיבי קוד גנריים, שיטות פיתוח ואינטגרציה, פונקציות עזר וארכיטקטורות זרימה שאינם מכילים מידע עסקי ספציפי או סודי של הלקוח.</p>
            </div>
            
            <!-- SECTION 7: Liability -->
            <div class="pdf-section">
                <h2>4. הגבלת אחריות (Limitation of Liability)</h2>
                <p>בשום מקרה ובשום נסיבות לא תעלה החבות הכוללת של הספק בגין כל נזק, הפסד, פגיעה או תביעה במסגרת הסכם זה, על הסכום הכולל ששולם בפועל על ידי הלקוח לספק עבור רכיב ההקמה הספציפי שגרם לנזק המדובר.</p>
                <p>הספק אינו אחראי בשום אופן לנזקים עקיפים, תוצאתיים, מיוחדים או נלווים, לרבות אובדן רווחים, אובדן עסקאות, הפרעות לפעילות העסקית, נפילות של שירותי צד ג' (כגון עדכוני מטא, תקלות ב-API WhatsApp, שינויים במדיניות LinkedIn או תקלות בשרתי OpenAI) או אובדן נתונים.</p>
            </div>
            
            <!-- SECTION 8: Validity -->
            <div class="pdf-section">
                <h2>5. תוקף, סיום ההסכם ומדיניות ביטולים</h2>
                <p>ההסכם יכנס לתוקפו עם חתימת שני הצדדים. הסכם התחזוקה והריטיינר החודשי הינו לתקופה של 12 חודשים ממועד ההפעלה, ויחודש אוטומטית לתקופות נוספות של שנה בכל פעם. כל צד רשאי לסיים את הסכם התחזוקה בכל עת מכל סיבה על ידי מתן הודעה בכתב לפחות 30 יום מראש.</p>
                
                <h2>6. שמירת סודיות (NDA)</h2>
                <p>הסכם שמירת סודיות (NDA) ייעודי שנחתם במקביל להסכם זה מהווה חלק בלתי נפרד ממנו.</p>
            </div>
            
            <!-- SECTION 9: Signatures -->
            <div class="pdf-section">
                <div class="signature-section" style="margin-top: 15px;">
                    <div class="signature-box">
                        <div class="signature-title">הספק: autoRI-studio</div>
                        <p style="font-size: 9px; margin-bottom: 4px;">שמות הנציגים: רון ועילי<br>תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="digital-sig-badge">
                            <span class="sig-status-icon">✓</span>
                            <div class="sig-details">
                                <div class="sig-text">autoRI-studio</div>
                                <div class="sig-meta">נחתם דיגיטלית מאובטח</div>
                                <div class="sig-meta">מזהה: SEC-SIG-84920A</div>
                                <div class="sig-meta">זמן: ${new Date().toLocaleString('he-IL')} | IP: 192.168.1.100</div>
                            </div>
                        </div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">הלקוח (המזמין): <bdi>${data.business_name}</bdi></div>
                        <p style="font-size: 9px; margin-bottom: 4px;">שם הנציג: <bdi>${data.contact_name}</bdi><br>תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="digital-sig-badge">
                            <span class="sig-status-icon">✓</span>
                            <div class="sig-details">
                                <div class="sig-text"><bdi>${data.contact_name || 'לקוח מורשה'}</bdi></div>
                                <div class="sig-meta">נחתם דיגיטלית מאובטח</div>
                                <div class="sig-meta">מזהה: SEC-SIG-71930B</div>
                                <div class="sig-meta">זמן: ${new Date().toLocaleString('he-IL')} | IP: 192.168.1.150</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


export function buildNdaHtml(data) {
    return `
        <div class="nda-container">
            ${documentStyle}
            
            <div class="pdf-header-template" style="display:none;">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">הסכם שמירת סודיות NDA</span>
                </div>
            </div>
            
            <div class="pdf-footer-template" style="display:none;">
                <div class="footer-note">
                    <span>עמוד <span class="pdf-page-num"></span> מתוך <span class="pdf-total-pages"></span> | autoRI-studio הסכם שמירת סודיות עבור <bdi>${data.business_name}</bdi></span>
                </div>
            </div>
            
            <!-- SECTION 1: Date/Parties -->
            <div class="pdf-section">
                <p style="text-align: center; font-weight: 600; margin-bottom: 12px; font-size: 11.5px;">שנערך ונחתם ביום ${new Date().getDate()} בחודש ${new Date().toLocaleString('he-IL', { month: 'long' })} שנת ${new Date().getFullYear()}</p>
                
                <h2>בין הצדדים:</h2>
                <table class="data-table">
                    <tr>
                        <th width="35%">הצד המוסר:</th>
                        <td><strong><bdi>${data.business_name}</bdi></strong> (<bdi>${data.contact_name}</bdi>)<br>ע.מ. / ח.פ.: ________________________</td>
                    </tr>
                    <tr>
                        <th>הצד המקבל:</th>
                        <td><strong>autoRI-studio (רון ועילי)</strong><br>שותפות פיתוח פתרונות אינטגרציה</td>
                    </tr>
                </table>
            </div>
            
            <!-- SECTION 2: Whereas -->
            <div class="pdf-section">
                <p><strong>הואיל</strong> והצד המוסר מעוניין להסתייע בשירותי הצד המקבל לצורך אפיון, בנייה, פיתוח, עיצוב ותחזוקה של אתר אינטרנט, תיק עבודות דינמי, מערכות אוטומציה, כלי AI ובוטים עסקיים (להלן: "הפרויקט");</p>
                <p><strong>והואיל</strong> ולשם ביצוע הפרויקט ואפיונו, עשוי הצד המוסר לחשוף בפני הצד המקבל מידע מסחרי, מקצועי ואישי רגיש ובעל ערך, והצדדים מעוניינים להסדיר את שמירתו ואבטחתו של מידע זה;</p>
                <p><strong>לפיכך הוצהר, הותנה והוסכם בין הצדדים כדלקמן:</strong></p>
            </div>
            
            <!-- SECTION 3: Definition of Confidential Info -->
            <div class="pdf-section">
                <h2>1. הגדרת "מידע סודי"</h2>
                <p>"מידע סודי" פירושו כל מידע עסקי, פיננסי, שיווקי, טכני, טכנולוגי, פרטי לקוחות של העסק, סיסמאות גישה למערכות, מפתחות API, שיטות עבודה, תהליכים פנימיים, נתוני פיתוח או תרשימי זרימה שיועברו בין הצדדים.</p>
            </div>
            
            <!-- SECTION 4: Commitments -->
            <div class="pdf-section">
                <h2>2. התחייבות לאי-גילוי ושימוש מוגבל</h2>
                <p>הצד המקבל (autoRI-studio) מתחייב לשמור על המידע הסודי בסודיות מוחלטת ולנקוט בכל האמצעים הסבירים והמקובלים בתעשייה על מנת למנוע חשיפתו לצד שלישי כלשהו, ולעשות שימוש במידע הסודי אך ורק לצורך מתן השירותים.</p>
            </div>
            
            <!-- SECTION 5: Deletion clause -->
            <div class="pdf-section">
                <h2>3. מחיקה והחזרת מידע בסיום פרויקט</h2>
                <div class="alert-box" style="background-color: #f0fdf4; border-right: 4px solid #16a34a; color: #14532d;">
                    <div class="alert-box-title" style="color: #166534;">🛡️ סעיף פינוי נתונים ואבטחה מוגברת:</div>
                    <p style="margin: 0; font-size: 10px; line-height: 1.35;">עם סיום ההתקשרות בין הצדדים, או עם קבלת דרישה מפורשת בכתב מהצד המוסר (<bdi>${data.business_name}</bdi>), מתחייב הצד המקבל למחוק לצמיתות או להחזיר לצד המוסר את כל העותקים הפיזיים והדיגיטליים של המידע הסודי שברשותו (פרטי גישה, סיסמאות, מפתחות API, בסיסי נתונים, רשימות תפוצה וכדומה) ולספק אישור בכתב המעיד על ביצוע המחיקה והטיהור תוך 14 ימי עסקים.</p>
                </div>
            </div>
            
            <!-- SECTION 6: Duration / Remedies -->
            <div class="pdf-section">
                <h2>4. תקופת ההסכם וסעדים</h2>
                <p>התחייבות הסודיות לפי הסכם זה תעמוד בתוקפה במהלך אפיון ופיתוח הפרויקט, ותישאר בתוקף מלא למשך <strong>3 שנים</strong> ממועד סיום ההתקשרות בין הצדדים מכל סיבה שהיא.</p>
                <p>הפרת הסכם זה תזכה את הצד המוסר בכל הסעדים המגיעים לו על פי כל דין, לרבות צווי מניעה ופיצויים בגין נזקים ישירים שנגרמו לו עקב ההפרה או השימוש הבלתי מורשה במידע.</p>
            </div>
            
            <!-- SECTION 7: Signatures -->
            <div class="pdf-section">
                <div class="signature-section" style="margin-top: 15px;">
                    <div class="signature-box">
                        <div class="signature-title">הצד המוסר (הלקוח): <bdi>${data.business_name}</bdi></div>
                        <p style="font-size: 9px; margin-bottom: 4px;">שם הנציג: <bdi>${data.contact_name}</bdi><br>תאריך החתימה: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="digital-sig-badge">
                            <span class="sig-status-icon">✓</span>
                            <div class="sig-details">
                                <div class="sig-text"><bdi>${data.contact_name || 'לקוח מורשה'}</bdi></div>
                                <div class="sig-meta">נחתם דיגיטלית מאובטח</div>
                                <div class="sig-meta">מזהה: SEC-SIG-71930B</div>
                                <div class="sig-meta">זמן: ${new Date().toLocaleString('he-IL')} | IP: 192.168.1.150</div>
                            </div>
                        </div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">הצד המקבל (הספק): autoRI-studio</div>
                        <p style="font-size: 9px; margin-bottom: 4px;">מנהלים מייצגים: רון ועילי<br>תאריך החתימה: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="digital-sig-badge">
                            <span class="sig-status-icon">✓</span>
                            <div class="sig-details">
                                <div class="sig-text">autoRI-studio</div>
                                <div class="sig-meta">נחתם דיגיטלית מאובטח</div>
                                <div class="sig-meta">מזהה: SEC-SIG-84920A</div>
                                <div class="sig-meta">זמן: ${new Date().toLocaleString('he-IL')} | IP: 192.168.1.100</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


export async function htmlToPdfBlob(htmlContent) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '794px'; // ~A4 width at 96 DPI
    container.style.background = '#ffffff';
    container.style.opacity = '1';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Create temporary pages container
    const pagesContainer = document.createElement('div');
    pagesContainer.style.position = 'absolute';
    pagesContainer.style.left = '0';
    pagesContainer.style.top = '0';
    pagesContainer.style.width = '794px';
    pagesContainer.style.zIndex = '-9999';
    pagesContainer.style.pointerEvents = 'none';
    document.body.appendChild(pagesContainer);

    try {
        const styleElement = container.querySelector('style');
        const styleHtml = styleElement ? styleElement.outerHTML : '';
        const headerElement = container.querySelector('.pdf-header-template');
        const headerHtml = headerElement ? headerElement.innerHTML : '';
        const footerElement = container.querySelector('.pdf-footer-template');
        const footerHtml = footerElement ? footerElement.innerHTML : '';

        const sections = container.querySelectorAll('.pdf-section');
        const pages = [];

        function createNewPage() {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page';
            pageDiv.style.width = '794px';
            pageDiv.style.height = '1122px'; // A4 height at 96 DPI
            pageDiv.style.boxSizing = 'border-box';
            pageDiv.style.padding = '50px 55px';
            pageDiv.style.position = 'relative';
            pageDiv.style.backgroundColor = '#ffffff';
            pageDiv.style.overflow = 'hidden';
            pageDiv.style.display = 'flex';
            pageDiv.style.flexDirection = 'column';
            pageDiv.style.justifyContent = 'flex-start';
            pageDiv.style.direction = 'rtl';
            pageDiv.style.textAlign = 'right';
            pageDiv.style.fontFamily = "'Segoe UI', Arial, sans-serif";
            pageDiv.style.lineHeight = '1.4';
            pageDiv.style.color = '#0f172a';
            pageDiv.style.fontSize = '11px';

            // Insert styles
            pageDiv.innerHTML = styleHtml;

            // Insert header
            if (headerHtml) {
                const headerDiv = document.createElement('div');
                headerDiv.innerHTML = headerHtml;
                pageDiv.appendChild(headerDiv);
            }

            // Create content wrapper
            const contentDiv = document.createElement('div');
            contentDiv.className = 'pdf-content-wrapper';
            contentDiv.style.flex = '1';
            contentDiv.style.display = 'flex';
            contentDiv.style.flexDirection = 'column';
            contentDiv.style.gap = '8px'; // tight spacing
            pageDiv.appendChild(contentDiv);

            // Insert footer placeholder
            if (footerHtml) {
                const footerDiv = document.createElement('div');
                footerDiv.className = 'pdf-footer-wrapper';
                footerDiv.innerHTML = footerHtml;
                pageDiv.appendChild(footerDiv);
            }

            pagesContainer.appendChild(pageDiv);
            return {
                element: pageDiv,
                contentElement: contentDiv,
                currentHeight: 0
            };
        }

        if (sections.length > 0) {
            let currentPage = createNewPage();
            
            // A4 page height is 1122px. Max content height is ~880px.
            const maxContentHeight = 880;

            for (const sec of sections) {
                // Clone section and append to temporary container to measure its height
                const testDiv = document.createElement('div');
                testDiv.style.width = '684px'; // 794 - 2 * 55 padding
                testDiv.style.direction = 'rtl';
                testDiv.style.textAlign = 'right';
                testDiv.style.fontFamily = "'Segoe UI', Arial, sans-serif";
                testDiv.style.lineHeight = '1.4';
                testDiv.style.fontSize = '11px';
                testDiv.style.boxSizing = 'border-box';
                testDiv.innerHTML = styleHtml + sec.innerHTML;
                container.appendChild(testDiv);
                const secHeight = testDiv.offsetHeight || testDiv.getBoundingClientRect().height;
                container.removeChild(testDiv);

                // If the section is empty or has zero height, skip it
                if (secHeight <= 0) continue;

                // Check if section fits in the current page
                if (currentPage.currentHeight + secHeight > maxContentHeight && currentPage.currentHeight > 0) {
                    pages.push(currentPage);
                    currentPage = createNewPage();
                }

                // Append cloned section
                const clonedSec = sec.cloneNode(true);
                currentPage.contentElement.appendChild(clonedSec);
                currentPage.currentHeight += secHeight + 8; // add gap
            }
            pages.push(currentPage);

            // Update page numbers in the footers
            pages.forEach((page, index) => {
                const pageNumSpan = page.element.querySelector('.pdf-page-num');
                const totalPagesSpan = page.element.querySelector('.pdf-total-pages');
                if (pageNumSpan) pageNumSpan.textContent = (index + 1).toString();
                if (totalPagesSpan) totalPagesSpan.textContent = pages.length.toString();
            });
        } else {
            // Fallback if no sections: treat the container as a single page or use legacy .pdf-page if present
            const legacyPages = container.querySelectorAll('.pdf-page');
            if (legacyPages.length > 0) {
                for (const lp of legacyPages) {
                    pages.push({ element: lp });
                }
            } else {
                pages.push({ element: container });
            }
        }

        // Render pages to PDF using html2canvas
        const doc = new jsPDF('p', 'pt', 'a4', true);
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) doc.addPage();
            
            const canvas = await html2canvas(pages[i].element, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            doc.addImage(imgData, 'JPEG', 0, 0, 595.28, 841.89, undefined, 'FAST');
        }

        return doc.output('blob');
    } finally {
        document.body.removeChild(container);
        if (pagesContainer.parentNode) {
            document.body.removeChild(pagesContainer);
        }
    }
}

/**
 * High-level orchestration function to generate the 3 documents and upload them to Supabase
 */
export async function generateAndUploadDocuments(rawSpec, setupCost, lead, customSettings, onStatusUpdate) {
    const clientData = {
        name: lead.name,
        company: lead.company || lead.name,
        phone: lead.phone,
        email: lead.email
    };

    if (onStatusUpdate) onStatusUpdate('מנתח אפיון ב-AI ומחלץ רכיבים...');
    const parsedData = await parseSpecWithAI(rawSpec, setupCost, clientData);

    // Merge calculator pricing and custom form settings
    const quoteData = lead.quote_data || {};
    
    parsedData.pricing = {
        project_type: quoteData.project_type || 'automation',
        setup_cost: setupCost,
        sla_price: quoteData.sla_price || (quoteData.project_type === 'website' ? 150 : 1000),
        hourly_rate: quoteData.hourly_rate || 230,
        third_party_costs: quoteData.third_party_costs || parsedData.third_party_costs?.[0]?.estimated_cost || 0,
        website_type: quoteData.website_type || null,
        addons: quoteData.addons || null,
        
        // Custom UI settings overrides
        has_advance: customSettings.hasAdvance,
        advance_payment: customSettings.advancePayment,
        final_payment: customSettings.finalPayment,
        pilot_days: customSettings.pilotDays
    };

    const isWebsite = parsedData.pricing.project_type === 'website';
    const docsToGenerate = [
        {
            type: 'proposal',
            name: isWebsite ? 'הצעת מחיר לבניית אתר לעסק' : 'הצעת מחיר לפרויקט אוטומציה',
            html: buildProposalHtml(parsedData),
            fileName: 'Proposal.pdf'
        },
        {
            type: 'contract',
            name: isWebsite ? 'הסכם פיתוח ותחזוקת אתר' : 'הסכם פיתוח והקמת מערכות',
            html: buildContractHtml(parsedData),
            fileName: 'Contract.pdf'
        },
        {
            type: 'nda',
            name: 'הסכם שמירת סודיות NDA',
            html: buildNdaHtml(parsedData),
            fileName: 'NDA.pdf'
        }
    ];

    const results = [];

    for (const doc of docsToGenerate) {
        if (onStatusUpdate) onStatusUpdate(`מייצר קובץ PDF עבור: ${doc.name}...`);
        const pdfBlob = await htmlToPdfBlob(doc.html);
        const file = new File([pdfBlob], doc.fileName, { type: 'application/pdf' });

        if (onStatusUpdate) onStatusUpdate(`מעלה את ${doc.fileName} ל-Supabase Storage...`);
        const docData = {
            lead_id: lead.id,
            name: doc.name,
            type: doc.type
        };

        const uploadedDoc = await db.uploadDocument(docData, file);
        results.push(uploadedDoc);
    }

    return results;
}

if (typeof window !== 'undefined') {
    window.buildProposalHtml = buildProposalHtml;
    window.buildContractHtml = buildContractHtml;
    window.buildNdaHtml = buildNdaHtml;
}
