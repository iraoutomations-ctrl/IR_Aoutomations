/* ==========================================================================
   autoRI-studio CRM - Projects & Automations Dashboard Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Wrench, 
    DollarSign, 
    TrendingUp, 
    Bug, 
    Calendar, 
    Eye, 
    Search,
    ExternalLink,
    PlayCircle,
    Cpu,
    Clock,
    X,
    Lock,
    Play,
    CheckCircle2,
    AlertCircle,
    Info,
    Brain,
    Sparkles,
    Check,
    Trash2
} from 'lucide-react';
import { db } from '../services/db';

const parseWorkflows = (workflowsData) => {
    if (!workflowsData) return [];
    if (Array.isArray(workflowsData)) return workflowsData;
    if (typeof workflowsData === 'string') {
        const trimmed = workflowsData.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') return [parsed];
        } catch (e) {
            // Not JSON
        }
        return trimmed.split(',').map(item => {
            const clean = item.trim();
            return { id: clean, name: clean };
        }).filter(w => w.id);
    }
    return [];
};

const WORKFLOW_DESCRIPTIONS = {
    'lyCrWBmsGlRSMJmo': {
        name: "בוט מענה ללידים (IR AI Bot)",
        description: "מנהל שיחות עם לידים ומאפיין את העסק שלהם, מציע פתרונות אוטומציה ומנסה לקבוע פגישה טלפונית.",
        nodes: [
            { name: "Webhook1", type: "Webhook", desc: "מאזין להודעות נכנסות מהצ'אט בפרונט" },
            { name: "Set1", type: "Set", desc: "מגדיר משתני שיחה ראשוניים" },
            { name: "HTTP Request", type: "HTTP Request (Gemini API)", desc: "שולח את השיחה וההנחיות ל-Gemini Flash לקבלת מענה וצ'יפים" },
            { name: "If Gemini Failed?", type: "If", desc: "בודק האם הפנייה ל-Gemini נכשלה" },
            { name: "HTTP Request (ChatGPT Fallback)", type: "HTTP Request (OpenAI API)", desc: "גיבוי לפניה ל-ChatGPT במידה וג'מיני נכשל" },
            { name: "Respond to Webhook1", type: "Respond to Webhook", desc: "מחזיר את התשובה והצ'יפים לדפדפן של המשתמש בזמן אמת" },
            { name: "Log Success (Gemini Flash)", type: "HTTP Request (Supabase)", desc: "רושם ב-system_alerts הצלחה של הריצה ב-Gemini Flash" },
            { name: "Log Warning (Gemini Pro)", type: "HTTP Request (Supabase)", desc: "רושם ב-system_alerts אזהרה במידה והשתמשנו בגיבוי" },
            { name: "Log to Supabase1", type: "HTTP Request (Supabase)", desc: "רושם ב-system_alerts שגיאה כללית במידה והריצה כולה כשלה" }
        ],
        connections: "Webhook1 -> Set1 -> HTTP Request -> If Gemini Failed? -> (True: Respond to Webhook1 -> Log Success) / (False: HTTP Request (ChatGPT Fallback) -> Respond to Webhook1 -> Log Warning)"
    },
    'bRNz7Lq79wYJ5Dvo': {
        name: "בדיקת תקינות מערכת (autoRI - Chatbot Error Monitor)",
        description: "מנטר שגיאות בבוט הראשי ובאתר. מופעל אוטומטית כאשר כל צומת בבוט הראשי נכשל.",
        nodes: [
            { name: "Error Trigger", type: "Error Trigger", desc: "מופעל אוטומטית על כל שגיאת ריצה בבוט הראשי" },
            { name: "Send a message", type: "Gmail", desc: "שולח התראת מייל מיידית עם פרטי השגיאה לכתובת iraoutomations@gmail.com" },
            { name: "Log to Supabase", type: "HTTP Request (Supabase)", desc: "רושם שגיאת ריצה מפורטת בטבלת system_alerts ב-Supabase" }
        ],
        connections: "Error Trigger -> (Send a message & Log to Supabase במקביל)"
    }
};

const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*?)$/gm, '<h4 style="color:var(--text-light);margin-top:12px;margin-bottom:6px;font-size:12px;font-weight:600;">$1</h4>')
        .replace(/^## (.*?)$/gm, '<h3 style="color:var(--accent-cyan);margin-top:16px;margin-bottom:8px;font-size:13px;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:4px;">$1</h3>')
        .replace(/^# (.*?)$/gm, '<h2 style="color:var(--text-light);margin-top:20px;margin-bottom:10px;font-size:15px;font-weight:700;">$1</h2>')
        .replace(/^\s*[\*\-]\s+(.*?)$/gm, '<li style="margin-right:20px;margin-bottom:4px;list-style-type:disc;color:var(--text-secondary);">$1</li>')
        .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.05);padding:2px 4px;border-radius:3px;font-family:monospace;font-size:11px;color:var(--accent-cyan);">$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.2);padding:10px;border-radius:4px;overflow-x:auto;font-family:monospace;font-size:11px;color:var(--text-light);border:1px solid var(--border-color);margin:8px 0;"><code>$1</code></pre>')
        .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:12px 0;" />')
        .replace(/\n\n/g, '</p><p style="margin-bottom:8px;line-height:1.5;">')
        .replace(/\n/g, '<br/>')
        .replace(/<br\/>\s*<li/g, '<li')
        .replace(/<\/li>\s*<br\/>/g, '</li>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--accent-cyan);text-decoration:underline;cursor:pointer;">$1</a>');
        
    return `<div style="line-height:1.5;font-size:11.5px;color:var(--text-secondary);"><p style="margin-bottom:8px;line-height:1.5;">${html}</p></div>`;
};

const formatDuration = (ms) => {
    if (ms === null || ms === undefined || ms <= 0) return '0ms';
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const sec = Math.floor(ms / 1000);
    const msec = ms % 1000;
    const msecStr = msec.toString().padStart(3, '0');
    if (ms < 60000) {
        return `${sec}.${msecStr}s`;
    }
    const min = Math.floor(ms / 60000);
    const remainingSec = sec % 60;
    if (ms < 3600000) {
        return `${min}m ${remainingSec}.${msecStr}s`;
    }
    const hr = Math.floor(ms / 3600000);
    const remainingMin = min % 60;
    return `${hr}h ${remainingMin}m ${remainingSec}.${msecStr}s`;
};

export default function Projects({ onSelectLead, activeTab }) {
    const [projects, setProjects] = useState([]);
    const [automations, setAutomations] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedAutos, setExpandedAutos] = useState({});
    const [systemAlerts, setSystemAlerts] = useState([]);

    // Additional dashboard/runs states
    const [autoRuns, setAutoRuns] = useState({});
    const [activeAutoTabs, setActiveAutoTabs] = useState({});
    const [logStatusFilter, setLogStatusFilter] = useState({});
    const [logTimeFilter, setLogTimeFilter] = useState({});
    const [logSearchFilter, setLogSearchFilter] = useState({});
    const [logDurationFilter, setLogDurationFilter] = useState({});
    const [expandedRun, setExpandedRun] = useState({});
    const [analyzingRun, setAnalyzingRun] = useState({});
    const [aiAnalysisText, setAiAnalysisText] = useState({});
    
    // Mapped by autoId for inline bugs reporting
    const [newBugDesc, setNewBugDesc] = useState({});
    const [newBugSev, setNewBugSev] = useState({});

    // Inline workflow input states
    const [wfNameInput, setWfNameInput] = useState({});
    const [wfIdInput, setWfIdInput] = useState({});

    // Add workflow to JSONB workflows list
    const handleAddWorkflow = async (autoId) => {
        const name = wfNameInput[autoId]?.trim();
        const id = wfIdInput[autoId]?.trim();
        if (!name || !id) return;

        const auto = automations.find(a => a.id === autoId);
        if (!auto) return;

        const workflows = [...parseWorkflows(auto.n8n_workflows)];
        if (workflows.some(w => w.id === id)) {
            alert('Workflow עם מזהה זה כבר קיים באוטומציה זו.');
            return;
        }

        workflows.push({ id, name });

        try {
            const updated = await db.updateAutomation(autoId, { 
                n8n_workflows: workflows,
                n8n_workflow_id: workflows.map(w => w.id).join(', ')
            });
            setAutomations(prev => prev.map(a => a.id === autoId ? updated : a));
            setWfNameInput(prev => ({ ...prev, [autoId]: '' }));
            setWfIdInput(prev => ({ ...prev, [autoId]: '' }));
        } catch (err) {
            console.error("Error adding workflow:", err);
        }
    };

    // Delete workflow from JSONB workflows list
    const handleDeleteWorkflow = async (autoId, wfId) => {
        const auto = automations.find(a => a.id === autoId);
        if (!auto) return;

        const workflows = parseWorkflows(auto.n8n_workflows).filter(w => w.id !== wfId);

        try {
            const updated = await db.updateAutomation(autoId, { 
                n8n_workflows: workflows,
                n8n_workflow_id: workflows.map(w => w.id).join(', ')
            });
            setAutomations(prev => prev.map(a => a.id === autoId ? updated : a));
        } catch (err) {
            console.error("Error deleting workflow:", err);
        }
    };

    const handleUpdateBugStatus = async (bugId, status) => {
        try {
            const updated = await db.updateBug(bugId, { status });
            setBugs(prev => prev.map(b => b.id === bugId ? updated : b));
        } catch (err) {
            console.error("Error updating bug status:", err);
            alert("שגיאה בעדכון סטטוס באג: " + (err.message || err));
        }
    };

    const handleDeleteBug = async (bugId) => {
        if (window.confirm("האם למחוק באג זה?")) {
            try {
                await db.deleteBug(bugId);
                setBugs(prev => prev.filter(b => b.id !== bugId));
            } catch (err) {
                console.error("Error deleting bug:", err);
                alert("שגיאה במחיקת באג: " + (err.message || err));
            }
        }
    };

    const handleAddBug = async (e, autoId) => {
        e.preventDefault();
        const desc = newBugDesc[autoId];
        const sev = newBugSev[autoId] || 'medium';
        if (!desc || !desc.trim()) return;

        try {
            const added = await db.addBug({
                automation_id: autoId,
                description: desc,
                severity: sev,
                status: 'open'
            });
            setBugs(prev => [...prev, added]);
            setNewBugDesc(prev => ({ ...prev, [autoId]: '' }));
        } catch (err) {
            console.error("Error adding bug:", err);
            alert("שגיאה בדיווח על באג: " + (err.message || err));
        }
    };

    // Toggle expand automation row & load runs
    const handleToggleExpandAuto = async (autoId) => {
        const isExpanding = !expandedAutos[autoId];
        setExpandedAutos(prev => ({ ...prev, [autoId]: isExpanding }));
        
        if (isExpanding) {
            try {
                const runsData = await db.getAutomationRuns(autoId);
                setAutoRuns(prev => ({ ...prev, [autoId]: runsData }));
            } catch (err) {
                console.error("Error fetching runs:", err);
            }
        }
    };

    const handleToggleRun = (runId) => {
        setExpandedRun(prev => ({ ...prev, [runId]: !prev[runId] }));
    };

    // Live AI Analysis via Gemini API
    const analyzeErrorWithGemini = async (run, autoName) => {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) return 'אנא הגדר מפתח API של Gemini בהגדרות ה-CRM כדי להשתמש בניתוח חי.';
        
        let workflowInfo = '';
        const n8nUrl = localStorage.getItem('n8n_url');
        const n8nApiKey = localStorage.getItem('n8n_api_key');
        
        if (run.n8n_workflow_id) {
            let wfData = null;
            if (n8nUrl && n8nApiKey) {
                try {
                    const cleanUrl = n8nUrl.replace(/\/$/, '');
                    let fetchUrl = `${cleanUrl}/api/v1/workflows/${run.n8n_workflow_id}`;
                    if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
                        fetchUrl = `/api-n8n/api/v1/workflows/${run.n8n_workflow_id}`;
                    }
                    const response = await fetch(fetchUrl, {
                        headers: {
                            'X-N8N-API-KEY': n8nApiKey
                        }
                    });
                    if (response.ok) {
                        wfData = await response.json();
                        console.log("Successfully fetched workflow structure from N8N:", wfData);
                    }
                } catch (e) {
                    console.warn("Failed to fetch workflow dynamically from N8N (falling back to registry):", e);
                }
            }
            
            if (wfData) {
                workflowInfo = `
הנה המבנה המלא והעדכני של ה-Workflow כפי שנשלף ישירות מ-N8N:
שם ה-Workflow: ${wfData.name || 'לא ידוע'}
מצב פעיל: ${wfData.active ? 'כן' : 'לא'}
רשימת הצמתים (Nodes):
${Array.isArray(wfData.nodes) ? wfData.nodes.map(n => `- צומת בשם "${n.name}" מסוג "${n.type}" (גרסה: ${n.typeVersion || 1})`).join('\n') : 'אין מידע על צמתים'}
זרימת הנתונים והחיבורים (Connections):
${wfData.connections ? JSON.stringify(wfData.connections) : 'אין מידע על חיבורים'}
`;
            } else if (WORKFLOW_DESCRIPTIONS[run.n8n_workflow_id]) {
                const wf = WORKFLOW_DESCRIPTIONS[run.n8n_workflow_id];
                workflowInfo = `
הנה המבנה המלא של ה-Workflow ב-N8N שבו אירעה השגיאה (מתוך מאגר ה-CRM):
שם ה-Workflow: ${wf.name}
תיאור: ${wf.description}
רשימת הצמתים (Nodes):
${wf.nodes.map(n => `- צומת בשם "${n.name}" מסוג "${n.type}" (תפקידו: ${n.desc})`).join('\n')}
זרימת הנתונים והחיבורים (Connections):
${wf.connections}
`;
            }
        }
        
        const prompt = `אתה מהנדס אינטגרציות ואוטומציות בכיר. 
יש לנו אוטומציה בשם "${autoName}" שרצה ב-N8N. 
הריצה נכשלה עם השגיאות הבאות:
סוג שגיאה: ${run.error_type || 'לא ידוע'}
הודעת שגיאה: ${run.details?.error_message || 'לא ידוע'}
פרטי ריצה (JSON): ${JSON.stringify(run.details || {})}
${workflowInfo ? `\n${workflowInfo}` : ''}

אנא תן הסבר מעמיק, מקצועי וידידותי מאוד בעברית הכולל:
1. מהי מהות השגיאה בשפה פשוטה.
2. מהם הגורמים האפשריים לתקלה זו ב-N8N (למשל אילו קוביות/הגדרות חשודות, בהתבסס על מבנה ה-Workflow שסופק לעיל).
3. פתרון מפורט שלב אחר שלב בעברית כולל המלצות קונקרטיות לתיקון ב-N8N.

כתוב את התשובה בפורמט Markdown קצר וקולע.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`שגיאה בפנייה ל-Gemini API: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'לא התקבלה תשובה מ-Gemini.';
        } catch (err) {
            console.error(err);
            return `שגיאה בניתוח ה-AI: ${err.message}`;
        }
    };

    const handleAiAnalyze = async (run, autoName) => {
        setAnalyzingRun(prev => ({ ...prev, [run.id]: true }));
        const analysis = await analyzeErrorWithGemini(run, autoName);
        setAiAnalysisText(prev => ({ ...prev, [run.id]: analysis }));
        setAnalyzingRun(prev => ({ ...prev, [run.id]: false }));
        
        try {
            await db.updateAutomationRun(run.id, { ai_analysis: analysis });
        } catch (err) {
            console.error("Error saving AI analysis:", err);
        }
    };

    // Offline rule-based diagnostics parser
    const getOfflineDiagnostics = (run) => {
        if (!run) {
            return {
                title: 'אין מידע על הריצה',
                desc: 'לא נמצא מידע תואם עבור ריצה זו.',
                steps: []
            };
        }
        if (run.status === 'success') {
            return {
                title: 'הריצה הושלמה בהצלחה',
                desc: 'כל הפעולות בוצעו בצורה תקינה. המידע הועבר בהצלחה ויעד השלבים הושלם ללא שגיאות.',
                steps: ['אין צורך בפעולה.']
            };
        }
        
        let errType = '';
        if (run.error_type) {
            errType = typeof run.error_type === 'object' ? JSON.stringify(run.error_type) : String(run.error_type);
        }
        
        let errMessage = '';
        if (run.details) {
            const rawMsg = run.details.error_message || run.details.warning_message || '';
            errMessage = typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : String(rawMsg);
        }
        
        const errTypeLower = errType.toLowerCase();
        const errMessageLower = errMessage.toLowerCase();
        
        if (errTypeLower.includes('auth') || errMessageLower.includes('credential') || errMessageLower.includes('auth') || errMessageLower.includes('token')) {
            return {
                title: 'בעיית הרשאות או התחברות (Authentication Failure)',
                desc: 'שרת היעד דחה את הבקשה עקב תוקף פגור או חוסר הרשאות בחיבור ה-API.',
                steps: [
                    'היכנס לחשבון ה-N8N שלך.',
                    'עבור לתפריט Credentials וחפש את החיבור הרלוונטי.',
                    'לחץ על Reconnect או הזן מחדש את מפתח ה-API / סיסמה.',
                    'וודא שהרשאות הגישה בחשבון גוגל/פייסבוק שלך לא בוטלו.'
                ]
            };
        }
        
        if (errTypeLower.includes('json') || errMessageLower.includes('json') || errMessageLower.includes('invalid json') || errMessageLower.includes('syntaxerror')) {
            return {
                title: 'שגיאת פורמט JSON (JSON Parsing Error)',
                desc: 'גוף הבקשה או המידע שרכיב ה-HTTP Request של N8N ניסה לשלוח אינו במבנה JSON תקין (בד"כ עקב תו פגום או חוסר בגרשיים/פסיקים).',
                steps: [
                    'בדוק את קוביית ה-HTTP Request ב-N8N.',
                    'וודא שכל שדות ה-JSON עטופים בגרשיים כפולים (") ואין גרשיים מיותרים בערכים הדינמיים.',
                    'מומלץ להשתמש בביטוי כגון {{ JSON.stringify(...) }} כדי לקודד את הערכים בצורה בטוחה.',
                    'השתמש ב-Linter מקוון לבדיקת תקינות מבנה ה-JSON.'
                ]
            };
        }

        if (errTypeLower.includes('timeout') || errMessageLower.includes('timeout') || errMessageLower.includes('time out') || errMessageLower.includes('limit')) {
            return {
                title: 'חריגה מזמן תגובה (Request Timeout)',
                desc: 'הבקשה לשרת החיצוני (למשל OpenAI או Gemini) ארכה זמן רב מדי והקשר נקטע (לרוב עקב עומס זמני בשרת היעד).',
                steps: [
                    'בהגדרות הקוביה ב-N8N (Settings), הפעל את האפשרות Retry On Fail (ניסיון חוזר אוטומטי).',
                    'בדוק את סטטוס השרתים של שירות היעד.',
                    'אם השגיאה חוזרת, שקול להגדיל את ה-Timeout בהגדרות הקוביה.'
                ]
            };
        }

        if (errMessageLower.includes('not found') || errMessageLower.includes('404')) {
            return {
                title: 'נתיב או משאב לא נמצא (404 Not Found)',
                desc: 'הכתובת (URL) אליה נשלחה הבקשה ב-N8N אינה קיימת או שהמשאב המבוקש נמחק.',
                steps: [
                    'וודא שכתובת ה-URL בקוביית ה-HTTP Request נכונה ומדויקת.',
                    'וודא שמזהה הרשומה (למשל מזהה הליד ב-CRM) נכון וקיים במסד הנתונים.'
                ]
            };
        }

        return {
            title: `תקלה כללית: ${errType || 'שגיאת הרצה'}`,
            desc: errMessage || 'נכשלה ריצת האוטומציה ב-N8N עקב שגיאה לא מזוהה במהלך ביצוע אחד השלבים.',
            steps: [
                'פתח את ה-Workflow ב-N8N ובדוק איזה שלב (Node) מסומן באדום.',
                'בדוק את הלוגים הפנימיים של אותו שלב (Input/Output tabs) כדי לראות את תשובת השרת הגולמית.',
                'הפעל ניסיון חוזר ידני.'
            ]
        };
    };

    useEffect(() => {
        async function loadProjectsData() {
            try {
                setLoading(true);
                const leads = await db.getLeads();
                const wonLeads = leads.filter(l => l.status === 'won');
                setProjects(wonLeads);

                const autos = await db.getAutomations();
                const bugList = await db.getBugs();
                const alerts = await db.getSystemAlerts();
                
                setAutomations(autos);
                setBugs(bugList);
                setSystemAlerts(alerts);
            } catch (err) {
                console.error("Error loading projects dashboard:", err);
            } finally {
                setLoading(false);
            }
        }
        loadProjectsData();
    }, [activeTab]);

    useEffect(() => {
        const cleanups = ['leads', 'automations', 'bugs', 'system_alerts', 'automation_runs'].map(table => 
            db.subscribeChanges(table, async () => {
                try {
                    const leads = await db.getLeads();
                    const wonLeads = leads.filter(l => l.status === 'won');
                    setProjects(wonLeads);

                    const autos = await db.getAutomations();
                    const bugList = await db.getBugs();
                    const alerts = await db.getSystemAlerts();
                    
                    setAutomations(autos);
                    setBugs(bugList);
                    setSystemAlerts(alerts);

                    for (const autoId of Object.keys(expandedAutos)) {
                        if (expandedAutos[autoId]) {
                            const runsData = await db.getAutomationRuns(autoId);
                            setAutoRuns(prev => ({ ...prev, [autoId]: runsData }));
                        }
                    }
                } catch (err) {
                    console.error("Error updating real-time data in Projects:", err);
                }
            })
        );

        return () => {
            cleanups.forEach(c => c());
        };
    }, [expandedAutos]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#8b5cf6' }}></i>
            </div>
        );
    }

    // Calculations
    const activeProjectsCount = projects.length;
    
    // Total setup revenue from won projects' automations
    const totalSetupRevenue = automations.reduce((sum, auto) => {
        // Check if automation belongs to a current won project
        const belongsToWon = projects.some(p => p.id === auto.lead_id);
        return belongsToWon ? sum + (auto.setup_price || 0) : sum;
    }, 0);

    // Monthly Recurring Revenue (MRR) from active/testing won projects' automations
    const mrr = automations.reduce((sum, auto) => {
        const belongsToWon = projects.some(p => p.id === auto.lead_id);
        const isActive = auto.status === 'live' || auto.status === 'testing';
        return (belongsToWon && isActive) ? sum + (auto.monthly_maintenance || 0) : sum;
    }, 0);

    // Total active/testing automations
    const activeAutomationsCount = automations.filter(auto => {
        const belongsToWon = projects.some(p => p.id === auto.lead_id);
        return belongsToWon && (auto.status === 'live' || auto.status === 'testing');
    }).length;

    // Total open bugs in these projects
    const openBugsCount = bugs.filter(bug => {
        const auto = automations.find(a => a.id === bug.automation_id);
        const belongsToWon = auto && projects.some(p => p.id === auto.lead_id);
        return belongsToWon && bug.status !== 'resolved';
    }).length;

    // Filter projects by search
    const filteredProjects = projects.filter(p => {
        return (
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const statusBadges = {
        design: <span className="badge badge-new" style={{ fontSize: '10px', padding: '1px 6px' }}>אפיון</span>,
        development: <span className="badge badge-contacted" style={{ fontSize: '10px', padding: '1px 6px' }}>פיתוח</span>,
        testing: <span className="badge badge-proposal" style={{ fontSize: '10px', padding: '1px 6px' }}>בדיקות</span>,
        live: <span className="badge badge-won" style={{ fontSize: '10px', padding: '1px 6px' }}>פעיל (Live)</span>,
        paused: <span className="badge badge-lost" style={{ fontSize: '10px', padding: '1px 6px' }}>מוקפא</span>
    };

    return (
        <div>
            {/* Header */}
            <header style={{ marginBottom: '24px' }}>
                <h1>פרויקטים ואוטומציות פעילות</h1>
                <p>נהל את שלבי הפיתוח, הגבייה, התחזוקה ומעקב התקלות עבור לקוחות העסק שלכם.</p>
            </header>

            {/* Financial & Operational KPIs */}
            <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>₪{totalSetupRevenue.toLocaleString('he-IL')}</h3>
                        <p>סך הכנסות הקמה</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>₪{mrr.toLocaleString('he-IL')}</h3>
                        <p>דמי תחזוקה חודשיים (MRR)</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>{activeAutomationsCount}</h3>
                        <p>אוטומציות פעילות</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                        <Wrench size={24} />
                    </div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3 style={{ color: openBugsCount > 0 ? '#ef4444' : 'var(--text-light)' }}>{openBugsCount}</h3>
                        <p>באגים פתוחים בטיפול</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                        <Bug size={24} />
                    </div>
                </div>
            </div>

            {/* Search filter */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="חפש לקוח או שם עסק..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingRight: '40px' }}
                    />
                    <Search size={16} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
            </div>

            {/* Projects list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredProjects.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Wrench size={36} style={{ color: '#8b5cf6', marginBottom: '12px', opacity: 0.6 }} />
                        <p style={{ fontWeight: '500' }}>לא נמצאו פרויקטים פעילים (Won leads).</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>שנה סטטוס של ליד ל-"Won" בלוח הקנבן כדי להפוך אותו לפרויקט כאן.</p>
                    </div>
                ) : (
                    filteredProjects.map(proj => {
                        const projAutos = automations.filter(a => a.lead_id === proj.id);
                        
                        // Project financial sums
                        const projSetupSum = projAutos.reduce((s, a) => s + (a.setup_price || 0), 0);
                        const projMaintSum = projAutos.reduce((s, a) => s + (a.monthly_maintenance || 0), 0);
                        
                        return (
                            <div key={proj.id} className="glass-card" style={{ padding: '20px' }}>
                                {/* Project summary header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '16px', margin: '0 0 4px 0', color: 'var(--text-light)' }}>
                                            {proj.company || proj.name}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            <span>לקוח: <strong>{proj.name}</strong></span>
                                            <span>•</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} />
                                                נוצר: {new Date(proj.created_at).toLocaleDateString('he-IL')}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'left', fontSize: '12.5px' }}>
                                            <div style={{ color: 'var(--text-secondary)' }}>הכנסות פרויקט:</div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-light)', marginTop: '2px' }}>
                                                הקמה: ₪{projSetupSum} | תחזוקה: ₪{projMaintSum}/חודש
                                            </div>
                                        </div>
                                        <button 
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 14px', fontSize: '12px' }}
                                            onClick={() => onSelectLead(proj.id)}
                                        >
                                            <Eye size={12} />
                                            <span>ניהול באגים ואוטומציות</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Automations list for this project */}
                                <div>
                                    {projAutos.length === 0 ? (
                                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>טרם הוגדרו אוטומציות לפרויקט זה. לחץ על כפתור הניהול למעלה כדי להוסיף אוטומציה.</p>
                                    ) : (
                                        <div className="table-container" style={{ border: 'none', margin: '0' }}>
                                            <table className="leads-table" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                                                        <th style={{ padding: '8px 12px' }}>שם האוטומציה</th>
                                                        <th style={{ padding: '8px 12px' }}>קטגוריה</th>
                                                        <th style={{ padding: '8px 12px' }}>סכום הקמה</th>
                                                        <th style={{ padding: '8px 12px' }}>תחזוקה חודשית</th>
                                                        <th style={{ padding: '8px 12px' }}>יעד הרצות</th>
                                                        <th style={{ padding: '8px 12px' }}>באגים פתוחים</th>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>סטטוס פיתוח</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {projAutos.map(auto => {
                                                        const autoBugs = bugs.filter(b => b.automation_id === auto.id);
                                                        const openBugsCount = autoBugs.filter(b => b.status !== 'resolved').length;
                                                        const isExpanded = !!expandedAutos[auto.id];
                                                        
                                                        return (
                                                            <React.Fragment key={auto.id}>
                                                                <tr 
                                                                    style={{ cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                                                                    onClick={() => handleToggleExpandAuto(auto.id)}
                                                                >
                                                                    <td style={{ padding: '8px 12px', fontWeight: '500', color: 'var(--text-light)' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                            <span style={{ color: 'var(--text-secondary)', fontSize: '9px', width: '10px' }}>
                                                                                {isExpanded ? '▼' : '◀'}
                                                                            </span>
                                                                            <span style={{ fontWeight: '600' }}>{auto.name}</span>
                                                                            {parseWorkflows(auto.n8n_workflows).map(wf => (
                                                                                <span 
                                                                                    key={wf.id} 
                                                                                    style={{ 
                                                                                        fontSize: '10px', 
                                                                                        color: 'var(--accent-cyan)', 
                                                                                        fontFamily: 'monospace', 
                                                                                        background: 'rgba(6, 182, 212, 0.06)', 
                                                                                        border: '1px solid rgba(6, 182, 212, 0.15)',
                                                                                        padding: '1px 6px', 
                                                                                        borderRadius: '10px', 
                                                                                        direction: 'ltr' 
                                                                                    }}
                                                                                    title={`Workflow ID: ${wf.id}`}
                                                                                >
                                                                                    {wf.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>{auto.type}</td>
                                                                    <td style={{ padding: '8px 12px' }}>₪{auto.setup_price}</td>
                                                                    <td style={{ padding: '8px 12px' }}>₪{auto.monthly_maintenance}</td>
                                                                    <td style={{ padding: '8px 12px' }}>{auto.runs_goal > 0 ? `${auto.runs_goal} הרצות` : 'ללא יעד'}</td>
                                                                    <td style={{ padding: '8px 12px', color: openBugsCount > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: openBugsCount > 0 ? '600' : 'normal' }}>
                                                                        {openBugsCount > 0 ? `🐛 ${openBugsCount} באגים` : 'אין תקלות'}
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'left' }}>
                                                                        {statusBadges[auto.status] || auto.status}
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr style={{ background: 'rgba(0,0,0,0.12)' }}>
                                                                        <td colSpan="7" style={{ padding: '12px 20px', borderTop: 'none' }}>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                                
                                                                                {/* Tabs Row */}
                                                                                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '10px' }} onClick={(e) => e.stopPropagation()}>
                                                                                    {['ops', 'stats', 'runs'].map(tab => {
                                                                                        const runsCount = (autoRuns[auto.id] || []).length;
                                                                                        const labels = { 
                                                                                            ops: 'תפעול ואפיון', 
                                                                                            stats: 'מדדים וסטטיסטיקות', 
                                                                                            runs: `לוג ריצות (${runsCount})` 
                                                                                        };
                                                                                        const isActive = (activeAutoTabs[auto.id] || 'ops') === tab;
                                                                                        return (
                                                                                            <button 
                                                                                                key={tab}
                                                                                                onClick={() => setActiveAutoTabs(prev => ({ ...prev, [auto.id]: tab }))}
                                                                                                style={{
                                                                                                    background: isActive ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                                                                                                    border: 'none',
                                                                                                    borderBottom: isActive ? '2px solid #8b5cf6' : 'none',
                                                                                                    color: isActive ? '#c084fc' : 'var(--text-secondary)',
                                                                                                    padding: '4px 10px',
                                                                                                    fontSize: '11px',
                                                                                                    fontWeight: isActive ? '600' : 'normal',
                                                                                                    cursor: 'pointer',
                                                                                                    borderRadius: '3px 3px 0 0',
                                                                                                    transition: 'all 0.15s'
                                                                                                }}
                                                                                            >
                                                                                                {labels[tab]}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>

                                                                                {/* Tab Content: Operations */}
                                                                                {(activeAutoTabs[auto.id] || 'ops') === 'ops' && (
                                                                                    <div onClick={(e) => e.stopPropagation()}>
                                                                                        {/* Workflows Management */}
                                                                                        <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                                                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                                                                <Cpu size={12} style={{ color: 'var(--accent-cyan)' }} />
                                                                                                מזהי Workflows מקושרים ב-N8N
                                                                                            </span>
                                                                                            
                                                                                            {/* Workflows tags list */}
                                                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                                                                                {(() => {
                                                                                                    const workflows = parseWorkflows(auto.n8n_workflows);
                                                                                                    return workflows.length === 0 ? (
                                                                                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>אין Workflows מקושרים כרגע.</span>
                                                                                                    ) : (
                                                                                                        workflows.map(wf => (
                                                                                                            <div key={wf.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px' }}>
                                                                                                                <span style={{ color: 'var(--text-secondary)' }}>{wf.name}:</span>
                                                                                                                <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{wf.id}</span>
                                                                                                                <button 
                                                                                                                    onClick={() => handleDeleteWorkflow(auto.id, wf.id)}
                                                                                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '0 2px' }}
                                                                                                                >
                                                                                                                    <X size={10} />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        ))
                                                                                                    );
                                                                                                })()}
                                                                                            </div>

                                                                                            {/* Add Workflow Inline Form */}
                                                                                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                                                                                <input 
                                                                                                    type="text" 
                                                                                                    placeholder="שם ה-Workflow..."
                                                                                                    value={wfNameInput[auto.id] || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value;
                                                                                                        setWfNameInput(prev => ({ ...prev, [auto.id]: val }));
                                                                                                    }}
                                                                                                    style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-light)', height: '26px' }}
                                                                                                />
                                                                                                <input 
                                                                                                    type="text" 
                                                                                                    placeholder="מזהה Workflow (N8N)..."
                                                                                                    value={wfIdInput[auto.id] || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value;
                                                                                                        setWfIdInput(prev => ({ ...prev, [auto.id]: val }));
                                                                                                    }}
                                                                                                    style={{ flex: 1.5, padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-light)', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', height: '26px' }}
                                                                                                />
                                                                                                <button 
                                                                                                    type="button"
                                                                                                    onClick={() => handleAddWorkflow(auto.id)}
                                                                                                    className="btn btn-secondary"
                                                                                                    style={{ padding: '2px 8px', fontSize: '11px', height: '26px' }}
                                                                                                >
                                                                                                    שייך
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Bugs Tracker */}
                                                                                        <div>
                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                                                                <span style={{ fontSize: '11px', fontWeight: '600', color: openBugsCount > 0 ? '#ef4444' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                    <Bug size={11} />
                                                                                                    מעקב באגים ותמיכה ({openBugsCount} פתוחים)
                                                                                                </span>
                                                                                            </div>

                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                                                                                                {autoBugs.map(bug => {
                                                                                                    const isResolved = bug.status === 'resolved';
                                                                                                    const severityColors = { high: '#ef4444', medium: '#f59e0b', low: '#9ca3af' };
                                                                                                    return (
                                                                                                        <div 
                                                                                                            key={bug.id} 
                                                                                                            style={{ 
                                                                                                                display: 'flex', 
                                                                                                                justifyContent: 'space-between', 
                                                                                                                alignItems: 'center', 
                                                                                                                background: 'rgba(255,255,255,0.01)', 
                                                                                                                padding: '6px 8px', 
                                                                                                                borderRadius: '4px',
                                                                                                                border: '1px solid var(--border-color)',
                                                                                                                fontSize: '11px',
                                                                                                                opacity: isResolved ? 0.5 : 1
                                                                                                            }}
                                                                                                        >
                                                                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                                                                                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: severityColors[bug.severity] }} />
                                                                                                                <span style={{ textDecoration: isResolved ? 'line-through' : 'none' }}>
                                                                                                                    {bug.description}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                                                                <select
                                                                                                                    value={bug.status}
                                                                                                                    onChange={(e) => handleUpdateBugStatus(bug.id, e.target.value)}
                                                                                                                    style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '10.5px', cursor: 'pointer', outline: 'none' }}
                                                                                                                >
                                                                                                                    <option value="open">פתוח</option>
                                                                                                                    <option value="in_progress">בטיפול</option>
                                                                                                                    <option value="resolved">נפתר</option>
                                                                                                                </select>
                                                                                                                <button 
                                                                                                                    onClick={() => handleDeleteBug(bug.id)}
                                                                                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                                                                                >
                                                                                                                    <Trash2 size={10} style={{ color: 'var(--text-muted)' }} />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>

                                                                                            {/* Add Bug Form */}
                                                                                            <form onSubmit={(e) => handleAddBug(e, auto.id)} style={{ display: 'flex', gap: '6px' }}>
                                                                                                <input 
                                                                                                    type="text" 
                                                                                                    className="form-control" 
                                                                                                    placeholder="דווח על באג/תקלה באוטומציה..."
                                                                                                    value={newBugDesc[auto.id] || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value;
                                                                                                        setNewBugDesc(prev => ({ ...prev, [auto.id]: val }));
                                                                                                    }}
                                                                                                    style={{ padding: '6px 10px', fontSize: '11px', flex: 1, height: '28px' }}
                                                                                                    required
                                                                                                />
                                                                                                <select
                                                                                                    className="form-control"
                                                                                                    value={newBugSev[auto.id] || 'medium'}
                                                                                                    onChange={(e) => {
                                                                                                        const val = e.target.value;
                                                                                                        setNewBugSev(prev => ({ ...prev, [auto.id]: val }));
                                                                                                    }}
                                                                                                    style={{ padding: '4px 6px', fontSize: '11px', width: '70px', height: '28px' }}
                                                                                                >
                                                                                                    <option value="low">נמוך</option>
                                                                                                    <option value="medium">בינוני</option>
                                                                                                    <option value="high">דחוף</option>
                                                                                                </select>
                                                                                                <button type="submit" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}>
                                                                                                    דווח
                                                                                                </button>
                                                                                            </form>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Tab Content: Statistics */}
                                                                                {(activeAutoTabs[auto.id] || 'ops') === 'stats' && (
                                                                                    <div onClick={(e) => e.stopPropagation()}>
                                                                                        {(() => {
                                                                                            const runs = autoRuns[auto.id] || [];
                                                                                            const total = runs.length;
                                                                                            const success = runs.filter(r => r.status === 'success').length;
                                                                                            const warning = runs.filter(r => r.status === 'warning').length;
                                                                                            const error = runs.filter(r => r.status === 'error').length;
                                                                                            
                                                                                            const successRate = total > 0 ? Math.round((success / total) * 100) : 100;
                                                                                            const runsWithDuration = runs.filter(r => r.duration_ms > 0);
                                                                                            const avgDuration = runsWithDuration.length > 0 ? Math.round(runsWithDuration.reduce((acc, r) => acc + r.duration_ms, 0) / runsWithDuration.length) : 0;

                                                                                            const errorTypes = {};
                                                                                            const warningTypes = {};
                                                                                            runs.forEach(r => {
                                                                                                if (r.status === 'error') {
                                                                                                    const type = r.error_type || 'General Error';
                                                                                                    errorTypes[type] = (errorTypes[type] || 0) + 1;
                                                                                                } else if (r.status === 'warning') {
                                                                                                    const type = r.error_type || 'General Warning';
                                                                                                    warningTypes[type] = (warningTypes[type] || 0) + 1;
                                                                                                }
                                                                                            });

                                                                                            // Calculate hourly, weekly, monthly and yearly distributions for time-based statistics
                                                                                            const hourlyErrors = Array(24).fill(0);
                                                                                            const hourlyWarnings = Array(24).fill(0);
                                                                                            
                                                                                            const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                                                                                            const dayIssues = Array(7).fill(0).map((_, i) => ({ name: dayNames[i], errors: 0, warnings: 0 }));

                                                                                            const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
                                                                                            const monthlyIssues = Array(12).fill(0).map((_, i) => ({ name: monthNames[i], errors: 0, warnings: 0 }));
                                                                                            
                                                                                            const yearlyIssues = {};

                                                                                            runs.forEach(r => {
                                                                                                const date = new Date(r.created_at);
                                                                                                const hour = date.getHours();
                                                                                                const day = date.getDay();
                                                                                                const month = date.getMonth();
                                                                                                const year = date.getFullYear();

                                                                                                if (r.status === 'error') {
                                                                                                    hourlyErrors[hour]++;
                                                                                                    dayIssues[day].errors++;
                                                                                                    monthlyIssues[month].errors++;
                                                                                                    if (!yearlyIssues[year]) yearlyIssues[year] = { errors: 0, warnings: 0 };
                                                                                                    yearlyIssues[year].errors++;
                                                                                                } else if (r.status === 'warning') {
                                                                                                    hourlyWarnings[hour]++;
                                                                                                    dayIssues[day].warnings++;
                                                                                                    monthlyIssues[month].warnings++;
                                                                                                    if (!yearlyIssues[year]) yearlyIssues[year] = { errors: 0, warnings: 0 };
                                                                                                    yearlyIssues[year].warnings++;
                                                                                                }
                                                                                            });

                                                                                            const timeBlocks = [
                                                                                                { name: 'בוקר (06:00 - 12:00)', start: 6, end: 12, errors: 0, warnings: 0 },
                                                                                                { name: 'צהריים (12:00 - 18:00)', start: 12, end: 18, errors: 0, warnings: 0 },
                                                                                                { name: 'ערב (18:00 - 00:00)', start: 18, end: 24, errors: 0, warnings: 0 },
                                                                                                { name: 'לילה (00:00 - 06:00)', start: 0, end: 6, errors: 0, warnings: 0 }
                                                                                            ];

                                                                                            timeBlocks.forEach(block => {
                                                                                                for (let h = block.start; h < block.end; h++) {
                                                                                                    block.errors += hourlyErrors[h];
                                                                                                    block.warnings += hourlyWarnings[h];
                                                                                                }
                                                                                            });

                                                                                            const totalIssues = error + warning;
                                                                                            const activeDays = dayIssues.filter(d => (d.errors + d.warnings) > 0);
                                                                                            const activeMonths = monthlyIssues.filter(m => (m.errors + m.warnings) > 0);
                                                                                            const activeYears = Object.entries(yearlyIssues).filter(([_, data]) => (data.errors + data.warnings) > 0);

                                                                                            return (
                                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                                                                                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>סה"ך הרצות</span>
                                                                                                            <strong style={{ fontSize: '16px', color: 'var(--text-light)', display: 'block', marginTop: '2px' }}>{total}</strong>
                                                                                                        </div>
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                                                                                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>שיעור הצלחה</span>
                                                                                                            <strong style={{ fontSize: '16px', color: successRate > 80 ? '#10b981' : '#f59e0b', display: 'block', marginTop: '2px' }}>{successRate}%</strong>
                                                                                                        </div>
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                                                                                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>זמן תגובה ממוצע</span>
                                                                                                            <strong style={{ fontSize: '16px', color: 'var(--accent-cyan)', display: 'block', marginTop: '2px' }}>{formatDuration(avgDuration)}</strong>
                                                                                                        </div>
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                                                                                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>באגים פתוחים</span>
                                                                                                            <strong style={{ fontSize: '16px', color: openBugsCount > 0 ? '#ef4444' : 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{openBugsCount}</strong>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {total > 0 && (
                                                                                                        <div style={{ marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>התפלגות הרצות:</span>
                                                                                                            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                                                                                                <div style={{ width: `${(success / total) * 100}%`, background: '#10b981' }} title={`הצלחה: ${success}`} />
                                                                                                                <div style={{ width: `${(warning / total) * 100}%`, background: '#f59e0b' }} title={`אזהרה: ${warning}`} />
                                                                                                                <div style={{ width: `${(error / total) * 100}%`, background: '#ef4444' }} title={`שגיאה: ${error}`} />
                                                                                                            </div>
                                                                                                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '9.5px', color: 'var(--text-muted)', justifyContent: 'center' }}>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />תקין ({success})</span>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />אזהרה ({warning})</span>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />שגיאה ({error})</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {warning > 0 && (
                                                                                                        <div style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b', display: 'block', marginBottom: '6px' }}>אזהרות לפי קטגוריה:</span>
                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                                                                {Object.entries(warningTypes).map(([type, count]) => (
                                                                                                                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                                                                                                                        <span style={{ color: 'var(--text-secondary)' }}>{type}</span>
                                                                                                                        <strong style={{ color: '#f59e0b' }}>{count} מקרים</strong>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {error > 0 && (
                                                                                                        <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#f87171', display: 'block', marginBottom: '6px' }}>שגיאות לפי קטגוריה:</span>
                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                                                                {Object.entries(errorTypes).map(([type, count]) => (
                                                                                                                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                                                                                                                        <span style={{ color: 'var(--text-secondary)' }}>{type}</span>
                                                                                                                        <strong style={{ color: '#f87171' }}>{count} מקרים</strong>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Time-Based Metrics */}
                                                                                                    {totalIssues > 0 && (
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>ריכוז תקלות ואזהרות לפי שעות:</span>
                                                                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                                                                                                                {timeBlocks.map(block => {
                                                                                                                    const blockIssues = block.errors + block.warnings;
                                                                                                                    const percentage = totalIssues > 0 ? Math.round((blockIssues / totalIssues) * 100) : 0;
                                                                                                                    return (
                                                                                                                        <div key={block.name} style={{ background: 'rgba(0,0,0,0.15)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                                                                                                                                <span style={{ color: 'var(--text-secondary)' }}>{block.name}</span>
                                                                                                                                <strong style={{ color: blockIssues > 0 ? '#f87171' : 'var(--text-muted)' }}>{blockIssues} ({percentage}%)</strong>
                                                                                                                            </div>
                                                                                                                            <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                                                                                                                                <div style={{ width: `${blockIssues > 0 ? (block.errors / blockIssues) * 100 : 0}%`, background: '#ef4444' }} />
                                                                                                                                <div style={{ width: `${blockIssues > 0 ? (block.warnings / blockIssues) * 100 : 0}%`, background: '#f59e0b' }} />
                                                                                                                            </div>
                                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: 'var(--text-muted)' }}>
                                                                                                                                <span>שגיאות: {block.errors}</span>
                                                                                                                                <span>אזהרות: {block.warnings}</span>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    );
                                                                                                                })}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                     {/* Day of Week Metrics */}
                                                                                                     {activeDays.length > 0 && (
                                                                                                         <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                             <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>ריכוז תקלות ואזהרות לפי ימי השבוע:</span>
                                                                                                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                                                                 {dayIssues.map(day => {
                                                                                                                     const total = day.errors + day.warnings;
                                                                                                                     if (total === 0) return null;
                                                                                                                     return (
                                                                                                                         <div key={day.name} style={{ background: 'rgba(0,0,0,0.15)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                                                                                                                             <strong style={{ color: 'var(--text-light)' }}>יום {day.name}</strong>
                                                                                                                             <span style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
                                                                                                                                 {day.errors > 0 && <span style={{ color: '#f87171' }}>שגיאות: {day.errors}</span>}
                                                                                                                                 {day.warnings > 0 && <span style={{ color: '#f59e0b' }}>אזהרות: {day.warnings}</span>}
                                                                                                                             </span>
                                                                                                                         </div>
                                                                                                                     );
                                                                                                                 })}
                                                                                                             </div>
                                                                                                         </div>
                                                                                                     )}

                                                                                                     {/* Monthly Metrics */}
                                                                                                     {activeMonths.length > 0 && (
                                                                                                         <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                             <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>ריכוז תקלות ואזהרות לפי חודשים:</span>
                                                                                                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                                                                 {monthlyIssues.map(month => {
                                                                                                                     const total = month.errors + month.warnings;
                                                                                                                     if (total === 0) return null;
                                                                                                                     return (
                                                                                                                         <div key={month.name} style={{ background: 'rgba(0,0,0,0.15)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                                                                                                                             <strong style={{ color: 'var(--text-light)' }}>{month.name}</strong>
                                                                                                                             <span style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
                                                                                                                                 {month.errors > 0 && <span style={{ color: '#f87171' }}>שגיאות: {month.errors}</span>}
                                                                                                                                 {month.warnings > 0 && <span style={{ color: '#f59e0b' }}>אזהרות: {month.warnings}</span>}
                                                                                                                             </span>
                                                                                                                         </div>
                                                                                                                     );
                                                                                                                 })}
                                                                                                             </div>
                                                                                                         </div>
                                                                                                     )}

                                                                                                     {/* Yearly Metrics */}
                                                                                                     {activeYears.length > 0 && (
                                                                                                         <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                             <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>ריכוז תקלות ואזהרות לפי שנים:</span>
                                                                                                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                                                                 {activeYears.map(([year, data]) => {
                                                                                                                     return (
                                                                                                                         <div key={year} style={{ background: 'rgba(0,0,0,0.15)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                                                                                                                             <strong style={{ color: 'var(--text-light)' }}>שנת {year}</strong>
                                                                                                                             <span style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
                                                                                                                                 {data.errors > 0 && <span style={{ color: '#f87171' }}>שגיאות: {data.errors}</span>}
                                                                                                                                 {data.warnings > 0 && <span style={{ color: '#f59e0b' }}>אזהרות: {data.warnings}</span>}
                                                                                                                             </span>
                                                                                                                         </div>
                                                                                                                     );
                                                                                                                 })}
                                                                                                             </div>
                                                                                                         </div>
                                                                                                     )}

                                                                                                </div>
                                                                                            );
                                                                                        })()}
                                                                                    </div>
                                                                                )}

                                                                                {/* Tab Content: Runs Log */}
                                                                                {(activeAutoTabs[auto.id] || 'ops') === 'runs' && (
                                                                                    <div onClick={(e) => e.stopPropagation()}>
                                                                                        {/* Filters Bar */}
                                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                                                                            <input 
                                                                                                type="text" 
                                                                                                placeholder="חיפוש בלוגים..." 
                                                                                                value={logSearchFilter[auto.id] || ''} 
                                                                                                onChange={(e) => setLogSearchFilter({ ...logSearchFilter, [auto.id]: e.target.value })}
                                                                                                style={{
                                                                                                    flex: '1 1 120px',
                                                                                                    background: 'rgba(0,0,0,0.2)',
                                                                                                    border: '1px solid var(--border-color)',
                                                                                                    borderRadius: '4px',
                                                                                                    color: 'var(--text-light)',
                                                                                                    fontSize: '10.5px',
                                                                                                    padding: '4px 8px',
                                                                                                    outline: 'none'
                                                                                                }}
                                                                                            />
                                                                                            <select
                                                                                                value={logStatusFilter[auto.id] || 'all'}
                                                                                                onChange={(e) => setLogStatusFilter({ ...logStatusFilter, [auto.id]: e.target.value })}
                                                                                                style={{
                                                                                                    background: 'rgba(0,0,0,0.2)',
                                                                                                    border: '1px solid var(--border-color)',
                                                                                                    borderRadius: '4px',
                                                                                                    color: 'var(--text-light)',
                                                                                                    fontSize: '10.5px',
                                                                                                    padding: '4px',
                                                                                                    outline: 'none',
                                                                                                    cursor: 'pointer'
                                                                                                }}
                                                                                            >
                                                                                                <option value="all" style={{ background: '#1e1e24' }}>כל הסטטוסים</option>
                                                                                                <option value="success" style={{ background: '#1e1e24' }}>הצלחות</option>
                                                                                                <option value="warning" style={{ background: '#1e1e24' }}>אזהרות</option>
                                                                                                <option value="error" style={{ background: '#1e1e24' }}>שגיאות</option>
                                                                                            </select>
                                                                                            <select
                                                                                                value={logTimeFilter[auto.id] || 'all'}
                                                                                                onChange={(e) => setLogTimeFilter({ ...logTimeFilter, [auto.id]: e.target.value })}
                                                                                                style={{
                                                                                                    background: 'rgba(0,0,0,0.2)',
                                                                                                    border: '1px solid var(--border-color)',
                                                                                                    borderRadius: '4px',
                                                                                                    color: 'var(--text-light)',
                                                                                                    fontSize: '10.5px',
                                                                                                    padding: '4px',
                                                                                                    outline: 'none',
                                                                                                    cursor: 'pointer'
                                                                                                }}
                                                                                            >
                                                                                                <option value="all" style={{ background: '#1e1e24' }}>כל הזמנים</option>
                                                                                                <option value="today" style={{ background: '#1e1e24' }}>היום</option>
                                                                                                <option value="24h" style={{ background: '#1e1e24' }}>24 שעות</option>
                                                                                                <option value="7d" style={{ background: '#1e1e24' }}>שבוע אחרון</option>
                                                                                                <option value="30d" style={{ background: '#1e1e24' }}>30 ימים</option>
                                                                                            </select>
                                                                                            <select
                                                                                                value={logDurationFilter[auto.id] || 'all'}
                                                                                                onChange={(e) => setLogDurationFilter({ ...logDurationFilter, [auto.id]: e.target.value })}
                                                                                                style={{
                                                                                                    background: 'rgba(0,0,0,0.2)',
                                                                                                    border: '1px solid var(--border-color)',
                                                                                                    borderRadius: '4px',
                                                                                                    color: 'var(--text-light)',
                                                                                                    fontSize: '10.5px',
                                                                                                    padding: '4px',
                                                                                                    outline: 'none',
                                                                                                    cursor: 'pointer'
                                                                                                }}
                                                                                            >
                                                                                                <option value="all" style={{ background: '#1e1e24' }}>כל זמני הריצה</option>
                                                                                                <option value="1s" style={{ background: '#1e1e24' }}>איטיים (&gt; 1s)</option>
                                                                                                <option value="2s" style={{ background: '#1e1e24' }}>איטיים (&gt; 2s)</option>
                                                                                                <option value="5s" style={{ background: '#1e1e24' }}>איטיים (&gt; 5s)</option>
                                                                                            </select>
                                                                                        </div>

                                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                                                                                            {(() => {
                                                                                                const runs = autoRuns[auto.id] || [];
                                                                                                const statusFilter = logStatusFilter[auto.id] || 'all';
                                                                                                const timeFilter = logTimeFilter[auto.id] || 'all';
                                                                                                const durationFilter = logDurationFilter[auto.id] || 'all';
                                                                                                const searchFilter = (logSearchFilter[auto.id] || '').trim().toLowerCase();

                                                                                                const filteredRuns = runs.filter(run => {
                                                                                                    if (statusFilter !== 'all' && run.status !== statusFilter) return false;
                                                                                                    if (timeFilter !== 'all') {
                                                                                                        const runTime = new Date(run.created_at).getTime();
                                                                                                        const now = Date.now();
                                                                                                        if (timeFilter === 'today') {
                                                                                                            const todayStart = new Date();
                                                                                                            todayStart.setHours(0, 0, 0, 0);
                                                                                                            if (runTime < todayStart.getTime()) return false;
                                                                                                        } else if (timeFilter === '24h') {
                                                                                                            if (now - runTime > 24 * 60 * 60 * 1000) return false;
                                                                                                        } else if (timeFilter === '7d') {
                                                                                                            if (now - runTime > 7 * 24 * 60 * 60 * 1000) return false;
                                                                                                        } else if (timeFilter === '30d') {
                                                                                                            if (now - runTime > 30 * 24 * 60 * 60 * 1000) return false;
                                                                                                        }
                                                                                                    }
                                                                                                    if (durationFilter !== 'all') {
                                                                                                        const dur = run.duration_ms || 0;
                                                                                                        if (durationFilter === '1s' && dur <= 1000) return false;
                                                                                                        if (durationFilter === '2s' && dur <= 2000) return false;
                                                                                                        if (durationFilter === '5s' && dur <= 5000) return false;
                                                                                                    }
                                                                                                    if (searchFilter) {
                                                                                                        const wfId = (run.n8n_workflow_id || '').toLowerCase();
                                                                                                        const errMsg = (run.details?.error_message || '').toLowerCase();
                                                                                                        const warnMsg = (run.details?.warning_message || '').toLowerCase();
                                                                                                        const title = (run.title || '').toLowerCase();
                                                                                                        const msg = (run.message || '').toLowerCase();
                                                                                                        if (!wfId.includes(searchFilter) && 
                                                                                                            !errMsg.includes(searchFilter) && 
                                                                                                            !warnMsg.includes(searchFilter) &&
                                                                                                            !title.includes(searchFilter) &&
                                                                                                            !msg.includes(searchFilter)) {
                                                                                                            return false;
                                                                                                        }
                                                                                                    }
                                                                                                    return true;
                                                                                                });

                                                                                                if (filteredRuns.length === 0) {
                                                                                                    return (
                                                                                                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                                                                                                            לא נמצאו ריצות התואמות את הסינון.
                                                                                                        </div>
                                                                                                    );
                                                                                                }

                                                                                                return filteredRuns.map(run => {
                                                                                                    const colors = {
                                                                                                        success: { bg: 'rgba(16, 185, 129, 0.03)', border: 'rgba(16, 185, 129, 0.1)', text: '#10b981', label: 'הצלחה' },
                                                                                                        error: { bg: 'rgba(239, 68, 68, 0.03)', border: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'שגיאה' },
                                                                                                        warning: { bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', label: 'אזהרה' }
                                                                                                    };
                                                                                                    const theme = colors[run.status] || colors.success;
                                                                                                    const isRunExpanded = !!expandedRun[run.id];
                                                                                                    const diagnostics = getOfflineDiagnostics(run);

                                                                                                    return (
                                                                                                        <div 
                                                                                                            key={run.id}
                                                                                                            style={{
                                                                                                                background: theme.bg,
                                                                                                                border: `1px solid ${theme.border}`,
                                                                                                                borderRadius: '6px',
                                                                                                                padding: '8px',
                                                                                                                fontSize: '11px',
                                                                                                                cursor: 'pointer',
                                                                                                                transition: 'all 0.2s',
                                                                                                                marginBottom: '4px'
                                                                                                            }}
                                                                                                            onClick={() => handleToggleRun(run.id)}
                                                                                                        >
                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                                                    <Play size={10} style={{ color: theme.text, transform: 'rotate(180deg)' }} />
                                                                                                                    <span style={{ fontWeight: '600', color: theme.text }}>{theme.label}</span>
                                                                                                                    {run.duration_ms > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({formatDuration(run.duration_ms)})</span>}
                                                                                                                </div>
                                                                                                                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                                                                                                                    {new Date(run.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                                                                                                </span>
                                                                                                            </div>

                                                                                                            <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '10.5px' }}>
                                                                                                                {run.status === 'success' 
                                                                                                                    ? `מזהה workflow: ${run.n8n_workflow_id || 'לא ידוע'}`
                                                                                                                    : (run.details?.error_message || run.details?.warning_message || 'שגיאה בקוביה')}
                                                                                                            </div>

                                                                                                            {isRunExpanded && (
                                                                                                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                                                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '4px', padding: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                                                                                        <strong style={{ fontSize: '10.5px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                                                                                            <Wrench size={10} />
                                                                                                                            ניתוח שגיאות מקומי (Offline Diagnostics):
                                                                                                                        </strong>
                                                                                                                        <div style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '500' }}>{diagnostics.title}</div>
                                                                                                                        <p style={{ color: 'var(--text-secondary)', fontSize: '10.5px', marginTop: '2px', lineHeight: '1.4' }}>{diagnostics.desc}</p>
                                                                                                                        
                                                                                                                        <strong style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>צעדים לפתרון:</strong>
                                                                                                                        <ol style={{ paddingRight: '16px', margin: '4px 0 0 0', fontSize: '10.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                                                                            {diagnostics.steps.map((step, idx) => <li key={idx}>{step}</li>)}
                                                                                                                        </ol>
                                                                                                                    </div>

                                                                                                                    <div style={{ background: '#0e111a', borderRadius: '4px', padding: '8px', border: '1px solid rgba(255,255,255,0.05)', direction: 'ltr', textAlign: 'left', overflowX: 'auto', maxHeight: '100px' }}>
                                                                                                                        <pre style={{ margin: '0', fontSize: '9.5px', fontFamily: 'monospace', color: '#9cf' }}>
                                                                                                                            {JSON.stringify(run.details || {}, null, 2)}
                                                                                                                        </pre>
                                                                                                                    </div>

                                                                                                                    {run.status !== 'success' && (
                                                                                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                                                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>צריך הסבר מעמיק יותר?</span>
                                                                                                                                <button 
                                                                                                                                    onClick={(e) => {
                                                                                                                                        e.stopPropagation();
                                                                                                                                        handleAiAnalyze(run, auto.name);
                                                                                                                                    }}
                                                                                                                                    disabled={analyzingRun[run.id]}
                                                                                                                                    className="btn btn-primary"
                                                                                                                                    style={{ padding: '2px 8px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px', background: '#a855f7', borderColor: '#a855f7', height: '22px' }}
                                                                                                                                >
                                                                                                                                    <Sparkles size={10} />
                                                                                                                                    <span>{analyzingRun[run.id] ? 'מנתח ב-AI...' : 'ניתוח AI חי'}</span>
                                                                                                                                </button>
                                                                                                                            </div>

                                                                                                                            {(aiAnalysisText[run.id] || run.ai_analysis) && (
                                                                                                                                <div style={{ marginTop: '8px', background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '4px', padding: '12px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                                                                                                                    <strong style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                                                                                                                        <Brain size={10} />
                                                                                                                                        ניתוח AI (Gemini Flash):
                                                                                                                                    </strong>
                                                                                                                                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAnalysisText[run.id] || run.ai_analysis) }} />
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    );
                                                                                                });
                                                                                            })()}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
