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
        background-color: #ffffff;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        direction: rtl;
        text-align: right;
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.4;
        color: #0f172a;
    }
    
    /* Header Banner styling */
    .header-banner {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%);
        padding: 16px 24px;
        margin: -50px -55px 25px -55px; /* Offset parent padding */
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #ffffff;
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
        color: #1e3a8a;
        margin-top: 0;
        margin-bottom: 8px;
    }
    h2 {
        font-size: 14.5px;
        font-weight: 700;
        border-bottom: 1.5px solid #e2e8f0;
        padding-bottom: 4px;
        margin-top: 14px;
        color: #2563eb;
    }
    h3 {
        font-size: 12px;
        font-weight: 600;
        color: #1e3a8a;
        margin-bottom: 5px;
    }
    p, li {
        font-size: 11px;
        color: #334155;
        margin-top: 0;
        margin-bottom: 5px;
    }
    
    /* Premium components cards */
    .comp-card {
        margin-bottom: 10px;
        padding: 8px 12px;
        background: #fafafa;
        border: 1px solid #f1f5f9;
        border-right: 4px solid #6366f1;
        border-radius: 6px;
    }
    
    /* Flex list RTL */
    .flex-list-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 5px;
    }
    .flex-list-num {
        color: #6366f1;
        font-weight: bold;
        min-width: 22px;
        margin-left: 4px;
        font-size: 11px;
    }
    .flex-list-bullet {
        color: #6366f1;
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
        border: 1px solid #cbd5e1;
        padding: 6px 10px;
        font-size: 10.5px;
        text-align: right;
    }
    table.data-table th {
        background-color: #eff6ff;
        color: #1e3a8a;
        font-weight: 700;
    }
    table.data-table tr.total-row {
        font-weight: bold;
        background-color: #f1f5f9;
    }
    
    .alert-box {
        background-color: #fef3c7;
        border-right: 4px solid #d97706;
        padding: 8px 12px;
        margin: 10px 0;
        border-radius: 4px;
    }
    .alert-box-title {
        font-weight: bold;
        color: #b45309;
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
        color: #94a3b8;
        text-align: center;
        border-top: 1px solid #f1f5f9;
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
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px;
        background: #fafafa;
    }
    .signature-title {
        font-weight: bold;
        font-size: 11px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-bottom: 16px;
        color: #1e3a8a;
    }
    .signature-line {
        border-bottom: 1px dashed #94a3b8;
        height: 16px;
        margin-bottom: 6px;
    }
</style>
`;

/**
 * Builds the HTML content for the Proposal
 */
export function buildProposalHtml(data) {
    const isWebsite = data.pricing?.project_type === 'website';
    const pilotDays = data.pricing?.pilot_days || 14;
    const hasAdvance = data.pricing?.has_advance !== false;
    const setupCost = data.pricing?.setup_cost || 0;

    // 1. Build components list based on project type
    let componentsHtml = '';
    if (isWebsite) {
        const websiteTypeName = WEBSITE_TYPES[data.pricing.website_type]?.name || 'אתר אינטרנט';
        componentsHtml += `
            <div class="comp-card">
                <h3>רכיב 1: בניית אתר אינטרנט - ${websiteTypeName}</h3>
                <p>עיצוב ופיתוח אתר מקצועי, מותאם אישית ומותאם למובייל, המשקף את מיתוג העסק ומיועד להמרת גולשים ללקוחות.</p>
            </div>
        `;
        let compIndex = 2;
        if (data.pricing.addons?.chatbot) {
            componentsHtml += `
                <div class="comp-card">
                    <h3>רכיב ${compIndex++}: צ'אטבוט AI מוטמע (Gemini)</h3>
                    <p>צ'אטבוט חכם מבוסס בינה מלאכותית של Google המוטמע באתר ומעניק מענה ללקוחות 24/7, אוסף לידים ומסנכרן אותם.</p>
                </div>
            `;
        }
        if (data.pricing.addons?.calculator) {
            componentsHtml += `
                <div class="comp-card">
                    <h3>רכיב ${compIndex++}: מחשבון ROI דינמי</h3>
                    <p>מחשבון אינטראקטיבי המאפשר למבקרים לחשב את החיסכון והרווח שלהם בעבודה איתכם, כלי חזק להגדלת אחוזי המרה.</p>
                </div>
            `;
        }
        if (data.pricing.addons?.survey) {
            componentsHtml += `
                <div class="comp-card">
                    <h3>רכיב ${compIndex++}: שאלון אפיון מרובה שלבים</h3>
                    <p>שאלון דינמי מרובה שלבים לאפיון צרכי הלקוח ואיסוף מידע מקיף ומדויק בצורה חווייתית.</p>
                </div>
            `;
        }
        if (data.pricing.addons?.crm) {
            componentsHtml += `
                <div class="comp-card">
                    <h3>רכיב ${compIndex++}: חיבור למערכת CRM</h3>
                    <p>אינטגרציה מלאה של טפסי האתר והצ'אטבוט ישירות למערכת ניהול הלקוחות של העסק לשליטה ומעקב.</p>
                </div>
            `;
        }
    } else {
        componentsHtml = data.components.map((c, index) => `
            <div class="comp-card">
                <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <span>רכיב ${index + 1}: ${c.name}</span>
                </h3>
                <p style="margin-bottom: 4px;">${c.description}</p>
                <p style="margin-bottom: 4px; font-size: 10px;"><strong>Trigger (טריגר):</strong> ${c.trigger}</p>
                <p style="margin-bottom: 4px; font-size: 10px;"><strong>מערכות:</strong> ${c.systems.join(', ')}</p>
                <p style="margin-bottom: 2px; font-size: 10px;"><strong>תהליך זרימה מתוכנן:</strong></p>
                <div style="padding-right: 5px;">
                    ${c.flow.map((step, sIdx) => `
                        <div class="flex-list-item">
                            <span class="flex-list-num">${sIdx + 1}.</span>
                            <span style="font-size: 10px;">${step}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // 2. Build pricing rows
    let pricingRowsHtml = '';
    let totalSetup = 0;
    let totalMonthly = 0;

    if (isWebsite) {
        const baseType = data.pricing.website_type || 'landing';
        const baseInfo = WEBSITE_TYPES[baseType] || { name: 'בניית אתר אינטרנט', price: 2500 };
        totalSetup += baseInfo.price;
        
        pricingRowsHtml += `
            <tr>
                <td><strong>בניית אתר אינטרנט (${baseInfo.name})</strong></td>
                <td style="text-align: left;">${baseInfo.price.toLocaleString('he-IL')} ₪</td>
                <td style="text-align: left;">₪ 0</td>
            </tr>
        `;
        
        if (data.pricing.addons?.chatbot) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת: צ'אטבוט AI מוטמע (Gemini)</strong></td>
                    <td style="text-align: left;">3,000 ₪</td>
                    <td style="text-align: left;">250 ₪ / חודש</td>
                </tr>
            `;
            totalSetup += 3000;
            totalMonthly += 250;
        }
        if (data.pricing.addons?.calculator) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת: מחשבון ROI דינמי</strong></td>
                    <td style="text-align: left;">1,500 ₪</td>
                    <td style="text-align: left;">₪ 0</td>
                </tr>
            `;
            totalSetup += 1500;
        }
        if (data.pricing.addons?.survey) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת: שאלון אפיון מרובה שלבים</strong></td>
                    <td style="text-align: left;">2,000 ₪</td>
                    <td style="text-align: left;">₪ 0</td>
                </tr>
            `;
            totalSetup += 2000;
        }
        if (data.pricing.addons?.crm) {
            pricingRowsHtml += `
                <tr>
                    <td><strong>תוספת: חיבור למערכת CRM</strong></td>
                    <td style="text-align: left;">1,000 ₪</td>
                    <td style="text-align: left;">₪ 0</td>
                </tr>
            `;
            totalSetup += 1000;
        }
        
        // SLA row
        const slaPrice = data.pricing.sla_price || 150;
        let slaName = 'אחסון ותחזוקת אתר';
        if (slaPrice === 150) slaName += ' (בסיסי)';
        else if (slaPrice === 300) slaName += ' (extended)';
        else if (slaPrice === 600) slaName += ' (premium)';
        
        pricingRowsHtml += `
            <tr>
                <td><strong>${slaName}:</strong><br><span style="font-size: 9.5px; color: #64748b;">שרת אחסון מהיר, תעודת SSL, גיבויים שוטפים ותמיכה.</span></td>
                <td style="text-align: left;">כלול בהקמה</td>
                <td style="text-align: left;">${slaPrice.toLocaleString('he-IL')} ₪ / חודש</td>
            </tr>
        `;
        totalMonthly += slaPrice;
    } else {
        const setupCostVal = data.pricing.setup_cost;
        const retainerPrice = data.pricing.sla_price || 1000;
        
        pricingRowsHtml += `
            <tr>
                <td>
                    <strong>חבילת האוטומציות המלאה לעסק:</strong><br>
                    <span style="font-size: 9.5px; color: #64748b;">כולל פיתוח וחיבור כלל הרכיבים, בדיקות איכות QA והדרכה.</span>
                </td>
                <td style="text-align: left;">${(setupCostVal - 2500).toLocaleString('he-IL')} ₪</td>
                <td style="text-align: left;">₪ 0</td>
            </tr>
            <tr>
                <td>
                    <strong>דף נחיתה יוקרתי, תיק עבודות מעוצב ואינטגרציות AI:</strong><br>
                    <span style="font-size: 9.5px; color: #64748b;">כולל עיצוב ב-Midjourney, בנייה דינמית מותאמת מובייל וחיבור טפסים.</span>
                </td>
                <td style="text-align: left;">2,500 ₪</td>
                <td style="text-align: left;">₪ 0</td>
            </tr>
            <tr>
                <td>
                    <strong>אירוח שרת n8n מאובטח ותמיכה שוטפת:</strong><br>
                    <span style="font-size: 9.5px; color: #64748b;">שרת ענן ייעודי ומאובטח, ניטור שגיאות 24/7, עדכוני API ותמיכה טכנית.</span>
                </td>
                <td style="text-align: left;">כלול בהקמה</td>
                <td style="text-align: left;">${retainerPrice.toLocaleString('he-IL')} ₪ / חודש</td>
            </tr>
        `;
        totalSetup = setupCostVal;
        totalMonthly = retainerPrice;
    }

    // 3. Build third-party costs rows
    const thirdPartyHtml = data.third_party_costs.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.estimated_cost}</td>
            <td>${c.explanation}</td>
        </tr>
    `).join('');

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

    return `
        <div class="proposal-container">
            ${documentStyle}
            
            <!-- PAGE 1 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">${isWebsite ? 'הצעת מחיר לבניית אתר לעסק' : 'הצעת מחיר לפרויקט אוטומציה ו-AI'}</span>
                </div>
                
                <h2>1. פרטי ההצעה והלקוח</h2>
                <table class="data-table">
                    <tr>
                        <th width="35%">עבור לקוח / חברה:</th>
                        <td><strong>${data.business_name}</strong> (${data.contact_name})</td>
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
                
                <h2>2. תקציר מנהלים ומטרות העל</h2>
                <p>מטרת-העל של פרויקט זה היא לייצר לעסק שלך סדר מוחלט בעיניים, לחסוך לך שעות יקרות של עבודה ידנית יומיומית, ולהעלות משמעותית את אחוז סגירת העסקאות בעסק - הכל בצורה אוטומטית שרצה מאחורי הקלעים בזמן שאתה ממוקד בליבת הפעילות השוטפת.</p>
                <p>באמצעות שילוב של מערכות ניהול מתקדמות, כלי בינה מלאכותית (AI) וחיבור לערוצי התקשורת והרשתות החברתיות, נבנה עבורך מערך דיגיטלי חכם שיעבוד בשבילך 24/7.</p>
                
                <div class="footer-note">
                    <span>עמוד 1 מתוך 4 | autoRI-studio הצעת מחיר עבור ${data.business_name}</span>
                </div>
            </div>
            
            <!-- PAGE 2 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">ארכיטקטורה ופירוט הרכיבים</span>
                </div>
                <h2>3. פירוט הרכיבים הכלולים בפרויקט</h2>
                <div style="flex: 1; overflow: hidden;">
                    ${componentsHtml}
                </div>
                <div class="footer-note">
                    <span>עמוד 2 מתוך 4 | autoRI-studio הצעת מחיר עבור ${data.business_name}</span>
                </div>
            </div>
            
            <!-- PAGE 3 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">תמחור, שרתים והוצאות נלוות</span>
                </div>
                <h2>4. תמחור ועלויות פיתוח והקמה</h2>
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
                            <td style="text-align: left;">${totalMonthly.toLocaleString('he-IL')} ₪ / חודש</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="alert-box">
                    <div class="alert-box-title">⚙️ שקט תעשייתי ומערכות יציבות 24/7</div>
                    <p style="margin: 0; font-size: 10px; line-height: 1.3;">האוטומציות והאתר שלך הם המנוע השקט שמייצר לך כסף. הריטיינר כולל: אירוח בשרתים ייעודיים מהירים (Dedicated Cloud Hosting), ניטור שגיאות אקטיבי 24/7, ותחזוקת קוד שוטפת מול שינויי API של מטא, גוגל ולינקדאין.</p>
                </div>
                
                <h2>5. ניתוח והערכת נפח הרצות (Executions) חודשי לעסק</h2>
                <div style="margin-bottom: 10px;">
                    <div class="flex-list-item">
                        <span class="flex-list-bullet">•</span>
                        <span><strong>סה"כ צפי חודשי:</strong> כ-${totalExecutions} הרצות בחודש.</span>
                    </div>
                    <div class="flex-list-item">
                        <span class="flex-list-bullet">•</span>
                        <span><strong>חישוב צפי:</strong> ${data.executions_summary?.explanation || ''}</span>
                    </div>
                </div>
                
                <h2>6. הערכת עלויות צד ג' חודשיות (משולם ישירות לספקים)</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>שם שירות צד ג'</th>
                            <th width="35%">עלות משוערת חודשית</th>
                            <th>הסבר ואופן חיוב</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${thirdPartyHtml}
                    </tbody>
                </table>
                <div class="footer-note">
                    <span>עמוד 3 מתוך 4 | autoRI-studio הצעת מחיר עבור ${data.business_name}</span>
                </div>
            </div>
            
            <!-- PAGE 4 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">תנאי תשלום וחתימות</span>
                </div>
                
                <h2>7. תנאי תשלום ומדיניות שביעות רצון (Satisfaction Guarantee)</h2>
                <div style="margin-bottom: 15px;">
                    ${paymentTermsHtml}
                    <div class="flex-list-item">
                        <span class="flex-list-bullet">•</span>
                        <span><strong>עבודות מחוץ להיקף:</strong> כל שינוי או תוספת יתומחרו בנפרד לפי תעריף פיתוח שעתי של ${data.pricing.hourly_rate} ₪ + מע"מ לשעה.</span>
                    </div>
                </div>
                
                <h2>8. לוחות זמנים משוערים להקמה</h2>
                <div style="margin-bottom: 15px;">
                    ${data.timeline.map((t, index) => `
                        <div class="flex-list-item">
                            <span class="flex-list-num">${index + 1}.</span>
                            <span><strong>שלב ${t.name}:</strong> כ-${t.days} ימי עסקים.</span>
                        </div>
                    `).join('')}
                </div>
                <p><em>* סה"כ זמן משוער לעלייה מלאה לאוויר: כ-27 ימי עסקים ממועד קבלת המקדמה והגישות (נשאף לקצר ככל הניתן).</em></p>
                
                <div class="signature-section" style="margin-top: auto; margin-bottom: 25px;">
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
                
                <div class="footer-note">
                    <span>עמוד 4 מתוך 4 | autoRI-studio הצעת מחיר עבור ${data.business_name}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Builds the HTML content for the Contract
 */
export function buildContractHtml(data) {
    const isWebsite = data.pricing?.project_type === 'website';
    const pilotDays = data.pricing?.pilot_days || 14;
    const hasAdvance = data.pricing?.has_advance !== false;
    const setupCost = data.pricing?.setup_cost || 0;

    let componentsListHtml = '';
    if (isWebsite) {
        const websiteTypeName = WEBSITE_TYPES[data.pricing.website_type]?.name || 'אתר אינטרנט';
        componentsListHtml += `
            <div class="flex-list-item">
                <span class="flex-list-num">1.</span>
                <span><strong>בניית אתר אינטרנט (${websiteTypeName})</strong> - הקמה ועיצוב דינמי.</span>
            </div>
        `;
        let compIndex = 2;
        if (data.pricing.addons?.chatbot) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIndex++}.</span>
                    <span><strong>צ'אטבוט AI מוטמע (Gemini)</strong> - אינטגרציה מענה ללקוחות.</span>
                </div>
            `;
        }
        if (data.pricing.addons?.calculator) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIndex++}.</span>
                    <span><strong>מחשבון ROI דינמי</strong> - מחשבון הערכת רווח ועלויות.</span>
                </div>
            `;
        }
        if (data.pricing.addons?.survey) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIndex++}.</span>
                    <span><strong>שאלון אפיון מרובה שלבים</strong> - שאלון דינמי מרובה שלבים לאיסוף מידע.</span>
                </div>
            `;
        }
        if (data.pricing.addons?.crm) {
            componentsListHtml += `
                <div class="flex-list-item">
                    <span class="flex-list-num">${compIndex++}.</span>
                    <span><strong>חיבור למערכת CRM</strong> - סנכרון וניהול לקוחות.</span>
                </div>
            `;
        }
    } else {
        componentsListHtml = data.components.map((c, index) => `
            <div class="flex-list-item">
                <span class="flex-list-num">${index + 1}.</span>
                <span><strong>${c.name}</strong> - ${c.description} (מערכות: ${c.systems.join(', ')}).</span>
            </div>
        `).join('');
    }

    // Retainer explanation
    let retainerHtml = '';
    const slaPrice = data.pricing?.sla_price || 1000;
    if (isWebsite) {
        retainerHtml = `
            <p>עבור אירוח האתר בשרת מהיר ומאובטח, רישיון SSL, גיבויים, ניטור שוטף ותמיכה טכנית, ישלם הלקוח סך חודשי קבוע של <strong>${slaPrice.toLocaleString('he-IL')} ₪ + מע"מ</strong> כחוק (משולם בכל 1 לחודש עבור החודש השוטף).</p>
        `;
    } else {
        retainerHtml = `
            <p>עבור אירוח המערכות בשרת n8n פרטי ומאובטח, ניטור אקטיבי של שגיאות 24/7 ותמיכה טכנית, ישלם הלקוח ריטיינר חודשי קבוע. הלקוח יבחר את מסלול השרת הרלוונטי עבורו במעמד החתימה:</p>
            <div class="flex-list-item">
                <span class="flex-list-bullet">•</span>
                <span><strong>[ ] מסלול Premium:</strong> ${SLA_PACKAGES.premium.price.toLocaleString('he-IL')} ₪ + מע"מ לחודש. כולל עד 5,000 הרצות (Executions) בחודש, כיסוי מלא ותמיכה מועדפת.</span>
            </div>
            <div class="flex-list-item">
                <span class="flex-list-bullet">•</span>
                <span><strong>[ ] מסלול Standard:</strong> ${SLA_PACKAGES.standard.price.toLocaleString('he-IL')} ₪ + מע"מ לחודש. כולל עד 1,000 הרצות בחודש (חריגה בחיוב של 0.20 ₪ לכל ריצה נוספת).</span>
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
            
            <!-- PAGE 1 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">${isWebsite ? 'הסכם פיתוח ותחזוקת אתר' : 'הסכם פיתוח והקמת מערכות אוטומציה'}</span>
                </div>
                
                <p style="text-align: center; font-weight: 600; margin-bottom: 12px; font-size: 11.5px;">שנערך ונחתם ביום ${new Date().getDate()} בחודש ${new Date().toLocaleString('he-IL', { month: 'long' })} שנת ${new Date().getFullYear()}</p>
                
                <h2>בין הצדדים:</h2>
                <table class="data-table">
                    <tr>
                        <th width="35%">הספק (מפתח):</th>
                        <td><strong>autoRI-studio (רון ועילי)</strong><br>שותפות פיתוח פתרונות אינטגרציה</td>
                    </tr>
                    <tr>
                        <th>הלקוח (המזמין):</th>
                        <td><strong>${data.business_name}</strong> (${data.contact_name})<br>ע.מ. / ח.פ.: ________________________</td>
                    </tr>
                </table>
                
                <p><strong>הואיל</strong> והספק עוסק בפיתוח, עיצוב, אינטגרציה ותחזוקה של אוטומציות עסקיות, כלי בינה מלאכותית, אתרי אינטרנט ובוטים עסקיים;</p>
                <p><strong>והואיל</strong> והלקוח מנהל עסק עצמאי ומעוניין להסתייע בשירותי הספק לצורך בניית תשתית דיגיטלית חכמה, אוטומציות תקשורת ומכירות, דף נחיתה מעוצב ואיסוף נתונים (להלן: "הפרויקט"), כמפורט בהסכם זה;</p>
                <p><strong>לפיכך הוצהר, הותנה והוסכם בין הצדדים כדלקמן:</strong></p>
                
                <h2>1. היקף השירותים והאפיון המוסכם</h2>
                <p>הספק יפתח, יעצב ויטמיע עבור הלקוח את הרכיבים הבאים, המהווים את גרעין הפרויקט והאפיון הטכנולוגי שלו:</p>
                <div style="margin-bottom: 10px;">
                    ${componentsListHtml}
                </div>
                <p>כל שינוי, תוספת או סטייה מהרכיבים המוגדרים מעלה יתומחרו בנפרד לפי תעריף פיתוח שעתי של ${data.pricing.hourly_rate} ₪ + מע"מ לשעה (או לפי הצעת מחיר גלובלית וכתובה שתסוכם מראש).</p>
                
                <div class="footer-note">
                    <span>עמוד 1 מתוך 3 | autoRI-studio הסכם התקשרות עבור ${data.business_name}</span>
                </div>
            </div>
            
            <!-- PAGE 2 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">תנאים כספיים וקניין רוחני</span>
                </div>
                
                <h2>2. תמורה, אבני דרך ותנאי תשלום</h2>
                <h3>א. עלות הקמה ופיתוח חד-פעמית (חלוקה מבוססת שביעות רצון):</h3>
                <p>עבור אפיון, פיתוח, עיצוב והקמה של הרכיבים המפורטים לעיל, ישלם הלקוח לספק סך חד-פעמי של <strong>${setupCost.toLocaleString('he-IL')} ₪ + מע"מ כחוק</strong>. פריסת התשלומים תתבצע כדלקמן:</p>
                <div style="margin-bottom: 10px;">
                    ${paymentMilestonesHtml}
                </div>
                
                <h3>ב. ריטיינר חודשי לתחזוקה, שרת ותמיכה טכנית:</h3>
                ${retainerHtml}
                
                <h3>ג. עדכוני תוכן ידניים באתר ובתיק העבודות:</h3>
                <p>הריטיינר החודשי עוסק בתחזוקה טכנולוגית ותשתיתית בלבד. עדכוני תוכן ידניים יבוצעו בעלות קבועה של 300 ₪ + מע"מ עבור כל סבב עדכונים מבוקש (מכסה עד שעת עבודה אחת בפועל).</p>
                
                <h3>ד. ריבית פיגורים:</h3>
                <p>איחור בתשלום העולה על 14 ימים ממועד הפירעון המוסכם ישא ריבית פיגורים שבועית בשיעור של 1.5% מהסכום שבפיגור.</p>
                
                <h2>3. קניין רוחני (Intellectual Property)</h2>
                <p>כל זכויות הקניין רוחני באוטומציות, במנגנונים ובאתר שהוקמו במיוחד עבור הלקוח, יעברו לבעלותו המלאה והבלעדית של הלקוח אך ורק לאחר פירעון מלא וסופי של כל התשלומים המגיעים לספק עבור שלב ההקמה.</p>
                <p>הספק שומר לעצמו את הזכות לעשות שימוש חוזר ברכיבי קוד גנריים, שיטות פיתוח ואינטגרציה, פונקציות עזר וארכיטקטורות זרימה שאינם מכילים מידע עסקי ספציפי או סודי של הלקוח.</p>
                
                <div class="footer-note">
                    <span>עמוד 2 מתוך 3 | autoRI-studio הסכם התקשרות עבור ${data.business_name}</span>
                </div>
            </div>
            
            <!-- PAGE 3 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">הגבלת אחריות וחתימות</span>
                </div>
                
                <h2>4. הגבלת אחריות (Limitation of Liability)</h2>
                <p>בשום מקרה ובשום נסיבות לא תעלה החבות הכוללת של הספק בגין כל נזק, הפסד, פגיעה או תביעה במסגרת הסכם זה, על הסכום הכולל ששולם בפועל על ידי הלקוח לספק עבור רכיב ההקמה הספציפי שגרם לנזק המדובר.</p>
                <p>הספק אינו אחראי בשום אופן לנזקים עקיפים, תוצאתיים, מיוחדים או נלווים, לרבות אובדן רווחים, אובדן עסקאות, הפרעות לפעילות העסקית, נפילות של שירותי צד ג' (כגון עדכוני מטא, תקלות ב-API WhatsApp, שינויים במדיניות LinkedIn או תקלות בשרתי OpenAI) או אובדן נתונים.</p>
                
                <h2>5. תוקף, סיום ההסכם ומדיניות ביטולים</h2>
                <p>הסכם התחזוקה והריטיינר החודשי הינו לתקופה של 12 חודשים ממועד ההפעלה, ויחודש אוטומטית לתקופות נוספות של שנה בכל פעם. כל צד רשאי לסיים את הסכם התחזוקה בכל עת מכל סיבה על ידי מתן הודעה בכתב לפחות 30 יום מראש.</p>
                
                <h2>6. שמירת סודיות (NDA)</h2>
                <p>הסכם שמירת סודיות (NDA) ייעודי שנחתם במקביל להסכם זה מהווה חלק בלתי נפרד ממנו.</p>
                
                <div class="signature-section" style="margin-top: auto; margin-bottom: 25px;">
                    <div class="signature-box">
                        <div class="signature-title">הספק: autoRI-studio</div>
                        <p style="font-size: 10px; margin-bottom: 8px;">שמות הנציגים: רון ועילי<br>תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="signature-line"></div>
                        <p style="font-size: 9px; margin: 0; color: #64748b;">חתימה וחותמת הספק</p>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">הלקוח (המזמין): ${data.business_name}</div>
                        <p style="font-size: 10px; margin-bottom: 8px;">שם הנציג המורשה: _________________<br>בחירת מסלול ריטיינר: [ ] Premium / [ ] Standard</p>
                        <div class="signature-line"></div>
                        <p style="font-size: 9px; margin: 0; color: #64748b;">חתימה וחותמת המזמין</p>
                    </div>
                </div>
                
                <div class="footer-note">
                    <span>עמוד 3 מתוך 3 | autoRI-studio הסכם התקשרות עבור ${data.business_name}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Builds the HTML content for the NDA
 */
export function buildNdaHtml(data) {
    return `
        <div class="nda-container">
            ${documentStyle}
            
            <!-- PAGE 1 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">הסכם שמירת סודיות NDA</span>
                </div>
                
                <p style="text-align: center; font-weight: 600; margin-bottom: 12px; font-size: 11.5px;">שנערך ונחתם ביום ${new Date().getDate()} בחודש ${new Date().toLocaleString('he-IL', { month: 'long' })} שנת ${new Date().getFullYear()}</p>
                
                <h2>בין הצדדים:</h2>
                <table class="data-table">
                    <tr>
                        <th width="35%">הצד המוסר:</th>
                        <td><strong>${data.business_name}</strong> (${data.contact_name})<br>ע.מ. / ח.פ.: ________________________</td>
                    </tr>
                    <tr>
                        <th>הצד המקבל:</th>
                        <td><strong>autoRI-studio (רון ועילי)</strong><br>שותפות פיתוח פתרונות אינטגרציה</td>
                    </tr>
                </table>
                
                <p><strong>הואיל</strong> והצד המוסר מעוניין להסתייע בשירותי הצד המקבל לצורך אפיון, בנייה, פיתוח, עיצוב ותחזוקה של אתר אינטרנט, תיק עבודות דינמי, מערכות אוטומציה, כלי AI ובוטים עסקיים (להלן: "הפרויקט");</p>
                <p><strong>והואיל</strong> ולשם ביצוע הפרויקט ואפיונו, עשוי הצד המוסר לחשוף בפני הצד המקבל מידע מסחרי, מקצועי ואישי רגיש ובעל ערך, והצדדים מעוניינים להסדיר את שמירתו ואבטחתו של מידע זה;</p>
                <p><strong>לפיכך הוצהר, הותנה והוסכם בין הצדדים כדלקמן:</strong></p>
                
                <h2>1. הגדרת "מידע סודי"</h2>
                <p>"מידע סודי" פירושו כל מידע עסקי, פיננסי, שיווקי, טכני, טכנולוגי, פרטי לקוחות של העסק, סיסמאות גישה למערכות, מפתחות API, שיטות עבודה, תהליכים פנימיים, נתוני פיתוח או תרשימי זרימה שיועברו בין הצדדים.</p>
                
                <h2>2. התחייבות לאי-גילוי ושימוש מוגבל</h2>
                <p>הצד המקבל (autoRI-studio) מתחייב לשמור על המידע הסודי בסודיות מוחלטת ולנקוט בכל האמצעים הסבירים והמקובלים בתעשייה על מנת למנוע חשיפתו לצד שלישי כלשהו, ולעשות שימוש במידע הסודי אך ורק לצורך מתן השירותים.</p>
                
                <h2>3. מחיקה והחזרת מידע בסיום פרויקט</h2>
                <div class="alert-box" style="background-color: #f0fdf4; border-right: 4px solid #16a34a; color: #14532d;">
                    <div class="alert-box-title" style="color: #166534;">🛡️ סעיף פינוי ננתונים ואבטחה מוגברת:</div>
                    <p style="margin: 0; font-size: 10px; line-height: 1.35;">עם סיום ההתקשרות בין הצדדים, או עם קבלת דרישה מפורשת בכתב מהצד המוסר (${data.business_name}), מתחייב הצד המקבל למחוק לצמיתות או להחזיר לצד המוסר את כל העותקים הפיזיים והדיגיטליים של המידע הסודי שברשותו (פרטי גישה, סיסמאות, מפתחות API, בסיסי נתונים, רשימות תפוצה וכדומה) ולספק אישור בכתב המעיד על ביצוע המחיקה והטיהור תוך 14 ימי עסקים.</p>
                </div>
                
                <div class="footer-note">
                    <span>עמוד 1 מתוך 2 | autoRI-studio הסכם שמירת סודיות עבור ${data.business_name}</span>
                </div>
            </div>
            
            <!-- PAGE 2 -->
            <div class="pdf-page">
                <div class="header-banner">
                    <span class="header-logo">autoRI-studio</span>
                    <span class="header-title">שמירת סודיות - חתימות</span>
                </div>
                
                <h2>4. תקופת ההסכם וסעדים</h2>
                <p>התחייבות הסודיות לפי הסכם זה תעמוד בתוקפה במהלך אפיון ופיתוח הפרויקט, ותישאר בתוקף מלא למשך <strong>3 שנים</strong> ממועד סיום ההתקשרות בין הצדדים מכל סיבה שהיא.</p>
                <p>הפרת הסכם זה תזכה את הצד המוסר בכל הסעדים המגיעים לו על פי כל דין, לרבות צווי מניעה ופיצויים בגין נזקים ישירים שנגרמו לו עקב ההפרה או השימוש הבלתי מורשה במידע.</p>
                
                <div class="signature-section" style="margin-top: auto; margin-bottom: 25px;">
                    <div class="signature-box">
                        <div class="signature-title">הצד המוסר (הלקוח): ${data.business_name}</div>
                        <p style="font-size: 10px; margin-bottom: 8px;">שם הנציג המורשה: _________________<br>תאריך החתימה: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="signature-line"></div>
                        <p style="font-size: 9px; margin: 0; color: #64748b;">חתימה וחותמת המזמין</p>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">הצד המקבל (הספק): autoRI-studio</div>
                        <p style="font-size: 10px; margin-bottom: 8px;">מנהלים מייצגים: רון ועילי<br>תאריך החתימה: ${new Date().toLocaleDateString('he-IL')}</p>
                        <div class="signature-line"></div>
                        <p style="font-size: 9px; margin: 0; color: #64748b;">חתימה וחותמת הספק</p>
                    </div>
                </div>
                
                <div class="footer-note">
                    <span>עמוד 2 מתוך 2 | autoRI-studio הסכם שמירת סודיות עבור ${data.business_name}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Converts a styled HTML string to a PDF Blob using jsPDF and html2canvas page-by-page
 */
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

    try {
        const pages = container.querySelectorAll('.pdf-page');
        const doc = new jsPDF('p', 'pt', 'a4', true);

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) doc.addPage();
            
            const canvas = await html2canvas(pages[i], {
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
