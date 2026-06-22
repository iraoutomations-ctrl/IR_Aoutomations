/* ==========================================================================
   autoRI-studio CRM - Database Monitor Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Database, 
    HardDrive, 
    RefreshCw, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Play, 
    Settings as SettingsIcon,
    Copy,
    CheckCircle,
    Terminal,
    Info,
    ArrowLeftRight
} from 'lucide-react';
import { isSupabaseConfigured, db } from '../services/db';

export default function DatabaseMonitor() {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [cronJobs, setCronJobs] = useState([]);
    const [error, setError] = useState(null);
    const [rollupLoading, setRollupLoading] = useState(false);
    const [rollupMessage, setRollupMessage] = useState(null);
    const [copiedText, setCopiedText] = useState(false);

    // Load data from database
    const loadDbData = async () => {
        if (!isSupabaseConfigured) return;
        setLoading(true);
        setError(null);
        try {
            const dbMetrics = await db.getDatabaseMetrics();
            setMetrics(dbMetrics);

            const jobs = await db.getCronJobsStatus();
            setCronJobs(jobs);
        } catch (err) {
            console.error("Error loading database metrics:", err);
            setError(err.message || "שגיאה בטעינת נתוני בסיס הנתונים");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDbData();
    }, []);

    // Format bytes to human readable format (MB/KB)
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Calculate database usage percentage (assuming 500MB free limit)
    const FREE_LIMIT_BYTES = 500 * 1024 * 1024; // 500MB
    const getUsagePercentage = () => {
        if (!metrics || !metrics.db_size_bytes) return 0;
        return Math.min(100, (metrics.db_size_bytes / FREE_LIMIT_BYTES) * 100);
    };

    // Trigger manual rollup process
    const handleManualRollup = async () => {
        setRollupLoading(true);
        setRollupMessage(null);
        try {
            await db.triggerManualRollup();
            setRollupMessage({ type: 'success', text: 'משימת הניקוי והארכוב הופעלה והסתיימה בהצלחה!' });
            // Reload data to reflect decreased database size and updated statistics
            await loadDbData();
        } catch (err) {
            console.error("Manual rollup failed:", err);
            setRollupMessage({ type: 'error', text: `שגיאה בהפעלת משימת הניקוי: ${err.message}` });
        } finally {
            setRollupLoading(false);
        }
    };

    // Copy SQL script helper
    const sqlSetupCode = `-- סקריפט SQL ליצירת פונקציות הניטור ב-Supabase SQL Editor:
CREATE OR REPLACE FUNCTION get_supabase_db_metrics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_db_size BIGINT;
    v_tables JSONB;
BEGIN
    SELECT pg_database_size(current_database()) INTO v_db_size;
    SELECT json_agg(json_build_object(
        'table_name', t.table_name,
        'row_count', (SELECT COALESCE(n_live_tup, 0) FROM pg_stat_user_tables WHERE relname = t.table_name LIMIT 1),
        'size_bytes', pg_total_relation_size(quote_ident(t.table_name))
    ))::JSONB INTO v_tables
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE';
    RETURN jsonb_build_object('db_size_bytes', v_db_size, 'tables', COALESCE(v_tables, '[]'::jsonb));
END; $$;

CREATE OR REPLACE FUNCTION get_supabase_cron_jobs_status()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_cron_jobs JSONB;
BEGIN
    BEGIN
        SELECT json_agg(json_build_object(
            'jobid', j.jobid, 'jobname', j.jobname, 'schedule', j.schedule, 'active', j.active,
            'last_run_status', (SELECT status FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1),
            'last_run_time', (SELECT start_time FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1),
            'last_run_message', (SELECT return_message FROM cron.job_run_details WHERE jobid = j.jobid ORDER BY start_time DESC LIMIT 1)
        ))::JSONB INTO v_cron_jobs FROM cron.job j;
    EXCEPTION WHEN OTHERS THEN v_cron_jobs := '[]'::jsonb; END;
    RETURN COALESCE(v_cron_jobs, '[]'::jsonb);
END; $$;`;

    const copySqlToClipboard = () => {
        navigator.clipboard.writeText(sqlSetupCode);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    };

    // --------------------------------------------------
    // RENDER: Offline State / Mock Warning
    // --------------------------------------------------
    if (!isSupabaseConfigured) {
        return (
            <div style={{ direction: 'rtl', padding: '24px' }}>
                <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', textAlign: 'center', maxWidth: '600px', margin: '60px auto' }}>
                    <Database size={48} style={{ color: '#8b5cf6', marginBottom: '16px', opacity: 0.8 }} />
                    <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '12px', fontWeight: '700' }}>
                        ניטור בסיס נתונים (Supabase)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                        רכיב הניטור זמין אך ורק כאשר המערכת מחוברת לענן Supabase פעיל.
                        כעת המערכת פועלת במצב אופליין (Mock) המדמה את הפעולות ב-LocalStorage של הדפדפן.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button 
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <RefreshCw size={16} />
                            בדוק חיבור מחדש
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const usagePct = getUsagePercentage();
    const isWarning = usagePct >= 70 && usagePct < 85;
    const isCritical = usagePct >= 85;
    const sizeColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

    return (
        <div style={{ direction: 'rtl', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-light)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Database style={{ color: '#8b5cf6' }} size={24} />
                        ניטור בסיס נתונים (Supabase Cloud)
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        ניהול שטח אחסון, סטטיסטיקות טבלאות ומעקב משימות אגרגציה מתוזמנות (Cron).
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        padding: '4px 10px', 
                        background: 'rgba(16, 185, 129, 0.08)', 
                        border: '1px solid rgba(16, 185, 129, 0.2)', 
                        borderRadius: '20px', 
                        color: '#10b981' 
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                        Supabase מחובר
                    </span>
                    <button 
                        className="btn btn-secondary" 
                        onClick={loadDbData} 
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
                    >
                        <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
                        רענן
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        border: '3px solid rgba(139, 92, 246, 0.1)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>טוען מדדי בסיס נתונים...</p>
                </div>
            ) : error ? (
                /* Error card with Copyable SQL Setup instructions */
                <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <AlertTriangle style={{ color: '#ef4444', flexShrink: 0 }} size={24} />
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fca5a5', margin: '0 0 6px 0' }}>פונקציות הניטור אינן מותקנות ב-Supabase</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                                לא הצלחנו לקרוא את מדדי ה-Database. ייתכן שפונקציות ה-RPC הנדרשות לא הותקנו עדיין ב-SQL Editor של Supabase.
                                אנא הרץ את הקוד הבא ב-Supabase SQL Editor על מנת לאפשר גישת ניטור מוגנת מהפרונטאנד:
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181824', padding: '8px 12px', borderRadius: '6px 6px 0 0', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Terminal size={12} /> SQL Script
                            </span>
                            <button 
                                onClick={copySqlToClipboard}
                                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}
                            >
                                {copiedText ? <CheckCircle size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                {copiedText ? 'הועתק!' : 'העתק קוד'}
                            </button>
                        </div>
                        <pre style={{ margin: 0, padding: '12px', background: '#0e0e16', borderRadius: '0 0 6px 6px', border: '1px solid var(--border-color)', overflowX: 'auto', fontSize: '11.5px', color: '#cbd5e1', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', maxHeight: '200px' }}>
                            {sqlSetupCode}
                        </pre>
                    </div>
                </div>
            ) : (
                /* Primary Panels Grid */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        
                        {/* LEFT COLUMN: Storage Gauge */}
                        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HardDrive size={16} style={{ color: '#8b5cf6' }} />
                                    ניצול נפח אחסון (Free Tier)
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0 24px 0' }}>
                                    {/* Circular Progress Indicator */}
                                    <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                                            <circle 
                                                cx="60" 
                                                cy="60" 
                                                r="50" 
                                                fill="transparent" 
                                                stroke={sizeColor} 
                                                strokeWidth="8" 
                                                strokeDasharray={2 * Math.PI * 50} 
                                                strokeDashoffset={2 * Math.PI * 50 * (1 - usagePct / 100)} 
                                                strokeLinecap="round" 
                                                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                                            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-light)' }}>
                                                {usagePct.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                        <p style={{ color: 'var(--text-light)', fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>
                                            {metrics ? formatBytes(metrics.db_size_bytes) : '0 MB'} בשימוש
                                        </p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: 0 }}>
                                            מתוך חבילה חינמית של 500.0 MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status warning alerts */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12.5px' }}>
                                {isCritical ? (
                                    <div style={{ display: 'flex', gap: '8px', color: '#ef4444', fontWeight: '500' }}>
                                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                        <span>קריטי! נפח בסיס הנתונים מעל 85%. קיימת סכנת נעילת המערכת לכתיבה. יש לבצע ניקוי מיידי.</span>
                                    </div>
                                ) : isWarning ? (
                                    <div style={{ display: 'flex', gap: '8px', color: '#f59e0b', fontWeight: '500' }}>
                                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                                        <span>אזהרה: נפח בסיס הנתונים חצה את ה-70%. מומלץ לוודא שמשימות הניקוי הליליות רצות כסדרן.</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px', color: '#10b981', fontWeight: '500' }}>
                                        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                                        <span>סטטוס תקין. הנפח מנוהל היטב ומנגנון הניקוי פועל בטווח הבטוח.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: User Tables Statistics */}
                        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowLeftRight size={16} style={{ color: '#8b5cf6' }} />
                                סטטיסטיקת טבלאות
                            </h3>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                            <th style={{ padding: '10px 8px', fontWeight: '600' }}>שם הטבלה</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center' }}>מספר שורות</th>
                                            <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'left' }}>גודל פיזי כולל</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics && metrics.tables && metrics.tables.length > 0 ? (
                                            metrics.tables
                                                .sort((a, b) => b.size_bytes - a.size_bytes)
                                                .map((table, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row-hover">
                                                        <td style={{ padding: '10px 8px', fontWeight: '500', color: 'var(--text-light)' }}>
                                                            <code>{table.table_name}</code>
                                                        </td>
                                                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                                            {table.row_count.toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'left' }}>
                                                            {formatBytes(table.size_bytes)}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                                    לא נמצאו טבלאות ציבוריות
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* BOTTOM SECTION: pg_cron Jobs Status */}
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} style={{ color: '#8b5cf6' }} />
                                משימות מתוזמנות במסד הנתונים (pg_cron)
                            </h3>
                            
                            <button
                                className="btn btn-primary"
                                onClick={handleManualRollup}
                                disabled={rollupLoading}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', padding: '6px 12px' }}
                            >
                                <Play size={12} />
                                הפעל ניקוי וארכוב ידנית
                            </button>
                        </div>

                        {rollupMessage && (
                            <div style={{ 
                                padding: '12px', 
                                borderRadius: '6px', 
                                marginBottom: '16px', 
                                fontSize: '13px',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                background: rollupMessage.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                border: `1px solid ${rollupMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                color: rollupMessage.type === 'success' ? '#10b981' : '#ef4444'
                            }}>
                                {rollupMessage.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                <span>{rollupMessage.text}</span>
                            </div>
                        )}

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '10px 8px', fontWeight: '600' }}>מזהה משימה</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600' }}>שם המשימה</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center' }}>תזמון (Cron)</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center' }}>סטטוס ריצה אחרונה</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'center' }}>זמן ריצה אחרונה</th>
                                        <th style={{ padding: '10px 8px', fontWeight: '600', textAlign: 'left' }}>הודעת פלט / שגיאה</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cronJobs && cronJobs.length > 0 ? (
                                        cronJobs.map((job, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>#{job.jobid}</td>
                                                <td style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text-light)' }}>{job.jobname}</td>
                                                <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                                    <code>{job.schedule}</code>
                                                </td>
                                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    {job.last_run_status === 'succeeded' ? (
                                                        <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                                            הושלם בהצלחה
                                                        </span>
                                                    ) : job.last_run_status === 'failed' ? (
                                                        <span style={{ padding: '2px 8px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                                            נכשל
                                                        </span>
                                                    ) : (
                                                        <span style={{ padding: '2px 8px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', fontSize: '11px' }}>
                                                            לא הורץ לאחרונה
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                                    {job.last_run_time ? (
                                                        new Date(job.last_run_time).toLocaleString('he-IL')
                                                    ) : '-'}
                                                </td>
                                                <td style={{ padding: '12px 8px', color: job.last_run_status === 'failed' ? '#ef4444' : 'var(--text-muted)', textAlign: 'left', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.last_run_message}>
                                                    {job.last_run_message || 'אין פלט'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px' }}>
                                                    <Info size={20} style={{ color: 'var(--text-muted)' }} />
                                                    <span>לא נמצאו משימות מתוזמנות פעילות ב-pg_cron.</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        יש לוודא שהפעלת את ה-extension pg_cron בשרת ה-PostgreSQL שלך.
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .spin-animation {
                    animation: spin 1.2s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .table-row-hover:hover {
                    background: rgba(255, 255, 255, 0.02) !important;
                }
            `}</style>
        </div>
    );
}
