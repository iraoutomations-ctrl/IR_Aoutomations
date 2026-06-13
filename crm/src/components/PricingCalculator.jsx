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

    const [selectedSla, setSelectedSla] = useState('standard');
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

    // Retainer Package definitions
    const SLA_PACKAGES = {
        standard: { name: 'Standard', limit: 1000, price: 400 },
        premium: { name: 'Premium', limit: 5000, price: 1000 },
        enterprise: { name: 'Enterprise', limit: 20000, price: 3000 }
    };

    // Calculate everything on input change
    useEffect(() => {
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

        // 4. Total Monthly Cost
        const retainerPrice = SLA_PACKAGES[selectedSla].price;
        const totalMonthly = retainerPrice + parseFloat(thirdPartyCosts || 0);
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
        const limit = SLA_PACKAGES[selectedSla].limit;
        if (parseInt(monthlyVolume || 0) > limit) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }
    }, [
        hours, hourlyRate, complexity, integrations,
        taskTime, monthlyVolume, employeeWage, includeHumanError,
        selectedSla, thirdPartyCosts
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

    // Save calculation to lead object
    const handleSaveQuoteToLead = async () => {
        if (!selectedLeadId) return;
        try {
            const quoteData = {
                setup_cost: finalSetupCost,
                monthly_cost: totalMonthlyCost,
                sla_price: SLA_PACKAGES[selectedSla].price,
                hourly_rate: hourlyRate,
                net_profit: netMonthlyProfit,
                break_even: breakEven,
                third_party_costs: thirdPartyCosts
            };

            await db.updateLead(selectedLeadId, { quote_data: quoteData });
            
            // Add note to lead details
            await db.addNote({
                lead_id: selectedLeadId,
                content: `הופקה הצעת מחיר במחשבון ה-ROI:
• עלות הקמה חד-פעמית: ₪${finalSetupCost.toLocaleString('he-IL')}
• ריטיינר חודשי קבוע: ₪${SLA_PACKAGES[selectedSla].price.toLocaleString('he-IL')}
• עלויות צד ג': ₪${thirdPartyCosts.toLocaleString('he-IL')}
• רווח חודשי נקי לעסק: ₪${netMonthlyProfit.toLocaleString('he-IL')}
• החזר השקעה: תוך ${breakEven} חודשים`
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
        const retainerPrice = SLA_PACKAGES[selectedSla].price.toLocaleString('he-IL');
        const grossStr = grossSavings.toLocaleString('he-IL');
        const netStr = netMonthlyProfit.toLocaleString('he-IL');
        const breakEvenStr = breakEven > 0 ? breakEven.toString() : 'לא מגיע';
        const nextMonthStr = breakEven > 0 ? Math.ceil(breakEven + 1).toString() : 'הבא';

        const text = `שם הלקוח/הפרויקט: ${pName}
שלום רב, בהמשך לאפיון האוטומציה עבורכם, להלן סיכום הנתונים הכלכליים והצעת המחיר:

📊 פוטנציאל חיסכון חודשי:
- זמן עבודה שנחסך: ${hoursSaved} שעות בחודש.
- חיסכון כספי ישיר לעסק: ${grossStr} ₪ בחודש.

💰 עלויות המערכת:
- עלות הקמה חד-פעמית - כולל פיתוח, שילוב AI וחיבור מערכות: ${setupStr} ₪.
- ריטיינר חודשי קבוע - כולל תמיכה, ניטור וחבילת הרצות: ${retainerPrice} ₪.

📈 כדאיות כלכלית - ROI:
- רווח נקי חודשי לעסק (לאחר קיזוז עלות שוטפת): ${netStr} ₪.
- נקודת איזון והחזר השקעה - Break-even: תוך ${breakEvenStr} חודשים בלבד!
* החל מהחודש ה-${nextMonthStr}, המערכת מייצרת לעסק רווח נקי של ${netStr} ₪ בכל חודש מחדש.

נשמח לצאת לדרך, לכל שאלה אני כאן!
🚀 autoRI-studio`;

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }).catch(err => {
            console.error("Failed to copy text:", err);
        });
    };

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
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>בחירת חבילת ריטיינר (SLA)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(SLA_PACKAGES).map(([key, value]) => (
                                    <label 
                                        key={key} 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            padding: '8px 12px', 
                                            background: selectedSla === key ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)', 
                                            border: selectedSla === key ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.04)', 
                                            borderRadius: '6px', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input 
                                                type="radio" 
                                                name="slaPackage" 
                                                value={key} 
                                                checked={selectedSla === key}
                                                onChange={() => setSelectedSla(key)}
                                                style={{ cursor: 'pointer', accentColor: '#8b5cf6' }}
                                            />
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)' }}>{value.name}</span>
                                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>(עד {value.limit.toLocaleString()} הרצות)</span>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#8b5cf6' }}>₪{value.price} / חודש</span>
                                    </label>
                                ))}
                            </div>
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

                </div>

                {/* Outputs Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Warning Box */}
                    {showWarning && (
                        <div style={{ display: 'flex', gap: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px', alignItems: 'flex-start' }}>
                            <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '11.5px', color: '#f59e0b', lineHeight: '1.4' }}>
                                <strong>אזהרה:</strong> נפח הפעולות החודשי שהוזן ({monthlyVolume.toLocaleString()}) חורג ממגבלת הריצות של חבילת {SLA_PACKAGES[selectedSla].name} (עד {SLA_PACKAGES[selectedSla].limit.toLocaleString()} ריצות). מומלץ לשדרג את חבילת ה-SLA על מנת למנוע חיוב חריגות של 0.05 ₪ לכל ריצה נוספת.
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
                                    {netMonthlyProfit > 0 ? `₪${netMonthlyProfit.toLocaleString('he-IL')}` : `₪${netMonthlyProfit.toLocaleString('he-IL')}`}
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
                            מחושבת לפי: <code>עלות חבילת ה-SLA שנבחרה + עלויות צד ג' צפויות</code>
                            <ul style={{ paddingRight: '18px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <li><strong>חבילת Standard (₪400):</strong> מיועדת לעד 1,000 הרצות בחודש.</li>
                                <li><strong>חבילת Premium (₪1,000):</strong> מיועדת לעד 5,000 הרצות בחודש.</li>
                                <li><strong>חבילת Enterprise (₪3,000):</strong> מיועדת לעד 20,000 הרצות בחודש.</li>
                                <li><strong>עלויות צד ג':</strong> עלויות ישירות של הלקוח עבור רשיונות (Make/n8n cloud), קרדיטים וטוקנים של OpenAI/Gemini שאינם כלולים בריטיינר שלכם.</li>
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
