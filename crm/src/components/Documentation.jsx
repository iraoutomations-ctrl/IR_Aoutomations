/* ==========================================================================
   autoRI-studio CRM - Complete Technical Documentation Component
   ========================================================================== */
import React, { useState } from 'react';
import { 
    BookOpen, 
    Cpu, 
    Database, 
    HelpCircle, 
    ArrowLeftRight, 
    ShieldAlert, 
    FolderDot, 
    Clock, 
    Terminal, 
    Copy, 
    Check,
    FileText,
    Layers,
    User,
    CheckCircle2,
    Settings,
    Activity,
    Info,
    AlertTriangle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function Documentation() {
    const [activeSection, setActiveSection] = useState('overview');
    const [copiedText, setCopiedText] = useState(null);
    const [expandedTable, setExpandedTable] = useState(null);

    const sections = [
        { id: 'overview', label: '1. ארכיטקטורה ומבנה', icon: Cpu },
        { id: 'database', label: '2. בסיס נתונים וטריגרים', icon: Database },
        { id: 'n8n_standard', label: '3. סטנדרט שילוב N8N', icon: ArrowLeftRight },
        { id: 'features', label: '4. פיצ\'רים ויכולות CRM', icon: Layers },
        { id: 'user_guide', label: '5. מדריך למשתמש (Manual)', icon: User }
    ];

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedText(key);
        setTimeout(() => setCopiedText(null), 2000);
    };

    // Dictionary of all tables and columns
    const tablesDictionary = {
        leads: {
            title: "leads (טבלת לידים)",
            description: "מנהלת את פרטי הלקוחות וסטטוס המכירות. שדות survey_data ו-chatbot_session מאחסנים מידע מורכב בפורמט JSONB.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה ייחודי של הליד, מיוצר אוטומטית." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "מועד יצירת הליד במסד הנתונים." },
                { name: "name", type: "TEXT (NOT NULL)", key: "", desc: "שמו המלא של הלקוח / איש הקשר." },
                { name: "email", type: "TEXT", key: "", desc: "כתובת הדואר האלקטרוני ליצירת קשר." },
                { name: "phone", type: "TEXT", key: "", desc: "מספר הטלפון של הלקוח." },
                { name: "company", type: "TEXT", key: "", desc: "שם החברה או העסק המשויך ללקוח." },
                { name: "source", type: "TEXT", key: "", desc: "ערוץ ההגעה של הליד (survey - שאלון, chatbot - בוט, manual - הזנה ידנית)." },
                { name: "status", type: "TEXT (NOT NULL)", key: "", desc: "שלב המכירות הנוכחי (new, contacted, proposal, won, lost)." },
                { name: "priority", type: "TEXT (NOT NULL)", key: "", desc: "עדיפות הטיפול בליד (low, medium, high)." },
                { name: "survey_data", type: "JSONB", key: "", desc: "תשובות שאלון איפיון מובנות (תעשייה, כמות עובדים, שעות עבודה ידניות, עלויות שעה)." },
                { name: "chatbot_session", type: "JSONB", key: "", desc: "מטא-דאטה והיסטוריית השיחה מול הצ'אטבוט באתר." },
                { name: "notes", type: "TEXT", key: "", desc: "הערות כלליות שנרשמו על ידי צוות המכירות." },
                { name: "updated_at", type: "TIMESTAMPTZ", key: "", desc: "תאריך ושעת עדכון אחרון (מעודכן אוטומטית ע\"י טריגר)." }
            ]
        },
        automations: {
            title: "automations (טבלת הגדרות אוטומציה)",
            description: "מנהלת את חבילות הריטיינר, מכסות הריצה, תמחור, ושיוך וורקפלוז N8N עבור כל לקוח וליד שנסגר.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה ייחודי של האוטומציה." },
                { name: "lead_id", type: "UUID", key: "Foreign Key", desc: "מקשר לטבלת leads(id) עם הגדרת ON DELETE CASCADE." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "מועד הקמת האוטומציה." },
                { name: "name", type: "TEXT (NOT NULL)", key: "", desc: "שם האוטומציה (למשל: 'בוט מענה לפייסבוק', 'מנטר תקלות')." },
                { name: "type", type: "TEXT", key: "", desc: "סוג טכנולוגי (למשל: סוכני AI, אינטגרציית API)." },
                { name: "status", type: "TEXT (NOT NULL)", key: "", desc: "סטטוס פיתוח/הרצה (development - בפיתוח, live - פעיל, paused - מושהה)." },
                { name: "setup_price", type: "NUMERIC (NOT NULL)", key: "", desc: "עלות הקמה חד פעמית עבור הפיתוח (ב-₪)." },
                { name: "monthly_maintenance", type: "NUMERIC (NOT NULL)", key: "", desc: "ריטיינר תחזוקה חודשי קבוע (ב-₪)." },
                { name: "runs_goal", type: "INTEGER (NOT NULL)", key: "", desc: "מכסת הרצות בסיס חודשית המוגדרת בחבילה (למשל: 1000, 5000)." },
                { name: "n8n_workflows", type: "JSONB", key: "", desc: "מערך וורקפלוז משויכים מתוך N8N במבנה של אובייקטים: [{ id, name }]." },
                { name: "block_on_limit", type: "BOOLEAN (NOT NULL)", key: "", desc: "האם לחסום הרצות אוטומטית ברגע שמגיעים למכסה המקסימלית." },
                { name: "extra_runs_allowance", type: "INTEGER (NOT NULL)", key: "", desc: "מכסת בונוס מיוחדת המתווספת למכסה בחודש הנוכחי." },
                { name: "custom_overage_rate", type: "NUMERIC (NOT NULL)", key: "", desc: "תעריף לכל הרצה עודפת (Overage) מעבר למכסה הכוללת (ב-₪)." },
                { name: "updated_at", type: "TIMESTAMPTZ", key: "", desc: "תאריך ושעת העדכון האחרון של ההגדרות." }
            ]
        },
        automation_runs: {
            title: "automation_runs (טבלת היסטוריית הרצות)",
            description: "מתעדת את כלל הריצות המדווחות בזמן אמת מתוך N8N. משמשת לחישובי ROI, זמני תגובה, ודיאגנוסטיקה.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה ריצה ייחודי." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "תאריך ושעת ביצוע ההרצה." },
                { name: "automation_id", type: "UUID", key: "Foreign Key", desc: "מקשר לטבלת automations(id) עם ON DELETE CASCADE." },
                { name: "n8n_workflow_id", type: "TEXT (NOT NULL)", key: "", desc: "מזהה ה-Workflow שביצע את ההרצה ב-N8N." },
                { name: "status", type: "TEXT (NOT NULL)", key: "", desc: "תוצאת הריצה (success - הצלחה, warning - גיבוי/אזהרה, error - תקלה, blocked - חסימת מכסה)." },
                { name: "duration_ms", type: "INTEGER", key: "", desc: "משך זמן הריצה הכולל במילישניות." },
                { name: "error_type", type: "TEXT", key: "", desc: "קטגוריית השגיאה/אזהרה לקיבוץ מהיר (למשל: 'שגיאת חיבור (404)')." },
                { name: "details", type: "JSONB", key: "", desc: "פרטים טכניים מורחבים, קוד שגיאה, או פלט גולש מה-Workflow." },
                { name: "ai_analysis", type: "TEXT", key: "", desc: "ניתוח והסבר התקלה בצירוף צעדי פתרון שהופק דינמית ע\"י Gemini Flash." }
            ]
        },
        documents: {
            title: "documents (טבלת ניהול מסמכים וקבצים)",
            description: "טבלת מטא-דאטה לקבצים המועלים למערכת. הקבצים עצמם נשמרים ב-Supabase Storage Bucket בשם 'documents'.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה ייחודי של הרשומה." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "מועד העלאת הקובץ." },
                { name: "lead_id", type: "UUID", key: "Foreign Key", desc: "מקשר לליד במידה ומדובר במסמך מכירות (proposal, contract, nda)." },
                { name: "automation_id", type: "UUID", key: "Foreign Key", desc: "מקשר לאוטומציה במידה ומדובר במסמך טכני (spec, credentials, handover)." },
                { name: "name", type: "TEXT (NOT NULL)", key: "", desc: "שם תצוגה מותאם אישית של המסמך בממשק." },
                { name: "type", type: "TEXT (NOT NULL)", key: "", desc: "סוג המסמך (proposal - הצעת מחיר, contract - חוזה, nda - סודיות, spec - אפיון, credentials - גישות, handover - מסירה)." },
                { name: "file_name", type: "TEXT (NOT NULL)", key: "", desc: "שם הקובץ הפיזי במערכת הקבצים." },
                { name: "file_size", type: "INTEGER (NOT NULL)", key: "", desc: "גודל הקובץ בבייטים." },
                { name: "file_type", type: "TEXT (NOT NULL)", key: "", desc: "פורמט הקובץ (mime-type, למשל: application/pdf)." },
                { name: "file_url", type: "TEXT (NOT NULL)", key: "", desc: "כתובת ה-URL הציבורית להורדה ישירה מתוך ה-Storage Bucket." }
            ]
        },
        automation_daily_stats: {
            title: "automation_daily_stats (טבלת אגרגציה יומית)",
            description: "טבלת סיכום שבה נשמרים הנתונים ההיסטוריים ברמת יום, על מנת לאפשר מחיקת לוגים ישנים ללא פגיעה בגרפים.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה ייחודי של הרשומה." },
                { name: "automation_id", type: "UUID", key: "Foreign Key", desc: "מקשר לאוטומציה המשויכת." },
                { name: "stat_date", type: "DATE (NOT NULL)", key: "Unique Composite", desc: "תאריך היום המשויך (בשילוב עם automation_id)." },
                { name: "total_runs", type: "INTEGER (NOT NULL)", key: "", desc: "סך הריצות שבוצעו באותו יום." },
                { name: "success_runs", type: "INTEGER (NOT NULL)", key: "", desc: "סך הריצות המוצלחות באותו יום." },
                { name: "warning_runs", type: "INTEGER (NOT NULL)", key: "", desc: "סך הריצות עם אזהרות (Fallback) באותו יום." },
                { name: "error_runs", type: "INTEGER (NOT NULL)", key: "", desc: "סך הריצות שכשלו באותו יום." },
                { name: "average_duration_ms", type: "INTEGER (NOT NULL)", key: "", desc: "ממוצע משך זמן ריצה של הרצות מוצלחות באותו יום." },
                { name: "hourly_success", type: "INTEGER[] (24)", key: "", desc: "מערך באורך 24 ערכים לרישום כמות הריצות המוצלחות בכל שעה ביממה." },
                { name: "hourly_warning", type: "INTEGER[] (24)", key: "", desc: "מערך באורך 24 ערכים לרישום כמות ריצות האזהרה בכל שעה ביממה." },
                { name: "hourly_error", type: "INTEGER[] (24)", key: "", desc: "מערך באורך 24 ערכים לרישום כמות ריצות הכשל בכל שעה ביממה." },
                { name: "error_breakdown", type: "JSONB", key: "", desc: "אובייקט JSON המקטלג סוגי שגיאות וכמות מופעים שלהן (למשל: {'404': 2})." },
                { name: "warning_breakdown", type: "JSONB", key: "", desc: "אובייקט JSON המקטלג סוגי אזהרות וכמות מופעים שלהן." }
            ]
        },
        tasks: {
            title: "tasks (טבלת משימות לידים)",
            description: "משימות לביצוע עבור כל ליד. תומכת בהגדרת תלות חוסמת (dependency_id) שמספקת לוגיקה תפקודית בממשק.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה משימה." },
                { name: "lead_id", type: "UUID", key: "Foreign Key", desc: "מקשר לליד המשויך עם ON DELETE CASCADE." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "מועד יצירת המשימה." },
                { name: "title", type: "TEXT (NOT NULL)", key: "", desc: "כותרת המשימה לביצוע." },
                { name: "description", type: "TEXT", key: "", desc: "תיאור ופרטים נוספים לביצוע." },
                { name: "status", type: "TEXT (NOT NULL)", key: "", desc: "סטטוס המשימה (pending - בהמתנה, completed - הושלמה)." },
                { name: "due_date", type: "TIMESTAMPTZ", key: "", desc: "תאריך יעד אחרון להשלמה." },
                { name: "dependency_id", type: "UUID", key: "Foreign Key", desc: "משימה חוסמת מתוך הטבלה (עצמית) המונעת השלמה עד שהיא נסגרת." }
            ]
        },
        bugs: {
            title: "bugs (טבלת באגים באוטומציות)",
            description: "באגים וליקויים טכנולוגיים המדווחים עבור אוטומציות בפיתוח או בייצור.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה הבאג." },
                { name: "automation_id", type: "UUID", key: "Foreign Key", desc: "מקשר לאוטומציה עם ON DELETE CASCADE." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "תאריך ושעת דיווח הבאג." },
                { name: "title", type: "TEXT (NOT NULL)", key: "", desc: "כותרת הבאג." },
                { name: "description", type: "TEXT (NOT NULL)", key: "", desc: "תיאור מפורט של התקלה ואיך לשחזר." },
                { name: "severity", type: "TEXT (NOT NULL)", key: "", desc: "רמת החומרה (low, medium, high)." },
                { name: "status", type: "TEXT (NOT NULL)", key: "", desc: "סטטוס הטיפול (open - פתוח, in_progress - בטיפול, resolved - נפתר)." },
                { name: "closed_at", type: "TIMESTAMPTZ", key: "", desc: "מועד סגירת הבאג וסימונו כנפתר." }
            ]
        },
        system_alerts: {
            title: "system_alerts (טבלת התראות מערכת)",
            description: "רישום התראות N8N כלליות, כשלים מנטר השגיאות והודעות מערכת המוזרמות ישירות לדפדפן בזמן אמת.",
            columns: [
                { name: "id", type: "UUID", key: "Primary Key", desc: "מזהה התראה ייחודי." },
                { name: "created_at", type: "TIMESTAMPTZ", key: "", desc: "מועד יצירת ההתראה." },
                { name: "title", type: "TEXT (NOT NULL)", key: "", desc: "כותרת ההתראה (למשל: '🚨 תקלה בוורקפלו: IR AI Bot')." },
                { name: "message", type: "TEXT (NOT NULL)", key: "", desc: "תיאור התקלה או ההתראה לפרטים." },
                { name: "type", type: "TEXT (NOT NULL)", key: "", desc: "סוג ההתראה (success, warning, error, info)." },
                { name: "read", type: "BOOLEAN (NOT NULL)", key: "", desc: "האם המשתמש קרא את ההתראה במגירת ההתראות." },
                { name: "n8n_workflow_id", type: "TEXT", key: "", desc: "מזהה ה-Workflow שיצר את ההתראה." },
                { name: "duration_ms", type: "INTEGER", key: "", desc: "זמן הריצה של ה-Workflow במידה וההתראה מתעדת ריצה מוצלחת/אזהרה." }
            ]
        }
    };

    // Full SQL script for creating tables, triggers, RPC, rollups
    const fullSqlSetupCode = `-- ==========================================================================
-- autoRI-studio CRM - Complete Supabase DB Setup Script
-- Includes: Tables, Constraints, Indexes, Storage, RLS Policies, Functions & Triggers
-- ==========================================================================

-- 1. טבלת לידים (leads)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT DEFAULT 'direct' NOT NULL, -- direct, chatbot, survey, manual
    status TEXT DEFAULT 'new' NOT NULL, -- new, contacted, proposal, won, lost
    priority TEXT DEFAULT 'medium' NOT NULL, -- low, medium, high
    survey_data JSONB DEFAULT '{}'::jsonb, -- נתוני שאלון איפיון מפורטים
    chatbot_session JSONB DEFAULT '{}'::jsonb, -- היסטוריית שיחת בוט
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. טבלת משימות (tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, completed
    due_date TIMESTAMP WITH TIME ZONE,
    dependency_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- משימה חוסמת
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. טבלת הערות (notes)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL
);

-- 4. טבלת אוטומציות (automations)
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'development' NOT NULL, -- paused, development, live
    setup_price NUMERIC DEFAULT 0 NOT NULL,
    monthly_maintenance NUMERIC DEFAULT 0 NOT NULL,
    runs_goal INTEGER DEFAULT 1000 NOT NULL,
    n8n_workflows JSONB DEFAULT '[]'::jsonb, -- מערך של { id, name }
    block_on_limit BOOLEAN DEFAULT true NOT NULL,
    extra_runs_allowance INTEGER DEFAULT 0 NOT NULL,
    custom_overage_rate NUMERIC DEFAULT 0.05 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. טבלת באגים / תקלות אוטומציה (bugs)
CREATE TABLE IF NOT EXISTS bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' NOT NULL, -- low, medium, high
    status TEXT DEFAULT 'open' NOT NULL, -- open, in_progress, resolved
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 6. טבלת התראות מערכת כלליות (system_alerts)
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL, -- success, warning, error, info
    read BOOLEAN DEFAULT false NOT NULL,
    n8n_workflow_id TEXT,
    duration_ms INTEGER
);

-- 7. טבלת הרצות אוטומציה (automation_runs)
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
    n8n_workflow_id TEXT NOT NULL,
    status TEXT NOT NULL, -- success, warning, error, blocked
    duration_ms INTEGER,
    error_type TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ai_analysis TEXT
);

-- 8. טבלת ניהול מסמכים וקבצים (documents)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- כותרת המסמך
    type TEXT NOT NULL, -- proposal, contract, nda, spec, credentials, handover
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL
);

-- 9. טבלת סטטיסטיקות אגרגציה יומיות (automation_daily_stats)
CREATE TABLE IF NOT EXISTS automation_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
    stat_date DATE NOT NULL,
    total_runs INTEGER DEFAULT 0 NOT NULL,
    success_runs INTEGER DEFAULT 0 NOT NULL,
    warning_runs INTEGER DEFAULT 0 NOT NULL,
    error_runs INTEGER DEFAULT 0 NOT NULL,
    average_duration_ms INTEGER DEFAULT 0 NOT NULL,
    hourly_success INTEGER[] DEFAULT array_fill(0, ARRAY[24]) NOT NULL,
    hourly_warning INTEGER[] DEFAULT array_fill(0, ARRAY[24]) NOT NULL,
    hourly_error INTEGER[] DEFAULT array_fill(0, ARRAY[24]) NOT NULL,
    error_breakdown JSONB DEFAULT '{}'::jsonb,
    warning_breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(automation_id, stat_date)
);

-- 10. יצירת אינדקסים לביצועים מהירים
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_tasks_lead ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_automations_lead ON automations(lead_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_auto ON automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_created ON automation_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_lead ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_auto ON documents(automation_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON automation_daily_stats(stat_date DESC);

-- 11. פונקציית עדכון תאריך עדכון אוטומטי (Trigger Function)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_automations_modtime BEFORE UPDATE ON automations FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 12. פונקציית בדיקת מכסות הרצה (RPC - check_automation_quota)
CREATE OR REPLACE FUNCTION check_automation_quota(p_automation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_runs_count INTEGER := 0;
    v_runs_limit INTEGER := 0;
    v_extra_allowance INTEGER := 0;
    v_total_quota INTEGER := 0;
    v_allowed BOOLEAN := true;
    v_block_on_limit BOOLEAN := true;
    v_status TEXT;
    v_month_start TIMESTAMP WITH TIME ZONE;
BEGIN
    v_month_start := date_trunc('month', now());

    SELECT runs_goal, extra_runs_allowance, block_on_limit, status
    INTO v_runs_limit, v_extra_allowance, v_block_on_limit, v_status
    FROM automations
    WHERE id = p_automation_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'error', 'Automation not found',
            'runs_count', 0,
            'runs_limit', 0
        );
    END IF;

    IF v_status <> 'live' THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'error', 'Automation is not in LIVE status',
            'runs_count', 0,
            'runs_limit', v_runs_limit
        );
    END IF;

    -- ספירת הרצות בחודש הנוכחי (לא כולל חסימות)
    SELECT COUNT(*)::INTEGER INTO v_runs_count
    FROM automation_runs
    WHERE automation_id = p_automation_id
      AND created_at >= v_month_start
      AND status <> 'blocked';

    v_total_quota := v_runs_limit + v_extra_allowance;

    IF v_runs_count >= v_total_quota AND v_block_on_limit THEN
        v_allowed := false;
    ELSE
        v_allowed := true;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'runs_count', v_runs_count,
        'runs_limit', v_runs_limit,
        'extra_allowance', v_extra_allowance,
        'total_quota', v_total_quota,
        'block_on_limit', v_block_on_limit
    );
END;
$$;

-- 13. מנגנון אגרגציה וצמצום נתונים (Rollup Stats & Data Purging)
CREATE OR REPLACE FUNCTION run_daily_automation_rollup()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_yesterday DATE := (now() - INTERVAL '1 day')::DATE;
    r RECORD;
    v_avg_duration INTEGER;
    v_hourly_s INTEGER[];
    v_hourly_w INTEGER[];
    v_hourly_e INTEGER[];
    v_errors JSONB;
    v_warnings JSONB;
BEGIN
    FOR r IN SELECT id FROM automations LOOP
        -- חישוב ממוצע זמן ריצה של אתמול
        SELECT COALESCE(AVG(duration_ms)::INTEGER, 0) INTO v_avg_duration
        FROM automation_runs
        WHERE automation_id = r.id AND created_at::DATE = v_yesterday AND status IN ('success', 'warning');

        -- חישוב מערכים שעתים (0-23)
        SELECT 
            ARRAY(SELECT COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) FROM generate_series(0,23) h LEFT JOIN automation_runs on extract(hour from created_at) = h AND automation_id = r.id AND created_at::DATE = v_yesterday GROUP BY h ORDER BY h),
            ARRAY(SELECT COALESCE(SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END), 0) FROM generate_series(0,23) h LEFT JOIN automation_runs on extract(hour from created_at) = h AND automation_id = r.id AND created_at::DATE = v_yesterday GROUP BY h ORDER BY h),
            ARRAY(SELECT COALESCE(SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END), 0) FROM generate_series(0,23) h LEFT JOIN automation_runs on extract(hour from created_at) = h AND automation_id = r.id AND created_at::DATE = v_yesterday GROUP BY h ORDER BY h)
        INTO v_hourly_s, v_hourly_w, v_hourly_e;

        -- פירוט שגיאות
        SELECT COALESCE(jsonb_object_agg(error_type, cnt), '{}'::jsonb) INTO v_errors
        FROM (SELECT error_type, COUNT(*) as cnt FROM automation_runs WHERE automation_id = r.id AND created_at::DATE = v_yesterday AND status = 'error' AND error_type <> '' GROUP BY error_type) tmp;

        -- פירוט אזהרות
        SELECT COALESCE(jsonb_object_agg(error_type, cnt), '{}'::jsonb) INTO v_warnings
        FROM (SELECT error_type, COUNT(*) as cnt FROM automation_runs WHERE automation_id = r.id AND created_at::DATE = v_yesterday AND status = 'warning' AND error_type <> '' GROUP BY error_type) tmp;

        -- רישום הסטטיסטיקה
        INSERT INTO automation_daily_stats (
            automation_id, stat_date, total_runs, success_runs, warning_runs, error_runs, average_duration_ms, hourly_success, hourly_warning, hourly_error, error_breakdown, warning_breakdown
        )
        VALUES (
            r.id, v_yesterday,
            (SELECT COUNT(*)::INTEGER FROM automation_runs WHERE automation_id = r.id AND created_at::DATE = v_yesterday),
            (SELECT COUNT(*)::INTEGER FROM automation_runs WHERE automation_id = r.id AND created_at::DATE = v_yesterday AND status = 'success'),
            (SELECT COUNT(*)::INTEGER FROM automation_runs WHERE automation_id = r.id AND created_at::DATE = v_yesterday AND status = 'warning'),
            (SELECT COUNT(*)::INTEGER FROM automation_runs WHERE automation_id = r.id AND created_at::DATE = v_yesterday AND status = 'error'),
            v_avg_duration, v_hourly_s, v_hourly_w, v_hourly_e, v_errors, v_warnings
        )
        ON CONFLICT (automation_id, stat_date) DO UPDATE SET
            total_runs = EXCLUDED.total_runs,
            success_runs = EXCLUDED.success_runs,
            warning_runs = EXCLUDED.warning_runs,
            error_runs = EXCLUDED.error_runs,
            average_duration_ms = EXCLUDED.average_duration_ms,
            hourly_success = EXCLUDED.hourly_success,
            hourly_warning = EXCLUDED.hourly_warning,
            hourly_error = EXCLUDED.hourly_error,
            error_breakdown = EXCLUDED.error_breakdown,
            warning_breakdown = EXCLUDED.warning_breakdown;
    END LOOP;

    -- ניקוי לוגים לפי מדיניות שמירת מקום
    -- 1. מחיקת הצלחות ואזהרות ישנות מ-7 ימים
    DELETE FROM automation_runs WHERE created_at < (now() - INTERVAL '7 days') AND status IN ('success', 'warning');
    -- 2. מחיקת שגיאות ישנות מ-30 ימים
    DELETE FROM automation_runs WHERE created_at < (now() - INTERVAL '30 days') AND status = 'error';
END;
$$;

-- 14. יצירת פולדר האחסון ומדיניות גישה (Supabase Storage Bucket Documents)
-- הערה: יצירת ה-Bucket מתבצעת תחת סכמת storage.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- הגדרת פוליסי הורדה (Select) ציבורית
CREATE POLICY "Allow public select from documents bucket" 
ON storage.objects FOR SELECT TO public USING (bucket_id = 'documents');

-- הגדרת פוליסי העלאה (Insert) ציבורית
CREATE POLICY "Allow public insert to documents bucket" 
ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'documents');

-- הגדרת פוליסי מחיקה (Delete) ציבורית
CREATE POLICY "Allow public delete from documents bucket" 
ON storage.objects FOR DELETE TO public USING (bucket_id = 'documents');

-- 15. אבטחת טבלאות ציבוריות (RLS Enable and Policies)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_daily_stats ENABLE ROW LEVEL SECURITY;

-- הגדרת פוליסי מעבר חופשי (Permissive Policies לשם פשטות הדגמה ופרונטאנד)
CREATE POLICY "Allow all select" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.leads FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all select" ON public.automations FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.automations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.automations FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.automations FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON public.bugs FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.bugs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.bugs FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.bugs FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON public.system_alerts FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.system_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.system_alerts FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.system_alerts FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON public.automation_runs FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.automation_runs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all select" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.documents FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON public.automation_daily_stats FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.automation_daily_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.automation_daily_stats FOR UPDATE USING (true);
`;

    const n8nTemplateCode = `{
  "name": "Template CRM Integrated Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "webhook-endpoint",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [100, 250],
      "id": "webhook-trigger",
      "name": "Webhook Trigger"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "startTime",
              "value": "={{ new Date().getTime() }}"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 4,
      "position": [280, 250],
      "id": "init-timer",
      "name": "Initialize Timer"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://[SUPABASE_URL]/rest/v1/rpc/check_automation_quota",
        "sendHeaders": true,
        "headersUi": {
          "parameter": [
            { "name": "apikey", "value": "YOUR_SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer YOUR_SUPABASE_ANON_KEY" }
          ]
        },
        "sendBody": true,
        "bodyParametersUi": {
          "parameter": [
            { "name": "p_automation_id", "value": "YOUR_AUTOMATION_UUID" }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [440, 250],
      "id": "quota-rpc",
      "name": "Check Quota (RPC)"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "type": "boolean"
          },
          "conditions": [
            {
              "id": "check-allowed",
              "leftValue": "={{ $json.allowed }}",
              "comparison": "true",
              "rightValue": ""
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [620, 250],
      "id": "quota-allowed-check",
      "name": "Quota Allowed?"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://[SUPABASE_URL]/rest/v1/automation_runs",
        "sendHeaders": true,
        "headersUi": {
          "parameter": [
            { "name": "apikey", "value": "YOUR_SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer YOUR_SUPABASE_ANON_KEY" }
          ]
        },
        "sendBody": true,
        "bodyParametersUi": {
          "parameter": [
            { "name": "automation_id", "value": "YOUR_AUTOMATION_UUID" },
            { "name": "n8n_workflow_id", "value": "={{ $workflow.id }}" },
            { "name": "status", "value": "blocked" },
            { "name": "duration_ms", "value": "0" },
            { "name": "details", "value": "{\"reason\":\"Quota exceeded / Account blocked\"}" }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [820, 150],
      "id": "log-blocked",
      "name": "Log Blocked in CRM"
    },
    {
      "parameters": {
        "respondWith": "respondWithNodeOnTrue",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1000, 150],
      "id": "webhook-response-blocked",
      "name": "Respond Blocked"
    },
    {
      "parameters": {
        "notice": "כאן מתבצע תהליך הבוט או האוטומציה הראשי שלך"
      },
      "type": "n8n-nodes-base.noOp",
      "position": [820, 350],
      "id": "main-process",
      "name": "Main Process Execution"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://[SUPABASE_URL]/rest/v1/automation_runs",
        "sendHeaders": true,
        "headersUi": {
          "parameter": [
            { "name": "apikey", "value": "YOUR_SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer YOUR_SUPABASE_ANON_KEY" }
          ]
        },
        "sendBody": true,
        "bodyParametersUi": {
          "parameter": [
            { "name": "automation_id", "value": "YOUR_AUTOMATION_UUID" },
            { "name": "n8n_workflow_id", "value": "={{ $workflow.id }}" },
            { "name": "status", "value": "success" },
            { "name": "duration_ms", "value": "={{ new Date().getTime() - $('init-timer').first().json.startTime }}" },
            { "name": "details", "value": "{\"message\":\"האוטומציה בוצעה בהצלחה\"}" }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [1020, 350],
      "id": "log-success",
      "name": "Log Success to CRM"
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [ { "node": "Initialize Timer", "type": "main", "index": 0 } ]
      ]
    },
    "Initialize Timer": {
      "main": [
        [ { "node": "Check Quota (RPC)", "type": "main", "index": 0 } ]
      ]
    },
    "Check Quota (RPC)": {
      "main": [
        [ { "node": "Quota Allowed?", "type": "main", "index": 0 } ]
      ]
    },
    "Quota Allowed?": {
      "main": [
        [ { "node": "Log Blocked in CRM", "type": "main", "index": 0 } ],
        [ { "node": "Main Process Execution", "type": "main", "index": 0 } ]
      ]
    },
    "Log Blocked in CRM": {
      "main": [
        [ { "node": "Respond Blocked", "type": "main", "index": 0 } ]
      ]
    },
    "Main Process Execution": {
      "main": [
        [ { "node": "Log Success to CRM", "type": "main", "index": 0 } ]
      ]
    }
  }
}`;

    const toggleTable = (tableName) => {
        if (expandedTable === tableName) {
            setExpandedTable(null);
        } else {
            setExpandedTable(tableName);
        }
    };

    return (
        <div className="documentation-container fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <BookOpen size={32} className="text-violet" style={{ color: '#8b5cf6' }} />
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-light)', margin: 0 }}>מרכז ידע, מדריכים ודוקומנטציה של ה-CRM</h1>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        תיעוד טכני מלא, סכמות בסיס הנתונים ב-Supabase, פרוטוקולי אינטגרציה של N8N, ומדריך משתמש מפורט לכל פיצ'רי המערכת.
                    </p>
                </div>
            </div>

            {/* Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '24px' }}>
                {/* Right Side Navigation Menu */}
                <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', height: 'fit-content', position: 'sticky', top: '24px' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '14px', paddingRight: '8px', fontWeight: '700' }}>פרקי הדוקומנטציה</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {sections.map(sec => {
                            const Icon = sec.icon;
                            return (
                                <li key={sec.id}>
                                    <button 
                                        onClick={() => setActiveSection(sec.id)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            background: activeSection === sec.id ? 'rgba(139, 92, 246, 0.15)' : 'none',
                                            border: 'none',
                                            color: activeSection === sec.id ? '#a78bfa' : 'var(--text-secondary)',
                                            padding: '12px 14px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '13.5px',
                                            fontWeight: activeSection === sec.id ? '600' : '400',
                                            textAlign: 'right',
                                            transition: 'all 0.2s ease',
                                            borderRight: activeSection === sec.id ? '3px solid #8b5cf6' : '3px solid transparent'
                                        }}
                                    >
                                        <Icon size={16} />
                                        <span>{sec.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)', paddingRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <Activity size={12} className="text-violet" style={{ color: '#8b5cf6' }} />
                            <span>סטטוס מערכת: <strong>תקין (LIVE)</strong></span>
                        </div>
                        <div>גרסה: <strong>1.4.0 (Vite + Supabase)</strong></div>
                    </div>
                </div>

                {/* Left Side Content Area */}
                <div className="glass-card" style={{ padding: '28px', borderRadius: '12px', minHeight: '600px' }}>
                    
                    {/* SECTION 1: ARCHITECTURE & STRUCTURE */}
                    {activeSection === 'overview' && (
                        <div className="fade-in">
                            <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '16px', fontWeight: '700' }}>1. ארכיטקטורת המערכת ומבנה טכנולוגי</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14.5px', marginBottom: '20px' }}>
                                מערכת ה-CRM של <strong>autoRI-studio</strong> משמשת כמרכז השליטה והבקרה (Control Plane) לכלל האוטומציות, הלידים ותהליכי המכירה והפיתוח בארגון.
                                המערכת מבוססת על שילוב של פרונטאנד אינטראקטיבי, מסד נתונים רילטיים בענן, ומנוע אוטומציות מקומי.
                            </p>

                            {/* Tech Stack Diagram (Visual HTML/CSS Representation) */}
                            <h3 style={{ fontSize: '15px', color: 'var(--text-light)', margin: '24px 0 12px 0', fontWeight: '600' }}>📐 תזרים ורכיבי הארכיטקטורה (Data Flow Topology)</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                    
                                    {/* Client App */}
                                    <div style={{ flex: '1', minWidth: '180px', padding: '14px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)', textAlign: 'center' }}>
                                        <Cpu size={24} style={{ color: '#8b5cf6', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
                                        <h5 style={{ margin: '0 0 4px 0', color: 'var(--text-light)', fontSize: '13px' }}>CRM Client App</h5>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>React, Vite, CSS Grid, Lucide React</span>
                                    </div>

                                    {/* Bi-directional arrow */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                                        <ArrowLeftRight size={18} />
                                        <span>Realtime / API</span>
                                    </div>

                                    {/* Supabase */}
                                    <div style={{ flex: '1', minWidth: '180px', padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                                        <Database size={24} style={{ color: '#10b981', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
                                        <h5 style={{ margin: '0 0 4px 0', color: 'var(--text-light)', fontSize: '13px' }}>Supabase DB & Storage</h5>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PostgreSQL, RLS, storage buckets, RPC Functions</span>
                                    </div>

                                    {/* Arrow */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                                        <ArrowLeftRight size={18} />
                                        <span>SQL / Auth</span>
                                    </div>

                                    {/* N8N Server */}
                                    <div style={{ flex: '1', minWidth: '180px', padding: '14px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)', textAlign: 'center' }}>
                                        <ArrowLeftRight size={24} style={{ color: '#06b6d4', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
                                        <h5 style={{ margin: '0 0 4px 0', color: 'var(--text-light)', fontSize: '13px' }}>N8N Server (Workflows)</h5>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Docker Local, CF Tunnel, Webhooks, HTTP API</span>
                                    </div>
                                    
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                                <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: '600' }}>🔄 מודל סנכרון נתונים דו-כיווני בזמן אמת</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        ה-CRM מאפשר מעקב בזמן אמת על ידי פתיחת ערוצי האזנה (Channels) לטבלאות Supabase. כל רישום שנעשה בוורקפלו של N8N (כגון הצלחה, אזהרה או שגיאה) או כל שינוי סטטוס ליד בבסיס הנתונים, משוקף <strong>מיידית (בתוך מילישניות)</strong> בממשק הפרונטאנד של הלקוח ללא צורך בריענון דף כלל.
                                    </p>
                                </div>
                                <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: '600' }}>🤖 מנוע דיאגנוסטיקה מבוסס AI וגיבוי מקומי</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        במקרה של כשל ריצה, ה-CRM מספק ניתוח דו-שלבי: (1) <strong>פענוח מבוסס חוקים</strong> השולף את סוג השגיאה, סיבתה וצעדים לפתרון בעברית. (2) <strong>ניתוח בינה מלאכותית חי</strong> המבוסס על Gemini API, השולף את מבנה ה-Workflow ישירות מ-N8N API ונותן אפיון מדויק היכן הבעיה וכיצד לתקן אותה בתוך הוורקפלו.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: DATABASE SCHEMA, TRIGGERS & FUNCTIONS */}
                    {activeSection === 'database' && (
                        <div className="fade-in">
                            <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '12px', fontWeight: '700' }}>2. בסיס נתונים וטריגרים (Supabase DB Schema)</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14.5px', marginBottom: '20px' }}>
                                בסיס הנתונים PostgreSQL מורכב מ-9 טבלאות המחוברות ביניהן באמצעות מפתחות זרים (Foreign Keys) עם הגדרות מחיקה משורשרת (Cascade Delete) לשמירה על שלמות המידע.
                            </p>

                            {/* Tables details accordion */}
                            <h3 style={{ fontSize: '16px', color: 'var(--text-light)', margin: '20px 0 12px 0', fontWeight: '600' }}>📁 מילון טבלאות אינטראקטיבי (לחץ להרחבה)</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                                {Object.keys(tablesDictionary).map((tblKey) => {
                                    const tbl = tablesDictionary[tblKey];
                                    const isExpanded = expandedTable === tblKey;
                                    return (
                                        <div key={tblKey} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', overflow: 'hidden' }}>
                                            <button 
                                                onClick={() => toggleTable(tblKey)}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: 'none',
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-light)',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    textAlign: 'right'
                                                }}
                                            >
                                                <span>{tbl.title}</span>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            
                                            {isExpanded && (
                                                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.05)' }}>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                                        {tbl.description}
                                                    </p>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'right' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                                                                <th style={{ padding: '8px', width: '20%' }}>שם העמודה</th>
                                                                <th style={{ padding: '8px', width: '20%' }}>סוג נתונים (Type)</th>
                                                                <th style={{ padding: '8px', width: '15%' }}>מפתח/מגבלה</th>
                                                                <th style={{ padding: '8px' }}>תיאור ומטרה</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {tbl.columns.map((col, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                                                    <td style={{ padding: '8px', fontWeight: '600', color: '#a78bfa', fontFamily: 'monospace' }}>{col.name}</td>
                                                                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{col.type}</td>
                                                                    <td style={{ padding: '8px', color: '#ef4444', fontWeight: '500' }}>{col.key}</td>
                                                                    <td style={{ padding: '8px', lineHeight: '1.4' }}>{col.desc}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* PostgreSQL Triggers & Functions */}
                            <h3 style={{ fontSize: '16px', color: 'var(--text-light)', margin: '20px 0 10px 0', fontWeight: '600' }}>⚙️ פונקציות וטריגרים מובנים (PostgreSQL Engine)</h3>
                            <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.04)', borderRight: '4px solid #8b5cf6', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                                <ul style={{ margin: 0, paddingRight: '20px' }}>
                                    <li><strong>עדכון תאריך שינוי (Trigger):</strong> מופעל אוטומטית לפני כל עדכון (UPDATE) על טבלאות <code>leads</code>, <code>tasks</code>, <code>automations</code> ומעדכן את עמודת <code>updated_at</code> לשעה הנוכחית.</li>
                                    <li><strong>בדיקת מכסת הרצות (check_automation_quota RPC):</strong> מקבלת מזהה אוטומציה, מחשבת את סך הרצותיה מתחילת החודש הנוכחי, משווה מול מכסת הבסיס והבונוס ומחזירה תשובת JSONB המאשרת או חוסמת את הריצה הבאה.</li>
                                    <li><strong>אגרגציה לילית וניקוי לוגים (daily stats rollup & purge):</strong> פונקציה המופעלת באופן מחזורי (או דרך <code>pg_cron</code> בענן או באמצעות סימולציית LocalStorage בדפדפן). היא מסכמת את לוגי האתמול לטבלת ה-daily stats, ולאחר מכן מוחקת הרצות מוצלחות בנות יותר מ-7 ימים ושגיאות בנות יותר מ-30 ימים.</li>
                                </ul>
                            </div>

                            {/* Copyable SQL Box */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1e2e', padding: '10px 16px', borderRadius: '8px 8px 0 0', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                    <span style={{ fontSize: '12.5px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}><Terminal size={14}/> סקריפט הקמה מלא ל-Supabase SQL Editor</span>
                                    <button 
                                        onClick={() => copyToClipboard(fullSqlSetupCode, 'fullSql')}
                                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                                    >
                                        {copiedText === 'fullSql' ? <CheckCircle2 size={14} style={{ color: '#10b981' }}/> : <Copy size={14}/>}
                                        {copiedText === 'fullSql' ? 'קוד הועתק!' : 'העתק קוד'}
                                    </button>
                                </div>
                                <pre style={{ margin: 0, padding: '16px', background: '#181824', borderRadius: '0 0 8px 8px', border: '1px solid var(--border-color)', overflowY: 'auto', maxHeight: '400px', fontSize: '12px', color: '#f8f8f2', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', lineHeight: '1.4' }}>
                                    {fullSqlSetupCode}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: N8N INTEGRATION STANDARD */}
                    {activeSection === 'n8n_standard' && (
                        <div className="fade-in">
                            <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '16px', fontWeight: '700' }}>3. סטנדרט אינטגרציה לוורקפלוז (N8N Workflows Integration Standard)</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14.5px' }}>
                                על מנת שה-CRM יוכל לנטר, להגביל, ולנתח תקלות בחיבור לכל אוטומציה או וורקפלו חדש בארגון, יש לעמוד בסטנדרט המובנה הבא בכל זרימת עבודה ב-N8N.
                            </p>

                            {/* Steps to integrate standard */}
                            <h3 style={{ fontSize: '15px', color: 'var(--text-light)', margin: '20px 0 10px 0', fontWeight: '600' }}>📋 4 השלבים שכל וורקפלו חייב לכלול:</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0' }}>
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-light)', fontSize: '14px' }}>אתחול טיימר (Set startTime):</strong>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                                            מיד לאחר צומת הטריגר (Webhook או אחר), יש להוסיף קוביית <code>Set</code> המאתחלת משתנה בשם <code>startTime</code> עם הערך <code>{"{{ new Date().getTime() }}"}</code>. משתנה זה ישמש לחישוב מדויק של זמן הריצה (duration) בסיום.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-light)', fontSize: '14px' }}>בדיקת מכסה וחסימה (Check Quota RPC Call):</strong>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                                            בצע פניית HTTP POST לקצה ה-RPC של Supabase <code>check_automation_quota</code>. 
                                            במידה ומשתנה התשובה <code>allowed</code> הוא <code>false</code>, האוטומציה צריכה מיידית:
                                            (א) לרשום ריצה מסוג <code>blocked</code> במסד הנתונים.
                                            (ב) להחזיר תגובה לגולש / לבצע עצירה יזומה (Webhook Respond node).
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-light)', fontSize: '14px' }}>דיווח הישגים וסטטוס (CRM Logging):</strong>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                                            בסיום הריצה, יש לפנות ב-POST לטבלת <code>automation_runs</code>.
                                            יש להעביר את הסטטוס (<code>success</code> או <code>warning</code> במידה והשתמשתם בגיבוי / Fallback).
                                            זמן הריצה יחושב דינמית בפרמטר: <code>{"{{ new Date().getTime() - $('init-timer').first().json.startTime }}"}</code>.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>4</div>
                                    <div>
                                        <strong style={{ color: 'var(--text-light)', fontSize: '14px' }}>חיבור למנטר שגיאות גלובלי (Error Workflow):</strong>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                                            בהגדרות ה-Workflow שלכם ב-N8N (תחת Settings), הגדירו את הוורקפלו <code>bRNz7Lq79wYJ5Dvo</code> (מנטר השגיאות) כ-<strong>Error Workflow</strong>. במקרה של קריסה לא צפויה, הניטור יופעל אוטומטית, ישלח אימייל וידווח על השגיאה ל-CRM עם מזהה ה-Workflow שחווה את התקלה.
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* Standard Template JSON */}
                            <div style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1e2e', padding: '10px 16px', borderRadius: '8px 8px 0 0', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
                                    <span style={{ fontSize: '12.5px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}><Terminal size={14}/> פורמט N8N Workflow JSON להעתקה/ייבוא</span>
                                    <button 
                                        onClick={() => copyToClipboard(n8nTemplateCode, 'n8nJson')}
                                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                                    >
                                        {copiedText === 'n8nJson' ? <CheckCircle2 size={14} style={{ color: '#10b981' }}/> : <Copy size={14}/>}
                                        {copiedText === 'n8nJson' ? 'JSON הועתק!' : 'העתק JSON'}
                                    </button>
                                </div>
                                <pre style={{ margin: 0, padding: '16px', background: '#181824', borderRadius: '0 0 8px 8px', border: '1px solid var(--border-color)', overflowY: 'auto', maxHeight: '300px', fontSize: '12px', color: '#f8f8f2', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', lineHeight: '1.4' }}>
                                    {n8nTemplateCode}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: CRM FEATURES BREAKDOWN */}
                    {activeSection === 'features' && (
                        <div className="fade-in">
                            <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '16px', fontWeight: '700' }}>4. פיצ'רים, יכולות ומנגנוני ה-CRM</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14.5px', marginBottom: '24px' }}>
                                ממשק ה-CRM מצויד במגוון רכיבים מורכבים המחוברים בזמן אמת ל-Supabase. להלן פירוט של כלל הפיצ'רים והמנגנונים הפנימיים במערכת:
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                                
                                {/* Feature 1 */}
                                <div style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 8px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>📋 לוח קנבן ומעגל מכירות</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        מנהל את הלידים ב-5 שלבי המרה: <strong>חדש (New), נוצר קשר (Contacted), הצעת מחיר (Proposal), פרויקט נסגר (Won), והפסד (Lost)</strong>. מעבר הלידים מתבצע בגרירה (HTML5 Drag and Drop) תוך סנכרון חי ועדכון שווי מפת המכירות בלוח הבקרה הראשי.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 8px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>🔒 מנגנון חסימת שלבים (Hard Gating)</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        בקרת איכות מובנית המונעת מעבר סטטוס ללא מסמכי חובה:
                                        <ul style={{ margin: '6px 0 0 0', paddingRight: '16px' }}>
                                            <li>מעבר להצעת מחיר דורש קובץ <strong>הצעת מחיר (Proposal)</strong>.</li>
                                            <li>מעבר לנסגר/פיתוח דורש <strong>חוזה חתום וסכם סודיות (NDA)</strong>.</li>
                                            <li>העברת אוטומציה לסטטוס <code>LIVE</code> דורשת <strong>מסמך אפיון טכני, כרטיס גישות מאובטח ופרוטוקול מסירה</strong>.</li>
                                        </ul>
                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 8px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>📈 מחשבון תמחור וחיזוי ROI אינטראקטיבי</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        מאפשר לבחור לקוח, למשוך את שעות העבודה שלו ועלויות השעה ישירות מהשאלון שלו, לחשב את סך החיסכון החודשי והשנתי בצפי שעות ואוטומציה, לבחור חבילת ריטיינר, ולהעתיק הצעה מפורמטת בעברית ללוח בלחיצת כפתור אחת.
                                    </p>
                                </div>

                                {/* Feature 4 */}
                                <div style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 8px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>📊 גרף נפח שימוש דו-כיווני עם Drill-Down</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        תרשים SVG אינטראקטיבי להמחשת הרצות: תומך בניווט פירורי לחם (Breadcrumbs) המאפשר ללחוץ על שנה כדי לראות חודשים, ללחוץ על חודש כדי לראות שבועות, ללחוץ על שבוע לימים, ויום לשעות. תוויות הציר מוגדרות בזווית -25 מעלות למניעת חפיפה.
                                    </p>
                                </div>

                                {/* Feature 5 */}
                                <div style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 8px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>⚡ מנטר ביצועים ודיאגנוסטיקה מונחית AI</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        בלוג הריצות ניתן לצפות בפרטי השגיאות. כפתור "דיאגנוסטיקת AI" יבצע קריאת API בזמן אמת ל-Gemini Flash. המנוע מפעיל פנייה ל-N8N API לשליפת מבנה ה-Workflow שנכשל (Nodes & connections) ומציע תיאור מעמיק של התקלה ואיך לפתור אותה.
                                    </p>
                                </div>

                                {/* Feature 6 */}
                                <div style={{ border: '1px solid var(--border-color)', padding: '18px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 8px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>🧹 אגרגציה וצמצום נתונים (Downsampling)</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                        מנגנון חסכון באחסון (גם ב-Supabase וגם ב-LocalStorage). הוא מאגד את נתוני הריצות הבודדות לסיכומי סטטיסטיקה יומית, ומנקה אוטומטית ריצות בנות יותר משבוע (למניעת ניפוח נפח הנתונים) ושגיאות בנות יותר מ-30 יום.
                                    </p>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* SECTION 5: USER GUIDE (MANUAL) */}
                    {activeSection === 'user_guide' && (
                        <div className="fade-in">
                            <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '16px', fontWeight: '700' }}>5. מדריך למשתמש ותפעול שוטף (User Manual)</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14.5px', marginBottom: '20px' }}>
                                מדריך זה מפרט כיצד לבצע את המטלות השכיחות ביותר בניהול המערכת.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                
                                {/* Step 1 */}
                                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><PlusCircle size={16}/> הוספה וניהול של לקוח (ליד) חדש בקנבן</h4>
                                    <ol style={{ margin: 0, paddingRight: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        <li>עבור לדף <strong>"לוח קנבן"</strong> או <strong>"רשימת לידים"</strong> ולחץ על כפתור <strong>"+ הוסף ליד חדש"</strong>.</li>
                                        <li>הזן את פרטי הלקוח (שם, אימייל, טלפון, חברה) ובחר את הערוץ דרכו הגיע (Survey, Chatbot, או ידני).</li>
                                        <li>במידה וללקוח יש שאלון אפיון, הזן את הפרטים הטכנולוגיים שלו במחשבון ה-ROI.</li>
                                        <li>כדי לקדם לקוח בשלב, פשוט גרור אותו לשלב הבא. שים לב: המערכת תחסום אותך אם לא תעלה את מסמכי החובה הדרושים לכל שלב.</li>
                                    </ol>
                                </div>

                                {/* Step 2 */}
                                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16}/> העלאת מסמכים והורדת תבניות (Gating & Templates)</h4>
                                    <ul style={{ margin: 0, paddingRight: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        <li>לחץ על ליד כדי לפתוח את <strong>חלון פרטי הליד המורחב</strong>, ועבור ללשונית <strong>"מסמכים וקבצים"</strong>.</li>
                                        <li>במידה ועדיין אין לך מסמך מוכן, לחץ על <strong>"הורד תבנית שבלונה"</strong> מתחת לסוג המסמך הדרוש (הצעת מחיר, NDA וכו') ותקבל קובץ Markdown מוכן למילוי.</li>
                                        <li>גרור את הקובץ המוכן אל תיבת ה-Drag-and-Drop או לחץ עליה לבחירה ידנית. הקובץ יועלה מאובטחת ל-Supabase.</li>
                                        <li>כעת החסימה הוסרה ותוכל לקדם את הליד לסטטוסים הבאים בקנבן או להעביר את האוטומציה שלו למצב פעיל.</li>
                                    </ul>
                                </div>

                                {/* Step 3 */}
                                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                    <h4 style={{ color: '#a78bfa', margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={16}/> הגדרות מפתחות וחיבורים (Gemini & N8N Webhook)</h4>
                                    <ol style={{ margin: 0, paddingRight: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        <li>נווט אל דף <strong>"הגדרות חיבור"</strong> בסרגל הצד.</li>
                                        <li>תחת פאנל <strong>"הגדרות Gemini AI"</strong>, הזן את מפתח ה-API שלך ולחץ על <strong>"בדוק מפתח"</strong> כדי לאשר את תקינותו. המפתח נשמר מקומית בדפדפן שלך ולא מועלה לענן.</li>
                                        <li>תחת פאנל <strong>"הגדרות שרת N8N"</strong>, הזן את הכתובת של שרת ה-N8N שלך (למשל <code>http://localhost:5678</code>) ואת מפתח ה-API של N8N, ולחץ על <strong>"בדוק חיבור"</strong>. חיבור זה מאפשר ל-AI למשוך את ה-workflows שלך בזמן אמת לניתוח השגיאות.</li>
                                    </ol>
                                </div>

                                {/* Step 4 */}
                                <div style={{ paddingBottom: '8px' }}>
                                    <h4 style={{ color: '#ef4444', margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16}/> מעקב תקלות, באגים ודיאגנוסטיקה</h4>
                                    <ul style={{ margin: 0, paddingRight: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        <li>אם אוטומציה מדווחת על שגיאה (Error) או שיעור ההצלחה שלה ירד, נווט ללשונית <strong>"לוג ריצות"</strong> באוטומציה שלה.</li>
                                        <li>השתמש בסרגל הסינונים כדי למקד את הריצות: חפש שגיאות, סנן לפי זמנים (היום, 24 שעות), או מצא ריצות איטיות.</li>
                                        <li>לחץ על הריצה שנכשלה. המערכת תספק פענוח מקומי קצר.</li>
                                        <li>לחץ על כפתור <strong>"דיאגנוסטיקת AI (Gemini)"</strong>. המערכת תתחבר לשרת N8N, תמשוך את שלבי האוטומציה ותספק לך ניתוח מעמיק והוראות מדויקות לתיקון התקלה בעברית פשוטה.</li>
                                        <li>אם התקלה דורשת פיתוח, לחץ על לשונית <strong>"תפעול ואפיון"</strong>, והוסף באג חדש תחת פאנל הבאגים כדי שהצוות הטכנולוגי יקבל התראה.</li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// Small helper UI components to replace standard icons
function PlusCircle({ size, style }) {
    return <span style={{ ...style, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>➕</span>;
}
