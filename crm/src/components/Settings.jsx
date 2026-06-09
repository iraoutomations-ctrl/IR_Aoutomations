/* ==========================================================================
   autoRI-studio CRM - Settings & Supabase Setup Component
   ========================================================================== */
import React, { useState } from 'react';
import { 
    Database, 
    Copy, 
    Check, 
    ExternalLink, 
    Terminal, 
    Info
} from 'lucide-react';

const SQL_SCRIPT = `-- 1. יצירת טבלת לידים (leads)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    source TEXT,
    status TEXT DEFAULT 'new'::text,
    priority TEXT DEFAULT 'medium'::text,
    survey_data JSONB,
    chatbot_session JSONB,
    notes TEXT
);

-- 2. יצירת טבלת משימות (tasks) עם מחיקה משורשרת (CASCADE)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. יצירת טבלת הערות (notes) עם מחיקה משורשרת
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    content TEXT NOT NULL
);

-- 4. פתיחת הרשאות גישה לטבלאות (לצרכי חיבור קל בדף נחיתה)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON leads FOR DELETE USING (true);

CREATE POLICY "Allow public access for tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow public access for notes" ON notes FOR ALL USING (true);
`;

export default function Settings() {
    const [copied, setCopied] = useState(false);
    
    // Read from environment variables if present
    const envUrl = import.meta.env?.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

    const handleCopySQL = () => {
        navigator.clipboard.writeText(SQL_SCRIPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <header style={{ marginBottom: '24px' }}>
                <h1>הגדרות חיבור למסד הנתונים</h1>
                <p>כאן תוכל ללמוד כיצד לחבר את ה-CRM למסד נתונים חי בענן Supabase לצורך סנכרון מלא עם דף הנחיתה שלכם.</p>
            </header>

            {/* Current Connection Status */}
            <div className="glass-card" style={{ marginBottom: '24px', borderRight: '4px solid #8b5cf6' }}>
                <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={18} style={{ color: '#8b5cf6' }} />
                    סטטוס החיבור הנוכחי במערכת
                </h3>
                
                {envUrl && envKey ? (
                    <div style={{ marginTop: '12px' }}>
                        <p style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-dot online"></span>
                            מחובר לענן Supabase!
                        </p>
                        <p style={{ fontSize: '13px', marginTop: '6px' }}>
                            המערכת טוענת וכותבת נתונים ישירות מהפרויקט שלך בענן: <code style={{ color: '#06b6d4', direction: 'ltr', display: 'inline-block' }}>{envUrl}</code>
                        </p>
                    </div>
                ) : (
                    <div style={{ marginTop: '12px' }}>
                        <p style={{ color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="status-dot offline"></span>
                            מצב אופליין (Mock Database) פעיל
                        </p>
                        <p style={{ fontSize: '13px', marginTop: '6px' }}>
                            לא נמצאו מפתחות חיבור בקובץ הסביבה. המערכת שומרת ומציגה נתונים מקומית בדפדפן זה (LocalStorage).
                            ניתן לחבר את המערכת לענן בכל עת על ידי הגדרת משתני סביבה.
                        </p>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="glass-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Database size={18} className="text-violet" style={{ color: '#8b5cf6' }} />
                    מדריך שלב אחר שלב לחיבור Supabase
                </h3>

                <ol style={{ paddingRight: '20px', color: 'var(--text-secondary)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li>
                        <strong>צור פרויקט ב-Supabase:</strong> היכנס ל-
                        <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', textDecoration: 'underline', inlineFlex: 'true', alignItems: 'center', gap: '4px' }}>
                            Supabase.com <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </a>
                        , פתח חשבון חינם וצור פרויקט חדש (למשל: <code>autoRI-CRM</code>).
                    </li>
                    <li>
                        <strong>צור את טבלאות מסד הנתונים:</strong> היכנס ל-<strong>SQL Editor</strong> בתפריט הצידי של Supabase, לחץ על <strong>New Query</strong>, העתק את סקריפט ה-SQL שמופיע למטה, הדבק אותו שם ולחץ על <strong>Run</strong>.
                    </li>
                    <li>
                        <strong>הגדרת משתני סביבה בפרויקט:</strong>
                        <p style={{ marginTop: '6px' }}>
                            צור קובץ בשם <code>.env</code> בתיקיית <code>crm/</code> הראשי של הפרויקט, והוסף לתוכו את השורות הבאות עם המפתחות שקיבלת מתוך הגדרות הפרויקט (Project Settings {"->"} API) ב-Supabase:
                        </p>
                        <pre style={{ background: '#191c29', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', color: '#06b6d4', direction: 'ltr', textAlign: 'left', marginTop: '8px', fontSize: '12px' }}>
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here`}
                        </pre>
                    </li>
                    <li>
                        <strong>הפעל מחדש את שרת הפיתוח:</strong> הרץ מחדש את הפקודה <code>npm run dev</code> כדי שהמפתחות ייקלטו במערכת.
                    </li>
                </ol>
            </div>

            {/* SQL Script Box */}
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0' }}>
                        <Terminal size={18} style={{ color: '#06b6d4' }} />
                        סקריפט SQL להקמת הטבלאות
                    </h3>
                    <button className="btn btn-secondary" onClick={handleCopySQL} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {copied ? (
                            <>
                                <Check size={14} style={{ color: '#10b981' }} />
                                <span>הועתק!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                <span>העתק קוד SQL</span>
                            </>
                        )}
                    </button>
                </div>
                
                <pre style={{ 
                    background: '#191c29', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)', 
                    color: '#f3f4f6', 
                    direction: 'ltr', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    fontFamily: 'monospace' 
                }}>
                    {SQL_SCRIPT}
                </pre>
            </div>
        </div>
    );
}
