/* ==========================================================================
   autoRI-studio CRM - Database & Storage Service (Local Mock + Supabase)
   ========================================================================== */
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase Client if env variables are defined
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ==========================================================================
// MOCK DATABASE / LOCAL STORAGE FALLBACK
// ==========================================================================
const STORAGE_KEYS = {
    LEADS: 'autoRI_leads',
    TASKS: 'autoRI_tasks',
    NOTES: 'autoRI_notes',
    AUTOMATIONS: 'autoRI_automations',
    BUGS: 'autoRI_bugs',
    SYSTEM_ALERTS: 'autoRI_system_alerts',
    SERVER_ALERTS: 'autoRI_server_alerts',
    AUTOMATION_RUNS: 'autoRI_automation_runs',
    AUTOMATION_DAILY_STATS: 'autoRI_automation_daily_stats',
    DOCUMENTS: 'autoRI_documents',
    SERVER_METRICS: 'autoRI_server_metrics',
    SERVER_CONTAINERS: 'autoRI_server_containers'
};

const INITIAL_MOCK_LEADS = [
    {
        id: 'mock-lead-1',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        name: 'דר׳ רון שפירא',
        email: 'dr.shapira@clinics-dental.co.il',
        phone: '054-1234567',
        company: 'מרפאת שיניים שפירא',
        source: 'survey',
        status: 'new',
        priority: 'high',
        survey_data: {
            industry: 'clinics',
            employees: '8',
            manual_hours: '15',
            hourly_cost: '75',
            monthly_savings_hours: '325',
            monthly_savings_cost: '₪24,375',
            yearly_savings_cost: '₪292,500'
        },
        notes: 'התעניין באוטומציה של זימון תורים ותזכורות בוואטסאפ למניעת אי-הגעה של פציינטים.'
    },
    {
        id: 'mock-lead-2',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        name: 'עו״ד מרינה גלר',
        email: 'marina@geller-law.co.il',
        phone: '052-7654321',
        company: 'גלר ושות׳ משרד עורכי דין',
        source: 'chatbot',
        status: 'contacted',
        priority: 'medium',
        chatbot_session: {
            industry: 'lawyers',
            challenge: 'סנכרון מסמכים ועדכון לקוחות',
            contact_pref: 'whatsapp'
        },
        notes: 'ליד מהצ׳אטבוט. ביקשה שייצרו איתה קשר בוואטסאפ לתיאום הדגמה של אוטומציית קליטת לקוחות חדשים.'
    },
    {
        id: 'mock-lead-3',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'שימי אלקובי',
        email: 'shimi@gold-key.co.il',
        phone: '050-9876543',
        company: 'מפתח הזהב נדל״ן',
        source: 'survey',
        status: 'proposal',
        priority: 'high',
        survey_data: {
            industry: 'realtors',
            employees: '4',
            manual_hours: '12',
            hourly_cost: '60',
            monthly_savings_hours: '104',
            monthly_savings_cost: '₪6,240',
            yearly_savings_cost: '₪74,880'
        },
        notes: 'שלחנו הצעה לאוטומציה המושכת נכסים חדשים מאתרים ומפרסמת ישירות לפייסבוק ואינסטגרם.'
    },
    {
        id: 'mock-lead-4',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'יפה לוי',
        email: 'yafa@levy-ins.com',
        phone: '054-4445556',
        company: 'לוי סוכנות ביטוח',
        source: 'contact_form',
        status: 'won',
        priority: 'medium',
        notes: 'פנייה כללית מטופס צור קשר. הפרויקט נסגר - אוטומציית מענה למיילים וקליטת פוליסות עובדת.'
    },
    {
        id: 'mock-lead-5',
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'אלון ברק',
        email: 'alon@barak-fit.co.il',
        phone: '053-1112223',
        company: 'Barak Fitness',
        source: 'chatbot',
        status: 'lost',
        priority: 'low',
        chatbot_session: {
            industry: 'general',
            challenge: 'ניהול לידים מפרסום',
            contact_pref: 'phone'
        },
        notes: 'פרויקט קטן מדי. חיפש פתרון חינמי לחלוטין ללא עלות רישוי. סומן כאבוד.'
    }
];

const INITIAL_MOCK_TASKS = [
    {
        id: 'mock-task-1',
        lead_id: 'mock-lead-1',
        title: 'להתקשר לתיאום פגישת אפיון ראשונית',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        completed: false,
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-task-2',
        lead_id: 'mock-lead-2',
        title: 'לשלוח הודעת וואטסאפ לתיאום שיחה',
        due_date: new Date().toISOString(), // Today
        completed: false,
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-task-3',
        lead_id: 'mock-lead-3',
        title: 'פולו-אפ על הצעת המחיר ששלחנו',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        created_at: new Date().toISOString()
    },
    {
        id: 'mock-task-4',
        lead_id: 'mock-lead-4',
        title: 'הדרכה ראשונית לצוות על המערכת',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        completed: true,
        created_at: new Date().toISOString()
    }
];

const INITIAL_MOCK_NOTES = [
    {
        id: 'mock-note-1',
        lead_id: 'mock-lead-1',
        content: 'הליד נוצר אוטומטית ממענה על שאלון האתר (ענף מרפאות). חיסכון שנתי מוערך של ₪292,500.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'mock-note-2',
        lead_id: 'mock-lead-2',
        content: 'הליד נוצר מצ׳אטבוט האתר. האתגר המרכזי: סנכרון מסמכים ועדכון לקוחות.',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'mock-note-3',
        lead_id: 'mock-lead-3',
        content: 'בוצעה שיחת הכרות ראשונה. העסק עובד עם 4 אנשים שמבזבזים שעות רבות בפרסום נכסים ידני.',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'mock-note-4',
        lead_id: 'mock-lead-3',
        content: 'נשלחה הצעה טכנית למייל ומחיר חודשי של ₪1,500.',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const INITIAL_MOCK_AUTOMATIONS = [
    {
        id: 'mock-auto-1',
        lead_id: 'mock-lead-3', // שימי אלקובי
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'משיכת נכסים מ-יד2 ופרסום לרשתות',
        type: 'פייסבוק ואינסטגרם',
        status: 'development',
        setup_price: 1500,
        monthly_maintenance: 200,
        runs_goal: 500,
        n8n_workflow_id: 'mock-workflow-1',
        n8n_workflows: [{ id: 'mock-workflow-1', name: 'משיכת נכסים מ-יד2' }],
        block_on_limit: true,
        extra_runs_allowance: 0,
        custom_overage_rate: 0.05
    },
    {
        id: 'mock-auto-2',
        lead_id: 'mock-lead-4', // יפה לוי
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'מענה אוטומטי וסיווג מיילים ב-AI',
        type: 'סוכני AI ומיילים',
        status: 'live',
        setup_price: 3200,
        monthly_maintenance: 350,
        runs_goal: 1000,
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        n8n_workflows: [
            { id: 'lyCrWBmsGlRSMJmo', name: 'IR AI Bot' },
            { id: 'bRNz7Lq79wYJ5Dvo', name: 'autoRI - Chatbot Error Monitor' }
        ],
        block_on_limit: true,
        extra_runs_allowance: 0,
        custom_overage_rate: 0.05
    },
    {
        id: 'mock-auto-3',
        lead_id: 'mock-lead-4', // יפה לוי
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'הנפקת פוליסות וחשבוניות אוטומטית',
        type: 'ניהול כספים ומסמכים',
        status: 'live',
        setup_price: 2400,
        monthly_maintenance: 250,
        runs_goal: 750,
        n8n_workflow_id: 'mock-workflow-3',
        n8n_workflows: [{ id: 'mock-workflow-3', name: 'מחולל חשבוניות' }],
        block_on_limit: true,
        extra_runs_allowance: 0,
        custom_overage_rate: 0.05
    }
];

const INITIAL_MOCK_BUGS = [
    {
        id: 'mock-bug-1',
        automation_id: 'mock-auto-1',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'שגיאת תיוג תמונות בהעלאה לאינסטגרם API',
        severity: 'high',
        status: 'open'
    }
];

const INITIAL_MOCK_SYSTEM_ALERTS = [
    {
        id: 'mock-alert-1',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        title: '🚨 תקלה: שגיאת חיבור ל-API',
        message: 'הבקשה לקבלת נתונים מ-OpenAI נכשלה עם קוד שגיאה 429: Too Many Requests.',
        type: 'error',
        read: false,
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        duration_ms: 1200
    },
    {
        id: 'mock-alert-2',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        title: '✅ צ\'אטבוט: מענה Gemini Flash',
        message: 'הודעה נשלחה בהצלחה ללקוח דניאל לוי.',
        type: 'success',
        read: false,
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        duration_ms: 450
    },
    {
        id: 'mock-alert-3',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        title: '⚠️ אזהרה: שימוש בגיבוי ChatGPT Fallback',
        message: 'הפנייה ל-Gemini Flash נכשלה, המערכת ביצעה מעבר אוטומטי לגיבוי ChatGPT.',
        type: 'warning',
        read: true,
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        duration_ms: 3120
    }
];

const INITIAL_MOCK_SERVER_ALERTS = [
    {
        id: 'mock-server-alert-1',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        title: '🚨 עומס חריג: מעבד (CPU) גבוה',
        message: 'עומס המעבד עלה על 95% למשך יותר מ-5 דקות. ערך נוכחי: 98.4%.',
        type: 'error',
        read: false,
        container_id: null
    },
    {
        id: 'mock-server-alert-2',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        title: '⚠️ אזהרה: זיכרון RAM גבוה',
        message: 'ניצול הזיכרון עבר את רף ה-90%. ערך נוכחי: 91.2% (7.3 GB מתוך 8 GB).',
        type: 'warning',
        read: false,
        container_id: null
    },
    {
        id: 'mock-server-alert-3',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        title: '🔄 קונטיינר הופעל מחדש: N8N Development',
        message: 'הקונטיינר n8n-dev קרס או הופעל מחדש באופן יזום על ידי המערכת.',
        type: 'warning',
        read: true,
        container_id: 'n8n-dev'
    },
    {
        id: 'mock-server-alert-4',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        title: '✅ תקין: שטח דיסק',
        message: 'ביצוע בדיקת שטח דיסק תקין: 38.4 GB בשימוש (51.6 GB פנויים).',
        type: 'success',
        read: true,
        container_id: null
    }
];

const INITIAL_MOCK_SERVER_METRICS = Array.from({ length: 24 }, (_, i) => {
    const time = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    const cpu = Math.floor(15 + Math.sin(i / 2) * 8 + Math.random() * 10);
    const ram = Math.floor(45 + Math.cos(i / 3) * 5 + Math.random() * 3);
    const disk = 38.4;
    return { 
        created_at: time, 
        cpu_usage: cpu, 
        ram_usage: ram, 
        disk_usage: disk,
        cpu_cores: 2,
        cpu_model: "AMD EPYC",
        ram_total: 4294967296,
        disk_total: 85899345920
    };
});

const INITIAL_MOCK_SERVER_CONTAINERS = [
    { id: 'n8n-prod', name: 'N8N Production', status: 'running', cpu_percent: 1.2, ram_bytes: 345000000, updated_at: new Date().toISOString() },
    { id: 'n8n-dev', name: 'N8N Development', status: 'running', cpu_percent: 0.4, ram_bytes: 290000000, updated_at: new Date().toISOString() },
    { id: 'supabase-db', name: 'PostgreSQL Database', status: 'running', cpu_percent: 2.1, ram_bytes: 512000000, updated_at: new Date().toISOString() },
    { id: 'redis-cache', name: 'Redis Cache', status: 'running', cpu_percent: 0.1, ram_bytes: 64000000, updated_at: new Date().toISOString() },
    { id: 'coolify', name: 'Coolify Console', status: 'running', cpu_percent: 0.8, ram_bytes: 180000000, updated_at: new Date().toISOString() }
];

const INITIAL_MOCK_AUTOMATION_RUNS = [
    {
        id: 'mock-run-1',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        automation_id: 'mock-auto-2',
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        status: 'success',
        duration_ms: 380,
        error_type: '',
        details: { message: 'ריצה תקינה' },
        ai_analysis: null
    },
    {
        id: 'mock-run-2',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        automation_id: 'mock-auto-2',
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        status: 'warning',
        duration_ms: 2450,
        error_type: 'גיבוי ChatGPT',
        details: { error_message: 'קריאה ל-Gemini נכשלה, הופעל גיבוי' },
        ai_analysis: 'הפנייה המקורית ל-Gemini Flash נכשלה עקב שגיאת רשת, המערכת פנתה ל-ChatGPT והחזירה תשובה בהצלחה.'
    },
    {
        id: 'mock-run-3',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        automation_id: 'mock-auto-2',
        n8n_workflow_id: 'lyCrWBmsGlRSMJmo',
        status: 'error',
        duration_ms: null,
        error_type: 'שגיאת חיבור (404)',
        details: { error_message: 'נתיב לא נמצא' },
        ai_analysis: 'שגיאת 404 בהתרת כתובת ה-webhook. ודא ששרת ה-N8N פעיל וכתובת ה-URL מעודכנת.'
    }
];

function generateInitialMockDailyStats() {
    const stats = [];
    const automations = [
        { id: 'mock-auto-1', workflowId: 'mock-workflow-1' },
        { id: 'mock-auto-2', workflowId: 'lyCrWBmsGlRSMJmo' },
        { id: 'mock-auto-3', workflowId: 'mock-workflow-3' }
    ];

    // Generate stats for the last 45 days
    for (let d = 45; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];

        automations.forEach(auto => {
            // Generate deterministic but realistic-looking numbers based on date/id
            const seed = (date.getDate() * 7 + auto.id.charCodeAt(auto.id.length - 1)) % 10;
            
            let total = 10 + seed * 3;
            let success = Math.round(total * 0.9);
            let error = 0;
            let warning = 0;
            
            if (seed === 3 || seed === 7) {
                error = 1;
                success -= 1;
            }
            if (seed === 5 || seed === 8) {
                warning = 2;
                success -= 2;
            }

            const avgDur = 500 + seed * 120;

            const hourlySuccess = Array(24).fill(0);
            const hourlyWarning = Array(24).fill(0);
            const hourlyError = Array(24).fill(0);

            // Distribute runs across hours (mostly active during business hours 9-18)
            let sRemaining = success;
            let wRemaining = warning;
            let eRemaining = error;

            const activeHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
            activeHours.forEach(h => {
                if (sRemaining > 0) {
                    const count = Math.min(sRemaining, 2);
                    hourlySuccess[h] = count;
                    sRemaining -= count;
                }
            });
            if (sRemaining > 0) hourlySuccess[12] += sRemaining;

            if (wRemaining > 0) {
                hourlyWarning[14] = wRemaining;
            }
            if (eRemaining > 0) {
                hourlyError[10] = eRemaining;
            }

            const errorTypes = error > 0 ? { 'שגיאת חיבור (404)': error } : {};
            const warningTypes = warning > 0 ? { 'גיבוי ChatGPT': warning } : {};

            stats.push({
                id: `mock-stats-${auto.id}-${dateStr}`,
                date: dateStr,
                automation_id: auto.id,
                n8n_workflow_id: auto.workflowId,
                total_runs: total,
                success_runs: success,
                warning_runs: warning,
                error_runs: error,
                avg_duration_ms: avgDur,
                hourly_success: hourlySuccess,
                hourly_warning: hourlyWarning,
                hourly_error: hourlyError,
                error_types: errorTypes,
                warning_types: warningTypes
            });
        });
    }
    return stats;
}

const INITIAL_MOCK_AUTOMATION_DAILY_STATS = generateInitialMockDailyStats();

const INITIAL_MOCK_DOCUMENTS = [
    {
        id: 'mock-doc-1',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: 'mock-lead-3', // שימי אלקובי
        automation_id: null,
        name: 'הצעת מחיר - מפתח הזהב נדלן',
        type: 'proposal',
        file_name: 'proposal_gold_key.pdf',
        file_size: 245120, // 240 KB
        file_url: '#'
    },
    {
        id: 'mock-doc-2',
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        lead_id: 'mock-lead-4', // יפה לוי
        automation_id: 'mock-auto-2',
        name: 'חוזה התקשרות חתום',
        type: 'contract',
        file_name: 'signed_contract_yafa_levy.pdf',
        file_size: 512000, // 500 KB
        file_url: '#'
    }
];

function synthesizeRunsFromDailyStats(dailyStats, automationId, workflowIds) {
    const synthesizedRuns = [];
    const defaultWorkflowId = workflowIds && workflowIds.length > 0 ? workflowIds[0] : '';
    
    dailyStats.forEach(row => {
        let dateStr = row.date;
        if (dateStr instanceof Date) {
            dateStr = dateStr.toISOString().split('T')[0];
        } else if (typeof dateStr === 'string') {
            dateStr = dateStr.split('T')[0];
        } else {
            return;
        }
        
        const [y, m_num, d_num] = dateStr.split('-').map(Number);
        
        // Expand error types and warning types
        const errorTypesList = [];
        if (row.error_types) {
            Object.entries(row.error_types).forEach(([type, count]) => {
                for (let i = 0; i < count; i++) errorTypesList.push(type);
            });
        }
        const warningTypesList = [];
        if (row.warning_types) {
            Object.entries(row.warning_types).forEach(([type, count]) => {
                for (let i = 0; i < count; i++) warningTypesList.push(type);
            });
        }

        // Loop through 24 hours
        for (let h = 0; h < 24; h++) {
            const sCount = row.hourly_success ? (row.hourly_success[h] || 0) : 0;
            const wCount = row.hourly_warning ? (row.hourly_warning[h] || 0) : 0;
            const eCount = row.hourly_error ? (row.hourly_error[h] || 0) : 0;

            // Generate success runs
            for (let i = 0; i < sCount; i++) {
                synthesizedRuns.push({
                    id: `synth-${row.id}-success-${h}-${i}`,
                    created_at: new Date(Date.UTC(y, m_num - 1, d_num, h, 0, 0)).toISOString(),
                    automation_id: automationId,
                    n8n_workflow_id: row.n8n_workflow_id || defaultWorkflowId,
                    status: 'success',
                    duration_ms: row.avg_duration_ms || 0,
                    error_type: '',
                    title: '✅ ריצה תקינה (היסטוריה)',
                    message: 'ריצה תקינה',
                    details: { message: 'ריצה תקינה' },
                    ai_analysis: null
                });
            }

            // Generate warning runs
            for (let i = 0; i < wCount; i++) {
                const errType = warningTypesList.shift() || 'General Warning';
                synthesizedRuns.push({
                    id: `synth-${row.id}-warning-${h}-${i}`,
                    created_at: new Date(Date.UTC(y, m_num - 1, d_num, h, 5, 0)).toISOString(),
                    automation_id: automationId,
                    n8n_workflow_id: row.n8n_workflow_id || defaultWorkflowId,
                    status: 'warning',
                    duration_ms: row.avg_duration_ms || 0,
                    error_type: errType,
                    title: `⚠️ אזהרה: ${errType} (היסטוריה)`,
                    message: `אזהרה היסטורית: ${errType}`,
                    details: { warning_message: `אזהרה: ${errType}` },
                    ai_analysis: null
                });
            }

            // Generate error runs
            for (let i = 0; i < eCount; i++) {
                const errType = errorTypesList.shift() || 'General Error';
                synthesizedRuns.push({
                    id: `synth-${row.id}-error-${h}-${i}`,
                    created_at: new Date(Date.UTC(y, m_num - 1, d_num, h, 10, 0)).toISOString(),
                    automation_id: automationId,
                    n8n_workflow_id: row.n8n_workflow_id || defaultWorkflowId,
                    status: 'error',
                    duration_ms: row.avg_duration_ms || 0,
                    error_type: errType,
                    title: `🚨 שגיאה: ${errType} (היסטוריה)`,
                    message: `שגיאה היסטורית: ${errType}`,
                    details: { error_message: `שגיאה: ${errType}` },
                    ai_analysis: null
                });
            }
        }
    });

    return synthesizedRuns;
}

function simulateLocalRollup() {
    try {
        const automations = getLocalData(STORAGE_KEYS.AUTOMATIONS, INITIAL_MOCK_AUTOMATIONS);
        let runs = getLocalData(STORAGE_KEYS.AUTOMATION_RUNS, INITIAL_MOCK_AUTOMATION_RUNS);
        let alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
        let dailyStats = getLocalData(STORAGE_KEYS.AUTOMATION_DAILY_STATS, INITIAL_MOCK_AUTOMATION_DAILY_STATS);

        const now = new Date();
        const cutoff7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const cutoff30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const allItems = [...runs, ...alerts];
        if (allItems.length === 0) return;

        const groups = {};

        automations.forEach(auto => {
            const workflowIds = [];
            if (auto.n8n_workflow_id) {
                auto.n8n_workflow_id.split(',').forEach(id => {
                    const trimmed = id.trim();
                    if (trimmed) workflowIds.push(trimmed);
                });
            }
            let parsedWorkflows = [];
            if (auto.n8n_workflows) {
                if (Array.isArray(auto.n8n_workflows)) {
                    parsedWorkflows = auto.n8n_workflows;
                } else if (typeof auto.n8n_workflows === 'string') {
                    try {
                        const parsed = JSON.parse(auto.n8n_workflows);
                        if (Array.isArray(parsed)) parsedWorkflows = parsed;
                    } catch (e) {}
                }
            }
            parsedWorkflows.forEach(w => {
                if (w && w.id) workflowIds.push(w.id.trim());
            });

            const autoRuns = runs.filter(r => 
                r.automation_id === auto.id || 
                (r.n8n_workflow_id && workflowIds.includes(r.n8n_workflow_id.trim()))
            );

            const autoAlerts = alerts.filter(alert => {
                let status = 'success';
                if (alert.type === 'error') status = 'error';
                else if (alert.type === 'warning') status = 'warning';

                let wfId = alert.n8n_workflow_id;
                if (!wfId) {
                    const textToSearch = ((alert.title || '') + ' ' + (alert.message || '')).toLowerCase();
                    if (textToSearch.includes("צ'אטבוט") || textToSearch.includes('chatbot') || textToSearch.includes('gemini') || textToSearch.includes('בוט') || textToSearch.includes('מענה')) {
                        wfId = 'lyCrWBmsGlRSMJmo';
                    } else if (textToSearch.includes('תקלה') || textToSearch.includes('נכשל') || textToSearch.includes('שגיאה')) {
                        wfId = 'bRNz7Lq79wYJ5Dvo';
                    }
                }
                return wfId && workflowIds.includes(wfId.trim());
            }).map(alert => {
                let status = 'success';
                if (alert.type === 'error') status = 'error';
                else if (alert.type === 'warning') status = 'warning';
                
                let errType = alert.title || '';
                errType = errType.replace(/🚨|⚠️|✅/g, '').replace('תקלה:', '').replace('הצלחה:', '').trim();

                return {
                    id: alert.id,
                    created_at: alert.created_at,
                    automation_id: auto.id,
                    n8n_workflow_id: alert.n8n_workflow_id,
                    status: status,
                    duration_ms: alert.duration_ms || null,
                    error_type: errType
                };
            });

            const combined = [...autoRuns, ...autoAlerts];

            combined.forEach(item => {
                const dateStr = item.created_at.split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                
                if (dateStr >= todayStr) return;

                const key = `${dateStr}_${auto.id}`;
                if (!groups[key]) {
                    groups[key] = {
                        date: dateStr,
                        automation_id: auto.id,
                        n8n_workflow_id: auto.n8n_workflow_id || workflowIds[0] || '',
                        items: []
                    };
                }
                groups[key].items.push(item);
            });
        });

        let statsChanged = false;
        Object.values(groups).forEach(g => {
            const dateStr = g.date;
            const autoId = g.automation_id;

            const total = g.items.length;
            const success = g.items.filter(item => item.status === 'success').length;
            const warning = g.items.filter(item => item.status === 'warning').length;
            const error = g.items.filter(item => item.status === 'error').length;
            
            const runsWithDuration = g.items.filter(item => item.duration_ms > 0);
            const avgDuration = runsWithDuration.length > 0 
                ? Math.round(runsWithDuration.reduce((acc, item) => acc + item.duration_ms, 0) / runsWithDuration.length) 
                : 0;

            const hourlySuccess = Array(24).fill(0);
            const hourlyWarning = Array(24).fill(0);
            const hourlyError = Array(24).fill(0);

            const errorTypes = {};
            const warningTypes = {};

            g.items.forEach(item => {
                const hour = new Date(item.created_at).getUTCHours();
                if (item.status === 'success') {
                    hourlySuccess[hour]++;
                } else if (item.status === 'warning') {
                    hourlyWarning[hour]++;
                    const type = item.error_type || 'General Warning';
                    warningTypes[type] = (warningTypes[type] || 0) + 1;
                } else if (item.status === 'error') {
                    hourlyError[hour]++;
                    const type = item.error_type || 'General Error';
                    errorTypes[type] = (errorTypes[type] || 0) + 1;
                }
            });

            const existingIdx = dailyStats.findIndex(s => s.date === dateStr && s.automation_id === autoId);
            const newRow = {
                id: existingIdx !== -1 ? dailyStats[existingIdx].id : `mock-stats-${autoId}-${dateStr}`,
                date: dateStr,
                automation_id: autoId,
                n8n_workflow_id: g.n8n_workflow_id,
                total_runs: total,
                success_runs: success,
                warning_runs: warning,
                error_runs: error,
                avg_duration_ms: avgDuration,
                hourly_success: hourlySuccess,
                hourly_warning: hourlyWarning,
                hourly_error: hourlyError,
                error_types: errorTypes,
                warning_types: warningTypes
            };

            if (existingIdx !== -1) {
                dailyStats[existingIdx] = newRow;
            } else {
                dailyStats.push(newRow);
            }
            statsChanged = true;
        });

        if (statsChanged) {
            setLocalData(STORAGE_KEYS.AUTOMATION_DAILY_STATS, dailyStats);
        }

        let runsPurged = false;
        const remainingRuns = runs.filter(r => {
            const created = new Date(r.created_at);
            if (r.status === 'error') {
                return created >= cutoff30Days;
            } else {
                return created >= cutoff7Days;
            }
        });
        if (remainingRuns.length !== runs.length) {
            setLocalData(STORAGE_KEYS.AUTOMATION_RUNS, remainingRuns);
            runsPurged = true;
        }

        let alertsPurged = false;
        const remainingAlerts = alerts.filter(alert => {
            const created = new Date(alert.created_at);
            if (alert.type === 'error') {
                return created >= cutoff30Days;
            } else {
                return created >= cutoff7Days;
            }
        });
        if (remainingAlerts.length !== alerts.length) {
            setLocalData(STORAGE_KEYS.SYSTEM_ALERTS, remainingAlerts);
            alertsPurged = true;
        }
    } catch (err) {
        console.error("[Local Rollup] Error performing local rollup:", err);
    }
}

// Run local rollup simulation on startup (async, non-blocking)
if (!isSupabaseConfigured) {
    setTimeout(() => {
        simulateLocalRollup();
    }, 500);
}

// Helper to get from localstorage or initialize
function getLocalData(key, defaultData) {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
    }
    return JSON.parse(data);
}

function setLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ==========================================================================
// EXPORTED DB ACTIONS (Unifies Local and Supabase)
// ==========================================================================

export const db = {
    // --------------------------------------------------
    // LEADS ACTIONS
    // --------------------------------------------------
    async getLeads() {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            return getLocalData(STORAGE_KEYS.LEADS, INITIAL_MOCK_LEADS);
        }
    },

    async getLeadById(id) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        } else {
            const leads = getLocalData(STORAGE_KEYS.LEADS, INITIAL_MOCK_LEADS);
            return leads.find(l => l.id === id) || null;
        }
    },

    async addLead(lead) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('leads')
                .insert([lead])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const leads = getLocalData(STORAGE_KEYS.LEADS, INITIAL_MOCK_LEADS);
            const newLead = {
                id: 'lead-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                status: 'new',
                priority: 'medium',
                ...lead
            };
            leads.unshift(newLead);
            setLocalData(STORAGE_KEYS.LEADS, leads);
            
            // Log lead creation activity
            await this.addNote({
                lead_id: newLead.id,
                content: `ליד חדש נוצר ממקור ${newLead.source === 'survey' ? 'שאלון' : newLead.source === 'chatbot' ? 'צ׳אטבוט' : 'צור קשר'}`
            });

            return newLead;
        }
    },

    async updateLeadStatus(id, status) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('leads')
                .update({ status })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const leads = getLocalData(STORAGE_KEYS.LEADS, INITIAL_MOCK_LEADS);
            const leadIndex = leads.findIndex(l => l.id === id);
            if (leadIndex !== -1) {
                const oldStatus = leads[leadIndex].status;
                leads[leadIndex].status = status;
                setLocalData(STORAGE_KEYS.LEADS, leads);

                // Log status change
                const statusNames = { new: 'חדש', contacted: 'יצירת קשר', proposal: 'הצעת מחיר', won: 'סגירה', lost: 'אבוד' };
                await this.addNote({
                    lead_id: id,
                    content: `סטטוס הליד שונה מ'${statusNames[oldStatus] || oldStatus}' ל-'${statusNames[status] || status}'`
                });

                return leads[leadIndex];
            }
            throw new Error('Lead not found');
        }
    },

    async updateLead(id, updates) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('leads')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const leads = getLocalData(STORAGE_KEYS.LEADS, INITIAL_MOCK_LEADS);
            const leadIndex = leads.findIndex(l => l.id === id);
            if (leadIndex !== -1) {
                leads[leadIndex] = { ...leads[leadIndex], ...updates };
                setLocalData(STORAGE_KEYS.LEADS, leads);
                return leads[leadIndex];
            }
            throw new Error('Lead not found');
        }
    },

    async deleteLead(id) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const leads = getLocalData(STORAGE_KEYS.LEADS, INITIAL_MOCK_LEADS);
            const updated = leads.filter(l => l.id !== id);
            setLocalData(STORAGE_KEYS.LEADS, updated);
            
            // Delete related tasks & notes
            const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_MOCK_TASKS);
            setLocalData(STORAGE_KEYS.TASKS, tasks.filter(t => t.lead_id !== id));
            
            const notes = getLocalData(STORAGE_KEYS.NOTES, INITIAL_MOCK_NOTES);
            setLocalData(STORAGE_KEYS.NOTES, notes.filter(n => n.lead_id !== id));

            return true;
        }
    },

    // --------------------------------------------------
    // TASKS ACTIONS
    // --------------------------------------------------
    async getTasks(leadId = null) {
        if (isSupabaseConfigured) {
            let query = supabase.from('tasks').select('*');
            if (leadId) {
                query = query.eq('lead_id', leadId);
            }
            const { data, error } = await query.order('due_date', { ascending: true });
            if (error) throw error;
            return data;
        } else {
            const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_MOCK_TASKS);
            if (leadId) {
                return tasks.filter(t => t.lead_id === leadId);
            }
            return tasks;
        }
    },

    async addTask(task) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('tasks')
                .insert([task])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_MOCK_TASKS);
            const newTask = {
                id: 'task-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                completed: false,
                ...task
            };
            tasks.push(newTask);
            setLocalData(STORAGE_KEYS.TASKS, tasks);

            // Log activity
            await this.addNote({
                lead_id: newTask.lead_id,
                content: `נוספה משימה חדשה: "${newTask.title}"`
            });

            return newTask;
        }
    },

    async toggleTaskCompleted(id) {
        if (isSupabaseConfigured) {
            // First fetch current task state
            const { data: current } = await supabase.from('tasks').select('completed').eq('id', id).single();
            const { data, error } = await supabase
                .from('tasks')
                .update({ completed: !current.completed, completed_at: !current.completed ? new Date().toISOString() : null })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_MOCK_TASKS);
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks[index].completed = !tasks[index].completed;
                tasks[index].completed_at = tasks[index].completed ? new Date().toISOString() : null;
                setLocalData(STORAGE_KEYS.TASKS, tasks);

                // Log activity
                await this.addNote({
                    lead_id: tasks[index].lead_id,
                    content: `המשימה "${tasks[index].title}" סומנה כ-${tasks[index].completed ? 'בוצעה' : 'לא בוצעה'}`
                });

                return tasks[index];
            }
            throw new Error('Task not found');
        }
    },

    async deleteTask(id) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const tasks = getLocalData(STORAGE_KEYS.TASKS, INITIAL_MOCK_TASKS);
            const updated = tasks.filter(t => t.id !== id);
            setLocalData(STORAGE_KEYS.TASKS, updated);
            return true;
        }
    },

    // --------------------------------------------------
    // NOTES / ACTIVITY LOG ACTIONS
    // --------------------------------------------------
    async getNotes(leadId) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            const notes = getLocalData(STORAGE_KEYS.NOTES, INITIAL_MOCK_NOTES);
            return notes.filter(n => n.lead_id === leadId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async addNote(note) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('notes')
                .insert([note])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const notes = getLocalData(STORAGE_KEYS.NOTES, INITIAL_MOCK_NOTES);
            const newNote = {
                id: 'note-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                ...note
            };
            notes.unshift(newNote);
            setLocalData(STORAGE_KEYS.NOTES, notes);
            return newNote;
        }
    },

    // --------------------------------------------------
    // AUTOMATIONS ACTIONS
    // --------------------------------------------------
    async getAutomations(leadId = null) {
        if (isSupabaseConfigured) {
            let query = supabase.from('automations').select('*');
            if (leadId) {
                query = query.eq('lead_id', leadId);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            const automations = getLocalData(STORAGE_KEYS.AUTOMATIONS, INITIAL_MOCK_AUTOMATIONS);
            if (leadId) {
                return automations.filter(a => a.lead_id === leadId);
            }
            return automations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async addAutomation(automation) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('automations')
                .insert([automation])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const automations = getLocalData(STORAGE_KEYS.AUTOMATIONS, INITIAL_MOCK_AUTOMATIONS);
            const newAuto = {
                id: 'auto-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                ...automation
            };
            automations.unshift(newAuto);
            setLocalData(STORAGE_KEYS.AUTOMATIONS, automations);
            return newAuto;
        }
    },

    async updateAutomation(id, updates) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('automations')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const automations = getLocalData(STORAGE_KEYS.AUTOMATIONS, INITIAL_MOCK_AUTOMATIONS);
            const idx = automations.findIndex(a => a.id === id);
            if (idx !== -1) {
                automations[idx] = { ...automations[idx], ...updates };
                setLocalData(STORAGE_KEYS.AUTOMATIONS, automations);
                return automations[idx];
            }
            throw new Error('Automation not found');
        }
    },

    async deleteAutomation(id) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('automations')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const automations = getLocalData(STORAGE_KEYS.AUTOMATIONS, INITIAL_MOCK_AUTOMATIONS);
            const updated = automations.filter(a => a.id !== id);
            setLocalData(STORAGE_KEYS.AUTOMATIONS, updated);
            return true;
        }
    },

    // --------------------------------------------------
    // AUTOMATION RUNS ACTIONS
    // --------------------------------------------------
    async getAutomationRuns(automationId) {
        if (isSupabaseConfigured) {
            // First we need to get the automation to know its n8n_workflows/n8n_workflow_id
            const { data: auto, error: autoErr } = await supabase
                .from('automations')
                .select('id, n8n_workflow_id, n8n_workflows')
                .eq('id', automationId)
                .single();
            
            if (autoErr) throw autoErr;

            // Collect all workflow IDs associated with this automation
            const workflowIds = [];
            if (auto.n8n_workflow_id) {
                auto.n8n_workflow_id.split(',').forEach(id => {
                    const trimmed = id.trim();
                    if (trimmed) workflowIds.push(trimmed);
                });
            }
            let parsedWorkflows = [];
            if (auto.n8n_workflows) {
                if (Array.isArray(auto.n8n_workflows)) {
                    parsedWorkflows = auto.n8n_workflows;
                } else if (typeof auto.n8n_workflows === 'string') {
                    try {
                        const parsed = JSON.parse(auto.n8n_workflows);
                        if (Array.isArray(parsed)) parsedWorkflows = parsed;
                    } catch (e) {}
                }
            }
            parsedWorkflows.forEach(w => {
                if (w && w.id) workflowIds.push(w.id.trim());
            });

            // Calculate cutoff date (7 days ago)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            const cutoffStr = cutoffDate.toISOString().split('T')[0];

            // 1. Fetch historical aggregated stats older than 7 days
            const { data: dailyStats, error: statsErr } = await supabase
                .from('automation_daily_stats')
                .select('*')
                .eq('automation_id', automationId)
                .lt('date', cutoffStr);
            
            if (statsErr) {
                console.error("Error fetching daily stats:", statsErr);
            }

            // 2. Fetch detailed runs in the last 7 days matching either the automation_id OR any of workflow IDs
            let query = supabase.from('automation_runs')
                .select('*')
                .gte('created_at', cutoffDate.toISOString());
            if (workflowIds.length > 0) {
                query = query.or(`automation_id.eq.${automationId},n8n_workflow_id.in.(${workflowIds.join(',')})`);
            } else {
                query = query.eq('automation_id', automationId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            // Format automation_runs to ensure title and message are always populated
            const formattedRuns = data.map(run => ({
                ...run,
                title: run.title || run.error_type || 'ריצת אוטומציה',
                message: run.message || (run.details ? (run.details.error_message || run.details.warning_message || '') : '') || ''
            }));

            // Fetch system_alerts matching any of workflow IDs, created in the last 7 days
            let alerts = [];
            if (workflowIds.length > 0) {
                const { data: alertData, error: alertErr } = await supabase
                    .from('system_alerts')
                    .select('*')
                    .gte('created_at', cutoffDate.toISOString())
                    .or(`n8n_workflow_id.in.(${workflowIds.join(',')}),n8n_workflow_id.is.null`);
                if (!alertErr && alertData) {
                    alerts = alertData;
                }
            }

            // Convert alerts to runs
            const alertRuns = alerts.map(alert => {
                let status = 'success';
                if (alert.type === 'error') status = 'error';
                else if (alert.type === 'warning') status = 'warning';
                else if (alert.type === 'info') status = 'success';

                let errType = alert.title || '';
                errType = errType.replace(/🚨|⚠️|✅/g, '').replace('תקלה:', '').replace('הצלחה:', '').trim();

                let wfId = alert.n8n_workflow_id;
                if (!wfId) {
                    const textToSearch = ((alert.title || '') + ' ' + (alert.message || '')).toLowerCase();
                    if (textToSearch.includes('צ\'אטבוט') || textToSearch.includes('chatbot') || textToSearch.includes('gemini') || textToSearch.includes('בוט') || textToSearch.includes('מענה')) {
                        wfId = 'lyCrWBmsGlRSMJmo';
                    } else if (textToSearch.includes('תקלה') || textToSearch.includes('נכשל') || textToSearch.includes('שגיאה')) {
                        wfId = 'bRNz7Lq79wYJ5Dvo';
                    }
                }

                return {
                    id: alert.id,
                    created_at: alert.created_at,
                    automation_id: automationId,
                    n8n_workflow_id: wfId,
                    status: status,
                    duration_ms: alert.duration_ms || null,
                    error_type: errType,
                    title: alert.title || '',
                    message: alert.message || '',
                    details: {
                        error_message: alert.message,
                        warning_message: alert.message
                    },
                    ai_analysis: alert.ai_analysis || null
                };
            }).filter(run => run.n8n_workflow_id && workflowIds.includes(run.n8n_workflow_id));

            // Synthesize historical runs
            const synthesizedRuns = dailyStats ? synthesizeRunsFromDailyStats(dailyStats, automationId, workflowIds) : [];

            const statusSeverity = { 'success': 1, 'fallback': 2, 'warning': 2, 'error': 3 };

            // 1. Deduplicate replicated runs within formattedRuns (due to DB trigger copying system_alerts to automation_runs)
            const cleanFormattedRuns = [];
            const replicatedRuns = [];
            
            formattedRuns.forEach(run => {
                if (run.automation_id) {
                    cleanFormattedRuns.push(run);
                } else {
                    replicatedRuns.push(run);
                }
            });
            
            const finalReplicatedRuns = [];
            for (const rep of replicatedRuns) {
                let matched = false;
                for (const direct of cleanFormattedRuns) {
                    const timeDiff = Math.abs(new Date(direct.created_at) - new Date(rep.created_at));
                    const sameWorkflow = direct.n8n_workflow_id === rep.n8n_workflow_id || 
                        (workflowIds.includes(direct.n8n_workflow_id) && workflowIds.includes(rep.n8n_workflow_id));
                    const closeTime = timeDiff < 5000;
                    
                    if (sameWorkflow && closeTime) {
                        if (!direct.title || direct.title === 'ריצת אוטומציה') {
                            direct.title = rep.title;
                        }
                        if (!direct.message) {
                            direct.message = rep.message;
                        }
                        if (rep.ai_analysis) {
                            direct.ai_analysis = rep.ai_analysis;
                        }
                        // Upgrade status if the replicated run has a more severe status
                        if (statusSeverity[rep.status] > statusSeverity[direct.status]) {
                            direct.status = rep.status;
                        }
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    finalReplicatedRuns.push(rep);
                }
            }
            
            const dedupedFormattedRuns = [...cleanFormattedRuns, ...finalReplicatedRuns];

            // 2. Merge alertRuns (from system_alerts) with dedupedFormattedRuns to avoid duplicate entries
            const finalAlertRuns = [];
            
            for (const alert of alertRuns) {
                let matched = false;
                
                for (const run of dedupedFormattedRuns) {
                    const timeDiff = Math.abs(new Date(run.created_at) - new Date(alert.created_at));
                    
                    const sameWorkflow = run.n8n_workflow_id === alert.n8n_workflow_id || 
                        (workflowIds.includes(run.n8n_workflow_id) && workflowIds.includes(alert.n8n_workflow_id));
                    const closeTime = timeDiff < 5000;
                        
                    if (sameWorkflow && closeTime) {
                        if (alert.title) run.title = alert.title;
                        if (alert.message) run.message = alert.message;
                        if (alert.details) {
                            run.details = {
                                ...run.details,
                                error_message: alert.details.error_message || run.details?.error_message,
                                warning_message: alert.details.warning_message || run.details?.warning_message
                            };
                        }
                        if (alert.ai_analysis) run.ai_analysis = alert.ai_analysis;
                        
                        // Upgrade status if the alert has a more severe status
                        if (statusSeverity[alert.status] > statusSeverity[run.status]) {
                            run.status = alert.status;
                        }
                        
                        matched = true;
                        break;
                    }
                }
                
                if (!matched) {
                    finalAlertRuns.push(alert);
                }
            }

            const merged = [...dedupedFormattedRuns, ...finalAlertRuns, ...synthesizedRuns];
            const seenIds = new Set();
            const unique = [];
            merged.forEach(run => {
                if (!seenIds.has(run.id)) {
                    seenIds.add(run.id);
                    unique.push(run);
                }
            });

            return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            // Local mock fallback
            const runs = getLocalData(STORAGE_KEYS.AUTOMATION_RUNS, INITIAL_MOCK_AUTOMATION_RUNS);
            const dailyStats = getLocalData(STORAGE_KEYS.AUTOMATION_DAILY_STATS, INITIAL_MOCK_AUTOMATION_DAILY_STATS);
            const automations = getLocalData(STORAGE_KEYS.AUTOMATIONS, INITIAL_MOCK_AUTOMATIONS);
            const auto = automations.find(a => a.id === automationId);
            if (!auto) return [];

            const workflowIds = [];
            if (auto.n8n_workflow_id) {
                auto.n8n_workflow_id.split(',').forEach(id => {
                    const trimmed = id.trim();
                    if (trimmed) workflowIds.push(trimmed);
                });
            }
            let parsedWorkflows = [];
            if (auto.n8n_workflows) {
                if (Array.isArray(auto.n8n_workflows)) {
                    parsedWorkflows = auto.n8n_workflows;
                } else if (typeof auto.n8n_workflows === 'string') {
                    try {
                        const parsed = JSON.parse(auto.n8n_workflows);
                        if (Array.isArray(parsed)) parsedWorkflows = parsed;
                    } catch (e) {}
                }
            }
            parsedWorkflows.forEach(w => {
                if (w && w.id) workflowIds.push(w.id.trim());
            });

            // Calculate cutoff date (7 days ago)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            const cutoffStr = cutoffDate.toISOString().split('T')[0];

            // Filter historical daily stats older than 7 days
            const filteredStats = dailyStats.filter(s => 
                s.automation_id === automationId && s.date < cutoffStr
            );

            // Filter detailed runs in the last 7 days
            const filteredRuns = runs.filter(r => 
                (r.automation_id === automationId || (r.n8n_workflow_id && workflowIds.includes(r.n8n_workflow_id.trim()))) &&
                r.created_at >= cutoffDate.toISOString()
            ).map(run => ({
                ...run,
                title: run.title || run.error_type || 'ריצת אוטומציה',
                message: run.message || (run.details ? (run.details.error_message || run.details.warning_message || '') : '') || ''
            }));

            // Fetch local alerts to merge (last 7 days)
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
            const alertRuns = alerts.filter(alert => 
                alert.created_at >= cutoffDate.toISOString()
            ).map(alert => {
                let status = 'success';
                if (alert.type === 'error') status = 'error';
                else if (alert.type === 'warning') status = 'warning';
                else if (alert.type === 'info') status = 'success';

                let errType = alert.title || '';
                errType = errType.replace(/🚨|⚠️|✅/g, '').replace('תקלה:', '').replace('הצלחה:', '').trim();

                let wfId = alert.n8n_workflow_id;
                if (!wfId) {
                    const textToSearch = ((alert.title || '') + ' ' + (alert.message || '')).toLowerCase();
                    if (textToSearch.includes('צ\'אטבוט') || textToSearch.includes('chatbot') || textToSearch.includes('gemini') || textToSearch.includes('בוט') || textToSearch.includes('מענה')) {
                        wfId = 'lyCrWBmsGlRSMJmo';
                    } else if (textToSearch.includes('תקלה') || textToSearch.includes('נכשל') || textToSearch.includes('שגיאה')) {
                        wfId = 'bRNz7Lq79wYJ5Dvo';
                    }
                }

                return {
                    id: alert.id,
                    created_at: alert.created_at,
                    automation_id: automationId,
                    n8n_workflow_id: wfId,
                    status: status,
                    duration_ms: alert.duration_ms || null,
                    error_type: errType,
                    title: alert.title || '',
                    message: alert.message || '',
                    details: {
                        error_message: alert.message,
                        warning_message: alert.message
                    },
                    ai_analysis: alert.ai_analysis || null
                };
            }).filter(run => run.n8n_workflow_id && workflowIds.includes(run.n8n_workflow_id));

            // Synthesize historical runs
            const synthesizedRuns = synthesizeRunsFromDailyStats(filteredStats, automationId, workflowIds);

            const merged = [...filteredRuns, ...alertRuns, ...synthesizedRuns];
            const seenIds = new Set();
            const unique = [];
            merged.forEach(run => {
                if (!seenIds.has(run.id)) {
                    seenIds.add(run.id);
                    unique.push(run);
                }
            });

            return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async addAutomationRun(run) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('automation_runs')
                .insert([run])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const runs = getLocalData(STORAGE_KEYS.AUTOMATION_RUNS, INITIAL_MOCK_AUTOMATION_RUNS);
            const newRun = {
                id: 'run-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                ...run
            };
            runs.unshift(newRun);
            setLocalData(STORAGE_KEYS.AUTOMATION_RUNS, runs);
            return newRun;
        }
    },

    async updateAutomationRun(id, updates) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('automation_runs')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const runs = getLocalData(STORAGE_KEYS.AUTOMATION_RUNS, INITIAL_MOCK_AUTOMATION_RUNS);
            const idx = runs.findIndex(r => r.id === id);
            if (idx !== -1) {
                runs[idx] = { ...runs[idx], ...updates };
                setLocalData(STORAGE_KEYS.AUTOMATION_RUNS, runs);
                return runs[idx];
            }
            throw new Error('Run not found');
        }
    },

    // --------------------------------------------------
    // BUGS ACTIONS
    // --------------------------------------------------
    async getBugs(automationId = null) {
        if (isSupabaseConfigured) {
            let query = supabase.from('bugs').select('*');
            if (automationId) {
                query = query.eq('automation_id', automationId);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            const bugs = getLocalData(STORAGE_KEYS.BUGS, INITIAL_MOCK_BUGS);
            if (automationId) {
                return bugs.filter(b => b.automation_id === automationId);
            }
            return bugs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async addBug(bug) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('bugs')
                .insert([bug])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const bugs = getLocalData(STORAGE_KEYS.BUGS, INITIAL_MOCK_BUGS);
            const newBug = {
                id: 'bug-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                status: 'open',
                ...bug
            };
            bugs.unshift(newBug);
            setLocalData(STORAGE_KEYS.BUGS, bugs);
            return newBug;
        }
    },

    async updateBug(id, updates) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('bugs')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const bugs = getLocalData(STORAGE_KEYS.BUGS, INITIAL_MOCK_BUGS);
            const idx = bugs.findIndex(b => b.id === id);
            if (idx !== -1) {
                bugs[idx] = { ...bugs[idx], ...updates };
                setLocalData(STORAGE_KEYS.BUGS, bugs);
                return bugs[idx];
            }
            throw new Error('Bug not found');
        }
    },

    async deleteBug(id) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('bugs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const bugs = getLocalData(STORAGE_KEYS.BUGS, INITIAL_MOCK_BUGS);
            const updated = bugs.filter(b => b.id !== id);
            setLocalData(STORAGE_KEYS.BUGS, updated);
            return true;
        }
    },

    // --------------------------------------------------
    // SYSTEM ALERTS ACTIONS
    // --------------------------------------------------
    async getSystemAlerts() {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('system_alerts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
            return alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async addSystemAlert(alert) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('system_alerts')
                .insert([alert])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
            const newAlert = {
                id: 'alert-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                read: false,
                ...alert
            };
            alerts.unshift(newAlert);
            setLocalData(STORAGE_KEYS.SYSTEM_ALERTS, alerts);

            // Replicate database trigger: copy alert to automation runs locally
            if (newAlert.n8n_workflow_id) {
                const runs = getLocalData(STORAGE_KEYS.AUTOMATION_RUNS, INITIAL_MOCK_AUTOMATION_RUNS);
                let status = 'success';
                if (newAlert.type === 'error') status = 'error';
                else if (newAlert.type === 'warning') status = 'warning';

                const newRun = {
                    id: newAlert.id,
                    created_at: newAlert.created_at,
                    automation_id: newAlert.automation_id || 'chatbot-automation',
                    n8n_workflow_id: newAlert.n8n_workflow_id,
                    status: status,
                    duration_ms: newAlert.duration_ms || null,
                    error_type: newAlert.title || '',
                    details: {
                        error_message: newAlert.message,
                        warning_message: newAlert.message
                    },
                    ai_analysis: null
                };
                runs.unshift(newRun);
                setLocalData(STORAGE_KEYS.AUTOMATION_RUNS, runs);
            }
            return newAlert;
        }
    },

    async markAlertAsRead(id) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('system_alerts')
                .update({ read: true })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
            const idx = alerts.findIndex(a => a.id === id);
            if (idx !== -1) {
                alerts[idx].read = true;
                setLocalData(STORAGE_KEYS.SYSTEM_ALERTS, alerts);
                return alerts[idx];
            }
            throw new Error('Alert not found');
        }
    },

    async markAllAlertsAsRead() {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('system_alerts')
                .update({ read: true })
                .eq('read', false)
                .select();
            if (error) throw error;
            return data;
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
            alerts.forEach(a => { a.read = true; });
            setLocalData(STORAGE_KEYS.SYSTEM_ALERTS, alerts);
            return alerts;
        }
    },

    async deleteSystemAlert(id) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('system_alerts')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
            const updated = alerts.filter(a => a.id !== id);
            setLocalData(STORAGE_KEYS.SYSTEM_ALERTS, updated);
            return true;
        }
    },

    async deleteAllSystemAlerts() {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('system_alerts')
                .delete()
                .gt('created_at', '1970-01-01T00:00:00Z');
            if (error) throw error;
            return true;
        } else {
            setLocalData(STORAGE_KEYS.SYSTEM_ALERTS, []);
            return true;
        }
    },

    // --------------------------------------------------
    // SERVER ALERTS ACTIONS
    // --------------------------------------------------
    async getServerAlerts() {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('server_alerts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SERVER_ALERTS, INITIAL_MOCK_SERVER_ALERTS);
            return alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async addServerAlert(alert) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('server_alerts')
                .insert([alert])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SERVER_ALERTS, INITIAL_MOCK_SERVER_ALERTS);
            const newAlert = {
                id: 'server-alert-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                read: false,
                ...alert
            };
            alerts.unshift(newAlert);
            setLocalData(STORAGE_KEYS.SERVER_ALERTS, alerts);
            return newAlert;
        }
    },

    async markServerAlertAsRead(id) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('server_alerts')
                .update({ read: true })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SERVER_ALERTS, INITIAL_MOCK_SERVER_ALERTS);
            const idx = alerts.findIndex(a => a.id === id);
            if (idx !== -1) {
                alerts[idx].read = true;
                setLocalData(STORAGE_KEYS.SERVER_ALERTS, alerts);
                return alerts[idx];
            }
            throw new Error('Server alert not found');
        }
    },

    async markAllServerAlertsAsRead() {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('server_alerts')
                .update({ read: true })
                .eq('read', false)
                .select();
            if (error) throw error;
            return data;
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SERVER_ALERTS, INITIAL_MOCK_SERVER_ALERTS);
            alerts.forEach(a => { a.read = true; });
            setLocalData(STORAGE_KEYS.SERVER_ALERTS, alerts);
            return alerts;
        }
    },

    async deleteServerAlert(id) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('server_alerts')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const alerts = getLocalData(STORAGE_KEYS.SERVER_ALERTS, INITIAL_MOCK_SERVER_ALERTS);
            const updated = alerts.filter(a => a.id !== id);
            setLocalData(STORAGE_KEYS.SERVER_ALERTS, updated);
            return true;
        }
    },

    async deleteAllServerAlerts() {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('server_alerts')
                .delete()
                .gt('created_at', '1970-01-01T00:00:00Z');
            if (error) throw error;
            return true;
        } else {
            setLocalData(STORAGE_KEYS.SERVER_ALERTS, []);
            return true;
        }
    },

    // --------------------------------------------------
    // AUTOMATION DAILY STATS ACTIONS
    // --------------------------------------------------
    async getAutomationDailyStats(automationId) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('automation_daily_stats')
                .select('*')
                .eq('automation_id', automationId)
                .order('date', { ascending: true });
            if (error) throw error;
            return data;
        } else {
            const stats = getLocalData(STORAGE_KEYS.AUTOMATION_DAILY_STATS, INITIAL_MOCK_AUTOMATION_DAILY_STATS);
            return stats.filter(s => s.automation_id === automationId).sort((a, b) => a.date.localeCompare(b.date));
        }
    },

    // --------------------------------------------------
    // DOCUMENTS ACTIONS
    // --------------------------------------------------
    async getDocuments(leadId = null, automationId = null) {
        if (isSupabaseConfigured) {
            let query = supabase.from('documents').select('*');
            if (leadId && automationId) {
                query = query.or(`lead_id.eq.${leadId},automation_id.eq.${automationId}`);
            } else if (leadId) {
                query = query.eq('lead_id', leadId);
            } else if (automationId) {
                query = query.eq('automation_id', automationId);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            const docs = getLocalData(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
            if (leadId && automationId) {
                return docs.filter(d => d.lead_id === leadId || d.automation_id === automationId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (leadId) {
                return docs.filter(d => d.lead_id === leadId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (automationId) {
                return docs.filter(d => d.automation_id === automationId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            return docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async uploadDocument(docData, file) {
        if (isSupabaseConfigured) {
            // Upload to Supabase Storage bucket 'documents'
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${docData.lead_id || docData.automation_id || 'general'}/${fileName}`;
            
            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('documents')
                .upload(filePath, file);
                
            if (uploadErr) throw uploadErr;
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);
                
            const fileUrl = urlData.publicUrl;

            // Insert into public.documents table
            const { data, error } = await supabase
                .from('documents')
                .insert([{
                    lead_id: docData.lead_id || null,
                    automation_id: docData.automation_id || null,
                    name: docData.name,
                    type: docData.type,
                    file_name: file.name,
                    file_size: file.size,
                    file_url: fileUrl
                }])
                .select();
                
            if (error) throw error;
            return data[0];
        } else {
            const newDoc = {
                id: 'doc-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                lead_id: docData.lead_id || null,
                automation_id: docData.automation_id || null,
                name: docData.name,
                type: docData.type,
                file_name: file.name,
                file_size: file.size,
                file_url: '#'
            };
            const docs = getLocalData(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
            docs.unshift(newDoc);
            setLocalData(STORAGE_KEYS.DOCUMENTS, docs);
            return newDoc;
        }
    },

    async linkExistingDocument(docData) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('documents')
                .insert([{
                    lead_id: docData.lead_id || null,
                    automation_id: docData.automation_id || null,
                    name: docData.name,
                    type: docData.type,
                    file_name: docData.file_name,
                    file_size: docData.file_size,
                    file_url: docData.file_url
                }])
                .select();
                
            if (error) throw error;
            return data[0];
        } else {
            const newDoc = {
                id: 'doc-' + Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                lead_id: docData.lead_id || null,
                automation_id: docData.automation_id || null,
                name: docData.name,
                type: docData.type,
                file_name: docData.file_name,
                file_size: docData.file_size,
                file_url: docData.file_url
            };
            const docs = getLocalData(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
            docs.unshift(newDoc);
            setLocalData(STORAGE_KEYS.DOCUMENTS, docs);
            return newDoc;
        }
    },

    async deleteDocument(id) {
        if (isSupabaseConfigured) {
            // First fetch document row to remove from Storage
            const { data: doc, error: getErr } = await supabase
                .from('documents')
                .select('file_url')
                .eq('id', id)
                .single();
                
            if (!getErr && doc && doc.file_url) {
                const parts = doc.file_url.split('/public/documents/');
                if (parts.length > 1) {
                    const filePath = decodeURIComponent(parts[1]);
                    await supabase.storage.from('documents').remove([filePath]);
                }
            }

            // Delete from database
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            return true;
        } else {
            const docs = getLocalData(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
            const updated = docs.filter(d => d.id !== id);
            setLocalData(STORAGE_KEYS.DOCUMENTS, updated);
            return true;
        }
    },

    // --------------------------------------------------
    // REALTIME SUBSCRIPTIONS
    // --------------------------------------------------
    subscribeChanges(table, callback) {
        if (isSupabaseConfigured) {
            const channelId = `${table}-realtime-${Math.random().toString(36).substring(2, 9)}`;
            const channel = supabase
                .channel(channelId)
                .on('postgres_changes', { event: '*', schema: 'public', table: table }, (payload) => {
                    console.log(`[Realtime] Event received on table "${table}":`, payload);
                    callback(payload);
                })
                .subscribe((status, err) => {
                    if (err) {
                        console.error(`[Realtime] Subscription error on table "${table}":`, err);
                    } else {
                        console.log(`[Realtime] Subscription status for table "${table}":`, status);
                    }
                });
            
            return () => {
                console.log(`[Realtime] Unsubscribing from table "${table}" (channel: ${channelId})`);
                supabase.removeChannel(channel);
            };
        } else {
            return () => {};
        }
    },

    // --------------------------------------------------
    // AUTHENTICATION ACTIONS (Password-Only)
    // --------------------------------------------------
    async signInWithPasswordOnly(password) {
        if (isSupabaseConfigured) {
            const email = import.meta.env.VITE_ADMIN_EMAIL || 'admin@atri.co.il';
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                // Return clear error message in Hebrew if possible
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('סיסמה שגויה. אנא נסה שוב.');
                }
                throw error;
            }
            return data.user;
        } else {
            // Mock authentication
            const mockPassword = import.meta.env.VITE_MOCK_PASSWORD || 'admin123';
            if (password === mockPassword) {
                const mockUser = { 
                    email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@atri.co.il', 
                    id: 'mock-admin-id' 
                };
                localStorage.setItem('autoRI_mock_user', JSON.stringify(mockUser));
                window.dispatchEvent(new Event('mock-auth-change'));
                return mockUser;
            } else {
                throw new Error('סיסמה שגויה. אנא נסה שוב.');
            }
        }
    },

    async signOut() {
        if (isSupabaseConfigured) {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } else {
            localStorage.removeItem('autoRI_mock_user');
            window.dispatchEvent(new Event('mock-auth-change'));
        }
    },

    async getCurrentUser() {
        if (isSupabaseConfigured) {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        } else {
            const stored = localStorage.getItem('autoRI_mock_user');
            return stored ? JSON.parse(stored) : null;
        }
    },

    onAuthStateChange(callback) {
        if (isSupabaseConfigured) {
            // Initial call
            supabase.auth.getUser().then(({ data: { user } }) => {
                callback(user);
            }).catch(() => {
                callback(null);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('[Auth] Auth state changed event:', event);
                callback(session?.user || null);
            });
            return () => {
                subscription.unsubscribe();
            };
        } else {
            // Initial call
            const stored = localStorage.getItem('autoRI_mock_user');
            callback(stored ? JSON.parse(stored) : null);

            const listener = () => {
                const user = localStorage.getItem('autoRI_mock_user');
                callback(user ? JSON.parse(user) : null);
            };
            window.addEventListener('mock-auth-change', listener);
            return () => {
                window.removeEventListener('mock-auth-change', listener);
            };
        }
    },

    async getServerMetrics(timeframe = '24h') {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .rpc('get_server_metrics_downsampled', { timeframe_param: timeframe });
                if (error) throw error;
                return data && data.length > 0 ? data : this.getMockServerMetricsForTimeframe(timeframe);
            } catch (err) {
                console.warn("Supabase server_metrics downsampled RPC error, falling back to mock data:", err);
                return this.getMockServerMetricsForTimeframe(timeframe);
            }
        } else {
            return this.getMockServerMetricsForTimeframe(timeframe);
        }
    },

    getMockServerMetricsForTimeframe(timeframe) {
        if (timeframe === '7d') {
            // 7 ימים, נקודה כל 6 שעות = 28 נקודות
            return Array.from({ length: 28 }, (_, i) => {
                const time = new Date(Date.now() - (27 - i) * 6 * 60 * 60 * 1000).toISOString();
                const cpu = Math.floor(20 + Math.sin(i / 2) * 12 + Math.random() * 8);
                const ram = Math.floor(50 + Math.cos(i / 3) * 6 + Math.random() * 4);
                const disk = 38.4;
                return { created_at: time, cpu_usage: cpu, ram_usage: ram, disk_usage: disk };
            });
        } else if (timeframe === '30d') {
            // 30 ימים, נקודה אחת ליום = 30 נקודות
            return Array.from({ length: 30 }, (_, i) => {
                const time = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString();
                const cpu = Math.floor(25 + Math.sin(i / 4) * 15 + Math.random() * 5);
                const ram = Math.floor(55 + Math.cos(i / 5) * 8 + Math.random() * 3);
                const disk = 38.4;
                return { created_at: time, cpu_usage: cpu, ram_usage: ram, disk_usage: disk };
            });
        } else {
            // 24 שעות ברירת מחדל
            return INITIAL_MOCK_SERVER_METRICS;
        }
    },

    async saveServerMetrics(metrics) {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from('server_metrics')
                .insert([metrics])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const current = getLocalData(STORAGE_KEYS.SERVER_METRICS, INITIAL_MOCK_SERVER_METRICS);
            current.push({ ...metrics, created_at: new Date().toISOString() });
            if (current.length > 288) current.shift();
            setLocalData(STORAGE_KEYS.SERVER_METRICS, current);
            return metrics;
        }
    },

    async getContainers() {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('server_containers')
                    .select('*')
                    .order('name', { ascending: true });
                if (error) throw error;
                return data && data.length > 0 ? data : INITIAL_MOCK_SERVER_CONTAINERS;
            } catch (err) {
                console.warn("Supabase server_containers table error, falling back to mock data:", err);
                return INITIAL_MOCK_SERVER_CONTAINERS;
            }
        } else {
            return getLocalData(STORAGE_KEYS.SERVER_CONTAINERS, INITIAL_MOCK_SERVER_CONTAINERS);
        }
    },

    async saveContainers(containers) {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('server_containers')
                .upsert(containers);
            if (error) throw error;
        } else {
            setLocalData(STORAGE_KEYS.SERVER_CONTAINERS, containers);
        }
    },

    async triggerContainerAction(containerId, action) {
        console.log(`[Coolify Service] Triggered action: ${action} on container: ${containerId}`);
        if (!isSupabaseConfigured) {
            const containers = getLocalData(STORAGE_KEYS.SERVER_CONTAINERS, INITIAL_MOCK_SERVER_CONTAINERS);
            const idx = containers.findIndex(c => c.id === containerId);
            if (idx !== -1) {
                if (action === 'restart') {
                    containers[idx].status = 'restarting';
                    containers[idx].cpu_percent = 0;
                    setLocalData(STORAGE_KEYS.SERVER_CONTAINERS, containers);
                    setTimeout(() => {
                        const latest = getLocalData(STORAGE_KEYS.SERVER_CONTAINERS, INITIAL_MOCK_SERVER_CONTAINERS);
                        const lIdx = latest.findIndex(c => c.id === containerId);
                        if (lIdx !== -1 && latest[lIdx].status === 'restarting') {
                            latest[lIdx].status = 'running';
                            latest[lIdx].cpu_percent = Math.random() * 2 + 0.5;
                            latest[lIdx].updated_at = new Date().toISOString();
                            setLocalData(STORAGE_KEYS.SERVER_CONTAINERS, latest);
                            window.dispatchEvent(new CustomEvent('server-monitor-refresh'));
                        }
                    }, 3000);
                } else if (action === 'stop') {
                    containers[idx].status = 'stopped';
                    containers[idx].cpu_percent = 0;
                    containers[idx].updated_at = new Date().toISOString();
                    setLocalData(STORAGE_KEYS.SERVER_CONTAINERS, containers);
                } else if (action === 'start') {
                    containers[idx].status = 'running';
                    containers[idx].cpu_percent = Math.random() * 2 + 0.5;
                    containers[idx].updated_at = new Date().toISOString();
                    setLocalData(STORAGE_KEYS.SERVER_CONTAINERS, containers);
                }
                window.dispatchEvent(new CustomEvent('server-monitor-refresh'));
            }
        } else {
            const n8nUrl = localStorage.getItem('n8n_url');
            if (n8nUrl) {
                try {
                    await fetch(`${n8nUrl}/webhook/coolify-action`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ containerId, action })
                    });
                } catch (e) {
                    console.warn("Could not call N8N action endpoint, simulating locally:", e);
                }
            }
            const { data } = await supabase
                .from('server_containers')
                .select('*')
                .eq('id', containerId)
                .single();
            
            if (data) {
                let targetStatus = 'running';
                if (action === 'stop') targetStatus = 'stopped';
                if (action === 'restart') targetStatus = 'restarting';
                
                await supabase
                    .from('server_containers')
                    .update({ status: targetStatus, updated_at: new Date().toISOString() })
                    .eq('id', containerId);
                
                if (action === 'restart') {
                    setTimeout(async () => {
                        await supabase
                            .from('server_containers')
                            .update({ status: 'running', updated_at: new Date().toISOString() })
                            .eq('id', containerId);
                    }, 3000);
                }
            }
        }
        return { success: true };
    }
};
