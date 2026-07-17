/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-unused-vars, no-useless-assignment */
/* ==========================================================================
   autoRI-studio CRM - Pricing & ROI Calculator Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Calculator, 
    TrendingUp, 
    Clock, 
    DollarSign, 
    Copy, 
    Check, 
    AlertTriangle, 
    Sparkles, 
    User, 
    Briefcase,
    Database
} from 'lucide-react';
import { db } from '../services/db';

export default function PricingCalculator() {
    // Leads State
    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Inputs State
    const [projectName, setProjectName] = useState('');
    const [hours, setHours] = useState(20);
    const [hourlyRate, setHourlyRate] = useState(250);
    const [complexity, setComplexity] = useState(1.0);
    const [integrations, setIntegrations] = useState(2);

    const [taskTime, setTaskTime] = useState(10);
    const [monthlyVolume, setMonthlyVolume] = useState(500);
    const [employeeWage, setEmployeeWage] = useState(60);
    const [includeHumanError, setIncludeHumanError] = useState(true);

    const [thirdPartyCosts, setThirdPartyCosts] = useState(0);

    // Outputs State
    const [finalSetupCost, setFinalSetupCost] = useState(0);
    const [hoursSaved, setHoursSaved] = useState(0);
    const [grossSavings, setGrossSavings] = useState(0);
    const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
    const [netMonthlyProfit, setNetMonthlyProfit] = useState(0);
    const [breakEven, setBreakEven] = useState(0);
    
    // UI Helpers
    const [copied, setCopied] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    // Multi-automation quote list - a client is often quoted several
    // automations at once (each with its own complexity/maintenance tier),
    // so the panel below lets several configured automations accumulate
    // into one combined quote instead of only ever pricing one at a time.
    const [automationItems, setAutomationItems] = useState([]);
    const [automationItemLabel, setAutomationItemLabel] = useState('');

    // Maintenance floor by complexity tier - a workflow's complexity is also
    // what drives its ongoing maintenance risk (external dependencies, AI
    // prompt drift, scraping breakage), so the same input that prices setup
    // also prices the retainer floor instead of an unrelated manual SLA pick.
    // `key` matches the tier keys used by the AI document generator
    // (aiDocGenerator.js / LeadDetailsModal.jsx) so a quote saved here
    // prefills the exact same tier there instead of a mismatched one.
    const MAINTENANCE_TIERS = {
        1.0: { key: 'basic', name: 'תחזוקה בסיסית', limit: 500, price: 400 },
        1.25: { key: 'medium', name: 'תחזוקה בינונית', limit: 2000, price: 650 },
        1.5: { key: 'advanced', name: 'תחזוקה מתקדמת (AI)', limit: 5000, price: 900 }
    };

    // Website Quoting State
    const [projectType, setProjectType] = useState('automation'); // 'automation' | 'website'
    const [websiteType, setWebsiteType] = useState('landing'); // 'landing' | 'image' | 'ecommerce' | 'custom'
    const [addons, setAddons] = useState({
        chatbot: false,
        calculator: false,
        survey: false,
        crm: false
    });
    const [webSla, setWebSla] = useState('basic'); // 'basic' | 'extended' | 'premium'

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

    // Calculate everything on input change
    useEffect(() => {
        if (projectType === 'website') {
            // Setup Cost
            let setup = WEBSITE_TYPES[websiteType].price;
            let extraMonthly = 0;
            
            if (addons.chatbot) {
                setup += WEBSITE_ADDONS.chatbot.price;
                extraMonthly += WEBSITE_ADDONS.chatbot.monthly;
            }
            if (addons.calculator) setup += WEBSITE_ADDONS.calculator.price;
            if (addons.survey) setup += WEBSITE_ADDONS.survey.price;
            if (addons.crm) setup += WEBSITE_ADDONS.crm.price;

            setFinalSetupCost(setup);

            // Monthly Cost
            const slaPrice = WEBSITE_SLA[webSla].price;
            const totalMonthly = slaPrice + extraMonthly + parseFloat(thirdPartyCosts || 0);
            setTotalMonthlyCost(totalMonthly);

            // Hours Saved & ROI (we can assume basic site saves 5 hours per week manually, or more if chatbot is added)
            const savedHours = addons.chatbot || addons.survey ? 20 : 5;
            setHoursSaved(savedHours);
            const gross = savedHours * parseFloat(employeeWage || 0);
            setGrossSavings(gross);

            const netProfit = gross - totalMonthly;
            setNetMonthlyProfit(netProfit);

            if (netProfit > 0) {
                setBreakEven(parseFloat((setup / netProfit).toFixed(1)));
            } else {
                setBreakEven(0);
            }
            setShowWarning(false);
        } else {
            // 1. Final Setup Cost
            const complexityMult = parseFloat(complexity);
            const extraIntegrations = Math.max(0, parseInt(integrations || 0) - 2);
            const setup = (parseFloat(hours || 0) * parseFloat(hourlyRate || 0) * complexityMult) + (extraIntegrations * 300);
            setFinalSetupCost(Math.round(setup));

            // 2. Hours Saved
            const savedHours = (parseFloat(taskTime || 0) * parseFloat(monthlyVolume || 0)) / 60;
            setHoursSaved(parseFloat(savedHours.toFixed(1)));

            // 3. Gross Savings
            let gross = savedHours * parseFloat(employeeWage || 0);
            if (includeHumanError) {
                gross = gross * 1.05; // 5% human error markup
            }
            setGrossSavings(Math.round(gross));

            // 4. Total Monthly Cost (includes overage billing beyond the maintenance
            // tier's run limit, matching the 0.05 ₪/run rate quoted in the warning
            // box below). The tier itself is derived from complexity, not picked
            // manually - a more complex workflow carries more maintenance risk.
            const maintenanceTier = MAINTENANCE_TIERS[complexity] || MAINTENANCE_TIERS[1.0];
            const retainerPrice = maintenanceTier.price;
            const limit = maintenanceTier.limit;
            const excessRuns = Math.max(0, parseInt(monthlyVolume || 0) - limit);
            const overageCost = excessRuns * 0.05;
            const totalMonthly = retainerPrice + parseFloat(thirdPartyCosts || 0) + overageCost;
            setTotalMonthlyCost(Math.round(totalMonthly));

            // 5. Net Monthly Profit
            const netProfit = gross - totalMonthly;
            setNetMonthlyProfit(Math.round(netProfit));

            // 6. Break-even
            if (netProfit > 0) {
                const beMonths = setup / netProfit;
                setBreakEven(parseFloat(beMonths.toFixed(1)));
            } else {
                setBreakEven(0);
            }

            // 7. Check if monthly runs exceed package limit
            setShowWarning(excessRuns > 0);
        }
    }, [
        projectType, websiteType, addons, webSla,
        hours, hourlyRate, complexity, integrations,
        taskTime, monthlyVolume, employeeWage, includeHumanError,
        thirdPartyCosts
    ]);

    // Load leads on mount
    useEffect(() => {
        async function loadLeads() {
            try {
                const data = await db.getLeads();
                setLeads(data || []);
            } catch (err) {
                console.error("Error loading leads in calculator:", err);
            }
        }
        loadLeads();
    }, []);

    // Switching to a different lead starts a fresh combined quote - otherwise
    // line items meant for the previous lead could get silently attached to
    // this one when the sales rep saves or copies the proposal.
    useEffect(() => {
        setAutomationItems([]);
        setAutomationItemLabel('');
    }, [selectedLeadId]);

    // Prefill fields when a lead is selected
    useEffect(() => {
        if (!selectedLeadId) return;
        const lead = leads.find(l => l.id === selectedLeadId);
        if (lead) {
            setProjectName(lead.company || lead.name || '');
            if (lead.survey_data) {
                const sd = lead.survey_data;
                if (sd.hourly_cost) {
                    setEmployeeWage(Math.max(0, parseInt(sd.hourly_cost) || 60));
                }
                if (sd.manual_hours) {
                    const weeklyHours = parseFloat(sd.manual_hours) || 0;
                    const estimatedVolume = Math.round((weeklyHours * 4.3 * 60) / (taskTime || 10));
                    setMonthlyVolume(Math.max(10, estimatedVolume));
                }
            }
        }
    }, [selectedLeadId, leads]);

    // Add the currently-configured automation as a line item in the combined
    // quote, snapshotting its already-computed numbers (setup, monthly,
    // savings) so later changes to the form don't retroactively alter items
    // already added to the list.
    const handleAddAutomationItem = () => {
        const maintenanceTier = MAINTENANCE_TIERS[complexity] || MAINTENANCE_TIERS[1.0];
        const newItem = {
            id: `${Date.now()}-${automationItems.length}`,
            label: automationItemLabel.trim() || `אוטומציה ${automationItems.length + 1}`,
            setupCost: finalSetupCost,
            monthlyCost: totalMonthlyCost,
            hoursSaved,
            grossSavings,
            maintenanceTierKey: maintenanceTier.key,
            maintenanceTierName: maintenanceTier.name,
            maintenanceTierPrice: maintenanceTier.price,
            thirdPartyCosts: parseFloat(thirdPartyCosts) || 0
        };
        setAutomationItems(prev => [...prev, newItem]);
        setAutomationItemLabel('');
    };

    const handleRemoveAutomationItem = (id) => {
        setAutomationItems(prev => prev.filter(item => item.id !== id));
    };

    // Save calculation to lead object
    const handleSaveQuoteToLead = async () => {
        if (!selectedLeadId) return;
        try {
            const maintenanceTier = MAINTENANCE_TIERS[complexity] || MAINTENANCE_TIERS[1.0];
            const quoteData = {
                project_type: projectType,
                setup_cost: hasMultipleItems ? itemsTotalSetup : finalSetupCost,
                monthly_cost: hasMultipleItems ? itemsTotalMonthly : totalMonthlyCost,
                sla_price: projectType === 'website' ? WEBSITE_SLA[webSla].price : (hasMultipleItems ? itemsTotalMonthly : maintenanceTier.price),
                automation_sla: projectType === 'website' || hasMultipleItems ? null : maintenanceTier.key,
                // Per-automation breakdown for a combined quote - consumed by the
                // AI document generator so the proposal itemizes each automation
                // instead of only showing one lump sum.
                automation_items: hasMultipleItems ? automationItems.map(item => ({
                    label: item.label,
                    setup_cost: item.setupCost,
                    monthly_cost: item.monthlyCost,
                    sla_key: item.maintenanceTierKey,
                    sla_price: item.maintenanceTierPrice,
                    third_party_costs: item.thirdPartyCosts
                })) : null,
                hourly_rate: projectType === 'website' ? null : hourlyRate,
                net_profit: hasMultipleItems ? itemsTotalNetProfit : netMonthlyProfit,
                break_even: hasMultipleItems ? itemsTotalBreakEven : breakEven,
                third_party_costs: hasMultipleItems ? automationItems.reduce((s, item) => s + item.thirdPartyCosts, 0) : thirdPartyCosts,
                website_type: projectType === 'website' ? websiteType : null,
                addons: projectType === 'website' ? addons : null
            };

            await db.updateLead(selectedLeadId, { quote_data: quoteData });

            const content = projectType === 'website'
                ? `הופקה הצעת מחיר לבניית אתר במחשבון ה-ROI:
• סוג האתר: ${WEBSITE_TYPES[websiteType].name}
• תוספות: ${Object.entries(addons).filter(([k,v]) => v).map(([k]) => WEBSITE_ADDONS[k].name).join(', ') || 'ללא'}
• עלות הקמה חד-פעמית: ₪${finalSetupCost.toLocaleString('he-IL')}
• אחסון ותחזוקה חודשית (${WEBSITE_SLA[webSla].name}): ₪${totalMonthlyCost.toLocaleString('he-IL')}
• החזר השקעה מחושב: תוך ${breakEven} חודשים`
                : hasMultipleItems
                    ? `הופקה הצעת מחיר משולבת (${automationItems.length} אוטומציות) במחשבון ה-ROI:
${automationItems.map(item => `• ${item.label}: הקמה ₪${item.setupCost.toLocaleString('he-IL')}, ריטיינר ₪${item.monthlyCost.toLocaleString('he-IL')} (${item.maintenanceTierName})`).join('\n')}
—
• סה"כ עלות הקמה: ₪${itemsTotalSetup.toLocaleString('he-IL')}
• סה"כ ריטיינר חודשי: ₪${itemsTotalMonthly.toLocaleString('he-IL')}
• רווח חודשי נקי לעסק: ₪${itemsTotalNetProfit.toLocaleString('he-IL')}
• החזר השקעה: תוך ${itemsTotalBreakEven} חודשים`
                    : `הופקה הצעת מחיר במחשבון ה-ROI:
• עלות הקמה חד-פעמית: ₪${finalSetupCost.toLocaleString('he-IL')}
• ריטיינר חודשי (${maintenanceTier.name}): ₪${maintenanceTier.price.toLocaleString('he-IL')}
• עלויות צד ג': ₪${thirdPartyCosts.toLocaleString('he-IL')}
• רווח חודשי נקי לעסק: ₪${netMonthlyProfit.toLocaleString('he-IL')}
• החזר השקעה: תוך ${breakEven} חודשים`;

            // Add note to lead details
            await db.addNote({
                lead_id: selectedLeadId,
                content: content
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Error saving quote to lead:", err);
            alert("שגיאה בשמירת הצעת המחיר לליד: " + (err.message || err));
        }
    };

    // Handle copying proposal text
    const handleCopyProposal = () => {
        const pName = projectName.trim() || '[שם הלקוח]';
        const setupStr = finalSetupCost.toLocaleString('he-IL');
        const retainerPrice = totalMonthlyCost.toLocaleString('he-IL');

        let text = '';
        if (projectType === 'website') {
            const webTypeName = WEBSITE_TYPES[websiteType].name;
            const slaName = WEBSITE_SLA[webSla].name;
            let activeAddons = [];
            if (addons.chatbot) activeAddons.push(WEBSITE_ADDONS.chatbot.name);
            if (addons.calculator) activeAddons.push(WEBSITE_ADDONS.calculator.name);
            if (addons.survey) activeAddons.push(WEBSITE_ADDONS.survey.name);
            if (addons.crm) activeAddons.push(WEBSITE_ADDONS.crm.name);

            text = `שם הלקוח/הפרויקט: ${pName}
שלום רב, בהמשך לשיחתנו אודות בניית האתר לעסק שלכם, להלן סיכום הצעת המחיר והאפיון:

🖥️ סוג האתר: ${webTypeName}
${activeAddons.length > 0 ? `✨ רכיבים ותוספות מתוכננים:\n${activeAddons.map(a => `  - ${a}`).join('\n')}\n` : ''}
💰 עלויות הפרויקט (לא כולל מע"מ):
- עלות הקמה חד-פעמית (עיצוב, פיתוח ואינטגרציות): ${setupStr} ₪ + מע"מ.
- עלות חודשית שוטפת (אחסון, רישיונות ותחזוקה - ${slaName}): ${retainerPrice} ₪ + מע"מ.

📈 כדאיות ותועלת עסקית:
- המערכות האינטראקטיביות באתר יחסכו לכם זמן עבודה יקר ויאפשרו איסוף לידים מסוננים ומאופיינים באופן אוטומטי.

נשמח לצאת לדרך! לכל שאלה אני כאן.
🚀 autoRI-studio`;
        } else if (hasMultipleItems) {
            const grossStr = itemsTotalGrossSavings.toLocaleString('he-IL');
            const netStr = itemsTotalNetProfit.toLocaleString('he-IL');
            const breakEvenStr = itemsTotalBreakEven > 0 ? itemsTotalBreakEven.toString() : 'לא מגיע';
            const nextMonthStr = itemsTotalBreakEven > 0 ? Math.ceil(itemsTotalBreakEven + 1).toString() : 'הבא';
            const itemsList = automationItems.map(item =>
                `- ${item.label}: הקמה ${item.setupCost.toLocaleString('he-IL')} ₪ + מע"מ, ריטיינר חודשי (${item.maintenanceTierName}) ${item.monthlyCost.toLocaleString('he-IL')} ₪ + מע"מ.`
            ).join('\n');

            text = `שם הלקוח/הפרויקט: ${pName}
שלום רב, בהמשך לאפיון צרכי האוטומציה עבורכם, להלן סיכום הנתונים הכלכליים והצעת המחיר לחבילת האוטומציות המשולבת (${automationItems.length} אוטומציות):

🔧 פירוט האוטומציות:
${itemsList}

📊 פוטנציאל חיסכון חודשי כולל:
- זמן עבודה שנחסך: ${itemsTotalHoursSaved} שעות בחודש.
- חיסכון כספי ישיר לעסק: ${grossStr} ₪ בחודש.

💰 סה"כ עלויות החבילה (לא כולל מע"מ):
- סה"כ עלות הקמה חד-פעמית: ${itemsTotalSetup.toLocaleString('he-IL')} ₪ + מע"מ.
- סה"כ ריטיינר חודשי לכל האוטומציות: ${itemsTotalMonthly.toLocaleString('he-IL')} ₪ + מע"מ.

📈 כדאיות כלכלית - ROI:
- רווח נקי חודשי לעסק (לאחר קיזוז עלות שוטפת): ${netStr} ₪.
- נקודת איזון והחזר השקעה - Break-even: תוך ${breakEvenStr} חודשים בלבד!
* החל מהחודש ה-${nextMonthStr}, המערכת מייצרת לעסק רווח נקי של ${netStr} ₪ בכל חודש מחדש.

נשמח לצאת לדרך, לכל שאלה אני כאן!
🚀 autoRI-studio`;
        } else {
            const maintenanceTier = MAINTENANCE_TIERS[complexity] || MAINTENANCE_TIERS[1.0];
            const grossStr = grossSavings.toLocaleString('he-IL');
            const netStr = netMonthlyProfit.toLocaleString('he-IL');
            const breakEvenStr = breakEven > 0 ? breakEven.toString() : 'לא מגיע';
            const nextMonthStr = breakEven > 0 ? Math.ceil(breakEven + 1).toString() : 'הבא';

            text = `שם הלקוח/הפרויקט: ${pName}
שלום רב, בהמשך לאפיון האוטומציה עבורכם, להלן סיכום הנתונים הכלכליים והצעת המחיר:

📊 פוטנציאל חיסכון חודשי:
- זמן עבודה שנחסך: ${hoursSaved} שעות בחודש.
- חיסכון כספי ישיר לעסק: ${grossStr} ₪ בחודש.

💰 עלויות המערכת (לא כולל מע"מ):
- עלות הקמה חד-פעמית - כולל פיתוח, שילוב AI וחיבור מערכות: ${setupStr} ₪ + מע"מ.
- ריטיינר חודשי (${maintenanceTier.name}) - כולל תמיכה, ניטור וחבילת הרצות: ${maintenanceTier.price.toLocaleString('he-IL')} ₪ + מע"מ.

📈 כדאיות כלכלית - ROI:
- רווח נקי חודשי לעסק (לאחר קיזוז עלות שוטפת): ${netStr} ₪.
- נקודת איזון והחזר השקעה - Break-even: תוך ${breakEvenStr} חודשים בלבד!
* החל מהחודש ה-${nextMonthStr}, המערכת מייצרת לעסק רווח נקי של ${netStr} ₪ בכל חודש מחדש.

נשמח לצאת לדרך, לכל שאלה אני כאן!
🚀 autoRI-studio`;
        }

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }).catch(err => {
            console.error("Failed to copy text:", err);
        });
    };

    // Combined totals across every automation added to the list - this is
    // what gets quoted to the client when they're buying more than one
    // automation at once, instead of only ever pricing a single automation.
    const itemsTotalSetup = automationItems.reduce((sum, item) => sum + item.setupCost, 0);
    const itemsTotalMonthly = automationItems.reduce((sum, item) => sum + item.monthlyCost, 0);
    const itemsTotalHoursSaved = automationItems.reduce((sum, item) => sum + item.hoursSaved, 0);
    const itemsTotalGrossSavings = automationItems.reduce((sum, item) => sum + item.grossSavings, 0);
    const itemsTotalNetProfit = itemsTotalGrossSavings - itemsTotalMonthly;
    const itemsTotalBreakEven = itemsTotalNetProfit > 0 ? parseFloat((itemsTotalSetup / itemsTotalNetProfit).toFixed(1)) : 0;
    const hasMultipleItems = projectType === 'automation' && automationItems.length > 0;

    return (
        <div style={{ direction: 'rtl', textAlign: 'right', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                        <Calculator size={22} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-light)', fontWeight: '600' }}>מחשבון תמחור ו-ROI משודרג</h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>חשב הצעות מחיר, רווחיות והחזר השקעה ללקוחות בצורה קלה ומהירה</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Lead Selector Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <User size={14} style={{ color: 'var(--text-secondary)' }} />
                        <select
                            value={selectedLeadId}
                            onChange={(e) => setSelectedLeadId(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '12.5px', outline: 'none', width: '160px', cursor: 'pointer' }}
                        >
                            <option value="" style={{ background: '#11131c', color: '#fff' }}>-- בחר ליד לקישור --</option>
                            {leads.map(lead => (
                                <option key={lead.id} value={lead.id} style={{ background: '#11131c', color: '#fff' }}>
                                    {lead.company || lead.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Manual Project Name Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <input 
                            type="text" 
                            placeholder="שם הלקוח / הפרויקט..." 
                            value={projectName}
                            onChange={(e) => {
                                setProjectName(e.target.value);
                                if (selectedLeadId) setSelectedLeadId(''); // Disconnect if custom text is typed
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '12.5px', outline: 'none', width: '150px', padding: 0 }}
                        />
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                
                {/* Inputs Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Project Type Switcher Tabs */}
                    <div style={{ 
                        display: 'flex', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        padding: '4px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-color)',
                        gap: '4px' 
                    }}>
                        <button
                            type="button"
                            onClick={() => setProjectType('automation')}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                background: projectType === 'automation' ? '#8b5cf6' : 'transparent',
                                color: projectType === 'automation' ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            אוטומציה ו-AI לעסק
                        </button>
                        <button
                            type="button"
                            onClick={() => setProjectType('website')}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                background: projectType === 'website' ? '#8b5cf6' : 'transparent',
                                color: projectType === 'website' ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            בניית אתר לעסק
                        </button>
                    </div>

                    {projectType === 'automation' ? (
                        <>
                            {/* Setup Costs Card */}
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Briefcase size={16} style={{ color: '#8b5cf6' }} />
                                    א. נתוני עלות הקמה (Setup)
                                </h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>שעות פיתוח משוערות</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={hours} 
                                            onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>תעריף שעתי (₪)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={hourlyRate} 
                                            onChange={(e) => setHourlyRate(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>רמת מורכבות הפרויקט</label>
                                    <select 
                                        value={complexity} 
                                        onChange={(e) => setComplexity(parseFloat(e.target.value))}
                                        className="form-control"
                                        style={{ padding: '6px 10px', fontSize: '12.5px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)', cursor: 'pointer' }}
                                    >
                                        <option value="1.0">בסיסי (x1.0) - אוטומציה פשוטה ללא עיבוד מורכב</option>
                                        <option value="1.25">בינוני (x1.25) - עיבוד לוגי, סינון, מניעת כפילויות</option>
                                        <option value="1.5">מתקדם / AI (x1.5) - שילוב Gemini, ניתוח קבצים, Scraping</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>מספר מערכות מקושרות (Integrations)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={integrations} 
                                        onChange={(e) => setIntegrations(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                    />
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>כל מערכת מעל ל-2 הראשונות מוסיפה תוספת קבועה של 300 ₪ לעלות ההקמה</span>
                                </div>
                            </div>

                            {/* Current Manual State Card */}
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={16} style={{ color: '#10b981' }} />
                                    ב. נתוני המצב הקיים (העבודה הידנית)
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>זמן ביצוע משימה ידנית (דקות)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={taskTime} 
                                            onChange={(e) => setTaskTime(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>נפח פעולות חודשי צפוי</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={monthlyVolume} 
                                            onChange={(e) => setMonthlyVolume(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>עלות שעת עובד ממוצעת (₪)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={employeeWage} 
                                        onChange={(e) => setEmployeeWage(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="humanError"
                                        checked={includeHumanError} 
                                        onChange={(e) => setIncludeHumanError(e.target.checked)}
                                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#8b5cf6' }}
                                    />
                                    <label htmlFor="humanError" style={{ fontSize: '12px', color: 'var(--text-light)', cursor: 'pointer' }}>
                                        כלול חיסכון של 5% בגין מניעת טעויות אנוש, זיכויים והפסד זמן (מומלץ)
                                    </label>
                                </div>
                            </div>

                            {/* Retainer & Infrastructure Card */}
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <DollarSign size={16} style={{ color: '#06b6d4' }} />
                                    ג. נתוני עלות שוטפת (Retainer & SLA)
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>רצפת תחזוקה חודשית (נגזרת אוטומטית מרמת המורכבות שנבחרה למעלה)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(MAINTENANCE_TIERS).map(([key, tier]) => {
                                            const isActive = String(complexity) === key;
                                            return (
                                                <div
                                                    key={key}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '8px 12px',
                                                        background: isActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                                                        border: isActive ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.04)',
                                                        borderRadius: '6px',
                                                        opacity: isActive ? 1 : 0.55
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input
                                                            type="radio"
                                                            checked={isActive}
                                                            readOnly
                                                            disabled={!isActive}
                                                            style={{ cursor: 'default', accentColor: '#8b5cf6' }}
                                                        />
                                                        <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', color: 'var(--text-light)' }}>{tier.name}</span>
                                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>(עד {tier.limit.toLocaleString()} הרצות)</span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#8b5cf6' }}>₪{tier.price} / חודש</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>הרמה המסומנת נבחרה אוטומטית לפי רמת המורכבות שהוגדרה בסעיף א' למעלה - היא לא ניתנת לבחירה ידנית. מעבר לנפח הכלול, כל ריצה נוספת מחויבת ב-0.05 ₪ (ראה אזהרה מתחת ללוח התוצאות אם רלוונטי).</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>עלויות צד ג' צפויות (OpenAI, רשיונות, טוקנים וכו')</label>
                                    <input
                                        type="number" 
                                        className="form-control" 
                                        value={thirdPartyCosts} 
                                        onChange={(e) => setThirdPartyCosts(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Website Setup Card */}
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Briefcase size={16} style={{ color: '#8b5cf6' }} />
                                    א. נתוני הקמת אתר (Setup)
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>סוג האתר הבסיסי</label>
                                    <select 
                                        value={websiteType} 
                                        onChange={(e) => setWebsiteType(e.target.value)}
                                        className="form-control"
                                        style={{ padding: '6px 10px', fontSize: '12.5px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)', cursor: 'pointer' }}
                                    >
                                        {Object.entries(WEBSITE_TYPES).map(([key, val]) => (
                                            <option key={key} value={key} style={{ background: '#11131c', color: '#fff' }}>
                                                {val.name} (₪{val.price.toLocaleString('he-IL')})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>תוספות ושילובים אינטראקטיביים (Add-ons)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(WEBSITE_ADDONS).map(([key, val]) => (
                                            <label 
                                                key={key} 
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    padding: '8px 12px', 
                                                    background: addons[key] ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)', 
                                                    border: addons[key] ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.04)', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={addons[key]}
                                                        onChange={(e) => setAddons(prev => ({ ...prev, [key]: e.target.checked }))}
                                                        style={{ cursor: 'pointer', accentColor: '#8b5cf6', width: '16px', height: '16px' }}
                                                    />
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)' }}>{val.name}</span>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                                    +₪{val.price.toLocaleString('he-IL')}
                                                    {val.monthly > 0 && ` (+₪${val.monthly}/ח"ד)`}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Current Manual State Card */}
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={16} style={{ color: '#10b981' }} />
                                    ב. הערכת חיסכון בזמן ידני לעסק
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>עלות שעת עובד ממוצעת (₪)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={employeeWage} 
                                        onChange={(e) => setEmployeeWage(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                                        חיסכון בזמן מחושב אוטומטית: 
                                        <strong> {addons.chatbot || addons.survey ? '20' : '5'} שעות בחודש </strong> 
                                        בזכות רכיבים אינטראקטיביים המבצעים סינון לידים ופניות.
                                    </span>
                                </div>
                            </div>

                            {/* Website SLA & Hosting Card */}
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <DollarSign size={16} style={{ color: '#06b6d4' }} />
                                    ג. עלויות אחסון, תחזוקה ושרתים (SLA)
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>בחירת חבילת תחזוקה ואחסון</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {Object.entries(WEBSITE_SLA).map(([key, value]) => (
                                            <label 
                                                key={key} 
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    padding: '8px 12px', 
                                                    background: webSla === key ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)', 
                                                    border: webSla === key ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.04)', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="webSlaPackage" 
                                                        value={key} 
                                                        checked={webSla === key}
                                                        onChange={() => setWebSla(key)}
                                                        style={{ cursor: 'pointer', accentColor: '#8b5cf6' }}
                                                    />
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)' }}>{value.name}</span>
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#8b5cf6' }}>₪{value.price} / חודש</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>עלויות שוטפות נוספות (שרתים, מנויים, Gemini API)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={thirdPartyCosts} 
                                        onChange={(e) => setThirdPartyCosts(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{ padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                </div>

                {/* Outputs Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Warning Box */}
                    {showWarning && (
                        <div style={{ display: 'flex', gap: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px', alignItems: 'flex-start' }}>
                            <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '11.5px', color: '#f59e0b', lineHeight: '1.4' }}>
                                <strong>אזהרה:</strong> נפח הפעולות החודשי שהוזן ({monthlyVolume.toLocaleString()}) חורג ממגבלת הריצות של רמת {(MAINTENANCE_TIERS[complexity] || MAINTENANCE_TIERS[1.0]).name} (עד {(MAINTENANCE_TIERS[complexity] || MAINTENANCE_TIERS[1.0]).limit.toLocaleString()} ריצות). ההפרש יחויב אוטומטית ב-0.05 ₪ לכל ריצה נוספת (מוצג בעלות השוטפת החודשית).
                            </span>
                        </div>
                    )}

                    {/* Results Dashboard Card */}
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.02) 100%)' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={16} style={{ color: '#10b981' }} />
                            לוח תוצאות כלכליות (Dashboard)
                        </h3>

                        {/* Metrics Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            
                            {/* Setup Fee Card */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>עלות הקמה מוצעת</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>₪{finalSetupCost.toLocaleString('he-IL')}</span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>חד פעמי</span>
                            </div>

                            {/* Monthly Retainer Card */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>עלות שוטפת חודשית</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#06b6d4' }}>₪{totalMonthlyCost.toLocaleString('he-IL')}</span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>ריטיינר + רישיונות</span>
                            </div>

                            {/* Hours Saved Card */}
                            <div style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '10.5px', color: '#10b981' }}>זמן שנחסך לעסק</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{hoursSaved} שעות</span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>בכל חודש</span>
                            </div>

                            {/* Net Profit Card */}
                            <div style={{ 
                                background: netMonthlyProfit > 0 ? 'rgba(139, 92, 246, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
                                border: netMonthlyProfit > 0 ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: '8px', 
                                padding: '12px', 
                                textAlign: 'center', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '4px',
                                boxShadow: netMonthlyProfit > 0 ? '0 0 10px rgba(139, 92, 246, 0.05)' : 'none'
                            }}>
                                <span style={{ fontSize: '10.5px', color: netMonthlyProfit > 0 ? '#a78bfa' : '#f87171' }}>רווח נקי חודשי לעסק</span>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: netMonthlyProfit > 0 ? '#c084fc' : '#f87171' }}>
                                    {netMonthlyProfit >= 0 ? `₪${netMonthlyProfit.toLocaleString('he-IL')}` : `-₪${Math.abs(netMonthlyProfit).toLocaleString('he-IL')}`}
                                </span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>לאחר קיזוז עלויות</span>
                            </div>

                        </div>

                        {/* Break-even Indicator */}
                        <div style={{ 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid rgba(255,255,255,0.04)', 
                            borderRadius: '8px', 
                            padding: '14px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '6px',
                            marginTop: '4px'
                        }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>החזר השקעה ונקודת איזון (Break-even):</span>
                            {netMonthlyProfit > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ 
                                        fontSize: '22px', 
                                        fontWeight: 'bold', 
                                        color: breakEven < 4.0 ? '#10b981' : 'var(--text-light)',
                                        textShadow: breakEven < 4.0 ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none'
                                    }}>
                                        תוך {breakEven} חודשים
                                    </span>
                                    {breakEven < 4.0 && (
                                        <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                                            🔥 החזר השקעה מהיר במיוחד (הצלחה מכירתית מובהקת)
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
                                    לא מגיע לאיזון (הוצאה חודשית גבוהה מהחיסכון הידני)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Multi-Automation Quote Builder - lets several configured
                        automations (each priced separately above) accumulate into
                        one combined quote for a client buying more than one. */}
                    {projectType === 'automation' && (
                        <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Database size={16} style={{ color: '#8b5cf6' }} />
                                הצעה משולבת - כמה אוטומציות ללקוח אחד
                            </h3>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                                הגדרתם למעלה אוטומציה אחת? הוסיפו אותה לרשימה כאן, אחר כך שנו את הנתונים למעלה לאוטומציה הבאה והוסיפו גם אותה. הסיכום הכולל בתחתית ישקף את כל האוטומציות יחד.
                            </p>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="שם/תיאור האוטומציה הנוכחית (למשל: סנכרון לידים)"
                                    value={automationItemLabel}
                                    onChange={(e) => setAutomationItemLabel(e.target.value)}
                                    style={{ flex: 1, padding: '6px 10px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-light)' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddAutomationItem}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: '12.5px', whiteSpace: 'nowrap', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    + הוסף לרשימה
                                </button>
                            </div>

                            {automationItems.length > 0 && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {automationItems.map(item => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-light)' }}>{item.label}</span>
                                                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                                        הקמה ₪{item.setupCost.toLocaleString('he-IL')} · ריטיינר ₪{item.monthlyCost.toLocaleString('he-IL')} ({item.maintenanceTierName})
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAutomationItem(item.id)}
                                                    aria-label={`הסר את ${item.label} מהרשימה`}
                                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px', padding: '2px 6px', lineHeight: 1 }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px', padding: '12px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid #8b5cf6', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>סה"כ הקמה ({automationItems.length} אוטומציות)</span>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>₪{itemsTotalSetup.toLocaleString('he-IL')}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>סה"כ ריטיינר חודשי</span>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#06b6d4' }}>₪{itemsTotalMonthly.toLocaleString('he-IL')}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>רווח נקי חודשי כולל</span>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#c084fc' }}>₪{itemsTotalNetProfit.toLocaleString('he-IL')}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>החזר השקעה כולל</span>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-light)' }}>{itemsTotalBreakEven > 0 ? `תוך ${itemsTotalBreakEven} חודשים` : 'לא מגיע'}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        כל עוד יש אוטומציות ברשימה, "שמור לליד" ו"העתק הצעה" ישתמשו בסכומים הכוללים האלה במקום בנתוני האוטומציה הבודדת שמוגדרת כרגע למעלה.
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Export Card */}
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={16} style={{ color: '#c084fc' }} />
                            ייצוא הצעת מחיר מקצועית
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                            בלחיצה על הכפתור למטה, המערכת תעתיק ללוח שלכם הצעת מחיר מפורמטת היטב בעברית כולל כל הנתונים, העלויות והחישובים הכלכליים של ה-ROI, המוכנה לשליחה מהירה בוואטסאפ או במייל.
                        </p>
                        
                        <button
                            type="button"
                            onClick={handleCopyProposal}
                            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                width: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: copied ? '#10b981' : '#8b5cf6',
                                color: '#ffffff',
                                border: 'none'
                            }}
                        >
                            {copied ? (
                                <>
                                    <Check size={16} />
                                    ההצעה הועתקה ללוח!
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    העתק הצעת מחיר מפורמטת לווטסאפ/מייל
                                </>
                            )}
                        </button>

                        {selectedLeadId && (
                            <button
                                type="button"
                                onClick={handleSaveQuoteToLead}
                                className={`btn ${saveSuccess ? 'btn-success' : 'btn-secondary'}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    width: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: saveSuccess ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                                    color: '#ffffff',
                                    border: '1px solid var(--border-color)',
                                    marginTop: '8px'
                                }}
                            >
                                {saveSuccess ? (
                                    <>
                                        <Check size={16} />
                                        ההצעה נשמרה בכרטיס הליד!
                                    </>
                                ) : (
                                    <>
                                        <Database size={16} style={{ color: '#8b5cf6' }} />
                                        שמור הצעת מחיר לכרטיס הליד
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                </div>

            </div>

            {/* User Guide Accordion */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '10px', marginTop: '10px' }}>
                <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-light)',
                        fontSize: '14px',
                        fontWeight: '600',
                        width: '100%',
                        textAlign: 'right',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} style={{ color: '#8b5cf6' }} />
                        מדריך שימוש והסבר על לוגיקת החישוב של המחשבון
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {showGuide ? '▲ סגור מדריך' : '▼ פתח מדריך לפרטים'}
                    </span>
                </button>
                
                {showGuide && (
                    <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: '1.5' }}>
                        <div>
                            <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>1. עלות הקמה סופית (Setup Cost):</strong>
                            נוסחה: <code>(שעות פיתוח × תעריף שעתי × מקדם מורכבות) + (מערכות מקושרות מעבר ל-2 × 300 ₪)</code>
                            <ul style={{ paddingRight: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <li><strong>בסיסי (x1.0):</strong> אוטומציה פשוטה, העברת מידע חלקה ללא עיבוד מורכב.</li>
                                <li><strong>בינוני (x1.25):</strong> כולל עיבוד לוגי, סינון כפילויות, או עד 2 מערכות.</li>
                                <li><strong>מתקדם/AI (x1.5):</strong> שילוב Gemini/AI, ניתוח קבצים, Scraping או מעל 3 מערכות.</li>
                                <li><strong>מערכות מקושרות:</strong> 2 המערכות הראשונות כלולות בעלות השעתית. כל מערכת נוספת מוסיפה 300 ₪ לעלות ההקמה.</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>2. חיסכון בזמן וכסף (Gross Savings):</strong>
                            <ul style={{ paddingRight: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <li><strong>זמן עבודה שנחסך:</strong> מחושב לפי: <code>(זמן ביצוע משימה ידנית בדקות × נפח פעולות חודשי) / 60</code>.</li>
                                <li><strong>חיסכון כספי חודשי ברוטו:</strong> מחושב לפי מכפלת שעות החיסכון בעלות שעת עובד.</li>
                                <li><strong>מקדם טעויות אנוש:</strong> סימון הצ'קבוקס מוסיף 5% לחיסכון הכללי בגין צמצום זיכויים, מניעת טעויות הקלדה והפסד זמן תפעולי.</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>3. עלות שוטפת חודשית (Total Monthly Cost):</strong>
                            מחושבת לפי: <code>רצפת תחזוקה (נגזרת מהמורכבות) + חריגת הרצות (0.05 ₪ לריצה) + עלויות צד ג' צפויות</code>
                            <ul style={{ paddingRight: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <li><strong>רצפת התחזוקה נגזרת אוטומטית מרמת המורכבות שנבחרה בסעיף א'</strong> - ולא נבחרת בנפרד - כי מורכבות הפרויקט היא גם מה שקובע כמה סיכון תחזוקה הוא נושא (תלות ב-AI, Scraping ואינטגרציות חיצוניות שיכולות להישבר).</li>
                                <li><strong>בסיסי (₪400):</strong> עד 500 הרצות בחודש כלולות.</li>
                                <li><strong>בינוני (₪650):</strong> עד 2,000 הרצות בחודש כלולות.</li>
                                <li><strong>מתקדם/AI (₪900):</strong> עד 5,000 הרצות בחודש כלולות.</li>
                                <li><strong>חריגת נפח:</strong> כל ריצה מעבר לנפח הכלול מחויבת אוטומטית ב-0.05 ₪.</li>
                                <li><strong>עלויות צד ג':</strong> עלויות ישירות של הלקוח עבור רשיונות (Make/n8n cloud), קרדיטים וטוקנים של OpenAI/Gemini שאינם כלולים ברצפת התחזוקה.</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>4. כדאיות כלכלית והחזר השקעה (ROI & Break-even):</strong>
                            <ul style={{ paddingRight: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <li><strong>רווח נקי חודשי לעסק:</strong> מחושב כהפרש בין החיסכון החודשי ברוטו לעלות השוטפת הכוללת.</li>
                                <li><strong>נקודת איזון (Break-even):</strong> מחושבת על ידי חלוקת עלות ההקמה החד-פעמית ברווח הנקי החודשי. מציגה תוך כמה חודשים העסק מחזיר את השקעתו ומתחיל לייצר רווח נקי.</li>
                                <li><strong>אינדיקטור הצלחה מהיר:</strong> החזר השקעה של פחות מ-4 חודשים יצבע את הנתון בירוק זוהר מודגש כהוכחת כדאיות חזקה.</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>5. קישוריות וסנכרון במערכת autoRI-studio:</strong>
                            <ul style={{ paddingRight: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <li><strong>קישור לליד:</strong> בחר ליד מהרשימה כדי לטעון את נתוניו אוטומטית. לחץ על "שמור הצעת מחיר לכרטיס הליד" כדי לתעד אותה במסד הנתונים.</li>
                                <li><strong>הזרקה אוטומטית למסמכים:</strong> ברגע ששמרת הצעת מחיר לליד, המסמכים הניתנים להורדה בכרטיס הליד ובדף הפרויקטים (הצעת מחיר, חוזה, חשבונית) ייווצרו כשהם כבר מעודכנים עם נתוני התמחור וה-ROI של הלקוח!</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
