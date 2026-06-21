/* ==========================================================================
   autoRI-studio CRM - Automation Roadmap Component
   ========================================================================== */
import React, { useState } from 'react';
import { 
    Map, 
    CheckCircle2, 
    Hourglass, 
    Calendar,
    ChevronDown, 
    ChevronUp,
    Shield,
    TrendingUp,
    Zap,
    Users,
    Activity,
    FileText,
    CreditCard,
    Clock,
    Cpu
} from 'lucide-react';

export default function Roadmap() {
    const [filter, setFilter] = useState('all');
    const [expandedItem, setExpandedItem] = useState(null);

    const roadmapItems = [
        {
            id: 'runs_capping',
            title: '1. בקרת הרצות וחסימת מכסות (Runs Capping)',
            category: 'sales',
            status: 'completed',
            icon: Zap,
            percentage: 100,
            description: 'מנגנון להגבלת הרצות אוטומטיות של הבוטים בהתאם לחבילת הבסיס ותוספות הבונוס של הלקוח.',
            integration: 'פונקציית PostgreSQL RPC בשם check_automation_quota המשולבת בתוך N8N לפני הרצת Gemini, וחוסמת או מנתבת את הריצה בהתאם.',
            value: 'מניעת חריגות תקציב של מפתחות ה-API ומניעת הפסדים כספיים לחברה.',
            supabase: 'automations, automation_runs, check_automation_quota RPC.',
            n8n: 'צומת HTTP Request ל-RPC, קוביית If (Quota Allowed?), צומת Log Run וצומת Respond.'
        },
        {
            id: 'ai_diagnostics',
            title: '2. דיאגנוסטיקה מונחית AI וניתוח תקלות',
            category: 'ops',
            status: 'completed',
            icon: Activity,
            percentage: 100,
            description: 'פענוח שגיאות ריצה מתוך N8N: ניתוח מבוסס חוקים לבעיות נפוצות + כפתור דיאגנוסטיקה חיה בעזרת Gemini Flash (ממשק ידני בתוך ה-CRM).',
            integration: 'ה-CRM שולף את מבנה ה-Workflow שנכשל ישירות משרת ה-N8N (דרך Vite CORS Proxy), מזין אותו ל-Gemini Flash ומקבל הסבר והנחיות לתיקון בעברית.',
            value: 'קיצור זמן הטיפול בתקלות (MTTR) מאינטגרציות מורכבות ללא צורך בכניסה ידנית ללוגים של N8N.',
            supabase: 'automation_runs, system_alerts.',
            n8n: 'שימוש ב-N8N Core API לגישה לנתוני ה-Workflow והשלבים.'
        },
        {
            id: 'data_rollups',
            title: '3. אגרגציה וצמצום נתונים (Daily Rollups)',
            category: 'ops',
            status: 'completed',
            icon: Clock,
            percentage: 100,
            description: 'מנגנון אוטומטי המאגד הרצות בודדות לסיכומים יומיים שבועיים ושנתיים, ומנקה היסטוריית ריצות ישנות לחיסכון במקום.',
            integration: 'פונקציית SQL מתוזמנת שמסכמת את אתמול לטבלת daily_stats, מוחקת הצלחות ישנות מ-7 ימים ושגיאות מ-30 יום.',
            value: 'חיסכון של למעלה מ-90% בנפח האחסון של Supabase ומניעת איטיות בגרפים ובממשק.',
            supabase: 'automation_daily_stats, automation_runs, run_daily_automation_rollup function.',
            n8n: 'סימולציה מובנית ב-CRM למצב אופליין, וג\'וב מתוזמן (Cron) ב-Supabase.'
        },
        {
            id: 'hard_gating',
            title: '4. חסימת שלבים מבוססת מסמכים (Hard Gating)',
            category: 'sales',
            status: 'completed',
            icon: FileText,
            percentage: 100,
            description: 'מניעת מעבר שלבים במכירות ובפרויקטים ללא העלאת מסמכי איכות וחתימות (NDA, חוזה, spec טכני, כרטיס גישות).',
            integration: 'ולידציה בפרונטאנד הבודקת את קיומם של קבצים משויכים בטבלת documents לפני שינוי הסטטוס ב-Supabase.',
            value: 'שמירה על סדר עבודה קפדני, מניעת מעבר לפיתוח ללא חוזה חתום, ומניעת מעבר ל-LIVE ללא אפיון.',
            supabase: 'documents, leads, automations.',
            n8n: 'אין צורך, מיושם ישירות ברמת ה-Client.'
        },
        {
            id: 'auth',
            title: '5. אבטחה ואוטנטיקציית משתמשים (User Authentication)',
            category: 'core',
            status: 'completed',
            icon: Shield,
            percentage: 100,
            description: 'מערכת התחברות (Login) ורישום מאובטחת המבוססת על Supabase Auth. המערכת מגבילה את הגישה ל-CRM רק לאנשי הצוות המורשים בארגון.',
            integration: 'שימוש במנגנון ה-JWT של Supabase והגדרת חוקי RLS מפורשים (Row Level Security) בטבלאות - כך שמשתמשים שאינם מחוברים ייחסמו טוטאלית, כולל ניתובים מאובטחים בפרונטאנד.',
            value: 'אבטחת מידע ארגוני רגיש ומניעת גישה לא מורשית ללידים, מפתחות API, ולנתוני הרצה.',
            supabase: 'storage.buckets (docs), public.users, public.leads, ופוליסיס לכלל הטבלאות.',
            n8n: 'אין צורך, מיושם ברמת ה-React App וה-Supabase Client.'
        },
        {
            id: 'auto_docs',
            title: '6. מחולל מסמכים וחתימות דיגיטליות (Auto-Doc & E-Sign)',
            category: 'sales',
            status: 'planned',
            icon: FileText,
            percentage: 0,
            description: 'יצירה אוטומטית של הצעות מחיר, NDA, וחוזים בפורמט PDF על בסיס נתוני הליד ושילוב מנגנון חתימה דיגיטלית ב-WhatsApp/Email.',
            integration: 'קוביית N8N המאזינה לשינוי שלב ב-CRM, מרכיבה PDF באמצעות HTML template, ושולחת אותו דרך API של שירות חתימות (כמו DocuSign או SignNow).',
            value: 'קיצור זמן סגירת העסקאות (Sales Cycle) וביטול הצורך ביצירת מסמכים ידנית.',
            supabase: 'documents, leads (עדכון סטטוס אוטומטי בחתימה).',
            n8n: 'מאזין ל-Supabase Webhook ➔ קוביית PDF Generator ➔ קוביית E-Sign API ➔ שליחת קישור ב-WhatsApp.'
        },
        {
            id: 'metered_billing',
            title: '7. הפקת חשבוניות וסליקה לפי שימוש (Metered Billing)',
            category: 'sales',
            status: 'planned',
            icon: CreditCard,
            percentage: 0,
            description: 'חישוב אוטומטי של עלות הריטיינר החודשי + עלויות החריגה (Overage) בסוף החודש, הפקת חשבונית ושליחת קישור לסליקה.',
            integration: 'וורקפלו מתוזמן ב-N8N הסורק את כמות הריצות בטבלת automation_daily_stats, מחשב חריגות מול ה-runs_goal, פונה ל-API של מערכת חשבוניות ומחולל קישור סליקה של Stripe.',
            value: 'חיוב מדויק ואוטומטי ללא התעסקות של הנהלת חשבונות ידנית בסוף החודש.',
            supabase: 'automation_daily_stats, automations (runs_goal, custom_overage_rate).',
            n8n: 'טריגר תזמון חודשי ➔ שליפת נתונים מ-Supabase ➔ חישוב מתמטי ב-Code node ➔ הפקת חשבונית ➔ Stripe payment link ➔ שליחה ב-WhatsApp.'
        },
        {
            id: 'client_portal',
            title: '8. פורטל לקוחות בשירות עצמי (Client Portal)',
            category: 'support',
            status: 'planned',
            icon: Users,
            percentage: 0,
            description: 'פורטל לקוחות ייעודי ומאובטח המאפשר לכל לקוח לראות את קצב הריצות שלו, מסמכים לחתימה, סטטוס הפיתוח, ודיווח על תקלות.',
            integration: 'יצירת דף כניסה נפרד ב-Vite המאומת ע"י מפתח גישה ייחודי ללקוח (Token). הפורטל מושך מידע מוגבל בלבד מתוך Supabase (ללא חשיפת לקוחות אחרים).',
            value: 'חוסך עשרות שעות שירות לקוחות ומשפר את אמון ושביעות רצון הלקוח.',
            supabase: 'leads, automations, automation_daily_stats, documents, bugs.',
            n8n: 'אין צורך, מיושם ברמת ה-CRM Client.'
        },
        {
            id: 'onboarding',
            title: '9. מערכת קליטת לקוח אוטומטית (Automated Onboarding)',
            category: 'support',
            status: 'planned',
            icon: Users,
            percentage: 0,
            description: 'פתיחת תיקיית לקוח ב-Google Drive, ערוץ Slack/Discord ייעודי ללקוח, ושליחת ערכת הצטרפות וסרטוני הדרכה אוטומטית.',
            integration: 'וורקפלו ב-N8N המופעל בעת מעבר ליד ל-Won ➔ יצירת תיקייה ב-Drive ➔ פנייה ל-Slack API לפתיחת ערוץ ➔ שליחת הודעת וואטסאפ ללקוח עם קישורים והדרכה.',
            value: 'חוסך זמן מנהלתי יקר, מעניק רושם ראשוני מקצועי מאוד ללקוח החדש.',
            supabase: 'leads (סטטוס won).',
            n8n: 'Supabase Webhook ➔ Google Drive node ➔ Slack node ➔ WhatsApp Send node.'
        },
        {
            id: 'csat_reviews',
            title: '10. סקר שביעות רצון ואיסוף ביקורות (Auto CSAT)',
            category: 'support',
            status: 'planned',
            icon: TrendingUp,
            percentage: 0,
            description: 'שליחת סקרי שביעות רצון (CSAT) אוטומטיים ללקוחות לאחר עלייה לאוויר וניתוב לקבלת ביקורות Google Business חיוביות.',
            integration: 'שליחת הודעת WhatsApp אינטראקטיבית 30 יום לאחר עליית אוטומציה ל-Live. דירוג 9-10 מנתב לבקשת ביקורת בגוגל, דירוג מתחת ל-7 פותח באג דחוף ב-CRM.',
            value: 'שיפור מתמיד באיכות, קבלת ביקורות חיוביות בגוגל, וזיהוי מוקדם של לקוחות מאוכזבים.',
            supabase: 'leads, bugs (פתיחת באג במקרה של דירוג נמוך).',
            n8n: 'Timer Trigger (30 days from live) ➔ WhatsApp interactive message ➔ conditional logic ➔ Google link / CRM Bug log.'
        },
        {
            id: 'churn_detection',
            title: '11. זיהוי סיכוני נטישה ואופטימיזציה (Churn Detection)',
            category: 'support',
            status: 'planned',
            icon: TrendingUp,
            percentage: 0,
            description: 'ניתוח דפוסי שימוש בריצות האוטומציה. התרעה על ירידות חדות בשימוש או ריבוי שגיאות המעידים על סיכון נטישת לקוח.',
            integration: 'סקריפט SQL/N8N המנתח את סך הריצות השבועי. ירידה של מעל 50% בנפח הריצות או שגיאות חוזרות במשך 3 ימים יוצרות התראה "Churn Risk" ב-CRM.',
            value: 'מניעת נטישת לקוחות באופן פרואקטיבי על ידי מתן מענה עוד לפני שהלקוח מדווח על בעיה.',
            supabase: 'automation_daily_stats, leads (שינוי תגית Churn Risk).',
            n8n: 'שליפת אגרגציות שבועיות מ-Supabase ➔ השוואה מול שבוע קודם ➔ פתיחת משימת סוכן ב-CRM במקרה של חריגה.'
        },
        {
            id: 'coolify_monitor',
            title: '12. ממשק ניטור שרתים וקונטיינרים (Coolify Server Monitor)',
            category: 'ops',
            status: 'completed',
            icon: Activity,
            percentage: 100,
            description: 'דף ייעודי ב-CRM המציג מדדים בזמן אמת על בריאות השרת (CPU, RAM, נפח דיסק) ומפרט החומרה הדינמי, לצד מעקב וניטור סטטוס ומדדי משאבים של קונטיינרים הפועלים בשרת.',
            integration: 'חיבור SSH מאובטח והרצת סקריפט Python בשרת Hetzner ➔ כתיבת מטריקות חומרה וקונטיינרים לטבלאות server_metrics ו-server_containers ב-Supabase.',
            value: 'מעקב רציף ואמין אחר משאבי שרת ה-CRM והסוכנים במקום אחד ללא צורך בכניסה ידנית לפאנלי ניהול, זיהוי מוקדם של עומסים וזליגות זיכרון.',
            supabase: 'server_metrics, server_containers, system_alerts.',
            n8n: 'וורקפלו ניטור מתוזמן (Cron) ➔ הרצת סקריפט בחיבור SSH ➔ עדכון מרוכז של מדדים וקונטיינרים ב-Supabase RPC.'
        },
        {
            id: 'agent_planner',
            title: '13. סוכן 1: אפיון ותכנון אוטומציות (Planner Agent)',
            category: 'core',
            status: 'in_progress',
            icon: Cpu,
            percentage: 10,
            description: 'סוכן AI המקבל את סיכום שיחת האיפיון של הלקוח מחלון ייעודי ב-CRM, מציע אוטומציות לאישור המשתמש ומייצר מפרט טכני מובנה (JSON Spec) הכולל טריגרים ושלבי עיבוד.',
            integration: 'הסוכן רץ בשרת Hetzner, מתחבר ב-API ל-CRM ושולח הצעות לאישור אנושי מובנה (Human-in-the-loop) לפני העברה לבנייה.',
            value: 'מייתר לחלוטין אפיון טכני ידני ראשוני ומקצר דרסטית את תחילת העבודה.',
            supabase: 'leads, automations, spec_templates.',
            n8n: 'CRM Webhooks לשליחת האפיון והחזרת ההצעות.'
        },
        {
            id: 'agent_builder_qa',
            title: '14. סוכנים 2 ו-3: בנייה אוטומטית ובקרת איכות (Builder & QA Agents)',
            category: 'core',
            status: 'in_progress',
            icon: Zap,
            percentage: 10,
            description: 'צמד סוכנים העובדים בלולאת פידבק סגורה (Ping-Pong) ליצירת וורקפלוס של N8N. הבונה מייצר/מעדכן וה-QA מריץ בדיקות קצה-לקצה עם Mock Data ומדווח על שגיאות לתיקון.',
            integration: 'סוכן הבנייה עובד מול N8N Dev REST API (בסביבת Sandbox). לאחר בדיקה תקינה של סוכן ה-QA, יופיע כפתור Deploy ב-CRM להעברה ל-N8N Production.',
            value: 'אוטומציה מלאה של פיתוח ה-Workflows ובדיקות איכות (QA) ללא צורך במגע יד אדם.',
            supabase: 'automations, qa_logs.',
            n8n: 'N8N REST API (Workflows CRUD & execution triggering).'
        },
        {
            id: 'agent_healer_monitor',
            title: '15. סוכן 4: ניטור, תיקון עצמי והפעלה מחדש (Self-Healing & Monitor Agent)',
            category: 'ops',
            status: 'in_progress',
            icon: Activity,
            percentage: 10,
            description: 'סוכן AI המנטר את ריצות הייצור ב-Production N8N בזמן אמת, מנתח תקלות ריצה, ומבצע תיקון עצמי אוטומטי תחת מגבלת תקציב קשיחה (עד 3 ניסיונות תיקון) למניעת לולאות שגיאות ובזבוז API.',
            integration: 'שימוש ב-Error Trigger של N8N לשליחת כשלים לסוכן ➔ ביצוע תיקונים לוגיים בוורקפלו או שליחת התראת רענון חיבור ללקוח ➔ בדיקת זמינות שרת והפעלה מחדש.',
            value: 'שרידות (Uptime) מקסימלית של האוטומציות ללא צורך במעורבות אנושית בשעות הלילה.',
            supabase: 'automation_runs, system_alerts, agent_healing_budgets.',
            n8n: 'Error Trigger Workflow ➔ API Updates.'
        }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span style={{ padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={11} /> הושלם</span>;
            case 'in_progress':
                return <span style={{ padding: '3px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Hourglass size={11} className="spin" /> בפיתוח</span>;
            default:
                return <span style={{ padding: '3px 8px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> מתוכנן</span>;
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            core: 'ליבת המערכת ואבטחה',
            sales: 'מכירות וסליקה',
            ops: 'תפעול וניטור שרתים',
            support: 'שירות עצמי ותמיכה'
        };
        return labels[category] || category;
    };

    const filteredItems = roadmapItems.filter(item => {
        if (filter === 'all') return true;
        return item.status === filter;
    });

    const completedCount = roadmapItems.filter(item => item.status === 'completed').length;
    const progressPercent = Math.round((completedCount / roadmapItems.length) * 100);

    return (
        <div className="roadmap-container fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <Map size={32} className="text-violet" style={{ color: '#8b5cf6' }} />
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-light)', margin: 0 }}>מפת דרכים לאוטומציית ה-CRM</h1>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        תוכנית הפיתוח והשדרוג להפיכת ה-CRM למערכת מנוהלת בעצמה (Zero-Touch System).
                    </p>
                </div>
            </div>

            {/* Overall Progress Dashboard */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(16, 185, 129, 0.02))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-light)' }}>התקדמות כללית של המערכת</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>{progressPercent}% ({completedCount} מתוך {roadmapItems.length} פיצ'רים)</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #10b981)', borderRadius: '5px', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '12.5px' }}>הכל</button>
                <button onClick={() => setFilter('completed')} className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '12.5px' }}>הושלמו</button>
                <button onClick={() => setFilter('in_progress')} className={`btn ${filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '12.5px' }}>בפיתוח</button>
                <button onClick={() => setFilter('planned')} className={`btn ${filter === 'planned' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 14px', fontSize: '12.5px' }}>מתוכננים</button>
            </div>

            {/* List of items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredItems.map(item => {
                    const isExpanded = expandedItem === item.id;
                    const Icon = item.icon;
                    return (
                        <div 
                            key={item.id} 
                            className="glass-card" 
                            style={{ 
                                borderRadius: '10px', 
                                border: isExpanded ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-color)', 
                                overflow: 'hidden',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: isExpanded ? '0 4px 20px rgba(139, 92, 246, 0.1)' : 'none'
                            }}
                        >
                            <div 
                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                style={{ 
                                    padding: '16px 20px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ 
                                        padding: '8px', 
                                        borderRadius: '8px', 
                                        background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.08)' : (item.status === 'in_progress' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.04)'),
                                        color: item.status === 'completed' ? '#10b981' : (item.status === 'in_progress' ? '#f59e0b' : 'var(--text-secondary)')
                                    }}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '14.5px', color: 'var(--text-light)', margin: 0, fontWeight: '600' }}>{item.title}</h3>
                                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>קטגוריה: {getCategoryLabel(item.category)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {getStatusBadge(item.status)}
                                    {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.06)' }}>
                                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                                        {item.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '12.5px' }}>
                                        
                                        <div style={{ border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                                            <strong style={{ color: '#a78bfa', display: 'block', marginBottom: '4px' }}>🔗 מנגנון אינטגרציה טכני</strong>
                                            <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5', display: 'block' }}>{item.integration}</span>
                                        </div>

                                        <div style={{ border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                                            <strong style={{ color: '#a78bfa', display: 'block', marginBottom: '4px' }}>💼 תועלת עסקית</strong>
                                            <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5', display: 'block' }}>{item.value}</span>
                                        </div>

                                        <div style={{ border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                                            <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>📊 עמודי Supabase מושפעים</strong>
                                            <code style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px', display: 'block', marginTop: '2px' }}>{item.supabase}</code>
                                        </div>

                                        <div style={{ border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                                            <strong style={{ color: '#06b6d4', display: 'block', marginBottom: '4px' }}>⚡ צמתי N8N נדרשים</strong>
                                            <code style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px', display: 'block', marginTop: '2px' }}>{item.n8n}</code>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
