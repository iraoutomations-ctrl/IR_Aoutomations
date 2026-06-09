const test = require('node:test');
const assert = require('node:assert');
const puppeteer = require('C:/Users/test0/node_modules/puppeteer');

test('IR_Aoutomations Landing Page E2E Test Suite', async (t) => {
  let browser;
  let lastUserName = 'משה';

  t.before(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-file-access-from-files'
      ]
    });
  });

  t.after(async () => {
    await browser.close();
  });

  // Helper to create page with network and dialog mocking
  async function createPage() {
    const page = await browser.newPage();
    
    // Log console and errors from browser
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err));

    // Override window.open before document loads to capture WhatsApp API redirects
    await page.evaluateOnNewDocument(() => {
      window.open = (url) => {
        window.lastOpenedUrl = url;
        return null;
      };
    });

    // Intercept and mock requests to make the test 100% offline
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('https://api.web3forms.com/')) {
        request.respond({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
          },
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: "Form submitted successfully" })
        });
      } else if (url.includes('/webhook/')) {
        const postData = request.postData();
        let payload = {};
        try {
          payload = JSON.parse(postData);
        } catch(e) {}
        
        const msg = payload.message || '';
        let reply = "תשובה מדומה מסוכן ה-AI";
        let chips = [];
        let lead_collected = false;
        let lead_data = null;
        
        if (msg.includes('קליניקות')) {
          reply = "איזה אתגר תפעולי מציק לכם ביותר?";
          chips = [
            { text: 'ניהול תורים וביטולים 📅', value: 'scheduling' },
            { text: 'תורים', value: 'scheduling' }
          ];
        } else if (msg.includes('עסק כללי')) {
          reply = "איזה אתגר תפעולי מציק לכם ביותר?";
          chips = [
            { text: 'הזנת נתונים וקלדנות 📂', value: 'data_entry' }
          ];
        } else if (msg.includes('תורים') || msg.includes('Excel manual copy')) {
          reply = "בוא נתאם שיחת אפיון מלאה של 10 דקות ללא עלות בטלפון או בווטסאפ כדי שנתאים לכם את הפתרון. מה דעתך?";
          chips = [
            { text: 'כן, אשמח לתאם שיחה! 📞', value: 'yes' },
            { text: 'כן', value: 'yes' },
            { text: 'לא כרגע, תודה 🤔', value: 'no' },
            { text: 'לא כרגע', value: 'no' }
          ];
        } else if (msg.includes('כן')) {
          reply = "מעולה! כדי שנוכל לחזור אליך, מה השם המלא שלך?";
        } else if (msg === 'משה' || msg === 'שלומי' || msg === 'Doctor Bob') {
          lastUserName = msg;
          reply = `תודה, ${msg}! מה מספר הטלפון שלך?`;
        } else if (msg === '123a' || msg === 'invalid-phone-num') {
          reply = "נראה שמספר הטלפון שהזנת לא תקין. אנא הקלד מספר טלפון תקין (לדוגמה: 054-7171828):";
        } else if (msg === '0547171828' || msg === '0501234567') {
          reply = "תודה! ומה כתובת האימייל שלך לקבלת סיכום האפיון? (אופציונלי - הקלד או לחץ על 'דלג')";
          chips = [{ text: 'דלג ⏭️', value: 'skip' }, { text: 'דלג', value: 'skip' }];
        } else if (msg === 'wrong-email') {
          reply = "נראה שכתובת האימייל לא תקינה. אנא הקלד אימייל תקין או לחץ על 'דלג':";
          chips = [{ text: 'דלג ⏭️', value: 'skip' }, { text: 'דלג', value: 'skip' }];
        } else if (msg.includes('דלג') || msg.includes('skip')) {
          reply = `תודה רבה, **${lastUserName}**! 🎉\n\nפרטייך התקבלו בהצלחה ונשלחו אלינו במייל.`;
          lead_collected = true;
          lead_data = {
            name: lastUserName,
            phone: "0547171828",
            email: "לא צוין",
            industry: "קליניקות ומטפלים 🩺",
            challenge: "תורים"
          };
        } else if (msg.includes('לא כרגע')) {
          reply = "מבין לגמרי, אין שום לחץ! הנה תוכנית פעולה לעבודה עצמית (DIY Automation Blueprint)... Make.com או n8n.cloud...";
          chips = [
            { text: 'שוחח עם סוכן ה-AI שאלות חופשיות 🤖', value: 'start_ai_chat' },
            { text: 'שוחח עם סוכן', value: 'start_ai_chat' },
            { text: 'דבר עם נציג', value: 'human_phone' }
          ];
        } else if (msg.includes('שוחח עם סוכן') || msg.includes('דבר עם נציג') || msg.includes('הסבר לי עוד')) {
          reply = "העברתי אותך כעת לסוכן ה-AI החי המופעל על ידי Gemini 🤖. שאל אותי כל שאלה!";
          chips = [
            { text: 'התחל שיחה מחדש 🔄', value: 'reset' },
            { text: 'התחל שיחה מחדש', value: 'reset' }
          ];
        }
        
        request.respond({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
          },
          contentType: 'application/json',
          body: JSON.stringify({ reply, chips, lead_collected, lead_data })
        });
      } else if (url.startsWith('file://')) {
        request.continue();
      } else {
        // Abort all other external requests to prevent loading remote CDNs
        request.abort();
      }
    });

    // Handle dialog events automatically
    page.on('dialog', async (dialog) => {
      page.emit('dialog-triggered', dialog.message());
      await dialog.accept();
    });

    const filePath = 'file:///c:/Users/test0/IR_Aoutomations/index.html';
    await page.goto(filePath, { waitUntil: 'load' });
    return page;
  }

  // Shared Helper Functions
  const setSliderValue = async (page, selector, val) => {
    await page.evaluate((sel, value) => {
      const el = document.querySelector(sel);
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, selector, val);
  };

  const jsClick = async (page, selector) => {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.click();
      } else {
        throw new Error(`Element "${sel}" not found for jsClick`);
      }
    }, selector);
  };

  const clickChipByText = async (page, text) => {
    await page.evaluate((txt) => {
      const chips = Array.from(document.querySelectorAll('#aiChatOptions .chat-chip'));
      const target = chips.find(c => c.textContent.includes(txt));
      if (target) {
        target.click();
      } else {
        throw new Error(`Chip with text "${txt}" not found`);
      }
    }, text);
  };

  // TIER 1: FEATURE COVERAGE
  await t.test('Tier 1: Feature Coverage', async (t) => {

    await t.test('TC_ROI_01: Default Values Verification', async () => {
      const page = await createPage();
      try {
        const emp = await page.$eval('#inputEmployees', el => el.value);
        const hrs = await page.$eval('#inputHours', el => el.value);
        const cst = await page.$eval('#inputCost', el => el.value);
        assert.strictEqual(emp, '5');
        assert.strictEqual(hrs, '8');
        assert.strictEqual(cst, '60');

        const valEmp = await page.$eval('#valEmployees', el => el.textContent.trim());
        const valHrs = await page.$eval('#valHours', el => el.textContent.trim());
        const valCst = await page.$eval('#valCost', el => el.textContent.trim());
        assert.strictEqual(valEmp, '5');
        assert.strictEqual(valHrs, '8 שעות');
        assert.strictEqual(valCst, '₪60');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_02: Default Results Verification', async () => {
      const page = await createPage();
      try {
        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        assert.strictEqual(hrs, '173');
        assert.strictEqual(mon, '₪10,380');
        assert.strictEqual(yr, '₪124,560');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_03: Employee Slider Interaction', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputEmployees', 10);
        const valEmp = await page.$eval('#valEmployees', el => el.textContent.trim());
        assert.strictEqual(valEmp, '10');

        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '346');
        assert.strictEqual(mon, '₪20,760');
        assert.strictEqual(yr, '₪249,120');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_04: Hours Slider Interaction', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputHours', 15);
        const valHrs = await page.$eval('#valHours', el => el.textContent.trim());
        assert.strictEqual(valHrs, '15 שעות');

        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '325');
        assert.strictEqual(mon, '₪19,500');
        assert.strictEqual(yr, '₪234,000');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_05: Cost Slider Interaction', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputCost', 100);
        const valCst = await page.$eval('#valCost', el => el.textContent.trim());
        assert.strictEqual(valCst, '₪100');

        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '173');
        assert.strictEqual(mon, '₪17,300');
        assert.strictEqual(yr, '₪207,600');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_01: Industry Selection Action', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        const displaySelect = await page.$eval('#stepIndustrySelect', el => getComputedStyle(el).display);
        const displayQuestions = await page.$eval('#stepQuestions', el => getComputedStyle(el).display);
        const displayProgress = await page.$eval('#surveyProgressContainer', el => getComputedStyle(el).display);
        
        assert.strictEqual(displaySelect, 'none');
        assert.strictEqual(displayQuestions, 'block');
        assert.strictEqual(displayProgress, 'block');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_02: Clinics Step 1 Render', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        const exists = await page.$('#specialty');
        assert.ok(exists);
        const val = await page.$eval('#specialty', el => el.value);
        assert.strictEqual(val, '');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_03: Dynamic Field Validation', async () => {
      const page = await createPage();
      let alertMsg = null;
      page.on('dialog-triggered', msg => {
        alertMsg = msg;
      });

      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.click('#btnNextStep');
        
        // Wait a small tick for dialog handler
        await new Promise(r => setTimeout(r, 50));
        assert.strictEqual(alertMsg, 'אנא מלא את כל שדות החובה המסומנים בכוכבית (*)');

        const borderColor = await page.$eval('#clinic_name', el => el.style.borderColor);
        assert.ok(borderColor.includes('239') || borderColor.includes('ef')); // #ef4444 or rgb(239, 68, 68)
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_04: Step 2 Rendering', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.type('#clinic_name', 'קליניקת בדיקה');
        await page.type('#specialty', 'ריפוי');
        await page.click('#btnNextStep');
        
        // Verify we are on Step 2
        const progress = await page.$eval('#surveyStepIndicator', el => el.textContent.trim());
        assert.ok(progress.includes('2'));
        const bottlenecksExists = await page.$('#bottlenecks');
        assert.ok(bottlenecksExists);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_05: Thank You Screen Summary', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.type('#clinic_name', 'קליניקת בדיקה');
        await page.type('#specialty', 'ריפוי');
        await page.click('#btnNextStep');

        await page.type('#bottlenecks', 'זמן המתנה ארוך');
        await page.click('#btnNextStep');

        // Step 3 (Ratings) - Click submit
        await page.waitForSelector('input[name="rating_scheduling"]');
        await page.click('#btnNextStep');

        const displayThankYou = await page.$eval('#stepThankYou', el => getComputedStyle(el).display);
        assert.strictEqual(displayThankYou, 'block');

        const summaryText = await page.$eval('#answersSummaryBox', el => el.textContent);
        assert.ok(summaryText.includes('קליניקת בדיקה'));
        assert.ok(summaryText.includes('ריפוי'));
        assert.ok(summaryText.includes('זמן המתנה ארוך'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_01: Toggle Open Chat', async () => {
      const page = await createPage();
      try {
        let isOpen = await page.evaluate(() => document.getElementById('aiChatWindow').classList.contains('open'));
        assert.strictEqual(isOpen, false);

        await page.click('#aiChatToggle');
        isOpen = await page.evaluate(() => document.getElementById('aiChatWindow').classList.contains('open'));
        assert.strictEqual(isOpen, true);

        const badgeDisplay = await page.$eval('#aiChatToggle .toggle-badge', el => getComputedStyle(el).display);
        assert.strictEqual(badgeDisplay, 'none');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_02: Welcome Message & Option Chips', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        const greetingExists = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg');
          return Array.from(msgs).some(m => m.textContent.includes('סוכן ה-AI'));
        });
        assert.ok(greetingExists);

        const chipsCount = await page.$$eval('#aiChatOptions .chat-chip', el => el.length);
        assert.strictEqual(chipsCount, 5);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_03: Select Niche Option', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'קליניקות');
        
        // Verify user message added
        const userMsgExists = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.user');
          return Array.from(msgs).some(m => m.textContent.includes('קליניקות'));
        });
        assert.ok(userMsgExists);

        // Wait for typing to finish
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Verify Clinic chips rendered
        const hasScheduling = await page.evaluate(() => {
          const chips = document.querySelectorAll('#aiChatOptions .chat-chip');
          return Array.from(chips).some(c => c.textContent.includes('תורים'));
        });
        assert.ok(hasScheduling);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_04: Select Challenge Option', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'תורים');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Verify chips for call option are shown
        const hasYes = await page.evaluate(() => {
          const chips = document.querySelectorAll('#aiChatOptions .chat-chip');
          return Array.from(chips).some(c => c.textContent.includes('כן'));
        });
        assert.ok(hasYes);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_05: Custom Message Input', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await page.type('#aiChatInputField', 'אני צריך עזרה מהירה');
        await page.click('#aiChatSendBtn');

        const userMsgExists = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.user');
          return Array.from(msgs).some(m => m.textContent.includes('עזרה מהירה'));
        });
        assert.ok(userMsgExists);
      } finally {
        await page.close();
      }
    });
  });

  // TIER 2: BOUNDARY & CORNER CASES
  await t.test('Tier 2: Boundary & Corner Cases', async (t) => {

    await t.test('TC_ROI_06: Employee Minimum Boundary', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputEmployees', 1);
        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '35');
        assert.strictEqual(mon, '₪2,100');
        assert.strictEqual(yr, '₪25,200');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_07: Employee Maximum Boundary', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputEmployees', 50);
        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '1,732');
        assert.strictEqual(mon, '₪103,920');
        assert.strictEqual(yr, '₪1,247,040');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_08: Hours Minimum Boundary', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputHours', 1);
        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '22');
        assert.strictEqual(mon, '₪1,320');
        assert.strictEqual(yr, '₪15,840');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_09: Hours Maximum Boundary', async () => {
      const page = await createPage();
      try {
        await setSliderValue(page, '#inputHours', 25);
        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());
        
        assert.strictEqual(hrs, '541');
        assert.strictEqual(mon, '₪32,460');
        assert.strictEqual(yr, '₪389,520');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_ROI_10: Cost Sliders Snapping and Steps', async () => {
      const page = await createPage();
      try {
        // Cost slider min=40, max=250, step=5. Set value to 63
        await setSliderValue(page, '#inputCost', 63);
        const costVal = await page.$eval('#inputCost', el => el.value);
        // Browser standard snapping behaves such that DOM property assignment to range input snaps value.
        assert.strictEqual(costVal, '65');
        
        const labelText = await page.$eval('#valCost', el => el.textContent.trim());
        assert.strictEqual(labelText, '₪65');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_06: Special Characters Handling', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        const text = "😊 🤖 ' OR '1'='1 <script>alert(1)</script>";
        await page.type('#clinic_name', text);
        await page.type('#specialty', text);
        await page.click('#btnNextStep');

        const progress = await page.$eval('#surveyStepIndicator', el => el.textContent.trim());
        assert.ok(progress.includes('2')); // Safely advanced without crashing
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_07: Navigation Value Preservation', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.type('#clinic_name', 'שם מיוחד');
        await page.type('#specialty', 'סוג התמחות');
        await page.click('#btnNextStep');

        // Now on Step 2. Click Prev.
        await page.click('#btnPrevStep');

        const clinicName = await page.$eval('#clinic_name', el => el.value);
        const specialty = await page.$eval('#specialty', el => el.value);

        assert.strictEqual(clinicName, 'שם מיוחד');
        assert.strictEqual(specialty, 'סוג התמחות');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_08: Rating Selection Styling & State', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.type('#clinic_name', 'שם');
        await page.type('#specialty', 'התמחות');
        await page.click('#btnNextStep');
        await page.type('#bottlenecks', 'פקקים');
        await page.click('#btnNextStep');

        // On rating screen, click 5 on rating_scheduling
        await page.evaluate(() => {
          const radio = document.querySelector('input[name="rating_scheduling"][value="5"]');
          if (radio) {
            radio.click();
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        const isSelected = await page.evaluate(() => {
          const radio = document.querySelector('input[name="rating_scheduling"][value="5"]');
          return radio.closest('.rating-btn-label').classList.contains('selected');
        });
        assert.strictEqual(isSelected, true);

        // Click next
        await page.click('#btnNextStep');
        const summary = await page.$eval('#answersSummaryBox', el => el.textContent);
        assert.ok(summary.includes('5 מתוך 5'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_09: Survey Reset Action', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.type('#clinic_name', 'שם');
        await page.type('#specialty', 'התמחות');
        await page.click('#btnNextStep');
        await page.type('#bottlenecks', 'פקק');
        await page.click('#btnNextStep');
        await page.click('#btnNextStep'); // End survey

        // Reset
        await jsClick(page, '#btnResetSurvey');

        const displaySelect = await page.$eval('#stepIndustrySelect', el => getComputedStyle(el).display);
        assert.strictEqual(displaySelect, 'block');

        // Re-enter, check empty
        await page.click('.industry-selector-card[data-industry="clinics"]');
        const val = await page.$eval('#clinic_name', el => el.value);
        assert.strictEqual(val, '');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_SRV_10: Required Field Focus Restoration', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.click('#btnNextStep'); // Triggers red borders

        let borderColor = await page.$eval('#clinic_name', el => el.style.borderColor);
        assert.ok(borderColor.includes('239') || borderColor.includes('ef'));

        // Focus the field
        await page.focus('#clinic_name');
        borderColor = await page.$eval('#clinic_name', el => el.style.borderColor);
        assert.ok(!borderColor.includes('239') && !borderColor.includes('ef'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_06: Long Message Layout', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        const longMsg = 'א'.repeat(1200);
        await page.type('#aiChatInputField', longMsg);
        await page.click('#aiChatSendBtn');

        const lastUserMsgText = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.user');
          return msgs[msgs.length - 1].textContent;
        });
        assert.strictEqual(lastUserMsgText.length, 1200);

        // Ensure chat messages box remains scrollable
        const scrollHeight = await page.$eval('#aiChatMessages', el => el.scrollHeight);
        const clientHeight = await page.$eval('#aiChatMessages', el => el.clientHeight);
        assert.ok(scrollHeight >= clientHeight);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_07: Phone Number Validation Rules', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'תורים');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'כן');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Name
        await page.type('#aiChatInputField', 'משה');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Invalid phone
        await page.type('#aiChatInputField', '123a');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Check error message
        const msgTexts = await page.evaluate(() => Array.from(document.querySelectorAll('#aiChatMessages .chat-msg.bot')).map(m => m.textContent));
        assert.ok(msgTexts.some(t => t.includes('לא תקין')));

        // Valid phone
        await page.type('#aiChatInputField', '0547171828');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Verify advanced to email prompt
        const latestBotMsg = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.bot');
          return msgs[msgs.length - 1].textContent;
        });
        assert.ok(latestBotMsg.includes('אימייל'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_08: Email Address Validation Rules', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'תורים');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'כן');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await page.type('#aiChatInputField', 'משה');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await page.type('#aiChatInputField', '0547171828');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Invalid Email
        await page.type('#aiChatInputField', 'wrong-email');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        let botMsgs = await page.evaluate(() => Array.from(document.querySelectorAll('#aiChatMessages .chat-msg.bot')).map(m => m.textContent));
        assert.ok(botMsgs.some(t => t.includes('כתובת האימייל לא תקינה')));

        // Skip Email
        await clickChipByText(page, 'דלג');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Reached completed state
        const finalMsg = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.bot');
          return msgs[msgs.length - 1].textContent;
        });
        assert.ok(finalMsg.includes('תודה רבה'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_09: Chatbot Reset Action', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'תורים');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Reject call option (goes to nurture DIY blueprint)
        await clickChipByText(page, 'לא כרגע');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Choose "שוחח עם סוכן ה-AI"
        await clickChipByText(page, 'שוחח עם סוכן');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Type custom free text
        await page.type('#aiChatInputField', 'הסבר לי עוד');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Click reset
        await clickChipByText(page, 'התחל שיחה מחדש');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        const historyCount = await page.$$eval('#aiChatMessages .chat-msg', el => el.length);
        // It should contain only default welcome messages
        assert.strictEqual(historyCount, 1);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_CHT_10: Chatbot Close Animation', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Close
        await jsClick(page, '#aiChatClose');
        let isOpen = await page.evaluate(() => document.getElementById('aiChatWindow').classList.contains('open'));
        assert.strictEqual(isOpen, false);

        // Reopen and verify history preserved
        await page.click('#aiChatToggle');
        const historyTexts = await page.evaluate(() => Array.from(document.querySelectorAll('#aiChatMessages .chat-msg')).map(m => m.textContent));
        assert.ok(historyTexts.some(t => t.includes('קליניקות')));
      } finally {
        await page.close();
      }
    });
  });

  // TIER 3: CROSS-FEATURE COMBINATIONS
  await t.test('Tier 3: Cross-Feature Combinations', async (t) => {

    await t.test('TC_COM_01: Footer Link to Survey Interaction', async () => {
      const page = await createPage();
      try {
        await jsClick(page, 'a[onclick*="clinics"]');
        
        // Wait for survey to start (setTimeout 400ms in script.js)
        await new Promise(r => setTimeout(r, 600));

        const displayQuestions = await page.$eval('#stepQuestions', el => getComputedStyle(el).display);
        assert.strictEqual(displayQuestions, 'block');

        const clinicNameExists = await page.$('#clinic_name');
        assert.ok(clinicNameExists);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_COM_02: Concurrent Feature States', async () => {
      const page = await createPage();
      try {
        // Set ROI to maximum
        await setSliderValue(page, '#inputEmployees', 50);
        await setSliderValue(page, '#inputHours', 25);
        await setSliderValue(page, '#inputCost', 250);

        // Start survey
        await page.click('.industry-selector-card[data-industry="clinics"]');

        // Verify ROI calculator results remain intact
        const hrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const mon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const yr = await page.$eval('#resultYearly', el => el.textContent.trim());

        assert.strictEqual(hrs, '5,413');
        assert.strictEqual(mon, '₪1,353,250');
        assert.strictEqual(yr, '₪16,239,000');
      } finally {
        await page.close();
      }
    });

    await t.test('TC_COM_03: Contact Form + Chatbot Independence', async () => {
      const page = await createPage();
      try {
        await page.type('#contactName', 'חיים');
        await page.type('#contactEmail', 'haim@example.com');
        await page.type('#contactPhone', '0547171828');
        await page.type('#contactMessage', 'רוצה לייעל את העסק');
        await jsClick(page, '#generalContactForm button[type="submit"]');

        // Verify contact form success
        await page.waitForSelector('#contactFormStatus.success', { visible: true });

        // Open chatbot
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Ensure chatbot starts in welcome state
        const historyCount = await page.$$eval('#aiChatMessages .chat-msg', el => el.length);
        assert.strictEqual(historyCount, 1);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_COM_04: Survey Webhook/WhatsApp & Chatbot Interplay', async () => {
      const page = await createPage();
      try {
        // Complete survey
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.waitForSelector('#clinic_name');
        await page.type('#clinic_name', 'קליניקה א');
        await page.type('#specialty', 'פיזיותרפיה');
        await page.click('#btnNextStep');
        await page.type('#bottlenecks', 'זמן המתנה');
        await page.click('#btnNextStep');
        await page.waitForSelector('input[name="rating_scheduling"]');
        await page.click('#btnNextStep');

        // Wait for thank you screen to be displayed
        await page.waitForSelector('#stepThankYou', { visible: true });

        // Click WhatsApp results
        await jsClick(page, '#btnSendWhatsApp');

        // Verify url matches WhatsApp API format
        await page.waitForFunction(() => window.lastOpenedUrl !== undefined, { timeout: 5000 });
        const openedUrl = await page.evaluate(() => window.lastOpenedUrl);
        console.log("DEBUG: openedUrl =", openedUrl);
        assert.ok(openedUrl.startsWith('https://api.whatsapp.com/send'));
        assert.ok(decodeURIComponent(openedUrl).includes('פיזיותרפיה'));

        // Open Chatbot and submit lead
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'תורים');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'כן');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await page.type('#aiChatInputField', 'שלומי');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await page.type('#aiChatInputField', '0547171828');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'דלג');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        const finalMsg = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.bot');
          return msgs[msgs.length - 1].textContent;
        });
        assert.ok(finalMsg.includes('תודה רבה'));
      } finally {
        await page.close();
      }
    });
  });

  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  await t.test('Tier 4: Real-World Application Scenarios', async (t) => {

    await t.test('TC_APP_01: Clinics Full Lead Workload', async () => {
      const page = await createPage();
      try {
        // Sets ROI: Employees 10, Hours 6, Cost 80
        await setSliderValue(page, '#inputEmployees', 10);
        await setSliderValue(page, '#inputHours', 6);
        await setSliderValue(page, '#inputCost', 80);

        const valHrs = await page.$eval('#resultHours', el => el.textContent.trim());
        const valMon = await page.$eval('#resultMonthly', el => el.textContent.trim());
        const valYr = await page.$eval('#resultYearly', el => el.textContent.trim());

        assert.strictEqual(valHrs, '260');
        assert.strictEqual(valMon, '₪20,800');
        assert.strictEqual(valYr, '₪249,600');

        // Fill Clinics Survey
        await page.click('.industry-selector-card[data-industry="clinics"]');
        await page.type('#clinic_name', 'מרפאת דולפין');
        await page.type('#specialty', 'General medicine');
        await page.type('#leads', 'Facebook');
        await page.type('#crm', 'Google Calendar');
        await page.click('#btnNextStep');

        await page.type('#bottlenecks', 'manual followups');
        await page.click('#btnNextStep');

        // Step 3: Choose whatsapp contact (not required but we submit it)
        await page.waitForSelector('input[name="rating_scheduling"]');
        await page.click('#btnNextStep');

        // Verify summary
        const summary = await page.$eval('#answersSummaryBox', el => el.textContent);
        assert.ok(summary.includes('General medicine'));
        assert.ok(summary.includes('Facebook'));
        assert.ok(summary.includes('manual followups'));
        assert.ok(summary.includes('Google Calendar'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_APP_02: Lawyers Custom Survey & Rating Workload', async () => {
      const page = await createPage();
      try {
        await page.click('.industry-selector-card[data-industry="lawyers"]');
        await page.type('#office_name', 'לורנס ושות');
        await page.type('#specialty', 'Intellectual Property');
        // skip marketing and crm
        await page.click('#btnNextStep');

        await page.type('#bottlenecks', 'ניסוח חוזים ארוכים');
        await page.click('#btnNextStep');

        // Step 3: Rates generator as 5, others as 2
        await page.evaluate(() => {
          // doc generator to 5
          document.querySelector('input[name="rating_generator"][value="5"]').click();
          // others to 2
          document.querySelector('input[name="rating_leads"][value="2"]').click();
          document.querySelector('input[name="rating_courts"][value="2"]').click();
          document.querySelector('input[name="rating_billing"][value="2"]').click();
          document.querySelector('input[name="rating_status"][value="2"]').click();
          document.querySelector('input[name="rating_docs"][value="2"]').click();
          document.querySelector('input[name="rating_ai"][value="2"]').click();
        });

        await page.click('#btnNextStep');

        const summary = await page.$eval('#answersSummaryBox', el => el.textContent);
        assert.ok(summary.includes('Intellectual Property'));
        assert.ok(summary.includes('5 מתוך 5'));
        assert.ok(summary.includes('2 מתוך 5'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_APP_03: Realtor Foot-to-Survey and Reset Workload', async () => {
      const page = await createPage();
      try {
        await jsClick(page, 'a[onclick*="realtors"]');
        await new Promise(r => setTimeout(r, 600));

        await page.type('#realtor_name', 'נדלן פלוס');
        await jsClick(page, '#btnResetSurvey');

        // Start general
        await page.click('.industry-selector-card[data-industry="general"]');
        await page.type('#business_name', 'חברה לוגיסטית');
        await page.click('#btnNextStep');

        await page.type('#bottlenecks', 'שילוחים');
        await page.click('#btnNextStep');

        await page.waitForSelector('input[name="rating_sales"]');
        await page.click('#btnNextStep');

        const summary = await page.$eval('#answersSummaryBox', el => el.textContent);
        assert.ok(summary.includes('חברה לוגיסטית'));
        assert.ok(summary.includes('שילוחים'));
      } finally {
        await page.close();
      }
    });

    await t.test('TC_APP_04: Chatbot DIY Path Workload', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'עסק כללי');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await page.type('#aiChatInputField', 'Excel manual copy');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'לא כרגע');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Verify Make/n8n plan is displayed in the bot response
        const botMsgs = await page.evaluate(() => Array.from(document.querySelectorAll('#aiChatMessages .chat-msg.bot')).map(m => m.textContent));
        assert.ok(botMsgs.some(t => t.includes('Make.com') || t.includes('n8n')));

        // Reset
        await clickChipByText(page, 'דבר עם נציג');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });
        await clickChipByText(page, 'התחל שיחה מחדש');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        const historyCount = await page.$$eval('#aiChatMessages .chat-msg', el => el.length);
        assert.strictEqual(historyCount, 1);
      } finally {
        await page.close();
      }
    });

    await t.test('TC_APP_05: Chatbot Full Lead Gen Workload', async () => {
      const page = await createPage();
      try {
        await page.click('#aiChatToggle');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'קליניקות');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'תורים');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await clickChipByText(page, 'כן');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        await page.type('#aiChatInputField', 'Doctor Bob');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Invalid phone
        await page.type('#aiChatInputField', 'invalid-phone-num');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Confirm error msg
        let botTexts = await page.evaluate(() => Array.from(document.querySelectorAll('#aiChatMessages .chat-msg.bot')).map(m => m.textContent));
        assert.ok(botTexts.some(t => t.includes('לא תקין')));

        // Valid phone
        await page.type('#aiChatInputField', '0501234567');
        await page.click('#aiChatSendBtn');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        // Skip email
        await clickChipByText(page, 'דלג');
        await page.waitForSelector('#chatTypingIndicator', { hidden: true });

        const latestMsg = await page.evaluate(() => {
          const msgs = document.querySelectorAll('#aiChatMessages .chat-msg.bot');
          return msgs[msgs.length - 1].textContent;
        });
        assert.ok(latestMsg.includes('Doctor Bob'));
      } finally {
        await page.close();
      }
    });
  });
});
