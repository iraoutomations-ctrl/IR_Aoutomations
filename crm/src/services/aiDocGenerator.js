import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { db } from './db';

/**
 * Parses raw specification text and pricing into structured JSON data using Gemini API
 */
export async function parseSpecWithAI(rawSpec, setupCost, clientData) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        throw new Error('אנא הגדר מפתח API של Gemini בהגדרות ה-CRM כדי להשתמש במחולל המסמכים.');
    }

    const prompt = `
אתה עוזר פיתוח עסקי ואנליסט מערכות מומחה באוטומציות עסקיות וב-N8N. 
המטרה שלך היא לנתח טקסט אפיון גולמי של לקוח (למשל תמלול שיחה, פגישה או התכתבות), יחד עם עלות ההקמה, ולפרק אותו למבנה נתונים מובנה בפורמט JSON בלבד.

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
  "pricing": {
    "setup_cost": ${setupCost},
    "advance_payment": ${Math.round(setupCost * 0.10)},
    "final_payment": ${Math.round(setupCost * 0.90)},
    "retainer_premium": 1000,
    "retainer_standard": 400,
    "hourly_rate": 230
  },
  "third_party_costs": [
    {
      "name": "שם השירות (למשל: WhatsApp Business API (Meta))",
      "estimated_cost": "הערכת עלות, למשל: כ-0.15 ₪ לשיחה (1,000 שיחות ראשונות חינם בחודש)",
      "explanation": "הסבר קצר על אופן החיוב"
    }
  ],
  "timeline": [
    {
      "phase": "א",
      "name": "איסוף חומרים, אפיון טכני וקבלת גישות",
      "days": 5
    },
    {
      "phase": "ב",
      "name": "פיתוח מערך האוטומציות, אינטגרציות ובדיקות QA",
      "days": 14
    },
    {
      "phase": "ג",
      "name": "עיצוב והקמת דף הנחיתה ותיק העבודות וחיבורו לוואטסאפ",
      "days": 5
    },
    {
      "phase": "ד",
      "name": "הרצת פיילוט (UAT) ומסירה רשמית ללקוח",
      "days": 3
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
 * Common elegant CSS styling for all documents
 */
const documentStyle = `
    direction: rtl;
    text-align: right;
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.5;
    color: #1e293b;
    background-color: #ffffff;
    max-width: 800px;
    margin: 0 auto;
    padding: 30px 40px;
    box-sizing: border-box;

    h1, h2, h3, h4 {
        color: #1e3a8a;
        margin-top: 0;
    }
    h1 {
        font-size: 24px;
        font-weight: 700;
        border-bottom: 3px solid #1e3a8a;
        padding-bottom: 8px;
        margin-bottom: 24px;
        text-align: center;
    }
    h2 {
        font-size: 16px;
        font-weight: 700;
        border-bottom: 1.5px solid #e2e8f0;
        padding-bottom: 6px;
        margin-top: 25px;
        margin-bottom: 12px;
        color: #2563eb;
    }
    h3 {
        font-size: 14px;
        font-weight: 600;
        margin-top: 15px;
        margin-bottom: 8px;
        color: #1e3a8a;
    }
    p, li {
        font-size: 12px;
        color: #334155;
        margin-bottom: 6px;
    }
    ul, ol {
        margin-top: 5px;
        margin-bottom: 12px;
        padding-right: 20px;
    }
    .badge {
        font-size: 9px;
        background: #eff6ff;
        color: #2563eb;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        margin-right: 5px;
        border: 1px solid #bfdbfe;
    }
    table.data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
    }
    table.data-table th, table.data-table td {
        border: 1px solid #cbd5e1;
        padding: 8px 10px;
        font-size: 11.5px;
        text-align: right;
    }
    table.data-table th {
        background-color: #f8fafc;
        color: #1e3a8a;
        font-weight: bold;
    }
    table.data-table tr.total-row {
        font-weight: bold;
        background-color: #f1f5f9;
    }
    .alert-box {
        background-color: #fef3c7;
        border-right: 4px solid #d97706;
        padding: 10px 15px;
        margin: 15px 0;
        border-radius: 4px;
    }
    .alert-box-title {
        font-weight: bold;
        color: #b45309;
        font-size: 12px;
        margin-bottom: 4px;
    }
    .footer-note {
        font-size: 10px;
        color: #64748b;
        text-align: center;
        margin-top: 40px;
        border-top: 1px solid #e2e8f0;
        padding-top: 10px;
    }
    .signature-section {
        display: flex;
        justify-content: space-between;
        margin-top: 40px;
        gap: 40px;
        page-break-inside: avoid;
    }
    .signature-box {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 15px;
        background: #fafafa;
    }
    .signature-title {
        font-weight: bold;
        font-size: 12px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-bottom: 25px;
    }
    .signature-line {
        border-bottom: 1px dashed #94a3b8;
        height: 20px;
        margin-bottom: 8px;
    }
`;

/**
 * Builds the HTML content for the Proposal
 */
export function buildProposalHtml(data) {
    const componentsHtml = data.components.map((c, index) => `
        <div style="margin-bottom: 15px; padding: 10px; background: #fafafa; border: 1px solid #f1f5f9; border-radius: 6px;">
            <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between;">
                <span>רכיב ${index + 1}: "${c.name}"</span>
            </h3>
            <p>${c.description}</p>
            <p><strong>מקור נתונים (Trigger):</strong> ${c.trigger}</p>
            <p><strong>מערכות מעורבות:</strong> ${c.systems.join(', ')}</p>
            <p><strong>תהליך זרימה מתוכנן:</strong></p>
            <ol style="margin-bottom: 0;">
                ${c.flow.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `).join('');

    const thirdPartyHtml = data.third_party_costs.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.estimated_cost}</td>
            <td>${c.explanation}</td>
        </tr>
    `).join('');

    const timelineHtml = data.timeline.map(t => `
        <li><strong>שלב ${t.phase} - ${t.name}:</strong> כ-${t.days} ימי עסקים.</li>
    `).join('');

    const totalExecutions = data.executions_summary.total_monthly_executions.toLocaleString('he-IL');

    return `
        <div style="${documentStyle}">
            <h1>הצעת מחיר לפרויקט אוטומציה, אתר ותיק עבודות</h1>
            <div style="text-align: center; color: #64748b; font-size: 11px; margin-top: -18px; margin-bottom: 20px;">
                <span>autoRI-studio - פתרונות אוטומציה ואינטגרציה עסקית מתקדמים לעולמות האירועים והעיצוב</span>
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
                    <td>30 ימים ממועד ההפקה (בתוקף עד: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')})</td>
                </tr>
                <tr>
                    <th>מנהלי פרויקט מטעם autoRI-studio:</th>
                    <td>רון ועילי</td>
                </tr>
            </table>

            <h2>2. תקציר מנהלים ומטרות העל של הפרויקט</h2>
            <p>מטרת-העל של פרויקט זה היא לייצר לעסק שלך סדר מוחלט בעיניים, לחסוך לך שעות יקרות של עבודה ידנית יומיומית, ולהעלות משמעותית את אחוז סגירת העסקאות בעסק - הכל בצורה אוטומטית שרצה מאחורי הקלעים בזמן שאתה ממוקד בליבת הפעילות השוטפת.</p>
            <p>באמצעות שילוב של מערכות ניהול מתקדמות, כלי בינה מלאכותית (AI) וחיבור לערוצי התקשורת והרשתות החברתיות, נבנה עבורך מערך דיגיטלי חכם שיעבוד בשבילך 24/7.</p>

            <h2>3. ארכיטקטורה ופירוט האוטומציות המוצעות</h2>
            ${componentsHtml}

            <div style="page-break-before: always; height: 1px;"></div>

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
                    <tr>
                        <td>
                            <strong>חבילת האוטומציות המלאה לעסק:</strong><br>
                            <span style="font-size: 10px; color: #64748b;">כולל פיתוח וחיבור כלל הרכיבים, בדיקות איכות QA והדרכה.</span>
                        </td>
                        <td style="text-align: left;">${(data.pricing.setup_cost - 2500).toLocaleString('he-IL')} ₪</td>
                        <td style="text-align: left;">₪ 0</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>דף נחיתה יוקרתי, תיק עבודות מעוצב ואינטגרציות AI:</strong><br>
                            <span style="font-size: 10px; color: #64748b;">כולל עיצוב ב-Midjourney, בנייה דינמית מותאמת מובייל וחיבור טפסים.</span>
                        </td>
                        <td style="text-align: left;">2,500 ₪</td>
                        <td style="text-align: left;">₪ 0</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>אירוח שרת n8n מאובטח ותמיכה שוטפת:</strong><br>
                            <span style="font-size: 10px; color: #64748b;">שרת ענן ייעודי ומאובטח, ניטור שגיאות 24/7, עדכוני API ותמיכה טכנית.</span>
                        </td>
                        <td style="text-align: left;">כלול בהקמה</td>
                        <td style="text-align: left;">${data.pricing.retainer_premium.toLocaleString('he-IL')} ₪ / חודש<br><span style="font-size: 9px; color: #64748b;">(חבילת Premium מומלצת)</span></td>
                    </tr>
                    <tr class="total-row">
                        <td>סה"כ פרויקט והקמה (ללא מע"מ):</td>
                        <td style="text-align: left;">${data.pricing.setup_cost.toLocaleString('he-IL')} ₪</td>
                        <td style="text-align: left;">${data.pricing.retainer_premium.toLocaleString('he-IL')} ₪ / חודש</td>
                    </tr>
                </tbody>
            </table>

            <div class="alert-box">
                <div class="alert-box-title">⚙️ למה אנחנו גובים ריטיינר חודשי? (שקט תעשייתי ומערכות יציבות 24/7)</div>
                <p style="margin: 0; font-size: 11px;">האוטומציות והאתר שלך הם המנוע השקט שמייצר לך כסף. כדי להבטיח עבודה רציפה, הריטיינר כולל: אירוח בשרתים ייעודיים מהירים (Dedicated Cloud Hosting), ניטור שגיאות אקטיבי 24/7 (לפני שאתה או הלקוח שמים לב), ותחזוקת קוד שוטפת מול שינויי API של מטא, גוגל ולינקדאין.</p>
            </div>

            <h2>5. ניתוח והערכת נפח הרצות (Executions) חודשי לעסק שלך</h2>
            <p>על בסיס ארכיטקטורת האוטומציות, המערכת תבצע מספר הרצות בכל אינטראקציה של לקוח. להלן הערכה צפויה:</p>
            <ul>
                <li><strong>סה"כ צפי חודשי:</strong> כ-${totalExecutions} הרצות בחודש.</li>
                <li><strong>פירוט החישוב:</strong> ${data.executions_summary.explanation}</li>
            </ul>

            <h2>6. הערכת עלויות צד ג' חודשיות צפויות (משולם ישירות לספקים)</h2>
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

            <h2>7. תנאי תשלום ומדיניות שביעות רצון (Satisfaction Guarantee)</h2>
            <ul>
                <li><strong>מקדמה לתחילת עבודה:</strong> ${data.pricing.advance_payment.toLocaleString('he-IL')} ₪ + מע"מ בלבד (10% מעלות ההקמה, משולם עם חתימת ההסכם לצורך אפיון מפורט וקבלת גישות).</li>
                <li><strong>יתרת תשלום סוגרת:</strong> ${data.pricing.final_payment.toLocaleString('he-IL')} ₪ + מע"מ (90% הנותרים, <strong>ישולמו רק לאחר שבועיים (14 ימים) של ריצה מלאה ותקינה של המערכות באוויר (פיילוט פעיל), ורק לאחר שביעות רצון מלאה של הלקוח מהתוצאות המעשיות ומהסדר שנוצר בעסק!</strong>).</li>
                <li><strong>עבודות מחוץ להיקף:</strong> כל שינוי או תוספת יתומחרו בנפרד לפי תעריף פיתוח שעתי של ${data.pricing.hourly_rate} ₪ + מע"מ לשעה.</li>
            </ul>

            <h2>8. לוחות זמנים משוערים להקמה</h2>
            <ol>
                ${data.timeline.map(t => `<li><strong>שלב ${t.phase} - ${t.name}:</strong> כ-${t.days} ימי עסקים.</li>`).join('')}
            </ol>
            <p><em>* סה"כ זמן משוער לעלייה מלאה לאוויר: כ-27 ימי עסקים ממועד קבלת המקדמה והגישות (נשאף לקצר ככל הניתן).</em></p>

            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-title">מטעם autoRI-studio (הספק)</div>
                    <p style="font-size: 11px; margin-bottom: 12px;">מנהלים מייצגים: רון ועילי</p>
                    <div class="signature-line"></div>
                    <p style="font-size: 10px; margin: 0; color: #64748b;">חתימה וחותמת</p>
                </div>
                <div class="signature-box">
                    <div class="signature-title">מטעם הלקוח (המזמין)</div>
                    <p style="font-size: 11px; margin-bottom: 12px;">שם הנציג המורשה: _________________</p>
                    <div class="signature-line"></div>
                    <p style="font-size: 10px; margin: 0; color: #64748b;">חתימה וחותמת</p>
                </div>
            </div>

            <div class="footer-note">
                <span>מסמך זה הופק כחלק מחבילת ההתקשרות והאפיון של autoRI-studio עבור ${data.business_name} | שנת ${new Date().getFullYear()}</span>
            </div>
        </div>
    `;
}

/**
 * Builds the HTML content for the Contract
 */
export function buildContractHtml(data) {
    const componentsListHtml = data.components.map(c => `
        <li><strong>רכיב ${c.id}: "${c.name}"</strong> - ${c.description} (מערכות: ${c.systems.join(', ')}).</li>
    `).join('');

    return `
        <div style="${documentStyle}">
            <h1>הסכם למתן שירותי פיתוח, הקמה ותחזוקת מערכות</h1>
            <div style="text-align: center; color: #64748b; font-size: 11px; margin-top: -18px; margin-bottom: 20px;">
                <span>autoRI-studio - פתרונות אוטומציה, אינטגרציה עסקית ודפי נחיתה מתקדמים</span>
            </div>

            <p style="text-align: center; font-weight: 600; margin-bottom: 20px;">שנערך ונחתם ביום ${new Date().getDate()} בחודש ${new Date().toLocaleString('he-IL', { month: 'long' })} שנת ${new Date().getFullYear()}</p>

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
            <p>הספק יפתח, יעצב ויטמיע עבור הלקוח את ${data.components.length} הרכיבים הבאים, המהווים את גרעין הפרויקט והאפיון הטכנולוגי שלו:</p>
            <ul>
                ${componentsListHtml}
            </ul>
            <p>כל שינוי, תוספת או סטייה מהרכיבים המוגדרים מעלה יתומחרו בנפרד לפי תעריף פיתוח שעתי של ${data.pricing.hourly_rate} ₪ + מע"מ לשעה (או לפי הצעת מחיר גלובלית וכתובה שתסוכם מראש).</p>

            <h2>2. תמורה, אבני דרך ותנאי תשלום</h2>
            <h3>א. עלות הקמה ופיתוח חד-פעמית (חלוקה מבוססת שביעות רצון):</h3>
            <p>עבור אפיון, פיתוח, עיצוב והקמה של הרכיבים המפורטים לעיל, ישלם הלקוח לספק סך חד-פעמי של <strong>${data.pricing.setup_cost.toLocaleString('he-IL')} ₪ + מע"מ כחוק</strong>. פריסת התשלומים תתבצע כדלקמן:</p>
            <ol>
                <li><strong>תשלום ראשון (מקדמה):</strong> סך של <strong>${data.pricing.advance_payment.toLocaleString('he-IL')} ₪ + מע"מ בלבד</strong>, ישולם במעמד חתימת הסכם זה לצורך התחלת עבודה, תחילת האפיון המפורט וקבלת גישות למערכות.</li>
                <li><strong>תשלום שני (יתרת סגירה):</strong> סך של <strong>${data.pricing.final_payment.toLocaleString('he-IL')} ₪ + מע"מ</strong>, ישולם רק לאחר שבועיים (14 ימים) של הרצה מלאה ותקינה של המערכות באוויר (פיילוט פעיל), <strong>ורק לאחר שביעות רצון מלאה של הלקוח מהתוצאות המעשיות ומהסדר שנוצר בעסק!</strong></li>
            </ol>

            <h3>ב. ריטיינר חודשי לתחזוקה, שרת ותמיכה טכנית:</h3>
            <p>עבור אירוח המערכות בשרת n8n פרטי ומאובטח, ניטור אקטיבי של שגיאות ופניות 24/7, עדכוני אבטחה שוטפים והתאמת קוד לשינויי API של חברות צד ג', ישלם הלקוח ריטיינר חודשי קבוע. הלקוח יבחר את מסלול השרת הרלוונטי עבורו במעמד החתימה:</p>
            <ul>
                <li><strong>[ ] מסלול Premium (מומלץ לעסק פעיל):</strong> ${data.pricing.retainer_premium.toLocaleString('he-IL')} ₪ + מע"מ לחודש. כולל עד 5,000 הרצות (Executions) בחודש, כיסוי מלא של נפח העבודה, מקום רב לצמיחה, ותמיכה מועדפת.</li>
                <li><strong>[ ] מסלול Standard (בסיסי):</strong> ${data.pricing.retainer_standard.toLocaleString('he-IL')} ₪ + מע"מ לחודש. כולל עד 1,000 הרצות בחודש (חריגה מחיוב של 0.20 ₪ לכל ריצה נוספת).</li>
            </ul>
            <p><em>* הטבת השקה מיוחדת: הלקוח זכאי לבונוס חד-פעמי של 1,000 הרצות נוספות ללא עלות במהלך חודש הפעילות הראשון.</em></p>

            <h3>ג. עדכוני תוכן ידניים באתר ובתיק העבודות:</h3>
            <p>הריטיינר החודשי עוסק בתחזוקה טכנולוגית ותשתיתית בלבד. עדכוני תוכן ידניים (העלאת פרויקטים חדשים, החלפת תמונות, שינויי טקסט קלים) יבוצעו בעלות קבועה של 300 ₪ + מע"מ עבור כל סבב עדכונים מבוקש (מכסה עד שעת עבודה אחת בפועל).</p>

            <h3>ד. ריבית פיגורים:</h3>
            <p>איחור בתשלום העולה על 14 ימים ממועד הפירעון המוסכם ישא ריבית פיגורים שבועית בשיעור של 1.5% מהסכום שבפיגור.</p>

            <div style="page-break-before: always; height: 1px;"></div>

            <h2>3. קניין רוחני (Intellectual Property)</h2>
            <p>כל זכויות הקניין רוחני באוטומציות, במנגנונים, בדף הנחיתה, בקטגוריות הקוד שפותחו ובארכיטקטורת המערכת שהוקמה במיוחד עבור הלקוח, יעברו לבעלותו המלאה והבלעדית של הלקוח אך ורק לאחר פירעון מלא וסופי של כל התשלומים המגיעים לספק עבור שלב ההקמה (${data.pricing.setup_cost.toLocaleString('he-IL')} ₪ + מע"מ).</p>
            <p>הספק שומר לעצמו את הזכות לעשות שימוש חוזר ברכיבי קוד גנריים, שיטות פיתוח ואינטגרציה, פונקציות עזר וארכיטקטורות זרימה שאינם מכילים מידע עסקי ספציפי או סודי של הלקוח.</p>

            <h2>4. הגבלת אחריות (Limitation of Liability)</h2>
            <p><strong>סעיף הגבלת אחריות והחרגת נזקים:</strong> בשום מקרה ובשום נסיבות לא תעלה החבות הכוללת של הספק בגין כל נזק, הפסד, פגיעה או תביעה במסגרת הסכם זה, על הסכום הכולל ששולם בפועל על ידי הלקוח לספק עבור רכיב ההקמה הספציפי שגרם לנזק המדובר.</p>
            <p>הספק אינו אחראי בשום אופן לנזקים עקיפים, תוצאתיים, מיוחדים או נלווים, לרבות אובדן רווחים, אובדן עסקאות, הפרעות לפעילות העסקית, נפילות של שירותי צד ג' (כגון עדכוני מטא, תקלות ב-API WhatsApp, שינויים במדיניות LinkedIn או תקלות בשרתי OpenAI) או אובדן נתונים עקב תקלות תקשורת שאינן בשליטתו הישירה.</p>

            <h2>5. תוקף, סיום ההסכם ומדיניות ביטולים</h2>
            <p>התחייבות פיתוח הפרויקט תחל עם חתימת מסמך זה ותסתיים עם עלייתו המלאה לאוויר ומסירתו הרשמית ללקוח. הסכם התחזוקה והריטיינר החודשי הינו לתקופה של 12 חודשים ממועד ההפעלה, ויחודש אוטומטית לתקופות נוספות של שנה בכל פעם.</p>
            <p>כל צד רשאי לסיים את הסכם התחזוקה והשירות בכל עת ומכל סיבה, וזאת על ידי מתן הודעה בכתב (בדואר אלקטרוני או בוואטסאפ מתועד) לצד השני לפחות 30 יום מראש. הלקוח יחוייב בתשלום יחסי עבור שירותי התחזוקה והרצות השרת שבוצעו בפועל עד למועד סיום ההתקשרות.</p>

            <h2>6. שמירת סודיות (NDA)</h2>
            <p>הצדדים מצהירים ומסכימים כי שמירת הסודיות על המידע העסקי הרגיש שייחשף במהלך פיתוח הפרויקט, לרבות פרטי גישה למערכות, תמונות קונספט, סיסמאות ומפתחות API, מוסדרת במלואה תחת מסמך נפרד ייעודי - "הסכם שמירת סודיות (NDA) - ${data.business_name}" שנחתם במקביל להסכם זה ומהווה חלק בלתי נפרד ממנו.</p>

            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-title">הספק: autoRI-studio</div>
                    <p style="font-size: 11px; margin-bottom: 12px;">שמות המייצגים: רון ועילי<br>תאריך החתימה: ${new Date().toLocaleDateString('he-IL')}</p>
                    <div class="signature-line"></div>
                    <p style="font-size: 10px; margin: 0; color: #64748b;">חתימה וחותמת הספק</p>
                </div>
                <div class="signature-box">
                    <div class="signature-title">הלקוח (המזמין): ${data.business_name}</div>
                    <p style="font-size: 11px; margin-bottom: 12px;">שם נציג מורשה: _________________<br>בחירת מסלול ריטיינר: [ ] Premium / [ ] Standard</p>
                    <div class="signature-line"></div>
                    <p style="font-size: 10px; margin: 0; color: #64748b;">חתימה וחותמת המזמין</p>
                </div>
            </div>

            <div class="footer-note">
                <span>מסמך זה הופק כחלק מחבילת ההתקשרות של autoRI-studio עבור ${data.business_name} | שנת ${new Date().getFullYear()}</span>
            </div>
        </div>
    `;
}

/**
 * Builds the HTML content for the NDA
 */
export function buildNdaHtml(data) {
    return `
        <div style="${documentStyle}">
            <h1>הסכם שמירת סודיות (NDA - Non-Disclosure Agreement)</h1>
            <div style="text-align: center; color: #64748b; font-size: 11px; margin-top: -18px; margin-bottom: 20px;">
                <span>autoRI-studio - פתרונות אוטומציה ואינטגרציה עסקית מתקדמים</span>
            </div>

            <p style="text-align: center; font-weight: 600; margin-bottom: 20px;">שנערך ונחתם ביום ${new Date().getDate()} בחודש ${new Date().toLocaleString('he-IL', { month: 'long' })} שנת ${new Date().getFullYear()}</p>

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
            <p>"מידע סודי" פירושו כל מידע עסקי, פיננסי, שיווקי, טכני, טכנולוגי, פרטי לקוחות של העסק, סיסמאות גישה למערכות, מפתחות API, שיטות עבודה, תהליכים פנימיים, נתוני פיתוח או תרשימי זרימה שיועברו בין הצדדים, בין אם בכתב, בעל-פה, במדיה דיגיטלית או בכל דרך אחרת, לרבות מידע שנחשף במהלך פגישות ושיחות האפיון לפיתוח האוטומציות.</p>

            <h2>2. התחייבות לאי-גילוי ושימוש מוגבל</h2>
            <p>הצד המקבל (autoRI-studio) מתחייב:</p>
            <ul>
                <li>לשמור על המידע הסודי בסודיות מוחלטת ולנקוט בכל האמצעים הסבירים והמקובלים בתעשייה על מנת למנוע חשיפתו לצד שלישי כלשהו.</li>
                <li>לעשות שימוש במידע הסודי אך ורק לצורך מתן השירותים, הפיתוח, האינטגרציה והתחזוקה השוטפת של המערכות עבור הצד המוסר.</li>
                <li>להגביל את החשיפה של המידע הסודי לעובדים או קבלני משנה מטעמו הזקוקים לו לצורך קידום וביצוע הפרויקט בלבד, ולוודא כי הם חתומים על התחייבות סודיות תואמת.</li>
            </ul>

            <h2>3. מחיקה והחזרת מידע בסיום פרויקט</h2>
            <div class="alert-box" style="background-color: #f0fdf4; border-right: 4px solid #16a34a; color: #14532d;">
                <div class="alert-box-title" style="color: #166534;">🛡️ סעיף פינוי נתונים ואבטחה מוגברת:</div>
                <p style="margin: 0; font-size: 11px;">עם סיום ההתקשרות בין הצדדים, או עם קבלת דרישה מפורשת בכתב מהצד המוסר (${data.business_name}), מתחייב הצד המקבל למחוק לצמיתות או להחזיר לצד המוסר את כל העותקים הפיזיים והדיגיטליים של המידע הסודי שברשותו. הדבר כולל: קובצי עיצוב, קטלוגים, תמונות קונספט, פרטי גישה לחשבונות, סיסמאות ומפתחות API (כגון Meta, LinkedIn, WhatsApp Business, n8n), בסיסי נתונים, רשימות תפוצה או תדפיסי פניות לקוחות שהצטברו במהלך הבדיקות. הצד המקבל מתחייב לספק אישור בכתב המעיד על ביצוע המחיקה והטיהור של הנתונים תוך 14 ימי עסקים ממועד הדרישה.</p>
            </div>

            <h2>4. תקופת ההסכם וסעדים</h2>
            <p>התחייבות הסודיות לפי הסכם זה תעמוד בתוקפה במהלך אפיון ופיתוח הפרויקט, ותישאר בתוקף מלא למשך <strong>3 שנים</strong> ממועד סיום ההתקשרות בין הצדדים מכל סיבה שהיא.</p>
            <p>הפרת הסכם זה תזכה את הצד המוסר בכל הסעדים המגיעים לו על פי כל דין, לרבות צווי מניעה ופיצויים בגין נזקים ישירים שנגרמו לו עקב ההפרה או השימוש הבלתי מורשה במידע.</p>

            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-title">הצד המוסר (הלקוח): ${data.business_name}</div>
                    <p style="font-size: 11px; margin-bottom: 12px;">שם נציג מורשה: _________________</p>
                    <div class="signature-line"></div>
                    <p style="font-size: 10px; margin: 0; color: #64748b;">חתימה וחותמת המזמין</p>
                </div>
                <div class="signature-box">
                    <div class="signature-title">הצד המקבל (הספק): autoRI-studio</div>
                    <p style="font-size: 11px; margin-bottom: 12px;">מנהלים מייצגים: רון ועילי</p>
                    <div class="signature-line"></div>
                    <p style="font-size: 10px; margin: 0; color: #64748b;">חתימה וחותמת הספק</p>
                </div>
            </div>

            <div class="footer-note">
                <span>מסמך זה הופק כחלק מחבילת ההתקשרות והאפיון של autoRI-studio עבור ${data.business_name} | שנת ${new Date().getFullYear()}</span>
            </div>
        </div>
    `;
}

/**
 * Converts a styled HTML string to a PDF Blob using jsPDF and html2canvas
 */
export async function htmlToPdfBlob(htmlContent) {
    // Create temporary container offscreen
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '794px'; // ~A4 width at 96 DPI
    container.style.background = '#ffffff';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
            compress: true
        });

        // Use jsPDF html method
        await new Promise((resolve, reject) => {
            doc.html(container, {
                callback: function (pdf) {
                    resolve(pdf);
                },
                x: 0,
                y: 0,
                width: 595.28, // A4 width in pt
                windowWidth: 794,
                autoPaging: 'text'
            });
        });

        return doc.output('blob');
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * High-level orchestration function to generate the 3 documents and upload them to Supabase
 */
export async function generateAndUploadDocuments(rawSpec, setupCost, lead, onStatusUpdate) {
    const clientData = {
        name: lead.name,
        company: lead.company || lead.name,
        phone: lead.phone,
        email: lead.email
    };

    if (onStatusUpdate) onStatusUpdate('מנתח אפיון ב-AI ומחלץ רכיבים...');
    const parsedData = await parseSpecWithAI(rawSpec, setupCost, clientData);

    const docsToGenerate = [
        {
            type: 'proposal',
            name: 'הצעת מחיר לפרויקט אוטומציה',
            html: buildProposalHtml(parsedData),
            fileName: 'Proposal.pdf'
        },
        {
            type: 'contract',
            name: 'הסכם פיתוח ותחזוקת מערכות',
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
        
        // Wrap the blob in a File object
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
