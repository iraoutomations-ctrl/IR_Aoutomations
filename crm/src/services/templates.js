/* ==========================================================================
   autoRI-studio CRM - Word Document (.doc) Templates & Downloader
   ========================================================================== */

const getHtmlWrapper = (title, contentHtml) => `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.6;
            color: #2d3748;
            padding: 40px;
            background-color: #ffffff;
        }
        .header-table {
            width: 100%;
            border-bottom: 3px solid #1a365d;
            margin-bottom: 30px;
        }
        .header-title {
            font-size: 28px;
            font-weight: bold;
            color: #1a365d;
            margin: 0;
            padding-bottom: 10px;
        }
        .header-subtitle {
            font-size: 14px;
            color: #718096;
            margin: 0;
            padding-bottom: 15px;
        }
        h1 {
            color: #1a365d;
            font-size: 22px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h2 {
            color: #2b6cb0;
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p, li {
            font-size: 13px;
            color: #4a5568;
            margin-bottom: 8px;
        }
        ul, ol {
            margin-top: 5px;
            margin-bottom: 15px;
            padding-right: 20px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #cbd5e0;
            padding: 10px;
            font-size: 12px;
            text-align: right;
        }
        table.data-table th {
            background-color: #ebf8ff;
            color: #2b6cb0;
            font-weight: bold;
        }
        .alert-box {
            background-color: #fffaf0;
            border-right: 4px solid #dd6b20;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert-box-title {
            font-weight: bold;
            color: #dd6b20;
            font-size: 13px;
            margin-bottom: 5px;
        }
        .info-box {
            background-color: #f7fafc;
            border-right: 4px solid #4a5568;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box-title {
            font-weight: bold;
            color: #4a5568;
            font-size: 13px;
            margin-bottom: 5px;
        }
        .signature-section {
            margin-top: 50px;
            width: 100%;
        }
        .signature-box {
            width: 45%;
            float: right;
            font-size: 13px;
        }
        .signature-line {
            border-top: 1px solid #a0aec0;
            margin-top: 40px;
            padding-top: 5px;
            color: #718096;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="header-title">${title}</div>
                <div class="header-subtitle"><span dir="ltr">autoRI-studio</span> - פתרונות אוטומציה ואינטגרציה עסקית מתקדמים</div>
            </td>
        </tr>
    </table>
    ${contentHtml}
    <div class="clear"></div>
    <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #a0aec0; direction: rtl;">
        מסמך זה הופק באמצעות מערכת ה-CRM של <span dir="ltr">autoRI-studio</span> | כל הזכויות שמורות.
    </div>
</body>
</html>
`;

export const TEMPLATE_HTMLS = {
    proposal: `
        <h1>הצעת מחיר ופתרון טכנולוגי</h1>
        
        <h2>1. פרטי ההצעה והלקוח</h2>
        <table class="data-table">
            <tr>
                <th width="30%">עבור לקוח / חברה:</th>
                <td>[שם הלקוח / שם החברה]</td>
            </tr>
            <tr>
                <th>תאריך הפקה:</th>
                <td>\${new Date().toLocaleDateString('he-IL')}</td>
            </tr>
            <tr>
                <th>תוקף ההצעה:</th>
                <td>30 ימים ממועד ההפקה (בתוקף עד: [תאריך תפוגה])</td>
            </tr>
            <tr>
                <th>מנהל פרויקט:</th>
                <td><span dir="ltr">autoRI-studio</span></td>
            </tr>
        </table>

        <h2>2. תקציר מנהלים ומטרות הפרויקט</h2>
        <p>מטרת הפרויקט היא לייעל את התהליכים העסקיים של הלקוח באמצעות פיתוח אוטומציות מתקדמות המקשרות בין מערכות המידע השונות בעסק, חוסכות שעות עבודה ידניות מרובות ומונעות טעויות אנוש.</p>
        <p>על בסיס שיחות האפיון המוקדמות, הגדרנו את האוטומציות הבאות כמפתח לשיפור היעילות התפעולית והמכירתית של העסק.</p>

        <h2>3. ארכיטקטורה ופירוט האוטומציות המוצעות</h2>
        <h3>אוטומציה 1: [שם האוטומציה - לדוגמה: מענה ללידים מבוסס AI]</h3>
        <ul>
            <li><strong>מקור נתונים <span dir="ltr">(Trigger)</span>:</strong> קבלת ליד חדש מטופס אתר, דף נחיתה או קמפיין ממומן.</li>
            <li><strong>מערכות מעורבות:</strong> WhatsApp Business API, Supabase Database, CRM, Gemini API.</li>
            <li><strong>תהליך זרימה מתוכנן:</strong>
                <ol>
                    <li>האזנה ל-Webhook עם פרטי הליד החדש.</li>
                    <li>פנייה ל-Gemini API לניתוח מהיר של העסק וסיווג הליד.</li>
                    <li>שליחת הודעת פנייה אישית ומתוחכמת בוואטסאפ לליד תוך 2 דקות.</li>
                    <li>עדכון רשומת הליד ב-CRM כולל הניתוח שביצע ה-AI.</li>
                </ol>
            </li>
        </ul>

        <h2>4. תמחור ועלויות פיתוח</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="50%">תיאור השירות / האוטומציה</th>
                    <th width="25%" style="text-align: left;">עלות הקמה חד-פעמית</th>
                    <th width="25%" style="text-align: left;">ריטיינר חודשי לתחזוקה</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>פיתוח ואפיון אוטומציה 1: [שם האוטומציה]</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                </tr>
                <tr>
                    <td>אירוח שרת N8N מאובטח, תמיכה שוטפת ותיקון באגים</td>
                    <td style="text-align: left;">כלול</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                </tr>
                <tr style="font-weight: bold; background-color: #f7fafc;">
                    <td>סה"כ <span dir="ltr">(ללא מע"מ)</span>:</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                </tr>
            </tbody>
        </table>

        <h2>5. תנאי תשלום ומדיניות שינויים</h2>
        <ul>
            <li><strong>תנאי תשלום:</strong> 50% מקדמה עם החתימה על הסכם העבודה, 50% הנותרים עם מסירת המערכת ובדיקות QA מוצלחות.</li>
            <li><strong>שעות עבודה מחוץ להיקף:</strong> כל דרישה לשינוי או תוספת שאינה מופיעה במסמך האפיון הטכני תתומחר בנפרד לפי תעריף פיתוח של [סכום בשקלים] לשעה + מע"מ, או תחת הצעת מחיר נפרדת מוסכמת מראש.</li>
        </ul>

        <h2>6. לוחות זמנים משוערים</h2>
        <ul>
            <li><strong>שלב 1:</strong> כתיבת מסמך אפיון טכני מפורט ואישורו - [X] ימי עסקים.</li>
            <li><strong>שלב 2:</strong> פיתוח האוטומציות ובדיקות QA פנימיות - [Y] ימי עסקים.</li>
            <li><strong>שלב 3:</strong> הרצת פיילוט, בדיקות לקוח <span dir="ltr">(UAT)</span> ומסירה רשמית - [Z] ימי עסקים.</li>
        </ul>
    `,

    contract: `
        <h1>הסכם למתן שירותי פיתוח ותחזוקת אוטומציות</h1>
        <p>שנערך ונחתם ביום [יום] בחודש [חודש] שנת [שנה]</p>
        
        <h2>בין:</h2>
        <p><strong><span dir="ltr">autoRI-studio</span></strong> <span dir="rtl">(להלן: "הספק")</span> מצד אחד;</p>
        <h2>לבין:</h2>
        <p><strong>[שם הלקוח / חברה]</strong> ח.פ. [מספר חברה] <span dir="rtl">(להלן: "הלקוח")</span> מצד שני;</p>

        <h1>הואיל והספק עוסק בפיתוח, אינטגרציה ותחזוקה של אוטומציות עסקיות; והואיל והלקוח מעוניין לקבל שירותים אלו כמפורט בהסכם זה; לפיכך הוסכם בין הצדדים כדלקמן:</h1>

        <h2>1. היקף השירותים והאפיון</h2>
        <p>הספק יפתח ויטמיע עבור הלקוח את האוטומציות המפורטות במסמך האפיון הטכני (נספח א'). כל שינוי או תוספת לאפיון המוסכם יתומחרו בנפרד לפי תעריף שעתי מוסכם של [סכום בשקלים] לשעה + מע"מ, או במסגרת נספח שינויים כתוב חתום על ידי שני הצדדים.</p>

        <h2>2. תמורה ותנאי תשלום</h2>
        <ul>
            <li><strong>עלות הקמה:</strong> עבור פיתוח האוטומציות, ישלם הלקוח לספק סך חד-פעמי של [סכום בשקלים] + מע"מ כחוק. התשלום יבוצע: 50% כמקדמה עם חתימת הסכם זה, ו-50% הנותרים תוך 7 ימים ממועד מסירת המערכת.</li>
            <li><strong>ריטיינר חודשי:</strong> עבור שירותי תחזוקה, ניטור, תיקון באגים ואירוח המערכות בשרת ייעודי, ישלם הלקוח לספק ריטיינר חודשי קבוע בסך של [סכום בשקלים] + מע"מ. הריטיינר ישולם בכל 1 לכל חודש קלנדרי, החל מהחודש שבו הועלתה האוטומציה הראשונה לאוויר (Live).</li>
            <li><strong>ריבית פיגורים:</strong> איחור בתשלום העולה על 14 ימים יישא ריבית פיגורים שבועית בשיעור של <span dir="ltr">1.5%</span> מהסכום שבפיגור.</li>
        </ul>

        <h2>3. קניין רוחני <span dir="ltr">(Intellectual Property)</span></h2>
        <p>כל זכויות הקניין הרוחני באוטומציות, בקוד, באפיון ובתרשימי הזרימה שפותחו במיוחד עבור הלקוח במסגרת פרויקט זה, יעברו לבעלותו הבלעדית של הלקוח אך ורק לאחר פירעון מלא של כל התשלומים המגיעים לספק לפי הסכם זה.</p>
        <p>הספק שומר לעצמו את הזכות לעשות שימוש חוזר ברכיבי קוד גנריים, שיטות עבודה וארכיטקטורה שאינם מכילים מידע עסקי ספציפי של הלקוח.</p>

        <h2>4. הגבלת אחריות <span dir="ltr">(Limitation of Liability)</span></h2>
        <div class="alert-box">
            <div class="alert-box-title">סעיף הגבלת אחריות קריטי:</div>
            <p>בשום מקרה ובשום נסיבות לא תעלה החבות הכוללת של הספק עבור כל נזק, הפסד, פגיעה או תביעה (בין אם חוזית, נזיקית או אחרת) במסגרת הסכם זה, על הסכום הכולל ששולם בפועל על ידי הלקוח לספק עבור רכיב הפיתוח הספציפי שגרם לנזק.</p>
            <p>הספק אינו אחראי לנזקים עקיפים, תוצאתיים או מיוחדים, לרבות אובדן רווחים, הפסד הכנסות או אובדן נתונים עקב תקלות במערכת.</p>
        </div>

        <h2>5. תוקף וסיום ההסכם</h2>
        <p>הסכם זה הינו לתקופה של 12 חודשים, ויחודש אוטומטית לתקופות נוספות של שנה כל אחת, אלא אם אחד הצדדים מסר הודעה מכתב על רצונו לסיים את ההתקשרות לפחות 30 יום לפני תום התקופה הנוכחית.</p>

        <div class="signature-section">
            <div class="signature-box">
                <p><strong>הלקוח:</strong> [שם הלקוח / חברה]</p>
                <p>שם המורשה לחתום: _________________</p>
                <div class="signature-line">חתימה וחותמת הלקוח</div>
            </div>
            <div class="signature-box" style="float: left;">
                <p><strong>הספק:</strong> <span dir="ltr">autoRI-studio</span></p>
                <p>שם המייצג: _________________</p>
                <div class="signature-line">חתימה וחותמת הספק</div>
            </div>
            <div class="clear"></div>
        </div>
    `,

    nda: `
        <h1>הסכם שמירת סודיות <span dir="ltr">(Non-Disclosure Agreement)</span></h1>
        <p>שנערך ונחתם ביום [יום] בחודש [חודש] שנת [שנה]</p>
        
        <h2>בין:</h2>
        <p><strong>[שם הלקוח / חברה]</strong> ח.פ. [מספר חברה] <span dir="rtl">(להלן: "הצד המוסר")</span></p>
        <h2>לבין:</h2>
        <p><strong><span dir="ltr">autoRI-studio</span></strong> <span dir="rtl">(להלן: "הצד המקבל")</span></p>

        <h2>1. הגדרת "מידע סודי"</h2>
        <p>"מידע סודי" פירושו כל מידע עסקי, פיננסי, שיווקי, טכני, טכנולוגי, פרטי לקוחות, סיסמאות גישה, תהליכים פנימיים, נתוני פיתוח או תרשימי זרימה שיועברו בין הצדדים, בין אם בכתב, בעל-פה, במדיה דיגיטלית או בכל דרך אחרת, לרבות מידע שנחשף במהלך שיחות האפיון לפיתוח האוטומציות.</p>

        <h2>2. התחייבות לאי-גילוי ושימוש מוגבל</h2>
        <p>הצד המקבל מתחייב:</p>
        <ul>
            <li>לשמור על המידע הסודי בסודיות מוחלטת ולנקוט בכל האמצעים הסבירים למנוע חשיפתו לצד שלישי.</li>
            <li>לעשות שימוש במידע הסודי אך ורק לצורך מתן השירותים, הפיתוח והתחזוקה של המערכות עבור הצד המוסר.</li>
            <li>להגביל את החשיפה של המידע הסודי לעובדים או קבלני משנה מטעמו הזקוקים לו לצורך הפרויקט בלבד, ולוודא כי הם חתומים על התחייבות סודיות תואמת.</li>
        </ul>

        <h2>3. מחיקה והחזרת מידע בסיום פרויקט</h2>
        <div class="info-box">
            <div class="info-box-title">סעיף פינוי נתונים ואבטחה:</div>
            <p>עם סיום ההתקשרות בין הצדדים, או עם קבלת דרישה בכתב מהצד המוסר, מתחייב הצד המקבל למחוק או להחזיר לצד המוסר את כל העותקים הפיזיים והדיגיטליים של המידע הסודי שברשותו (לרבות קבצים, מפתחות API, בסיסי נתונים ופרטי גישה) ולספק אישור בכתב על ביצוע המחיקה תוך 14 ימי עסקים.</p>
        </div>

        <h2>4. תקופת ההסכם וסעדים</h2>
        <p>התחייבות הסודיות לפי הסכם זה תעמוד בתוקפה במהלך פיתוח הפרויקט ותישאר בתוקף למשך [3] שנים ממועד סיום ההתקשרות בין הצדדים מכל סיבה שהיא.</p>
        <p>הפרת הסכם זה תזכה את הצד המוסר בכל הסעדים המגיעים לו על פי כל דין, לרבות צווי מניעה ופיצויים בגין נזקים ישירים שנגרמו לו עקב ההפרה.</p>

        <div class="signature-section">
            <div class="signature-box">
                <p><strong>הצד המוסר:</strong> [שם הלקוח / חברה]</p>
                <div class="signature-line">חתימה</div>
            </div>
            <div class="signature-box" style="float: left;">
                <p><strong>הצד המקבל:</strong> <span dir="ltr">autoRI-studio</span></p>
                <div class="signature-line">חתימה</div>
            </div>
            <div class="clear"></div>
        </div>
    `,

    discovery: `
        <h1>מסמך איפיון ראשוני – מיפוי אפשרויות אוטומציה ודרישות</h1>

        <h2>1. פרטי הפרויקט והלקוח</h2>
        <table class="data-table">
            <tr>
                <th width="30%">עבור לקוח / חברה:</th>
                <td>[שם הלקוח / שם החברה]</td>
            </tr>
            <tr>
                <th>תאריך הפקה:</th>
                <td>\${new Date().toLocaleDateString('he-IL')}</td>
            </tr>
            <tr>
                <th>שלב בתהליך:</th>
                <td>איפיון ראשוני - טרם נבחרה אפשרות סופית ליישום</td>
            </tr>
            <tr>
                <th>נכתב על ידי:</th>
                <td><span dir="ltr">autoRI-studio</span></td>
            </tr>
        </table>

        <h2>2. רקע ומטרות</h2>
        <p>מסמך זה מסכם את שיחות האפיון הראשוניות עם הלקוח, וממפה את מכלול האפשרויות הטכנולוגיות הרלוונטיות לפתרון הצרכים העסקיים שהועלו. מטרת המסמך היא לאפשר ללקוח לבחור, מתוך מספר כיווני פעולה, את האפשרות (או שילוב האפשרויות) המתאימה ביותר להמשך פיתוח - בטרם מעבר לשלב מסמך האפיון הטכני הסופי והמחייב.</p>

        <h2>3. מיפוי אפשרויות האוטומציה</h2>

        <h3>אפשרות 1: [שם האפשרות]</h3>
        <p><strong>תיאור:</strong> [תיאור ההזדמנות / הבעיה שהאפשרות פותרת, ואופן הפעולה המוצע]</p>
        <table class="data-table">
            <tr>
                <th width="30%">מערכות מעורבות:</th>
                <td>[רשימת מערכות ואינטגרציות]</td>
            </tr>
            <tr>
                <th>מורכבות משוערת:</th>
                <td>[נמוכה / בינונית / גבוהה]</td>
            </tr>
            <tr>
                <th>השפעה עסקית משוערת:</th>
                <td>[תיאור התועלת הצפויה - חיסכון בזמן, הגדלת מכירות וכו']</td>
            </tr>
        </table>
        <p><strong>דרישות גישה ומשאבים נדרשים מהלקוח למימוש אפשרות זו:</strong></p>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="40%">פריט נדרש</th>
                    <th width="30%">סוג</th>
                    <th width="30%">הערות</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>[לדוגמה: הרשאת אדמין למערכת קיימת של הלקוח]</td>
                    <td>גישת משתמש</td>
                    <td>[פרטים נוספים]</td>
                </tr>
                <tr>
                    <td>[לדוגמה: יצירת חשבון מפתח / API Key בפלטפורמה מסוימת]</td>
                    <td>מפתח API</td>
                    <td>[פרטים נוספים]</td>
                </tr>
                <tr>
                    <td>[לדוגמה: רכישת מנוי / שדרוג תוכנית בפלטפורמה נדרשת]</td>
                    <td>רכישה / מנוי</td>
                    <td>[פרטים נוספים]</td>
                </tr>
            </tbody>
        </table>

        <h3>אפשרות 2: [שם האפשרות]</h3>
        <p><strong>תיאור:</strong> [תיאור ההזדמנות / הבעיה שהאפשרות פותרת, ואופן הפעולה המוצע]</p>
        <table class="data-table">
            <tr>
                <th width="30%">מערכות מעורבות:</th>
                <td>[רשימת מערכות ואינטגרציות]</td>
            </tr>
            <tr>
                <th>מורכבות משוערת:</th>
                <td>[נמוכה / בינונית / גבוהה]</td>
            </tr>
            <tr>
                <th>השפעה עסקית משוערת:</th>
                <td>[תיאור התועלת הצפויה]</td>
            </tr>
        </table>
        <p><strong>דרישות גישה ומשאבים נדרשים מהלקוח למימוש אפשרות זו:</strong> [פירוט הרשאות, משתמשים, סיסמאות ומנויים נדרשים]</p>

        <h2>4. טבלת השוואה מסכמת</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="25%">אפשרות</th>
                    <th width="20%">מורכבות</th>
                    <th width="20%">עלות הקמה משוערת</th>
                    <th width="20%">זמן פיתוח משוער</th>
                    <th width="15%">עדיפות מומלצת</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>אפשרות 1: [שם]</td>
                    <td>[נמוכה / בינונית / גבוהה]</td>
                    <td>[סכום בשקלים]</td>
                    <td>[X ימי עסקים]</td>
                    <td>[גבוהה / בינונית / נמוכה]</td>
                </tr>
                <tr>
                    <td>אפשרות 2: [שם]</td>
                    <td>[נמוכה / בינונית / גבוהה]</td>
                    <td>[סכום בשקלים]</td>
                    <td>[X ימי עסקים]</td>
                    <td>[גבוהה / בינונית / נמוכה]</td>
                </tr>
            </tbody>
        </table>

        <h2>5. המלצת הסטודיו ושלבי המשך</h2>
        <div class="info-box">
            <div class="info-box-title">המלצה:</div>
            <p>[המלצת הסטודיו לגבי האפשרות / האפשרויות המומלצות למימוש ראשוני, ונימוק קצר]</p>
        </div>
        <div class="alert-box">
            <div class="alert-box-title">שלב הבא בתהליך:</div>
            <p>לאחר בחירת הלקוח באפשרות (או באפשרויות) הרצויה מתוך מסמך זה, יופק <strong>מסמך אפיון טכני וארכיטקטורה</strong> מפורט ומחייב עבור האפשרות שנבחרה, הכולל את כל שלבי הזרימה הטכניים, טיפול בשגיאות ולוחות זמנים מדויקים.</p>
        </div>
    `,

    spec: `
        <h1>מסמך אפיון טכני וארכיטקטורה <span dir="ltr">(Technical Spec)</span></h1>
        
        <h2>1. פרטי המערכת והאוטומציה</h2>
        <table class="data-table">
            <tr>
                <th width="30%">שם האוטומציה:</th>
                <td>[לדוגמה: בוט מענה וסיווג לידים]</td>
            </tr>
            <tr>
                <th>מזהה Workflow ב-<span dir="ltr">N8N</span>:</th>
                <td>[מזהה תהליך N8N]</td>
            </tr>
            <tr>
                <th>תאריך כתיבה:</th>
                <td>\${new Date().toLocaleDateString('he-IL')}</td>
            </tr>
            <tr>
                <th>כותב האפיון:</th>
                <td><span dir="ltr">autoRI-studio</span></td>
            </tr>
        </table>

        <h2>2. מערכות, אינטגרציות ומפתחות API</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="30%">שם המערכת</th>
                    <th width="30%">תפקיד באוטומציה</th>
                    <th width="40%">הרשאות / שיטת חיבור</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Facebook Leads / Elementor Form</td>
                    <td>טריגר כניסת נתונים <span dir="ltr">(Webhook)</span></td>
                    <td>הרשאות Admin / Webhook URL</td>
                </tr>
                <tr>
                    <td>WhatsApp Business API</td>
                    <td>שליחת הודעות ללקוח</td>
                    <td>System User Access Token / API Key</td>
                </tr>
                <tr>
                    <td>Gemini AI (Google)</td>
                    <td>פירסור ואפיון טקסטואלי של הליד</td>
                    <td>Gemini API Key</td>
                </tr>
                <tr>
                    <td>Supabase Database</td>
                    <td>שמירת רשומות ולוגים</td>
                    <td>PostgreSQL connection / Service Role Key</td>
                </tr>
            </tbody>
        </table>

        <h2>3. תהליך זרימת הנתונים <span dir="ltr">(Workflow Nodes & Logic)</span></h2>
        <p>להלן פירוט שלבי הריצה באוטומציה לפי סדר ביצועם בשרת ה-N8N:</p>
        <ol>
            <li><strong>Trigger Node (Webhook):</strong> מאזין לקריאות POST עם גוף נתונים <span dir="ltr">(JSON Payload)</span> המכיל: <code>name, phone, email, business_description</code>.</li>
            <li><strong>Validation Node (JavaScript):</strong> מנקה את מספר הטלפון מתווים מיוחדים וממיר אותו לפורמט בינלאומי תקין (למשל 97250...). במקרה של מספר לא תקין, הריצה נעצרת ונרשמת אזהרה.</li>
            <li><strong>AI Analysis Node (HTTP Request):</strong> שולח את ה-<code>business_description</code> ל-Gemini API עם Prompt המנחה לסווג את תחום העסק לאחת מ-4 קטגוריות (מרפאות, נדל"ן, עורכי דין, כללי) ולהפיק משפט סיכום קצר.</li>
            <li><strong>DB Check & Insert Node (Supabase):</strong> בודק האם הליד קיים לפי מספר טלפון. אם לא קיים - יוצר רשומה חדשה. אם קיים - מעדכן את הרשומה הקיימת ומוסיף את ניתוח ה-AI.</li>
            <li><strong>Action Node (WhatsApp Send):</strong> שולח הודעה מותאמת אישית ללקוח: "שלום [שם], ראינו שאתה מתעניין באוטומציות עבור עסק בתחום [קטגוריה]...".</li>
        </ol>

        <h2>4. טיפול בשגיאות ומקרי קצה <span dir="ltr">(Error Handling)</span></h2>
        <div class="alert-box">
            <div class="alert-box-title">מנגנון טיפול בשגיאות:</div>
            <p>כל צמתי המפתח באוטומציה מוגדרים עם אפשרות <code>Continue On Fail</code>. במקרה של כשל באחד הצמתים (לדוגמה, נפילה של שרת ה-AI):</p>
            <ul>
                <li>האוטומציה תפנה לצומת Error Trigger ייעודי שישלח הודעת שגיאה מובנית לטבלת <code>system_alerts</code> ב-Supabase לצורך עדכון בזמן אמת ב-CRM.</li>
                <li>המערכת תבצע שליחת וואטסאפ גנרית <span dir="ltr">(Fallback)</span> ללקוח ללא ניתוח ה-AI כדי לשמור על רציפות הטיפול בליד.</li>
            </ul>
        </div>
    `,

    credentials: `
        <h1>כרטיס גישות ומזהי מערכת <span dir="ltr">(Credentials Vault)</span></h1>
        
        <div class="alert-box">
            <div class="alert-box-title">הנחיית אבטחה קריטית <span dir="ltr">(Security Notice)</span>:</div>
            <p>אין לשמור סיסמאות גלויות בטקסט פשוט במסמך זה במידה והוא נשמר בענן לא מאובטח. מומלץ להשתמש במסמך זה כרשימת קישורים לתיקיות מאובטחות במנהל סיסמאות ארגוני (כגון 1Password, Bitwarden, או Keepass).</p>
        </div>

        <h2>1. פרטי גישה למערכות הפרויקט</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="25%">מערכת</th>
                    <th width="25%">קישור כניסה <span dir="ltr">(URL)</span></th>
                    <th width="25%">שם משתמש / אימייל</th>
                    <th width="25%">מיקום סיסמה מאובטח</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>שרת N8N</td>
                    <td><code>http://localhost:5678</code> / <code>https://n8n.yourdomain.com</code></td>
                    <td><code>admin@yourdomain.com</code></td>
                    <td>[קישור ל-Vault / 1Password]</td>
                </tr>
                <tr>
                    <td>Supabase Panel</td>
                    <td><code>https://supabase.com/dashboard</code></td>
                    <td><code>dev@yourdomain.com</code></td>
                    <td>[קישור ל-Vault]</td>
                </tr>
                <tr>
                    <td>WhatsApp Meta Business</td>
                    <td><code>https://business.facebook.com</code></td>
                    <td><code>admin@yourdomain.com</code></td>
                    <td>[קישור ל-Vault]</td>
                </tr>
            </tbody>
        </table>

        <h2>2. מפתחות API וטוקנים פעילים <span dir="ltr">(API Keys & Tokens)</span></h2>
        <ul>
            <li><strong>Gemini API Key:</strong> שמור מקומית בדפדפן ה-CRM של הלקוח.</li>
            <li><strong>Meta System User Token:</strong> מוגדר כ-Permanent Token ללא תוקף תפוגה.</li>
            <li><strong>N8N API Key:</strong> מוגדר ב-CRM לצורך תשאול ומשיכת דיאגרמות ה-Workflows.</li>
        </ul>

        <h2>3. הנחיות לביטול גישה בסיום פרויקט <span dir="ltr">(Access Revocation Checklist)</span></h2>
        <div class="info-box">
            <div class="info-box-title">צ'קליסט סגירת פרויקט ואבטחה:</div>
            <p>לאחר מסירה מושלמת והעלאה מלאה לאוויר (Live), מומלץ לבצע את הפעולות הבאות להגנה על חשבונות הלקוח:</p>
            <ol>
                <li>[ ] החלפת סיסמאות זמניות שניתנו לצוות הפיתוח בסיסמאות קבועות של הלקוח.</li>
                <li>[ ] הסרת משתמשי פיתוח זמניים מחשבונות ה-Meta Business Suite והשארת גישת System User בלבד.</li>
                <li>[ ] ביטול מפתחות API זמניים שנוצרו לצורך הבדיקות.</li>
                <li>[ ] שינוי הרשאות ה-Database מ-Superuser / Admin להרשאות קריאה/כתיבה ממוקדות (RLS Policies).</li>
            </ol>
        </div>
    `,

    handover: `
        <h1>פרוטוקול מסירה ואישור הפעלת מערכת <span dir="ltr">(Handover Form)</span></h1>
        
        <h2>1. פרטי הפרויקט והמסירה</h2>
        <table class="data-table">
            <tr>
                <th width="30%">שם הפרויקט / לקוח:</th>
                <td>[שם הלקוח / חברה]</td>
            </tr>
            <tr>
                <th>תאריך מסירה רשמי:</th>
                <td>\${new Date().toLocaleDateString('he-IL')}</td>
            </tr>
            <tr>
                <th>מפתח מוביל:</th>
                <td><span dir="ltr">autoRI-studio</span></td>
            </tr>
        </table>

        <h2>2. צ'קליסט בדיקות קבלה <span dir="ltr">(User Acceptance Testing - UAT)</span></h2>
        <p>להלן תוצאות הבדיקות שנערכו במשותף על ידי הספק והלקוח טרם העלייה לאוויר:</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="40%">רכיב / תרחיש שנבדק</th>
                    <th width="30%">שיטת בדיקה</th>
                    <th width="30%">סטטוס בדיקה</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>בדיקת תרחיש קצה (מספר טלפון לא תקין)</td>
                    <td>הכנסת ליד עם מספר לא תקין, וידוא עצירה בטוחה ולוג אזהרה ב-CRM.</td>
                    <td>[ ] עבר בהצלחה / מאושר</td>
                </tr>
                <tr>
                    <td>בדיקת פנייה ל-AI (סיווג עסק)</td>
                    <td>הכנסת ליד מענף הנדל"ן, וידוא סיווג נכון ושליפת סיכום מדויק.</td>
                    <td>[ ] עבר בהצלחה / מאושר</td>
                </tr>
                <tr>
                    <td>בדיקת שליחת וואטסאפ (משלוח הודעה)</td>
                    <td>הוצאת הודעת וואטסאפ ובדיקת הגעתה למכשיר הקצה תוך 2 דקות.</td>
                    <td>[ ] עבר בהצלחה / מאושר</td>
                </tr>
                <tr>
                    <td>סנכרון Real-time ב-CRM</td>
                    <td>וידוא הופעת לוג הריצה בלוח הבקרה בזמן אמת ללא ריענון עמוד.</td>
                    <td>[ ] עבר בהצלחה / מאושר</td>
                </tr>
            </tbody>
        </table>

        <h2>3. הצהרת הלקוח על קבלת המערכת והדרכה</h2>
        <ul>
            <li>הלקוח מצהיר כי קיבל הדרכה מקיפה (בזום או באמצעות סרטון מוקלט) על תפעול המערכת, צפייה בריצות וניהול באגים ב-CRM.</li>
            <li>הלקוח מאשר כי המערכות והאוטומציות המפורטות לעיל נבדקו על ידו ונמצאו תקינות, עובדות בהתאם לאפיון הטכני המוסכם, ומאושרות להעלאה מלאה לאוויר (Live).</li>
            <li><strong>תקופת אחריות לבאגים:</strong> הספק מעניק תקופת אחריות של [30] ימים ממועד מסירה זה לצורך תיקון תקלות ובאגים שנתגלו באוטומציות ללא עלות נוספת. אחריות זו אינה מכסה שינויים ב-APIs של מערכות צד שלישי או שינויים שבוצעו במערכת על ידי הלקוח.</li>
        </ul>

        <div class="signature-section">
            <div class="signature-box">
                <p>שם נציג הלקוח: _________________</p>
                <div class="signature-line">חתימת הלקוח מאשר המסירה</div>
            </div>
            <div class="signature-box" style="float: left;">
                <p>שם נציג הספק: _________________</p>
                <div class="signature-line">חתימת נציג <span dir="ltr">autoRI-studio</span></div>
            </div>
            <div class="clear"></div>
        </div>
    `,

    sla: `
        <h1>הסכם רמת שירות <span dir="ltr">(SLA - Service Level Agreement)</span></h1>
        
        <h2>1. הגדרת שעות פעילות התמיכה</h2>
        <p>שירותי התמיכה הטכנית השוטפת של הספק יינתנו בימים א'-ה' בין השעות 09:00 ל-18:00 (להלן: "שעות הפעילות"). פניות מחוץ לשעות אלו יטופלו ביום העסקים העוקב, למעט מקרים של תקלות קריטיות (השבתה מלאה) אשר יטופלו בהתאם לזמני התגובה המפורטים להלן.</p>

        <h2>2. סיווג תקלות וזמני תגובה מוגדרים</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="30%">חומרת התקלה</th>
                    <th width="40%">תיאור דוגמה</th>
                    <th width="30%">זמן תגובה / פתרון משוער</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-weight: bold; color: #ef4444;">קריטית <span dir="ltr">(Critical)</span></td>
                    <td>השבתה מלאה של האוטומציה, פגיעה ישירה ומידית בפעילות העסקית (למשל, לידים לא נכנסים כלל).</td>
                    <td>תגובה: עד [2] שעות פעילות.<br>פתרון/מעקף: עד [6] שעות.</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; color: #f59e0b;">בינונית <span dir="ltr">(Major)</span></td>
                    <td>חלק מהאוטומציה אינו עובד בצורה תקינה אך יש זרימת נתונים חלקית (למשל, הודעת הוואטסאפ נשלחת אך ללא פירסור ה-AI).</td>
                    <td>תגובה: עד [6] שעות פעילות.<br>פתרון: עד [24] שעות.</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; color: #3b82f6;">קלה <span dir="ltr">(Minor)</span></td>
                    <td>באג אסתטי במערכת, שאלה טכנית, או בקשה לשינוי קל שאינו פוגע בפעילות השוטפת.</td>
                    <td>תגובה: עד [24] שעות.<br>פתרון: לפי תעדוף משותף.</td>
                </tr>
            </tbody>
        </table>

        <h2>3. מקרים מחרגים מאחריות הספק <span dir="ltr">(Exclusions)</span></h2>
        <div class="alert-box">
            <div class="alert-box-title">החרגות אחריות ושרתים חיצוניים:</div>
            <p>זמני התגובה והפתרון המפורטים בהסכם זה אינם חלים במקרים של תקלות שמקורן אינו בשליטת הספק, לרבות:</p>
            <ul>
                <li>נפילות שרתים או שינויי קוד של מערכות צד שלישי (לדוגמה, שינויים ב-API של Meta/WhatsApp, נפילת שרתי Google, Supabase, או OpenAI).</li>
                <li>תקלות חיבור רשת או חומרה מקומית אצל הלקוח.</li>
                <li>שינויים שבוצעו ב-Workflows ב-N8N או בהגדרות ה-CRM על ידי הלקוח או מי מטעמו ללא אישור מראש ובכתב מהספק.</li>
            </ul>
        </div>
    `,

    invoice: `
        <h1>חשבונית עסקה ודרישת תשלום</h1>
        
        <h2>1. פרטי המסמך והלקוח</h2>
        <table class="data-table">
            <tr>
                <th width="30%">עבור לקוח / חברה:</th>
                <td>[שם הלקוח / שם החברה]</td>
            </tr>
            <tr>
                <th>ח.פ. / ע.מ. לקוח:</th>
                <td>[מספר חברה לקוח]</td>
            </tr>
            <tr>
                <th>תאריך הפקה:</th>
                <td>\${new Date().toLocaleDateString('he-IL')}</td>
            </tr>
            <tr>
                <th>מספר דרישת תשלום:</th>
                <td>[מספר מסמך]</td>
            </tr>
        </table>

        <h2>2. פירוט השירותים והסכומים לתשלום</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th width="10%">פריט</th>
                    <th width="50%">תיאור השירות / מוצר</th>
                    <th width="15%" style="text-align: left;">כמות</th>
                    <th width="25%" style="text-align: left;">מחיר כולל (ללא מע"מ)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>פיתוח והקמת אוטומציות (שלב א' - מענה ללידים) לפי אפיון טכני מוסכם</td>
                    <td style="text-align: left;">1</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>ריטיינר חודשי עבור אירוח שרת N8N, תחזוקה, ניטור ותיקון באגים לחודש [שם החודש]</td>
                    <td style="text-align: left;">1</td>
                    <td style="text-align: left;">[סכום בשקלים]</td>
                </tr>
                <tr style="font-weight: bold; background-color: #f7fafc;">
                    <td colspan="3">סה"כ ללא מע"מ:</td>
                    <td style="text-align: left;">[סכום בשקלים] ₪</td>
                </tr>
                <tr style="font-weight: bold; background-color: #f7fafc;">
                    <td colspan="3">מע"מ <span dir="ltr">(17%)</span>:</td>
                    <td style="text-align: left;">[סכום בשקלים] ₪</td>
                </tr>
                <tr style="font-weight: bold; background-color: #ebf8ff; color: #2b6cb0; font-size: 14px;">
                    <td colspan="3">סה"כ לתשלום כולל מע"מ:</td>
                    <td style="text-align: left;">[סכום בשקלים] ₪</td>
                </tr>
            </tbody>
        </table>

        <h2>3. פרטים להעברה בנקאית ותנאי תשלום</h2>
        <ul>
            <li><strong>תנאי אשראי:</strong> תשלום מיידי / שוטף+15 (תאריך פירעון אחרון: [תאריך פירעון]).</li>
        </ul>
        <div class="info-box">
            <div class="info-box-title">פרטי חשבון בנק להעברת תשלום:</div>
            <p><strong>שם המוטב:</strong> <span dir="ltr">autoRI-studio</span></p>
            <p><strong>בנק:</strong> [שם הבנק] (מספר בנק: [מספר])</p>
            <p><strong>סניף:</strong> [מספר סניף] (שם הסניף: [שם])</p>
            <p><strong>מספר חשבון:</strong> [מספר חשבון]</p>
            <p>אנא שלח אישור העברה בנקאית למייל: <code>billing@yourdomain.com</code></p>
        </div>
    `
};

export const downloadTemplate = (type, data = {}) => {
    let rawContentHtml = TEMPLATE_HTMLS[type];
    if (!rawContentHtml) return;

    const names = {
        proposal: 'proposal_template',
        contract: 'contract_template',
        nda: 'nda_template',
        discovery: 'initial_discovery_template',
        spec: 'technical_spec_template',
        credentials: 'credentials_vault_template',
        handover: 'handover_protocol_template',
        sla: 'sla_agreement_template',
        invoice: 'invoice_template'
    };

    const titles = {
        proposal: 'הצעת מחיר לפרויקט אוטומציה',
        contract: 'הסכם פיתוח ותחזוקת אוטומציות',
        nda: 'הסכם שמירת סודיות (NDA)',
        discovery: 'מסמך איפיון ראשוני - מיפוי אפשרויות אוטומציה',
        spec: 'מסמך אפיון טכני וארכיטקטורה',
        credentials: 'כרטיס גישות ומזהי מערכת',
        handover: 'פרוטוקול מסירה ואישור הפעלה',
        sla: 'הסכם רמת שירות (SLA)',
        invoice: 'חשבונית עסקה ודרישת תשלום'
    };

    const title = titles[type] || 'תבנית מסמך';
    const filename = names[type] || 'template';

    // Replace dynamic date
    let contentHtml = rawContentHtml.replace(/\\?\${new Date\(\)\.toLocaleDateString\('he-IL'\)}/g, new Date().toLocaleDateString('he-IL'));

    // Inject data if available
    if (data) {
        const companyName = data.company || data.name || '[שם הלקוח / שם החברה]';
        const clientName = data.name || '[שם הלקוח]';
        const clientPhone = data.phone || '[טלפון]';
        const clientEmail = data.email || '[אימייל]';

        contentHtml = contentHtml
            .replace(/\[שם הלקוח \/ שם החברה\]/g, companyName)
            .replace(/\[שם הלקוח \/ שם החברה\]/g, companyName)
            .replace(/\[שם החברה\]/g, companyName)
            .replace(/\[שם הלקוח\]/g, clientName)
            // No company registration number (ח.פ./ע.מ.) is collected anywhere in the
            // lead data model - leave this placeholder for staff to fill in manually
            // rather than silently substituting the client's phone number for it.
            .replace(/\[טלפון\]/g, clientPhone)
            .replace(/\[אימייל\]/g, clientEmail);

        // Quote data dynamic replacements
        if (data.quote_data) {
            const q = data.quote_data;
            const setupVal = q.setup_cost || 0;
            const monthlyVal = q.monthly_cost || 0;
            const slaVal = q.sla_price || 0;
            const rateVal = q.hourly_rate || 250;

            const setupStr = setupVal.toLocaleString('he-IL') + ' ₪';
            const slaStr = slaVal.toLocaleString('he-IL') + ' ₪';
            const monthlyStr = monthlyVal.toLocaleString('he-IL') + ' ₪';
            const rateStr = rateVal.toLocaleString('he-IL') + ' ₪';

            if (type === 'proposal') {
                contentHtml = contentHtml
                    .replace('[סכום בשקלים]', setupStr) // Row 1 Setup
                    .replace('[סכום בשקלים]', '0 ₪') // Row 1 Retainer
                    .replace('[סכום בשקלים]', slaStr) // Row 2 SLA Retainer
                    .replace('[סכום בשקלים]', setupStr) // Total Setup
                    .replace('[סכום בשקלים]', monthlyStr) // Total Retainer
                    .replace('[סכום בשקלים]', rateStr); // Extra dev hourly cost
            } else if (type === 'contract') {
                contentHtml = contentHtml
                    .replace('[סכום בשקלים]', rateStr) // hourly rate in section 1
                    .replace('[סכום בשקלים]', setupStr) // setup cost in section 2
                    .replace('[סכום בשקלים]', monthlyStr); // retainer cost in section 2
            } else if (type === 'invoice') {
                const totalVal = setupVal + monthlyVal;
                const vatVal = Math.round(totalVal * 0.17);
                const totalWithVatVal = totalVal + vatVal;

                contentHtml = contentHtml
                    .replace('[סכום בשקלים]', setupStr) // Item 1 Setup
                    .replace('[סכום בשקלים]', monthlyStr) // Item 2 Retainer
                    .replace('[סכום בשקלים]', totalVal.toLocaleString('he-IL') + ' ₪') // Subtotal
                    .replace('[סכום בשקלים]', vatVal.toLocaleString('he-IL') + ' ₪') // VAT
                    .replace('[סכום בשקלים]', totalWithVatVal.toLocaleString('he-IL') + ' ₪'); // Total
            }
        }
    }

    const htmlDocument = getHtmlWrapper(title, contentHtml);

    // Microsoft Word application/msword blob
    const blob = new Blob(['\ufeff' + htmlDocument], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
