/* ==========================================================================
   autoRI-studio CRM - Lead Details Modal Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    X, 
    Calendar, 
    User, 
    Mail, 
    Phone, 
    Briefcase,
    Activity, 
    Plus, 
    Check,
    Trash2,
    Clock,
    AlertTriangle,
    Wrench,
    Bug,
    Settings as SettingsIcon,
    DollarSign,
    RefreshCw,
    Lock,
    Play,
    CheckCircle2,
    AlertCircle,
    Info,
    Brain,
    Cpu,
    Globe,
    FileText,
    Sparkles,
    TrendingUp,
    Search,
    Upload,
    Download,
    Paperclip,
    Calculator,
    ChevronRight,
    Save,
    Send,
    MessageCircle
} from 'lucide-react';
import { db } from '../services/db';
import { downloadTemplate } from '../services/templates';
import { generateAndUploadDocuments } from '../services/aiDocGenerator';

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

const QUESTION_LABELS = {
    clinic_name: 'שם הקליניקה / המטפל',
    office_name: 'שם המשרד / עורך הדין',
    realtor_name: 'שם המשרד / הסוכן',
    business_name: 'שם העסק והתעשייה',
    specialty: 'תחום ההתמחות וסוג הפעילות',
    leads: 'ערוצי גיוס לקוחות ולידים',
    crm: 'מערכות CRM / תוכנה בשימוש',
    daily_routine: 'תיאור יום העבודה הטיפוסי',
    robotic_tasks: 'משימות רובוטיות רפטטיביות',
    cognitive_tasks: 'משימות רפטטיביות עם מחשבה',
    bottlenecks: 'צווארי בקבוק ותסכולים מרכזיים',
    automation_idea: 'הצעות אישיות לאוטומציה',
    rating_scheduling: 'אוטומציה: ניהול תורים ורשימות המתנה',
    rating_intake: 'אוטומציה: שאלון אנמנזה והצהרת בריאות',
    rating_followup: 'אוטומציה: שימור לקוחות ופולו-אפ',
    rating_leads: 'אוטומציה: מענה מהיר וסינון לידים',
    rating_courts: 'אוטומציה: מעקב ודיונים משפטיים',
    rating_billing: 'אוטומציה: גבייה ותזכורות תשלום',
    rating_status: 'אוטומציה: עדכון סטטוס תיק אוטומטי',
    rating_docs: 'אוטומציה: איסוף ומרדף מסמכים',
    rating_generator: 'אוטומציה: מחולל חוזים ומסמכים',
    rating_ai: 'אוטומציה: תמלול וסיכום AI',
    rating_lead_routing: 'אוטומציה: ניתוב וסינון לידים',
    rating_dormant_leads: 'אוטומציה: איתור יזום של לקוחות רדומים',
    rating_investors: 'אוטומציה: איתור משקיעים להחלפת נכס',
    rating_syndication: 'אוטומציה: הפצה וקליטת נכס',
    rating_visit_followup: 'אוטומציה: פולו-אפ לאחר סיור',
    rating_sales: 'אוטומציה: שיווק ומכירות',
    rating_service: 'אוטומציה: שירות לקוחות ופולו-אפ',
    rating_operations: 'אוטומציה: תפעול ומשרד אחורי'
};
const WEBSITE_TYPES_MAP = {
    landing: 'דף נחיתה / כרטיס ביקור דיגיטלי',
    image: 'אתר תדמיתי מרובה עמודים',
    ecommerce: 'אתר חנות / איקומרס',
    custom: 'אתר פורטל / מערכת מותאמת אישית'
};
const DOC_DESCRIPTIONS = {
    proposal: 'פירוט עלויות ההקמה, התחזוקה החודשית ותנאי הפיתוח של האוטומציות המתוכננות.',
    contract: 'הסכם ההתקשרות המשפטי והכלכלי החתום המסדיר את התשלום החודשי והתחייבויות הצדדים.',
    nda: 'הסכם שמירת סודיות להגנה על המידע העסקי הרגיש של הלקוח במהלך הפיתוח והתחזוקה.',
    spec: 'תרשים זרימה ואפיון מפורט של שלבי האוטומציה, ה-Nodes ב-N8N, והמערכות המקושרות.',
    credentials: 'פרטי גישה מאובטחים לחשבונות ומערכות הלקוח הדרושים לביצוע החיבורים והאינטגרציות.',
    handover: 'מסמך אישור חתום על ידי הלקוח המעיד כי האוטומציה נבדקה, נמסרה ועובדת בצורה תקינה.',
    sla: 'הסכם רמת שירות המפרט את זמני המענה, שעות התמיכה במקרה של תקלות ותנאי התחזוקה השוטפת.',
    invoice: 'חשבונית מס / קבלה רשמית המאשרת את קבלת התשלום עבור עלויות ההקמה של האוטומציה.'
};
const WEBSITE_ADDONS_MAP = {
    chatbot: "צ'אטבוט AI מוטמע (Gemini)",
    calculator: 'מחשבון ROI דינמי',
    survey: 'שאלון אפיון מרובה שלבים',
    crm: 'חיבור ל-CRM של העסק'
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

const formatMTTR = (ms) => {
    if (ms === null || ms === undefined || ms <= 0) return '—';
    const hours = ms / (1000 * 60 * 60);
    if (hours < 24) {
        return `${Math.round(hours * 10) / 10} שעות`;
    }
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} ימים`;
};

export default function LeadDetailsModal({ leadId, onClose, onLeadUpdated }) {
    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [loading, setLoading] = useState(true);

    // Advanced task state variables
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('כללי');
    const [newTaskDependsOn, setNewTaskDependsOn] = useState('');

    // Documents state - available for ALL leads (fixes circular dep: need docs to become won, but docs were only shown after won)
    const [documents, setDocuments] = useState([]);
    const [docUploadType, setDocUploadType] = useState('proposal');
    const [docUploadName, setDocUploadName] = useState('');
    const [docUploading, setDocUploading] = useState(false);

    // States for "Documents to Send" feature
    const [selectedDocsToSend, setSelectedDocsToSend] = useState([]);
    const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
    const [sendViaEmail, setSendViaEmail] = useState(false);
    const [customMessageText, setCustomMessageText] = useState('');
    const [isMessageModified, setIsMessageModified] = useState(false);
    const [isSendingDoc, setIsSendingDoc] = useState(false);

    // Synchronize default message text when documents or selection changes
    const getGeneratedMessageText = (selectedIds, currentLead, currentDocs) => {
        if (!currentLead) return '';
        
        const selectedDocs = [];
        
        const proposalDoc = currentDocs.find(d => d.type === 'proposal' && !d.automation_id);
        if (proposalDoc && selectedIds.includes('proposal')) {
            selectedDocs.push({ name: 'הצעת מחיר', url: proposalDoc.file_url, type: 'proposal' });
        }
        const ndaDoc = currentDocs.find(d => d.type === 'nda' && !d.automation_id);
        if (ndaDoc && selectedIds.includes('nda')) {
            selectedDocs.push({ name: 'הסכם סודיות NDA', url: ndaDoc.file_url, type: 'nda' });
        }
        const contractDoc = currentDocs.find(d => d.type === 'contract' && !d.automation_id);
        if (contractDoc && selectedIds.includes('contract')) {
            selectedDocs.push({ name: 'חוזה עבודה חתום', url: contractDoc.file_url, type: 'contract' });
        }
        
        const additionalDocs = currentDocs.filter(d => !d.automation_id && d.type !== 'proposal' && d.type !== 'nda' && d.type !== 'contract');
        additionalDocs.forEach(d => {
            if (selectedIds.includes(d.id)) {
                selectedDocs.push({ name: d.name || d.file_name, url: d.file_url, type: 'other' });
            }
        });

        if (selectedDocs.length === 0) {
            return `שלום ${currentLead.name || 'לקוח'},`;
        }

        const clientName = currentLead.name || 'לקוח';
        const companyName = currentLead.company || 'העסק';

        if (selectedDocs.length === 1) {
            const doc = selectedDocs[0];
            if (doc.type === 'proposal') {
                return `שלום ${clientName},\nמצורפת הצעת המחיר המקצועית עבור פרויקט האוטומציות והאתר של ${companyName}.\n\nלצפייה והורדה:\n${doc.url}\n\nנשמח לקבלת פידבק ולכל שאלה!`;
            } else if (doc.type === 'nda') {
                return `שלום ${clientName},\nמצורף הסכם שמירת הסודיות (NDA) להמשך התקדמות בפרויקט המשותף שלנו.\n\nלצפייה והורדה:\n${doc.url}\n\nנשמח אם תעבור עליו ותאשר.`;
            } else if (doc.type === 'contract') {
                return `שלום ${clientName},\nמצורף הסכם העבודה המפורט לפרויקט של ${companyName}.\n\nלצפייה והורדה:\n${doc.url}\n\nנשמח לחתימתך כדי שנוכל לצאת לדרך!`;
            } else {
                return `שלום ${clientName},\nמצורף המסמך "${doc.name}" עבור הפרויקט שלך.\n\nלצפייה והורדה:\n${doc.url}`;
            }
        } else {
            let msg = `שלום ${clientName},\nמצורפים המסמכים הבאים לפרויקט של ${companyName}:\n\n`;
            selectedDocs.forEach(doc => {
                msg += `• ${doc.name}: ${doc.url}\n`;
            });
            msg += `\nנשמח לעבור עליהם יחד ולהתקדם בשלבים הבאים.`;
            return msg;
        }
    };

    useEffect(() => {
        if (!isMessageModified) {
            const text = getGeneratedMessageText(selectedDocsToSend, lead, documents);
            setCustomMessageText(text);
        }
    }, [selectedDocsToSend, documents, lead, isMessageModified]);

    const handleResetMessageText = () => {
        setIsMessageModified(false);
        const text = getGeneratedMessageText(selectedDocsToSend, lead, documents);
        setCustomMessageText(text);
    };

    // Helper to check if any document is checked and actually exists
    const hasAnyDocsSelected = () => {
        return selectedDocsToSend.some(idOrType => {
            return documents.some(d => {
                if (d.type === 'proposal' || d.type === 'nda' || d.type === 'contract') {
                    return d.type === idOrType && !d.automation_id;
                }
                return d.id === idOrType && !d.automation_id;
            });
        });
    };

    // Send documents orchestrator (n8n + fallback)
    const handleSendDocuments = async () => {
        if (selectedDocsToSend.length === 0) {
            alert('אנא בחר לפחות מסמך אחד לשליחה.');
            return;
        }
        if (!sendViaWhatsApp && !sendViaEmail) {
            alert('אנא בחר לפחות ערוץ שליחה אחד (וואטסאפ או מייל).');
            return;
        }

        setIsSendingDoc(true);
        try {
            const n8nUrl = localStorage.getItem('n8n_url');
            
            const selectedDocs = [];
            const proposalDoc = documents.find(d => d.type === 'proposal' && !d.automation_id);
            if (proposalDoc && selectedDocsToSend.includes('proposal')) selectedDocs.push(proposalDoc);
            const ndaDoc = documents.find(d => d.type === 'nda' && !d.automation_id);
            if (ndaDoc && selectedDocsToSend.includes('nda')) selectedDocs.push(ndaDoc);
            const contractDoc = documents.find(d => d.type === 'contract' && !d.automation_id);
            if (contractDoc && selectedDocsToSend.includes('contract')) selectedDocs.push(contractDoc);
            
            const additionalDocs = documents.filter(d => !d.automation_id && d.type !== 'proposal' && d.type !== 'nda' && d.type !== 'contract');
            additionalDocs.forEach(d => {
                if (selectedDocsToSend.includes(d.id)) selectedDocs.push(d);
            });

            const docNamesStr = selectedDocs.map(d => d.name || d.file_name).join(', ');
            let sendSuccess = false;

            if (n8nUrl) {
                try {
                    const cleanUrl = n8nUrl.replace(/\/$/, '');
                    const response = await fetch(`${cleanUrl}/webhook/send-document`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            lead_id: leadId,
                            lead_name: lead.name,
                            lead_phone: lead.phone,
                            lead_email: lead.email,
                            lead_company: lead.company,
                            channels: {
                                whatsapp: sendViaWhatsApp,
                                email: sendViaEmail
                            },
                            message: customMessageText,
                            documents: selectedDocs.map(d => ({
                                id: d.id,
                                name: d.name || d.file_name,
                                type: d.type,
                                url: d.file_url
                            }))
                        })
                    });

                    if (response.ok) {
                        sendSuccess = true;
                    } else {
                        console.warn('n8n webhook response was not ok, falling back to browser links');
                    }
                } catch (webhookErr) {
                    console.error('Error posting to n8n webhook:', webhookErr);
                }
            }

            const channelsUsed = [];
            if (sendViaWhatsApp) channelsUsed.push('וואטסאפ');
            if (sendViaEmail) channelsUsed.push('אימייל');

            if (!sendSuccess) {
                if (n8nUrl) {
                    alert('השליחה האוטומטית דרך n8n נכשלה. עובר לשליחה ידנית (פתיחת וואטסאפ / אימייל במחשב)...');
                }

                if (sendViaWhatsApp) {
                    let cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
                    if (cleanPhone.startsWith('05')) {
                        cleanPhone = '9725' + cleanPhone.substring(2);
                    } else if (cleanPhone.startsWith('5')) {
                        cleanPhone = '9725' + cleanPhone.substring(1);
                    }
                    
                    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(customMessageText)}`;
                    window.open(waUrl, '_blank');
                }

                if (sendViaEmail) {
                    const mailtoUrl = `mailto:${lead.email || ''}?subject=${encodeURIComponent('מסמכים לפרויקט - ' + (lead.company || lead.name || ''))}&body=${encodeURIComponent(customMessageText)}`;
                    const triggerMailto = () => {
                        const link = document.createElement('a');
                        link.href = mailtoUrl;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    if (sendViaWhatsApp) {
                        setTimeout(triggerMailto, 400);
                    } else {
                        triggerMailto();
                    }
                }

                await db.addNote({
                    lead_id: leadId,
                    content: `נשלחו מסמכים ללקוח בגיבוי ידני ב-[${channelsUsed.join(' + ')}]: ${docNamesStr}`
                });
                alert('הופעלה שליחה ידנית. המסמכים שנשלחו: ' + docNamesStr);
            } else {
                await db.addNote({
                    lead_id: leadId,
                    content: `נשלחו מסמכים ללקוח אוטומטית ב-[${channelsUsed.join(' + ')}]: ${docNamesStr}`
                });
                alert('המסמכים נשלחו בהצלחה ללקוח באמצעות n8n!');
            }

            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
        } catch (err) {
            console.error('Error sending documents:', err);
            alert('שגיאה בתהליך השליחה: ' + (err.message || err));
        } finally {
            setIsSendingDoc(false);
        }
    };

    // Automations and Bugs states for Won projects
    const [automations, setAutomations] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [systemAlerts, setSystemAlerts] = useState([]);
    
    // New Automation Form states
    const [newAutoName, setNewAutoName] = useState('');
    const [newAutoType, setNewAutoType] = useState('סוכני AI ומיילים');
    const [newAutoSetupPrice, setNewAutoSetupPrice] = useState('');
    const [newAutoMaintPrice, setNewAutoMaintPrice] = useState('');
    const [newAutoRunsGoal, setNewAutoRunsGoal] = useState('');

    // Additional dashboard/runs states
    const [autoRuns, setAutoRuns] = useState({});
    const [activeAutoTabs, setActiveAutoTabs] = useState({});
    const [chartStates, setChartStates] = useState({});
    const [roiSettingsOpen, setRoiSettingsOpen] = useState({});
    const [tempRoiMins, setTempRoiMins] = useState({});
    const [tempRoiWage, setTempRoiWage] = useState({});
    const [logStatusFilter, setLogStatusFilter] = useState({});
    const [logTimeFilter, setLogTimeFilter] = useState({});
    const [logSearchFilter, setLogSearchFilter] = useState({});
    const [logDurationFilter, setLogDurationFilter] = useState({});
    const [expandedRun, setExpandedRun] = useState({});
    const [analyzingRun, setAnalyzingRun] = useState({});
    const [aiAnalysisText, setAiAnalysisText] = useState({});
    const [expandedAutos, setExpandedAutos] = useState({});

    // Mapped by autoId for inline bugs reporting
    const [newBugDesc, setNewBugDesc] = useState({});
    const [newBugSev, setNewBugSev] = useState({});

    // Inline workflow input states
    const [wfNameInput, setWfNameInput] = useState({});
    const [wfIdInput, setWfIdInput] = useState({});

    // Document drag-drop state for automation doc slots
    const [dragActive, setDragActive] = useState({});

    // ── Docs & Calculator Panel ──────────────────────────────────────────────
    const [showDocsPanel, setShowDocsPanel] = useState(false);
    const [panelDragActive, setPanelDragActive] = useState(false);
    // Inline calculator state inside the panel
    const [calcHours, setCalcHours] = useState(20);
    const [calcHourlyRate, setCalcHourlyRate] = useState(250);
    const [calcIntegrations, setCalcIntegrations] = useState(2);
    const [calcTaskTime, setCalcTaskTime] = useState(10);
    const [calcMonthlyVolume, setCalcMonthlyVolume] = useState(500);
    const [calcWage, setCalcWage] = useState(60);
    const [calcSla, setCalcSla] = useState('standard');
    const [calcThirdParty, setCalcThirdParty] = useState(0);
    const [calcSaving, setCalcSaving] = useState(false);
    const [calcSaved, setCalcSaved] = useState(false);
    const CALC_SLA = {
        standard: { name: 'Standard', price: 400 },
        premium: { name: 'Premium', price: 1000 },
        enterprise: { name: 'Enterprise', price: 3000 }
    };
    // Derived calc values
    const _calcSetup = Math.round((calcHours * calcHourlyRate * (1 + (calcIntegrations - 1) * 0.15)) / 100) * 100;
    const _calcSlaPrice = CALC_SLA[calcSla].price;
    const _calcHoursSaved = Math.round((calcTaskTime / 60) * calcMonthlyVolume);
    const _calcGross = Math.round(_calcHoursSaved * calcWage);
    const _calcTotal = _calcSlaPrice + calcThirdParty;
    const _calcNet = _calcGross - _calcTotal;
    const _calcBreakeven = _calcTotal > 0 ? Math.ceil(_calcSetup / Math.max(1, _calcNet)) : 0;

    // AI Document Generator states
    const [showAiDocGeneratorForm, setShowAiDocGeneratorForm] = useState(false);
    const [aiDocSpecText, setAiDocSpecText] = useState('');
    const [aiDocSetupPrice, setAiDocSetupPrice] = useState('');
    const [aiDocPilotDays, setAiDocPilotDays] = useState(14);
    const [aiDocHasAdvance, setAiDocHasAdvance] = useState(true);
    const [aiDocAdvancePrice, setAiDocAdvancePrice] = useState('');
    const [aiDocStatus, setAiDocStatus] = useState('');
    const [aiDocEstimatedClients, setAiDocEstimatedClients] = useState(100);
    const [aiDocBonusRuns, setAiDocBonusRuns] = useState(0);

    // Integrated Calculator States inside AI Document Generator
    const [aiDocIncludeAutomation, setAiDocIncludeAutomation] = useState(true);
    const [aiDocIncludeWebsite, setAiDocIncludeWebsite] = useState(false);
    const [aiDocAutomationSetupPrice, setAiDocAutomationSetupPrice] = useState(12500);
    const [aiDocAutomationSla, setAiDocAutomationSla] = useState('standard');
    const [aiDocAutomationThirdParty, setAiDocAutomationThirdParty] = useState(0);
    const [aiDocWebsiteType, setAiDocWebsiteType] = useState('landing');
    const [aiDocWebsiteSetupPrice, setAiDocWebsiteSetupPrice] = useState(2500);
    const [aiDocWebsiteAddons, setAiDocWebsiteAddons] = useState({
        chatbot: false,
        calculator: false,
        survey: false,
        crm: false
    });
    const [aiDocWebsiteSla, setAiDocWebsiteSla] = useState('basic');
    const [aiDocWebsiteThirdParty, setAiDocWebsiteThirdParty] = useState(0);

    // Pre-fill fields from lead notes/quote_data when form is opened
    useEffect(() => {
        if (showAiDocGeneratorForm && lead) {
            const q = lead.quote_data || {};
            
            // 1. Project toggles
            let incAuto = true;
            let incWeb = false;
            if (q.project_type === 'website') {
                incAuto = false;
                incWeb = true;
            } else if (q.project_type === 'both' || q.project_type === 'automation_and_website') {
                incAuto = true;
                incWeb = true;
            } else if (q.project_type === 'automation') {
                incAuto = true;
                incWeb = false;
            } else {
                if (q.include_automation !== undefined) incAuto = q.include_automation;
                if (q.include_website !== undefined) incWeb = q.include_website;
            }
            setAiDocIncludeAutomation(incAuto);
            setAiDocIncludeWebsite(incWeb);

            // 2. Automation prefill
            if (q.automation_setup_price !== undefined) {
                setAiDocAutomationSetupPrice(q.automation_setup_price);
            } else if (q.project_type === 'automation' && q.setup_cost) {
                setAiDocAutomationSetupPrice(q.setup_cost);
            } else {
                setAiDocAutomationSetupPrice(12500);
            }
            setAiDocAutomationSla(q.automation_sla || q.sla_level || 'standard');
            setAiDocAutomationThirdParty(q.automation_third_party || q.third_party_costs || 0);

            // 3. Website prefill
            setAiDocWebsiteType(q.website_type || 'landing');
            if (q.website_setup_price !== undefined) {
                setAiDocWebsiteSetupPrice(q.website_setup_price);
            } else if (q.project_type === 'website' && q.setup_cost) {
                setAiDocWebsiteSetupPrice(q.setup_cost);
            } else {
                setAiDocWebsiteSetupPrice(2500);
            }
            if (q.website_addons) {
                setAiDocWebsiteAddons({
                    chatbot: !!q.website_addons.chatbot,
                    calculator: !!q.website_addons.calculator,
                    survey: !!q.website_addons.survey,
                    crm: !!q.website_addons.crm
                });
            } else if (q.addons) {
                setAiDocWebsiteAddons({
                    chatbot: !!q.addons.chatbot,
                    calculator: !!q.addons.calculator,
                    survey: !!q.addons.survey,
                    crm: !!q.addons.crm
                });
            } else {
                setAiDocWebsiteAddons({
                    chatbot: false,
                    calculator: false,
                    survey: false,
                    crm: false
                });
            }
            setAiDocWebsiteSla(q.website_sla || 'basic');
            setAiDocWebsiteThirdParty(q.website_third_party || 0);

            // 4. General prefill
            if (q.setup_cost) {
                setAiDocSetupPrice(q.setup_cost.toString());
                if (q.advance_payment !== undefined) {
                    setAiDocAdvancePrice(q.advance_payment.toString());
                    setAiDocHasAdvance(!!q.has_advance);
                } else {
                    setAiDocAdvancePrice(Math.round(q.setup_cost * 0.1).toString());
                    setAiDocHasAdvance(true);
                }
            }
            if (q.pilot_days !== undefined) {
                setAiDocPilotDays(q.pilot_days);
            } else {
                setAiDocPilotDays(14);
            }
            
            // 5. Estimated clients & Bonus runs prefill
            setAiDocEstimatedClients(q.estimated_clients !== undefined ? q.estimated_clients : 100);
            setAiDocBonusRuns(q.bonus_runs !== undefined ? q.bonus_runs : 0);

            if (lead.notes) {
                setAiDocSpecText(lead.notes);
            }
        }
    }, [showAiDocGeneratorForm, lead]);

    // Keep website setup price prefilled when website type changes
    useEffect(() => {
        const TYPE_PRICES = { landing: 2500, image: 5000, ecommerce: 8000, custom: 12000 };
        if (TYPE_PRICES[aiDocWebsiteType] !== undefined) {
            setAiDocWebsiteSetupPrice(TYPE_PRICES[aiDocWebsiteType]);
        }
    }, [aiDocWebsiteType]);

    // Calculate total setup cost dynamically
    useEffect(() => {
        let total = 0;
        if (aiDocIncludeAutomation) {
            total += parseFloat(aiDocAutomationSetupPrice) || 0;
        }
        if (aiDocIncludeWebsite) {
            total += parseFloat(aiDocWebsiteSetupPrice) || 0;
            const ADDON_PRICES = { chatbot: 3000, calculator: 1500, survey: 2000, crm: 1000 };
            Object.keys(aiDocWebsiteAddons).forEach(addon => {
                if (aiDocWebsiteAddons[addon]) {
                    total += ADDON_PRICES[addon] || 0;
                }
            });
        }
        setAiDocSetupPrice(total.toString());
    }, [
        aiDocIncludeAutomation, 
        aiDocAutomationSetupPrice, 
        aiDocIncludeWebsite, 
        aiDocWebsiteSetupPrice, 
        aiDocWebsiteAddons
    ]);

    // Keep advance price updated when setup price changes
    useEffect(() => {
        if (aiDocSetupPrice && aiDocHasAdvance) {
            const setup = parseFloat(aiDocSetupPrice) || 0;
            setAiDocAdvancePrice(Math.round(setup * 0.1).toString());
        } else if (!aiDocHasAdvance) {
            setAiDocAdvancePrice('');
        }
    }, [aiDocSetupPrice, aiDocHasAdvance]);

    const handleGenerateAiDocuments = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!aiDocIncludeAutomation && !aiDocIncludeWebsite) {
            alert('אנא בחר לפחות סוג פרויקט אחד (אוטומציה או אתר).');
            return;
        }
        if (!aiDocSpecText.trim()) {
            alert('אנא הזן אפיון גולמי.');
            return;
        }
        const priceVal = parseFloat(aiDocSetupPrice) || 0;
        if (priceVal <= 0) {
            alert('אנא הזן עלות הקמה תקינה הגדולה מ-0.');
            return;
        }

        const advanceVal = aiDocHasAdvance ? (parseFloat(aiDocAdvancePrice) || 0) : 0;
        const finalVal = priceVal - advanceVal;
        const pilotDaysVal = parseInt(aiDocPilotDays) || 14;

        // Calculate combined monthly costs and retainers
        const autoSlaPrices = { standard: 400, premium: 1000, enterprise: 3000 };
        const webSlaPrices = { basic: 150, extended: 300, premium: 600 };
        
        let autoSlaPrice = aiDocIncludeAutomation ? (autoSlaPrices[aiDocAutomationSla] || 0) : 0;
        let webSlaPrice = aiDocIncludeWebsite ? (webSlaPrices[aiDocWebsiteSla] || 0) : 0;
        let monthlyCostVal = autoSlaPrice + webSlaPrice;
        if (aiDocIncludeWebsite && aiDocWebsiteAddons.chatbot) {
            monthlyCostVal += 250; // Chatbot monthly
        }
        const totalThirdParty = (aiDocIncludeAutomation ? parseFloat(aiDocAutomationThirdParty || 0) : 0) + 
                                (aiDocIncludeWebsite ? parseFloat(aiDocWebsiteThirdParty || 0) : 0);

        const customSettings = {
            includeAutomation: aiDocIncludeAutomation,
            includeWebsite: aiDocIncludeWebsite,
            automationSetupPrice: parseFloat(aiDocAutomationSetupPrice) || 0,
            automationSla: aiDocAutomationSla,
            automationThirdParty: parseFloat(aiDocAutomationThirdParty) || 0,
            websiteType: aiDocWebsiteType,
            websiteSetupPrice: parseFloat(aiDocWebsiteSetupPrice) || 0,
            websiteAddons: aiDocWebsiteAddons,
            websiteSla: aiDocWebsiteSla,
            websiteThirdParty: parseFloat(aiDocWebsiteThirdParty) || 0,
            pilotDays: pilotDaysVal,
            hasAdvance: aiDocHasAdvance,
            advancePayment: advanceVal,
            finalPayment: finalVal,
            estimatedClients: parseInt(aiDocEstimatedClients) || 100,
            bonusRuns: parseInt(aiDocBonusRuns) || 0
        };

        setDocUploading(true);
        setAiDocStatus('מתחיל תהליך גנרוט...');

        try {
            const addedDocs = await generateAndUploadDocuments(
                aiDocSpecText, 
                priceVal, 
                lead, 
                customSettings,
                (status) => setAiDocStatus(status)
            );

            // Sync generated details to Lead's quote_data in Database
            const quoteData = {
                project_type: (aiDocIncludeAutomation && aiDocIncludeWebsite) ? 'both' : aiDocIncludeAutomation ? 'automation' : 'website',
                include_automation: aiDocIncludeAutomation,
                include_website: aiDocIncludeWebsite,
                automation_setup_price: parseFloat(aiDocAutomationSetupPrice) || 0,
                automation_sla: aiDocAutomationSla,
                automation_third_party: parseFloat(aiDocAutomationThirdParty) || 0,
                website_type: aiDocWebsiteType,
                website_setup_price: parseFloat(aiDocWebsiteSetupPrice) || 0,
                website_addons: aiDocWebsiteAddons,
                website_sla: aiDocWebsiteSla,
                website_third_party: parseFloat(aiDocWebsiteThirdParty) || 0,
                setup_cost: priceVal,
                monthly_cost: monthlyCostVal + totalThirdParty,
                sla_price: autoSlaPrice + webSlaPrice,
                third_party_costs: totalThirdParty,
                advance_payment: advanceVal,
                final_payment: finalVal,
                pilot_days: pilotDaysVal,
                has_advance: aiDocHasAdvance,
                hourly_rate: 230,
                estimated_clients: parseInt(aiDocEstimatedClients) || 100,
                bonus_runs: parseInt(aiDocBonusRuns) || 0
            };
            await db.updateLead(leadId, { quote_data: quoteData });

            // Add note to CRM
            let projDesc = '';
            if (aiDocIncludeAutomation && aiDocIncludeWebsite) projDesc = 'פרויקט משולב (אוטומציות + אתר)';
            else if (aiDocIncludeAutomation) projDesc = 'פרויקט אוטומציות';
            else projDesc = 'פרויקט בניית אתר';

            await db.addNote({ 
                lead_id: leadId, 
                content: `גונרטו בהצלחה 3 מסמכי פרימיום ב-AI (הצעת מחיר, הסכם, NDA) עבור ${projDesc}.\n• עלות הקמה כוללת: ${priceVal.toLocaleString('he-IL')} ₪\n• מקדמה: ${advanceVal.toLocaleString('he-IL')} ₪\n• ריטיינר חודשי כולל: ${(monthlyCostVal + totalThirdParty).toLocaleString('he-IL')} ₪` 
            });

            // Reload notes, docs and lead
            const docsData = await db.getDocuments(leadId);
            setDocuments(docsData || []);
            if (docsData) {
                setSelectedDocsToSend(prev => {
                    const updated = [...prev];
                    docsData.forEach(d => {
                        const id = d.type === 'other' ? d.id : d.type;
                        if (!updated.includes(id)) {
                            updated.push(id);
                        }
                    });
                    return updated;
                });
            }
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            const updatedLead = await db.getLeadById(leadId);
            if (updatedLead) setLead(updatedLead);
            onLeadUpdated();

            // Reset state
            setShowAiDocGeneratorForm(false);
            alert('המסמכים גונרטו, הועלו בהצלחה ונתוני הצעת המחיר עודכנו בתיק הלקוח!');
        } catch (err) {
            console.error('Error generating AI documents:', err);
            alert('שגיאה במהלך גנרוט המסמכים: ' + (err.message || err));
        } finally {
            setDocUploading(false);
            setAiDocStatus('');
        }
    };

    const handleSaveQuoteFromPanel = async () => {
        if (!leadId) return;
        setCalcSaving(true);
        try {
            const quoteData = {
                project_type: 'automation',
                setup_cost: _calcSetup,
                monthly_cost: _calcTotal,
                sla_price: _calcSlaPrice,
                hourly_rate: calcHourlyRate,
                net_profit: _calcNet,
                break_even: _calcBreakeven,
                third_party_costs: calcThirdParty
            };
            await db.updateLead(leadId, { quote_data: quoteData });
            await db.addNote({
                lead_id: leadId,
                content: `הצעת מחיר הוזנה ידנית מהמחשבון:\n• עלות הקמה: ₪${_calcSetup.toLocaleString('he-IL')}\n• ריטיינר חודשי: ₪${_calcSlaPrice.toLocaleString('he-IL')}\n• רווח חודשי נקי: ₪${_calcNet.toLocaleString('he-IL')}\n• החזר השקעה: תוך ${_calcBreakeven} חודשים`
            });
            // Refresh lead
            const updatedLead = await db.getLeadById(leadId);
            if (updatedLead) setLead(updatedLead);
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
            setCalcSaved(true);
            setTimeout(() => setCalcSaved(false), 3000);
        } catch (err) {
            console.error('Error saving quote from panel:', err);
            alert('שגיאה בשמירת הצעת המחיר: ' + (err.message || err));
        } finally {
            setCalcSaving(false);
        }
    };

    // Panel-level drag handlers
    const handlePanelDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setPanelDragActive(true);
        else if (e.type === 'dragleave' || e.type === 'drop') setPanelDragActive(false);
    };
    const handlePanelDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPanelDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !leadId) return;
        setDocUploading(true);
        try {
            const ext = file.name.split('.').pop().toLowerCase();
            const guessType = ext === 'pdf' ? 'proposal' : 'other';
            const newDoc = await db.uploadDocument(
                { lead_id: leadId, name: file.name, type: guessType },
                file
            );
            setDocuments(prev => [...prev, newDoc]);
            setSelectedDocsToSend(prev => [...prev, newDoc.type === 'other' ? newDoc.id : newDoc.type]);
        } catch (err) {
            console.error('Panel drop upload error:', err);
        } finally {
            setDocUploading(false);
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    // Helper to check if a task is blocked by another uncompleted task
    const isTaskBlocked = (task) => {
        if (!task.depends_on_task_id) return false;
        const dependency = tasks.find(t => t.id === task.depends_on_task_id);
        return dependency ? !dependency.completed : false;
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
            onLeadUpdated();
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
            onLeadUpdated();
        } catch (err) {
            console.error("Error deleting workflow:", err);
        }
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
                    } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                        if (cleanUrl.includes('autori-n8n.autori-studio.com')) {
                            fetchUrl = `/api-n8n/api/v1/workflows/${run.n8n_workflow_id}`;
                        }
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

    // Offline rule-based diagnostics parser (completely crash-safe)
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
        if (run.status === 'warning' || run.status === 'fallback') {
            return {
                title: 'הריצה הושלמה עם אזהרה / גיבוי (Fallback Model Active)',
                desc: "הצ'אטבוט ענה למשתמש בהצלחה, אך המערכת נאלצה להשתמש במודל הגיבוי (Gemini Pro) עקב עיכוב או כשל זמני במודל הראשי (Gemini Flash).",
                steps: [
                    'אין צורך בפעולה מיידית מכיוון שהמשתמש קיבל מענה תקין.',
                    'מומלץ לבדוק את זמני התגובה או זמינות ה-API של Gemini Flash ב-N8N.',
                    'וודא שמפתח ה-API של גוגל מוגדר ותקין.'
                ]
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

    // Modal Real-time sync for automations, bugs, alerts, and runs
    useEffect(() => {
        if (!leadId || lead?.status !== 'won') return;

        const cleanups = ['automations', 'bugs', 'system_alerts', 'automation_runs'].map(table => 
            db.subscribeChanges(table, async () => {
                try {
                    const autosData = await db.getAutomations(leadId);
                    const bugsData = await db.getBugs();
                    const alertsData = await db.getSystemAlerts();
                    setAutomations(autosData);
                    setBugs(bugsData);
                    setSystemAlerts(alertsData);

                    // Re-fetch runs for any expanded automations
                    for (const autoId of Object.keys(expandedAutos)) {
                        if (expandedAutos[autoId]) {
                            const runsData = await db.getAutomationRuns(autoId);
                            setAutoRuns(prev => ({ ...prev, [autoId]: runsData }));
                        }
                    }
                } catch (err) {
                    console.error("Error updating real-time data in modal:", err);
                }
            })
        );

        return () => {
            cleanups.forEach(c => c());
        };
    }, [leadId, lead?.status, expandedAutos]);

    useEffect(() => {
        if (!leadId) return;
        
        async function loadLeadDetails() {
            try {
                setLoading(true);
                const leadData = await db.getLeadById(leadId);
                const notesData = await db.getNotes(leadId);
                const tasksData = await db.getTasks(leadId);
                
                setLead(leadData);
                setNotes(notesData);
                setTasks(tasksData);

                // Load documents for ALL leads (not just won) to allow pre-won document upload
                try {
                    const docsData = await db.getDocuments(leadId);
                    setDocuments(docsData || []);
                } catch (docErr) {
                    console.warn("Documents not available:", docErr);
                    setDocuments([]);
                }

                if (leadData && leadData.status === 'won') {
                    const autosData = await db.getAutomations(leadId);
                    const bugsData = await db.getBugs();
                    const alertsData = await db.getSystemAlerts();
                    setAutomations(autosData);
                    setBugs(bugsData);
                    setSystemAlerts(alertsData);
                }
                
                // Set default due date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setNewTaskDueDate(tomorrow.toISOString().split('T')[0]);
            } catch (err) {
                console.error("Error loading lead details modal:", err);
            } finally {
                setLoading(false);
            }
        }
        loadLeadDetails();
    }, [leadId]);

    const handleUpdateStatus = async (status) => {
        // ── Document gating (same rules as KanbanBoard) ──
        if (status === 'proposal' || status === 'won') {
            const hasProposal = documents.some(d => d.type === 'proposal');
            if (!hasProposal) {
                alert("חסימת שלב: חסר מסמך 'הצעת מחיר'.\nלחץ על כפתור 📎 מסמכים בראש החלון כדי להעלות אותו.");
                return;
            }
        }
        if (status === 'won') {
            const hasContract = documents.some(d => d.type === 'contract');
            const hasNDA = documents.some(d => d.type === 'nda');
            if (!hasContract || !hasNDA) {
                let missing = [];
                if (!hasContract) missing.push("חוזה חתום");
                if (!hasNDA) missing.push("הסכם סודיות NDA");
                alert(`חסימת שלב: חסרים מסמכי חובה: ${missing.join(' ו')}\nלחץ על כפתור 📎 מסמכים בראש החלון כדי להעלות אותם.`);
                return;
            }
        }
        // ──────────────────────────────────────────────────
        try {
            const updated = await db.updateLeadStatus(leadId, status);
            setLead(updated);

            // If changed to Won, fetch projects tables
            if (status === 'won') {
                const autosData = await db.getAutomations(leadId);
                const bugsData = await db.getBugs();
                const alertsData = await db.getSystemAlerts();
                setAutomations(autosData);
                setBugs(bugsData);
                setSystemAlerts(alertsData);
            }

            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    // Document handlers - available for all lead statuses
    const handleUploadDocument = async (e) => {
        e.preventDefault();
        const file = e.target.querySelector('input[type="file"]').files[0];
        if (!file || !docUploadName.trim()) return;
        setDocUploading(true);
        try {
            const newDoc = await db.uploadDocument(
                { lead_id: leadId, name: docUploadName.trim(), type: docUploadType },
                file
            );
            setDocuments(prev => [newDoc, ...prev]);
            setSelectedDocsToSend(prev => [...prev, newDoc.type === 'other' ? newDoc.id : newDoc.type]);
            setDocUploadName('');
            e.target.reset();
        } catch (err) {
            console.error('Error uploading document:', err);
            alert('שגיאה בהעלאת המסמך: ' + (err.message || err));
        } finally {
            setDocUploading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('האם למחוק מסמך זה?')) return;
        try {
            await db.deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (err) {
            console.error('Error deleting document:', err);
        }
    };

    // Drag-drop and file upload for per-automation document slots (Won tab)
    const handleDocDrag = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(prev => ({ ...prev, [type]: true }));
        } else if (e.type === "dragleave") {
            setDragActive(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleDocDrop = async (e, type, automationId = null) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleAutoFileUpload(e.dataTransfer.files[0], type, automationId);
        }
    };

    const handleAutoFileUpload = async (file, type, automationId = null) => {
        if (!file) return;
        const auto = automations.find(a => a.id === automationId);
        const docNames = {
            proposal: 'הצעת מחיר', contract: 'חוזה התקשרות חתום', nda: 'הסכם סודיות NDA',
            spec: 'מסמך אפיון טכני', credentials: 'פרטי גישות וסיסמאות',
            handover: 'פרוטוקול מסירה חתום', sla: 'תנאי תחזוקה SLA', invoice: 'חשבונית מס'
        };
        try {
            const added = await db.uploadDocument({
                lead_id: leadId,
                automation_id: automationId,
                name: docNames[type] || 'מסמך כללי',
                type: type
            }, file);
            setDocuments(prev => [added, ...prev]);
            if (leadId) {
                await db.addNote({ lead_id: leadId, content: `הועלה מסמך חדש מסוג ${docNames[type] || 'כללי'} לאוטומציה ${auto?.name || ''}: ${file.name}` });
                const notesData = await db.getNotes(leadId);
                setNotes(notesData);
            }
        } catch (err) {
            console.error("Error uploading document:", err);
            alert("שגיאה בהעלאת הקובץ: " + (err.message || err));
        }
    };

    const handleDeleteAutoDoc = async (docId, docName) => {
        if (window.confirm(`האם למחוק את המסמך "${docName}"?`)) {
            try {
                await db.deleteDocument(docId);
                setDocuments(prev => prev.filter(d => d.id !== docId));
            } catch (err) {
                console.error("Error deleting document:", err);
                alert("שגיאה במחיקת המסמך: " + (err.message || err));
            }
        }
    };

    const handleLinkExistingDoc = async (existingDoc, type, automationId) => {
        const auto = automations.find(a => a.id === automationId);
        const docNames = {
            proposal: 'הצעת מחיר', contract: 'חוזה התקשרות חתום', nda: 'הסכם סודיות NDA',
            spec: 'מסמך אפיון טכני', credentials: 'פרטי גישות וסיסמאות',
            handover: 'פרוטוקול מסירה חתום', sla: 'תנאי תחזוקה SLA', invoice: 'חשבונית מס'
        };
        try {
            const added = await db.linkExistingDocument({
                lead_id: leadId,
                automation_id: automationId,
                name: docNames[type] || existingDoc.name,
                type: type,
                file_name: existingDoc.file_name,
                file_size: existingDoc.file_size,
                file_url: existingDoc.file_url
            });
            setDocuments(prev => [added, ...prev]);
            if (leadId) {
                await db.addNote({ lead_id: leadId, content: `קושר מסמך קיים מסוג ${docNames[type] || 'כללי'} לאוטומציה ${auto?.name || ''}: ${existingDoc.file_name}` });
                const notesData = await db.getNotes(leadId);
                setNotes(notesData);
            }
        } catch (err) {
            console.error("Error linking document:", err);
            alert("שגיאה בשיוך הקובץ: " + (err.message || err));
        }
    };

    // Render a single document slot for automation (spec, credentials, handover, etc.)
    const renderAutoDocumentSlot = (auto, type, label, requiredForStatus) => {
        const doc = documents.find(d => d.automation_id === auto.id && d.type === type);
        const uniqueKey = `${auto.id}_${type}`;
        const isDragActive = dragActive[uniqueKey];
        const existingDocs = documents.filter(d => d.type === type && d.automation_id !== auto.id);

        return (
            <div
                key={type}
                className={`glass-card ${isDragActive ? 'drag-active' : ''}`}
                style={{
                    padding: '12px', border: isDragActive ? '2px dashed #8b5cf6' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px', background: isDragActive ? 'rgba(139, 92, 246, 0.04)' : 'rgba(255,255,255,0.01)',
                    position: 'relative', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '8px'
                }}
                onDragEnter={(e) => handleDocDrag(e, uniqueKey)}
                onDragOver={(e) => handleDocDrag(e, uniqueKey)}
                onDragLeave={(e) => handleDocDrag(e, uniqueKey)}
                onDrop={(e) => handleDocDrop(e, uniqueKey, auto.id)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {label}
                        {requiredForStatus && (
                            <span style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1px 4px', borderRadius: '3px' }}>
                                חובה ל-{requiredForStatus}
                            </span>
                        )}
                    </span>
                    {doc && (
                        <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>קיים</span>
                    )}
                </div>
                <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)', lineHeight: '1.3', marginTop: '-2px' }}>
                    {DOC_DESCRIPTIONS[type]}
                </span>

                {doc ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden', maxWidth: '75%' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={doc.file_name}>{doc.file_name}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-icon" style={{ width: '22px', height: '22px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="הורד/צפה">
                                <Download size={10} />
                            </a>
                            <button className="btn btn-danger btn-icon" style={{ width: '22px', height: '22px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }} onClick={() => handleDeleteAutoDoc(doc.id, doc.name)} title="מחק מסמך">
                                <Trash2 size={10} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <label style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px', padding: '12px 6px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', transition: 'all 0.2s ease' }}>
                            <Upload size={14} style={{ color: 'var(--text-secondary)' }} />
                            <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                                גרור קובץ או <span style={{ color: '#c084fc', textDecoration: 'underline' }}>לחץ לבחירה</span>
                            </span>
                            <input type="file" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) handleAutoFileUpload(e.target.files[0], type, auto.id); }} />
                        </label>
                        
                        {existingDocs.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>שיוך מסמך קיים של הלקוח:</span>
                                <select
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        if (selectedId) {
                                            const selectedDoc = existingDocs.find(d => d.id === selectedId);
                                            if (selectedDoc) handleLinkExistingDoc(selectedDoc, type, auto.id);
                                        }
                                    }}
                                    defaultValue=""
                                    className="form-control"
                                    style={{
                                        padding: '4px 6px',
                                        fontSize: '9.5px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        width: '100%',
                                        outline: 'none',
                                        height: '24px'
                                    }}
                                >
                                    <option value="" disabled>בחר מסמך לשיוך...</option>
                                    {existingDocs.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.file_name} ({automations.find(a => a.id === d.automation_id)?.name || 'מסמכים כלליים'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => downloadTemplate(type, lead)}
                            className="btn btn-secondary"
                            style={{ fontSize: '9.5px', padding: '3px 6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = 'var(--text-light)'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.color = 'var(--text-secondary)'; }}
                        >
                            <FileText size={10} /> הורד תבנית שבלונה
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const handleUpdatePriority = async (priority) => {
        try {
            const updated = await db.updateLead(leadId, { priority });
            setLead(updated);
            onLeadUpdated();
        } catch (err) {
            console.error("Error updating priority:", err);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            const added = await db.addNote({
                lead_id: leadId,
                content: newNote
            });
            setNotes(prev => [added, ...prev]);
            setNewNote('');
        } catch (err) {
            console.error("Error adding note:", err);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const added = await db.addTask({
                lead_id: leadId,
                title: newTaskTitle,
                due_date: new Date(newTaskDueDate).toISOString(),
                assigned_to: newTaskAssignedTo,
                depends_on_task_id: newTaskDependsOn || null
            });
            setTasks(prev => [...prev, added]);
            setNewTaskTitle('');
            setNewTaskDependsOn('');
            setNewTaskAssignedTo('כללי');
            
            // Refresh activity notes
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error adding task:", err);
            alert("שגיאה בהוספת משימה: " + (err.message || err));
        }
    };

    const handleToggleTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && isTaskBlocked(task)) {
            alert("משימה זו חסומה על ידי משימה אחרת שלא הושלמה עדיין.");
            return;
        }
        try {
            const updated = await db.toggleTaskCompleted(taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
            
            // Refresh activity notes
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error toggling task:", err);
            alert("שגיאה בעדכון משימה: " + (err.message || err));
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await db.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    // Add automation handler
    const handleAddAutomation = async (e) => {
        e.preventDefault();
        if (!newAutoName.trim()) return;

        try {
            const added = await db.addAutomation({
                lead_id: leadId,
                name: newAutoName,
                type: newAutoType,
                setup_price: Number(newAutoSetupPrice) || 0,
                monthly_maintenance: Number(newAutoMaintPrice) || 0,
                runs_goal: Number(newAutoRunsGoal) || 0,
                status: 'design'
            });
            setAutomations(prev => [...prev, added]);
            setNewAutoName('');
            setNewAutoSetupPrice('');
            setNewAutoMaintPrice('');
            setNewAutoRunsGoal('');
            
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error adding automation:", err);
            alert("שגיאה בהוספת אוטומציה: " + (err.message || err));
        }
    };

    // Update automation status handler
    const handleUpdateAutoStatus = async (autoId, status) => {
        // ── Live gating: requires spec + credentials + handover ────────────────
        if (status === 'live') {
            const autoDocs = documents.filter(d => d.automation_id === autoId);
            const hasSpec = autoDocs.some(d => d.type === 'spec');
            const hasCreds = autoDocs.some(d => d.type === 'credentials');
            const hasHandover = autoDocs.some(d => d.type === 'handover');
            if (!hasSpec || !hasCreds || !hasHandover) {
                const missing = [];
                if (!hasSpec) missing.push('מסמך אפיון טכני');
                if (!hasCreds) missing.push('כרטיס גישות מאובטח');
                if (!hasHandover) missing.push('פרוטוקול מסירה');
                alert(`חסימת שלב: כדי להעביר אוטומציה ל-Live, יש להעלות:\n• ${missing.join('\n• ')}\n\nלחץ על האוטומציה כדי לפתוח את לוח המסמכים.`);
                return;
            }
        }
        // ────────────────────────────────────────────────────────────────────────
        try {
            const updated = await db.updateAutomation(autoId, { status });
            setAutomations(prev => prev.map(a => a.id === autoId ? updated : a));
            onLeadUpdated();
        } catch (err) {
            console.error("Error updating automation status:", err);
            alert("שגיאה בעדכון סטטוס אוטומציה: " + (err.message || err));
        }
    };

    // Delete automation handler
    const handleDeleteAutomation = async (autoId) => {
        if (window.confirm("האם למחוק אוטומציה זו? כל הבאגים המקושרים יימחקו גם כן.")) {
            try {
                await db.deleteAutomation(autoId);
                setAutomations(prev => prev.filter(a => a.id !== autoId));
                onLeadUpdated();
            } catch (err) {
                console.error("Error deleting automation:", err);
                alert("שגיאה במחיקת אוטומציה: " + (err.message || err));
            }
        }
    };

    // Update bug status handler
    const handleUpdateBugStatus = async (bugId, status) => {
        try {
            const updated = await db.updateBug(bugId, { status });
            setBugs(prev => prev.map(b => b.id === bugId ? updated : b));
        } catch (err) {
            console.error("Error updating bug status:", err);
            alert("שגיאה בעדכון סטטוס באג: " + (err.message || err));
        }
    };

    // Delete bug handler
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

    // Add bug handler
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

    const handleToggleRun = (runId) => {
        setExpandedRun(prev => ({ ...prev, [runId]: !prev[runId] }));
    };

    if (!leadId) return null;

    const leadAutos = automations.filter(a => a.lead_id === leadId);

    const additionalDocs = documents.filter(d => !d.automation_id && d.type !== 'proposal' && d.type !== 'nda' && d.type !== 'contract');

    const renderSendDocItem = (idOrType, label, requiredForStatus, existingDocObj = null) => {
        const doc = existingDocObj || documents.find(d => d.type === idOrType && !d.automation_id);
        const uniqueKey = `lead_send_${idOrType}`;
        const isDragActive = dragActive[uniqueKey];
        const isChecked = selectedDocsToSend.includes(idOrType);

        return (
            <div
                key={idOrType}
                className={`glass-card ${isDragActive ? 'drag-active' : ''}`}
                style={{
                    padding: '10px 12px', 
                    border: isDragActive ? '2px dashed #8b5cf6' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px', 
                    background: isDragActive ? 'rgba(139, 92, 246, 0.04)' : 'rgba(255,255,255,0.01)',
                    position: 'relative', 
                    transition: 'all 0.2s ease', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '6px'
                }}
                onDragEnter={(e) => handleDocDrag(e, uniqueKey)}
                onDragOver={(e) => handleDocDrag(e, uniqueKey)}
                onDragLeave={(e) => handleDocDrag(e, uniqueKey)}
                onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(prev => ({ ...prev, [uniqueKey]: false }));
                    const file = e.dataTransfer.files?.[0];
                    if (!file || !leadId) return;
                    setDocUploading(true);
                    try {
                        const typeVal = typeof idOrType === 'string' && ['proposal', 'nda', 'contract'].includes(idOrType) ? idOrType : 'other';
                        const added = await db.uploadDocument({ lead_id: leadId, name: label, type: typeVal }, file);
                        setDocuments(prev => [...prev, added]);
                        setSelectedDocsToSend(prev => [...prev, added.type === 'other' ? added.id : added.type]);
                        await db.addNote({ lead_id: leadId, content: `הועלה מסמך חדש: ${label} (${file.name})` });
                        const notesData = await db.getNotes(leadId);
                        setNotes(notesData);
                    } catch (err) {
                        alert('שגיאה בהעלאה: ' + (err.message || err));
                    } finally {
                        setDocUploading(false);
                    }
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {doc && (
                            <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                    setSelectedDocsToSend(prev => 
                                        prev.includes(idOrType) 
                                            ? prev.filter(x => x !== idOrType) 
                                            : [...prev, idOrType]
                                    );
                                }}
                                style={{ width: '13px', height: '13px', cursor: 'pointer', margin: 0 }}
                            />
                        )}
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {label}
                            {requiredForStatus && (
                                <span style={{ fontSize: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1px 3px', borderRadius: '3px' }}>
                                    חובה ל-{requiredForStatus}
                                </span>
                            )}
                        </span>
                    </div>
                    {doc ? (
                        <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>קיים</span>
                    ) : (
                        <span style={{ fontSize: '9px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '1px 4px', borderRadius: '3px' }}>חסר</span>
                    )}
                </div>

                {doc ? (
                    <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px', 
                        border: '1px solid rgba(255, 255, 255, 0.03)', marginTop: '2px' 
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden', maxWidth: '70%' }}>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={doc.file_name || doc.name}>{doc.file_name || doc.name}</span>
                            <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : new Date(doc.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {doc.file_url && (
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-icon" style={{ width: '20px', height: '20px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="הורד/צפה">
                                    <Download size={9} />
                                </a>
                            )}
                            <button className="btn btn-danger btn-icon" style={{ width: '20px', height: '20px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }} onClick={() => handleDeleteDocument(doc.id)} title="מחק מסמך">
                                <Trash2 size={9} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                            {DOC_DESCRIPTIONS[typeof idOrType === 'string' ? idOrType : 'other'] || 'העלה מסמך מותאם אישית עבור הלקוח.'}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <label style={{ 
                                flex: 1, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px', 
                                padding: '6px', textAlign: 'center', cursor: 'pointer', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent' 
                            }}>
                                <Upload size={11} style={{ color: 'var(--text-secondary)' }} />
                                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>העלה קובץ</span>
                                <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setDocUploading(true);
                                        try {
                                            const typeVal = typeof idOrType === 'string' && ['proposal', 'nda', 'contract'].includes(idOrType) ? idOrType : 'other';
                                            const added = await db.uploadDocument({ lead_id: leadId, name: label, type: typeVal }, file);
                                            setDocuments(prev => [...prev, added]);
                                            setSelectedDocsToSend(prev => [...prev, added.type === 'other' ? added.id : added.type]);
                                            await db.addNote({ lead_id: leadId, content: `הועלה מסמך חדש: ${label} (${file.name})` });
                                            const notesData = await db.getNotes(leadId);
                                            setNotes(notesData);
                                        } catch (err) {
                                            alert('שגיאה בהעלאה: ' + (err.message || err));
                                        } finally {
                                            setDocUploading(false);
                                        }
                                    }
                                }} />
                            </label>
                            {typeof idOrType === 'string' && ['proposal', 'nda', 'contract'].includes(idOrType) && (
                                <button
                                    type="button"
                                    onClick={() => downloadTemplate(idOrType, lead)}
                                    className="btn btn-secondary"
                                    style={{ 
                                        flex: 1, fontSize: '9px', padding: '4px', background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-secondary)', 
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' 
                                    }}
                                >
                                    <FileText size={9} /> שבלונה
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const statusBadges = {
        design: <span className="badge badge-new" style={{ fontSize: '10px', padding: '1px 6px' }}>אפיון</span>,
        development: <span className="badge badge-contacted" style={{ fontSize: '10px', padding: '1px 6px' }}>פיתוח</span>,
        testing: <span className="badge badge-proposal" style={{ fontSize: '10px', padding: '1px 6px' }}>בדיקות</span>,
        live: <span className="badge badge-won" style={{ fontSize: '10px', padding: '1px 6px' }}>פעיל (Live)</span>,
        paused: <span className="badge badge-lost" style={{ fontSize: '10px', padding: '1px 6px' }}>מוקפא</span>
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%' }}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2 style={{ margin: '0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} className="text-violet" style={{ color: '#8b5cf6' }} />
                        פרטי ליד מורחבים: {loading ? 'טוען...' : lead?.name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Docs & Calculator Panel Button */}
                        {!loading && lead && (
                            <button
                                id="lead-docs-panel-btn"
                                className="btn btn-secondary"
                                onClick={() => setShowDocsPanel(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '12px', padding: '6px 12px',
                                    background: documents.length > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: documents.length > 0 ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border-color)',
                                    color: documents.length > 0 ? '#c084fc' : 'var(--text-secondary)',
                                    borderRadius: '8px', transition: 'all 0.2s ease'
                                }}
                                title="פתח פאנל מסמכים"
                            >
                                <Paperclip size={14} />
                                מסמכים
                                {documents.length > 0 && (
                                    <span style={{
                                        background: '#8b5cf6', color: '#fff',
                                        borderRadius: '10px', fontSize: '10px',
                                        padding: '1px 6px', fontWeight: '700'
                                    }}>{documents.length}</span>
                                )}
                            </button>
                        )}
                        <button className="btn btn-secondary btn-icon" onClick={onClose}>
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                     DOCS & CALCULATOR SIDE PANEL
                ═══════════════════════════════════════════════════════════ */}
                {showDocsPanel && lead && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setShowDocsPanel(false)}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9000,
                                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)'
                            }}
                        />
                        {/* Panel */}
                        <div
                            id="lead-docs-side-panel"
                            onDragEnter={handlePanelDrag}
                            onDragOver={handlePanelDrag}
                            onDragLeave={handlePanelDrag}
                            onDrop={handlePanelDrop}
                            style={{
                                position: 'fixed', top: 0, right: 0, bottom: 0,
                                width: '420px', zIndex: 9001,
                                background: 'var(--bg-secondary, #1a1a2e)',
                                borderLeft: panelDragActive
                                    ? '2px solid #8b5cf6'
                                    : '1px solid rgba(139,92,246,0.25)',
                                display: 'flex', flexDirection: 'column',
                                overflowY: 'auto',
                                transition: 'border-color 0.2s',
                                boxShadow: '-8px 0 40px rgba(0,0,0,0.5)'
                            }}
                        >
                            {/* Panel Header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 20px', borderBottom: '1px solid rgba(139,92,246,0.2)',
                                background: 'rgba(139,92,246,0.07)', position: 'sticky', top: 0, zIndex: 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Paperclip size={16} style={{ color: '#c084fc' }} />
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-light)' }}>מסמכים</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>— {lead.name}</span>
                                </div>
                                <button
                                    className="btn btn-secondary btn-icon"
                                    onClick={() => setShowDocsPanel(false)}
                                    style={{ width: '28px', height: '28px', padding: 0 }}
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                                
                                {/* ── AI Document Generator Card ── */}
                                <div style={{ padding: '0 20px' }}>
                                    {!showAiDocGeneratorForm ? (
                                        <div style={{
                                            padding: '14px',
                                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: '#c084fc' }}>
                                                <Brain size={16} />
                                                מחולל מסמכי פרימיום ב-AI
                                            </div>
                                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                גנרט הצעת מחיר, הסכם פיתוח ו-NDA ישירות מאפיון גולמי (למשל משיחת וואטסאפ או סיכום פגישה) ומחיר הקמה.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => setShowAiDocGeneratorForm(true)}
                                                style={{
                                                    background: '#8b5cf6',
                                                    border: 'none',
                                                    fontSize: '11px',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    marginTop: '4px'
                                                }}
                                            >
                                                <Sparkles size={12} />
                                                גנרט מסמכים ב-AI
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleGenerateAiDocuments} style={{
                                            padding: '14px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}>
                                            <div style={{ fontWeight: '700', fontSize: '13px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Brain size={16} />
                                                הגדרות מחולל מסמכים AI
                                            </div>
                                            
                                            <div>
                                                <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    אפיון גולמי או סיכום שיחה:
                                                </label>
                                                <textarea
                                                    required
                                                    value={aiDocSpecText}
                                                    onChange={(e) => setAiDocSpecText(e.target.value)}
                                                    placeholder="הדבק כאן את האפיון גולמי (למשל: ישבנו אני ורון ועשינו תכנון...)"
                                                    style={{
                                                        width: '100%',
                                                        height: '90px',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '6px',
                                                        color: 'var(--text-light)',
                                                        padding: '8px',
                                                        fontSize: '11px',
                                                        fontFamily: 'inherit',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            </div>

                                            {/* ── Estimated Clients & Bonus Runs Inputs ── */}
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                        מספר לקוחות משוער בחודש:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={aiDocEstimatedClients}
                                                        onChange={(e) => setAiDocEstimatedClients(parseInt(e.target.value) || 0)}
                                                        style={{
                                                            width: '100%',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '4px',
                                                            color: 'var(--text-light)',
                                                            padding: '4px 6px',
                                                            fontSize: '11px'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                        ריצות בונוס חודשיות בחוזה:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={aiDocBonusRuns}
                                                        onChange={(e) => setAiDocBonusRuns(parseInt(e.target.value) || 0)}
                                                        style={{
                                                            width: '100%',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '4px',
                                                            color: 'var(--text-light)',
                                                            padding: '4px 6px',
                                                            fontSize: '11px'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* ── Project Type Selection Checkboxes ── */}
                                            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-light)', cursor: 'pointer', margin: 0 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={aiDocIncludeAutomation}
                                                        onChange={(e) => setAiDocIncludeAutomation(e.target.checked)}
                                                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                    />
                                                    <span>⚙️ פרויקט אוטומציה</span>
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-light)', cursor: 'pointer', margin: 0 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={aiDocIncludeWebsite}
                                                        onChange={(e) => setAiDocIncludeWebsite(e.target.checked)}
                                                        style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                    />
                                                    <span>🌐 בניית אתר אינטרנט</span>
                                                </label>
                                            </div>

                                            {/* ── AUTOMATION SETTINGS ── */}
                                            {aiDocIncludeAutomation && (
                                                <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Cpu size={12} /> הגדרות פרויקט אוטומציה
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                            עלות הקמה אוטומציות (₪ ללא מע"מ):
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            value={aiDocAutomationSetupPrice}
                                                            onChange={(e) => setAiDocAutomationSetupPrice(parseFloat(e.target.value) || 0)}
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-light)', padding: '4px 6px', fontSize: '11px' }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Automation SLA Radio Selection Card-style */}
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                            בחירת חבילת ריטיינר (SLA):
                                                        </label>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                            {[
                                                                { key: 'standard', name: 'Standard', desc: 'עד 1,000 הרצות', price: 400 },
                                                                { key: 'premium', name: 'Premium', desc: 'עד 5,000 הרצות', price: 1000 },
                                                                { key: 'enterprise', name: 'Enterprise', desc: 'עד 20,000 הרצות', price: 3000 }
                                                            ].map(pkg => {
                                                                const isSelected = aiDocAutomationSla === pkg.key;
                                                                return (
                                                                    <div 
                                                                        key={pkg.key}
                                                                        onClick={() => setAiDocAutomationSla(pkg.key)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            padding: '6px 10px',
                                                                            background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0,0,0,0.15)',
                                                                            border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.06)',
                                                                            borderRadius: '5px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <input 
                                                                                type="radio" 
                                                                                checked={isSelected}
                                                                                onChange={() => {}}
                                                                                style={{ cursor: 'pointer' }}
                                                                            />
                                                                            <span style={{ fontSize: '11px', fontWeight: isSelected ? '700' : '400', color: 'var(--text-light)' }}>{pkg.name}</span>
                                                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({pkg.desc})</span>
                                                                        </div>
                                                                        <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: '700' }}>₪{pkg.price} / חודש</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                            עלויות צד ג' צפויות (OpenAI, רשיונות וכו'):
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={aiDocAutomationThirdParty}
                                                            onChange={(e) => setAiDocAutomationThirdParty(parseFloat(e.target.value) || 0)}
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-light)', padding: '4px 6px', fontSize: '11px' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── WEBSITE SETTINGS ── */}
                                            {aiDocIncludeWebsite && (
                                                <div style={{ padding: '10px', background: 'rgba(37, 99, 235, 0.04)', border: '1px solid rgba(37, 99, 235, 0.15)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Globe size={12} /> הגדרות בניית אתר אינטרנט
                                                    </div>
                                                    
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                            בחירת סוג אתר:
                                                        </label>
                                                        <select
                                                            value={aiDocWebsiteType}
                                                            onChange={(e) => setAiDocWebsiteType(e.target.value)}
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-light)', padding: '4px 6px', fontSize: '11px' }}
                                                        >
                                                            <option value="landing">דף נחיתה / כרטיס ביקור (2,500 ₪)</option>
                                                            <option value="image">אתר תדמיתי מרובה עמודים (5,000 ₪)</option>
                                                            <option value="ecommerce">אתר חנות / איקומרס (8,000 ₪)</option>
                                                            <option value="custom">פורטל / מערכת אישית (12,000 ₪)</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                            עלות הקמה בסיסית לאתר (₪ ללא מע"מ):
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            value={aiDocWebsiteSetupPrice}
                                                            onChange={(e) => setAiDocWebsiteSetupPrice(parseFloat(e.target.value) || 0)}
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-light)', padding: '4px 6px', fontSize: '11px' }}
                                                        />
                                                    </div>

                                                    {/* Website Addons Checkboxes */}
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                            תוספות לאתר:
                                                        </label>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '6px', borderRadius: '5px' }}>
                                                            {[
                                                                { key: 'chatbot', name: "צ'אטבוט AI מוטמע (3k ₪)", desc: "+250 ₪/חודש" },
                                                                { key: 'calculator', name: "מחשבון ROI דינמי (1.5k ₪)", desc: "" },
                                                                { key: 'survey', name: "שאלון מרובה שלבים (2k ₪)", desc: "" },
                                                                { key: 'crm', name: "חיבור ל-CRM של העסק (1k ₪)", desc: "" }
                                                            ].map(addon => {
                                                                const checked = !!aiDocWebsiteAddons[addon.key];
                                                                return (
                                                                    <label 
                                                                        key={addon.key}
                                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', color: 'var(--text-light)', cursor: 'pointer', margin: 0 }}
                                                                    >
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) => setAiDocWebsiteAddons(prev => ({
                                                                                ...prev,
                                                                                [addon.key]: e.target.checked
                                                                            }))}
                                                                            style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                                                                        />
                                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${addon.name} ${addon.desc}`}>{addon.name}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Website SLA Selection Card-style */}
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                            בחירת חבילת תחזוקה ואחסון:
                                                        </label>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                            {[
                                                                { key: 'basic', name: 'אחסון ותחזוקה בסיסית', price: 150 },
                                                                { key: 'extended', name: 'אחסון, תחזוקה ועדכוני תוכן', price: 300 },
                                                                { key: 'premium', name: 'תמיכה מהירה ושינויים שוטפים', price: 600 }
                                                            ].map(pkg => {
                                                                const isSelected = aiDocWebsiteSla === pkg.key;
                                                                return (
                                                                    <div 
                                                                        key={pkg.key}
                                                                        onClick={() => setAiDocWebsiteSla(pkg.key)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            padding: '6px 10px',
                                                                            background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(0,0,0,0.15)',
                                                                            border: isSelected ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.06)',
                                                                            borderRadius: '5px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <input 
                                                                                type="radio" 
                                                                                checked={isSelected}
                                                                                onChange={() => {}}
                                                                                style={{ cursor: 'pointer' }}
                                                                            />
                                                                            <span style={{ fontSize: '10px', fontWeight: isSelected ? '700' : '400', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{pkg.name}</span>
                                                                        </div>
                                                                        <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: '700' }}>₪{pkg.price} / חודש</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                                            עלויות שוטפות נוספות (שרתים, Gemini API):
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={aiDocWebsiteThirdParty}
                                                            onChange={(e) => setAiDocWebsiteThirdParty(parseFloat(e.target.value) || 0)}
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-light)', padding: '4px 6px', fontSize: '11px' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── GENERAL PRICING & PAYMENT TERMS ── */}
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                        עלות הקמה כוללת (₪ ללא מע"מ):
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={aiDocSetupPrice}
                                                        onChange={(e) => setAiDocSetupPrice(e.target.value)}
                                                        placeholder="למשל: 15000"
                                                        style={{
                                                            width: '100%',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-light)',
                                                            padding: '6px 8px',
                                                            fontSize: '11px'
                                                        }}
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                                                    <input
                                                        type="checkbox"
                                                        id="aiDocHasAdvance"
                                                        checked={aiDocHasAdvance}
                                                        onChange={(e) => setAiDocHasAdvance(e.target.checked)}
                                                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                                    />
                                                    <label htmlFor="aiDocHasAdvance" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                        האם יש תשלום מקדמה?
                                                     </label>
                                                </div>

                                                {aiDocHasAdvance && (
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                            סכום המקדמה (₪ ללא מע"מ):
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="0"
                                                            value={aiDocAdvancePrice}
                                                            onChange={(e) => setAiDocAdvancePrice(e.target.value)}
                                                            placeholder="למשל: 1500 (ברירת מחדל: 10%)"
                                                            style={{
                                                                width: '100%',
                                                                background: 'rgba(0,0,0,0.2)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: '6px',
                                                                color: 'var(--text-light)',
                                                                padding: '6px 8px',
                                                                fontSize: '11px'
                                                            }}
                                                        />
                                                        <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>
                                                            יתרת תשלום סוגרת: ₪{(parseFloat(aiDocSetupPrice || 0) - parseFloat(aiDocAdvancePrice || 0)).toLocaleString('he-IL')}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                        משך ימי הפיילוט לפני תשלום יתרה:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={aiDocPilotDays}
                                                        onChange={(e) => setAiDocPilotDays(e.target.value)}
                                                        placeholder="למשל: 14"
                                                        style={{
                                                            width: '100%',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-light)',
                                                            padding: '6px 8px',
                                                            fontSize: '11px'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {docUploading && (
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#a78bfa',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: 'rgba(139, 92, 246, 0.05)',
                                                    padding: '6px 10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(139, 92, 246, 0.1)'
                                                }}>
                                                    <RefreshCw size={12} className="spin" />
                                                    <span>{aiDocStatus}</span>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <button
                                                    type="submit"
                                                    disabled={docUploading}
                                                    className="btn btn-primary"
                                                    style={{
                                                        flex: 1,
                                                        background: '#8b5cf6',
                                                        border: 'none',
                                                        fontSize: '11px',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        cursor: docUploading ? 'not-allowed' : 'pointer',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {docUploading ? 'מגנרט...' : 'גנרט מסמכים ✨'}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={docUploading}
                                                    onClick={() => {
                                                        setShowAiDocGeneratorForm(false);
                                                        setAiDocSpecText('');
                                                    }}
                                                    className="btn btn-secondary"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        fontSize: '11px',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: docUploading ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    ביטול
                                                </button>
                                            </div>
                                        </form>


                                    )}
                                </div>

                                {/* ── Documents to Send (מסמכים לשליחה) Section ── */}
                                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                        <Paperclip size={12} style={{ color: '#c084fc' }} /> מסמכים לשליחה
                                    </div>

                                    {/* Document List (Standard + Additional) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* 1. Proposal */}
                                        {renderSendDocItem('proposal', 'הצעת מחיר', 'הצעת מחיר')}
                                        
                                        {/* 2. NDA */}
                                        {renderSendDocItem('nda', 'הסכם סודיות NDA', 'נסגר בהצלחה')}

                                        {/* 3. Contract */}
                                        {renderSendDocItem('contract', 'חוזה חתום', 'נסגר בהצלחה')}

                                        {/* 4. Additional Documents */}
                                        {additionalDocs.map(doc => renderSendDocItem(doc.id, doc.name, null, doc))}
                                    </div>

                                    {/* Add Additional Document Trigger */}
                                    <div style={{ marginTop: '2px' }}>
                                        <label style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            fontSize: '11px', color: '#c084fc', cursor: 'pointer', padding: '8px', 
                                            background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed rgba(139, 92, 246, 0.25)', 
                                            borderRadius: '6px', width: '100%', transition: 'all 0.2s ease'
                                        }}
                                            onMouseEnter={(e) => { e.target.style.background = 'rgba(139, 92, 246, 0.1)'; }}
                                            onMouseLeave={(e) => { e.target.style.background = 'rgba(139, 92, 246, 0.05)'; }}
                                        >
                                            <Plus size={12} /> הוסף מסמך נוסף לרשימה
                                            <input
                                                type="file"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        setDocUploading(true);
                                                        try {
                                                            const added = await db.uploadDocument({ lead_id: leadId, name: file.name, type: 'other' }, file);
                                                            setDocuments(prev => [...prev, added]);
                                                            setSelectedDocsToSend(prev => [...prev, added.id]);
                                                            await db.addNote({ lead_id: leadId, content: `הועלה מסמך נוסף לרשימת השליחה: ${file.name}` });
                                                            const notesData = await db.getNotes(leadId);
                                                            setNotes(notesData);
                                                        } catch (err) {
                                                            alert('שגיאה בהעלאה: ' + (err.message || err));
                                                        } finally {
                                                            setDocUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>

                                    {/* Sending Controls (WhatsApp / Email / Previews) - Only if we have at least one valid existing doc selected */}
                                    {hasAnyDocsSelected() && (
                                        <div style={{ 
                                            padding: '12px', background: 'rgba(255,255,255,0.02)', 
                                            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                                            display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px'
                                        }}>
                                            {/* Channel Selector */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>בחר ערוצי שליחה:</span>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-light)', cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={sendViaWhatsApp} 
                                                            onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                                                            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                        />
                                                        <MessageCircle size={12} style={{ color: '#10b981' }} /> וואטסאפ (WhatsApp)
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-light)', cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={sendViaEmail} 
                                                            onChange={(e) => setSendViaEmail(e.target.checked)}
                                                            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                        />
                                                        <Mail size={12} style={{ color: '#3b82f6' }} /> אימייל (Email)
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Message Content Preview/Edit */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>נוסח ההודעה לשליחה:</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(customMessageText);
                                                                alert('ההודעה הועתקה ללוח הזיכרון!');
                                                            }}
                                                            style={{ 
                                                                background: 'none', border: 'none', color: '#10b981', 
                                                                fontSize: '10px', textDecoration: 'underline', cursor: 'pointer', padding: 0 
                                                            }}
                                                        >
                                                            העתק הודעה
                                                        </button>
                                                        {isMessageModified && (
                                                            <button 
                                                                type="button" 
                                                                onClick={handleResetMessageText} 
                                                                style={{ 
                                                                    background: 'none', border: 'none', color: '#c084fc', 
                                                                    fontSize: '10px', textDecoration: 'underline', cursor: 'pointer', padding: 0 
                                                                }}
                                                            >
                                                                אפס לנוסח ברירת מחדל
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={customMessageText}
                                                    onChange={(e) => {
                                                        setCustomMessageText(e.target.value);
                                                        setIsMessageModified(true);
                                                    }}
                                                    placeholder="הקלד את ההודעה ללקוח..."
                                                    style={{
                                                        width: '100%', height: '110px', background: 'rgba(0,0,0,0.2)',
                                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                                                        color: 'var(--text-light)', padding: '8px', fontSize: '11.5px',
                                                        fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.4'
                                                    }}
                                                />
                                            </div>

                                            {/* Send Button */}
                                            <button
                                                type="button"
                                                disabled={isSendingDoc}
                                                onClick={handleSendDocuments}
                                                className="btn btn-primary"
                                                style={{
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                                    border: 'none', fontSize: '12px', padding: '8px',
                                                    borderRadius: '6px', cursor: isSendingDoc ? 'not-allowed' : 'pointer',
                                                    fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                                                }}
                                            >
                                                {isSendingDoc ? (
                                                    <>
                                                        <RefreshCw size={12} className="spin" />
                                                        שולח...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={12} />
                                                        שלח ללקוח
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Panel close padding */}
                            <div style={{ height: '20px' }} />
                        </div>
                    </>
                )}

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#8b5cf6' }}></i>
                    </div>
                ) : (
                    <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                        <div className="details-grid">
                            {/* Column 1: Info and Notes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Basic Info Card */}
                                <div className="glass-card" style={{ padding: '16px' }}>
                                    <h3 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>פרטי קשר וסטטוס</h3>
                                    
                                    <div className="lead-meta-info">
                                        <div className="lead-meta-row">
                                            <span className="lead-meta-label"><User size={12} style={{ display: 'inline', marginLeft: '6px' }} />שם מלא:</span>
                                            <span className="lead-meta-value">{lead.name}</span>
                                        </div>
                                        <div className="lead-meta-row">
                                            <span className="lead-meta-label"><Phone size={12} style={{ display: 'inline', marginLeft: '6px' }} />טלפון:</span>
                                            <span className="lead-meta-value" style={{ direction: 'ltr' }}>{lead.phone}</span>
                                        </div>
                                        <div className="lead-meta-row">
                                            <span className="lead-meta-label"><Mail size={12} style={{ display: 'inline', marginLeft: '6px' }} />אימייל:</span>
                                            <span className="lead-meta-value">{lead.email}</span>
                                        </div>
                                        <div className="lead-meta-row">
                                            <span className="lead-meta-label"><Briefcase size={12} style={{ display: 'inline', marginLeft: '6px' }} />חברה/עסק:</span>
                                            <span className="lead-meta-value">{lead.company || '—'}</span>
                                        </div>
                                        <div className="lead-meta-row">
                                            <span className="lead-meta-label"><Calendar size={12} style={{ display: 'inline', marginLeft: '6px' }} />תאריך יצירה:</span>
                                            <span className="lead-meta-value">{new Date(lead.created_at).toLocaleString('he-IL')}</span>
                                        </div>
                                    </div>

                                    {/* Status & Priority Selectors */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                                        <div>
                                            <label className="form-label" style={{ fontSize: '12px' }}>שלב טיפול (סטטוס)</label>
                                            <select 
                                                className="form-control"
                                                value={lead.status}
                                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                                style={{ padding: '8px 12px' }}
                                            >
                                                <option value="new">חדש</option>
                                                <option value="contacted">יצירת קשר</option>
                                                <option value="proposal">הצעת מחיר</option>
                                                <option value="won">Won - סגירה</option>
                                                <option value="lost">Lost - אבוד</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: '12px' }}>עדיפות</label>
                                            <select 
                                                className="form-control"
                                                value={lead.priority || 'medium'}
                                                onChange={(e) => handleUpdatePriority(e.target.value)}
                                                style={{ padding: '8px 12px' }}
                                            >
                                                <option value="high">דחוף (High)</option>
                                                <option value="medium">רגיל (Medium)</option>
                                                <option value="low">נמוך (Low)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments & Timeline */}
                                <div className="glass-card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>היסטוריית הערות ופעילות</h3>
                                    
                                    {/* Add Comment Form */}
                                    <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="הוסף הערה או עדכון חדש..." 
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            style={{ padding: '8px 12px' }}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                            <Plus size={16} />
                                        </button>
                                    </form>

                                    {/* Logs List */}
                                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {notes.length === 0 ? (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>אין היסטוריית פעילות עדיין.</p>
                                        ) : (
                                            notes.map(note => {
                                                const isSystem = note.content.includes("סטטוס") || note.content.includes("נוצר");
                                                return (
                                                    <div 
                                                        key={note.id} 
                                                        style={{ 
                                                            padding: '8px 12px', 
                                                            borderRadius: '6px', 
                                                            background: isSystem ? 'rgba(139, 92, 246, 0.03)' : 'rgba(255, 255, 255, 0.01)', 
                                                            border: isSystem ? '1px solid rgba(139, 92, 246, 0.1)' : '1px solid var(--border-color)',
                                                            fontSize: '12.5px'
                                                        }}
                                                    >
                                                        <div style={{ color: isSystem ? 'var(--text-light)' : 'var(--text-primary)' }}>
                                                            {note.content}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                            <Clock size={8} />
                                                            <span>{new Date(note.created_at).toLocaleString('he-IL')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Survey / Chatbot Data and Tasks */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Dynamic questionnaire / chatbot responses */}
                                <div className="glass-card" style={{ padding: '16px' }}>
                                    <h3 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>נתונים שנתקבלו מהאתר</h3>
                                    
                                    <div className="survey-responses-box">
                                        {/* Survey Data */}
                                        {lead.survey_data && (
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
                                                    שאלון איפיון מפורט
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">ענף פעילות:</div>
                                                    <div className="survey-answer">{lead.survey_data.industry === 'clinics' ? 'מרפאות' : lead.survey_data.industry === 'lawyers' ? 'עורכי דין' : lead.survey_data.industry === 'realtors' ? 'נדל״ן' : 'כללי/אחר'}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">מספר עובדים המבצעים משימות ידניות:</div>
                                                    <div className="survey-answer">{lead.survey_data.employees} עובדים</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">שעות מבוזבזות בשבוע לעובד (הערכה):</div>
                                                    <div className="survey-answer">{lead.survey_data.manual_hours} שעות שבועיות</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">עלות ממוצעת לשעת עבודה:</div>
                                                    <div className="survey-answer">₪{lead.survey_data.hourly_cost} לשעה</div>
                                                </div>
                                                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>הערכת פוטנציאל חיסכון מחושב:</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>חיסכון חודשי: <strong>{lead.survey_data.monthly_savings_cost}</strong></span>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>חיסכון שנתי: <strong style={{ color: '#10b981' }}>{lead.survey_data.yearly_savings_cost}</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Chatbot Data */}
                                        {lead.chatbot_session && (
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--accent-violet)', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-violet)' }}></span>
                                                    שיחת צ׳אטבוט AI
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">ענף שהוגדר:</div>
                                                    <div className="survey-answer">{lead.chatbot_session.industry === 'clinics' ? 'מרפאות' : lead.chatbot_session.industry === 'lawyers' ? 'עורכי דין' : lead.chatbot_session.industry === 'realtors' ? 'נדל״ן' : 'כללי/אחר'}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">האתגר/הקושי העיקרי:</div>
                                                    <div className="survey-answer" style={{ fontStyle: 'italic' }}>"{lead.chatbot_session.challenge || 'לא פורט'}"</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">אופן יצירת קשר מועדף:</div>
                                                    <div className="survey-answer">{lead.chatbot_session.contact_pref === 'whatsapp' ? 'הודעת WhatsApp' : 'שיחת טלפון'}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quote Data (Pricing / Proposal) */}
                                        {lead.quote_data && (
                                            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--accent-pink)', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-pink)' }}></span>
                                                    {lead.quote_data.project_type === 'website' ? 'הצעת מחיר לבניית אתר לעסק' : 'הצעת מחיר לאוטומציה ו-AI'}
                                                </div>
                                                
                                                {lead.quote_data.project_type === 'website' && (
                                                    <>
                                                        <div className="survey-response-item">
                                                            <div className="survey-question">סוג האתר:</div>
                                                            <div className="survey-answer" style={{ color: 'var(--text-light)' }}>
                                                                {WEBSITE_TYPES_MAP[lead.quote_data.website_type] || lead.quote_data.website_type || 'לא מוגדר'}
                                                            </div>
                                                        </div>
                                                        {lead.quote_data.addons && Object.values(lead.quote_data.addons).some(v => v) && (
                                                            <div className="survey-response-item">
                                                                <div className="survey-question">תוספות ושילובים:</div>
                                                                <div className="survey-answer" style={{ color: 'var(--text-light)', fontSize: '11px' }}>
                                                                    {Object.entries(lead.quote_data.addons)
                                                                        .filter(([_, active]) => active)
                                                                        .map(([key]) => WEBSITE_ADDONS_MAP[key] || key)
                                                                        .join(', ')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                <div className="survey-response-item">
                                                    <div className="survey-question">עלות הקמה מוצעת:</div>
                                                    <div className="survey-answer" style={{ fontWeight: 'bold', color: 'var(--text-light)' }}>₪{lead.quote_data.setup_cost?.toLocaleString('he-IL')}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">{lead.quote_data.project_type === 'website' ? 'עלות תחזוקה ואחסון:' : 'ריטיינר חודשי:'}</div>
                                                    <div className="survey-answer" style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>₪{lead.quote_data.sla_price?.toLocaleString('he-IL')}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">עלויות צד ג' חודשיות:</div>
                                                    <div className="survey-answer">₪{lead.quote_data.third_party_costs?.toLocaleString('he-IL')}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">סה"כ עלות חודשית:</div>
                                                    <div className="survey-answer">₪{lead.quote_data.monthly_cost?.toLocaleString('he-IL')}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">רווח חודשי נקי מחושב:</div>
                                                    <div className="survey-answer" style={{ color: lead.quote_data.net_profit > 0 ? '#10b981' : '#ef4444' }}>₪{lead.quote_data.net_profit?.toLocaleString('he-IL')}</div>
                                                </div>
                                                <div className="survey-response-item">
                                                    <div className="survey-question">החזר השקעה (ROI):</div>
                                                    <div className="survey-answer">תוך {lead.quote_data.break_even} חודשים</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fallback - Simple Notes */}
                                        {!lead.survey_data && !lead.chatbot_session && lead.notes && (
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>תוכן ההודעה המקורית:</div>
                                                <div style={{ fontSize: '13.5px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)', fontStyle: 'italic' }}>
                                                    "{lead.notes}"
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!lead.survey_data && !lead.chatbot_session && !lead.notes && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>אין מידע מובנה נוסף מהאתר.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Checklist of Tasks */}
                                <div className="glass-card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>משימות המשך (Checklist)</h3>
                                    
                                    {/* Add Task Form with Assignee and Dependency */}
                                    <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="מה צריך לעשות?" 
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px' }}
                                                required
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.2fr auto', gap: '8px', alignItems: 'center' }}>
                                            <select 
                                                className="form-control"
                                                value={newTaskAssignedTo}
                                                onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                                                style={{ padding: '8px', fontSize: '11.5px', height: '34px' }}
                                            >
                                                <option value="כללי">אחראי: כללי</option>
                                                <option value="אורי">אחראי: אורי</option>
                                                <option value="עידן">אחראי: עידן</option>
                                            </select>
                                            <select 
                                                className="form-control"
                                                value={newTaskDependsOn}
                                                onChange={(e) => setNewTaskDependsOn(e.target.value)}
                                                style={{ padding: '8px', fontSize: '11.5px', height: '34px' }}
                                            >
                                                <option value="">ללא תלות במשימה</option>
                                                {tasks.filter(t => !t.completed).map(t => (
                                                    <option key={t.id} value={t.id}>תלוי ב: {t.title}</option>
                                                ))}
                                            </select>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                value={newTaskDueDate}
                                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                                style={{ padding: '8px', fontSize: '11px', height: '34px' }}
                                                required
                                            />
                                            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', height: '34px' }}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </form>

                                    {/* Tasks Checklist */}
                                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {tasks.length === 0 ? (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>אין משימות פתוחות לליד זה.</p>
                                        ) : (
                                            tasks.map(task => {
                                                const isOverdue = !task.completed && task.due_date && task.due_date.split('T')[0] < new Date().toISOString().split('T')[0];
                                                const isBlocked = isTaskBlocked(task);
                                                return (
                                                    <div 
                                                        key={task.id} 
                                                        className={`task-item ${task.completed ? 'completed' : ''} ${isBlocked ? 'blocked' : ''}`}
                                                        style={{ 
                                                            padding: '8px 12px', 
                                                            marginBottom: '0', 
                                                            borderRight: isOverdue ? '3px solid #ef4444' : '1px solid var(--border-color)',
                                                            borderColor: task.completed ? 'transparent' : '',
                                                            opacity: isBlocked ? 0.6 : 1
                                                        }}
                                                    >
                                                        <div className="task-item-right">
                                                            <div 
                                                                className={`task-checkbox ${task.completed ? 'checked' : ''} ${isBlocked ? 'blocked-chk' : ''}`}
                                                                onClick={() => handleToggleTask(task.id)}
                                                                style={{ cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                                                            >
                                                                {task.completed ? <Check size={10} /> : isBlocked ? <Lock size={8} /> : null}
                                                            </div>
                                                            <div>
                                                                <span className="task-title" style={{ fontSize: '12.5px', color: isBlocked ? 'var(--text-muted)' : 'var(--text-light)' }}>
                                                                    {task.title}
                                                                </span>
                                                                <div style={{ fontSize: '9px', color: isOverdue ? '#ef4444' : 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <Calendar size={8} />
                                                                    <span>
                                                                        {isOverdue ? 'פג תוקף: ' : ''}
                                                                        {new Date(task.due_date).toLocaleDateString('he-IL')}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <User size={8} />
                                                                    <span>{task.assigned_to || 'כללי'}</span>
                                                                    {isBlocked && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <Lock size={8} />
                                                                            <span style={{ color: '#ef4444' }}>חסום</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="btn btn-secondary btn-icon"
                                                            style={{ width: '22px', height: '22px', fontSize: '10px', padding: '0', background: 'transparent', border: 'none' }}
                                                            onClick={() => handleDeleteTask(task.id)}
                                                        >
                                                            <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents & Files card removed — the 3 gating docs
                             (proposal / nda / contract) are managed via the 📎
                             side panel button in the modal header. All other
                             documents live inside the automation rows (Won only). */}

                        {/* Won Lead - Automations & Bugs Dashboard */}
                        {lead && lead.status === 'won' && (
                            <div className="glass-card" style={{ marginTop: '20px', padding: '20px' }}>
                                <h3 style={{ fontSize: '14px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-light)' }}>
                                    לוח בקרה לפרויקט: אוטומציות ותקלות
                                </h3>

                                {/* Add Automation Inline Form */}
                                <form onSubmit={handleAddAutomation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr)) 80px', gap: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>שם האוטומציה</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="למשל: בוט הודעות WhatsApp" 
                                            value={newAutoName} 
                                            onChange={(e) => setNewAutoName(e.target.value)} 
                                            style={{ padding: '6px 8px', fontSize: '12px', height: '30px' }} 
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>סוג/קטגוריה</label>
                                        <select 
                                            className="form-control" 
                                            value={newAutoType} 
                                            onChange={(e) => setNewAutoType(e.target.value)} 
                                            style={{ padding: '4px 6px', fontSize: '12px', height: '30px' }}
                                        >
                                            <option value="סוכני AI ומיילים">סוכני AI ומיילים</option>
                                            <option value="צ'אטבוטים של הודעות">צ'אטבוטים של הודעות</option>
                                            <option value="אינטגרציית מערכות ו-CRM">אינטגרציית מערכות ו-CRM</option>
                                            <option value="אוטומציות דוחות ופיננסיים">אוטומציות דוחות ופיננסיים</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>עלות הקמה</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            placeholder="₪" 
                                            value={newAutoSetupPrice} 
                                            onChange={(e) => setNewAutoSetupPrice(e.target.value)} 
                                            style={{ padding: '6px 8px', fontSize: '12px', height: '30px' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>תחזוקה חודשית</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            placeholder="₪" 
                                            value={newAutoMaintPrice} 
                                            onChange={(e) => setNewAutoMaintPrice(e.target.value)} 
                                            style={{ padding: '6px 8px', fontSize: '12px', height: '30px' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>יעד הרצות</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            placeholder="למשל: 500" 
                                            value={newAutoRunsGoal} 
                                            onChange={(e) => setNewAutoRunsGoal(e.target.value)} 
                                            style={{ padding: '6px 8px', fontSize: '12px', height: '30px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '30px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}>
                                            <Plus size={14} />
                                            <span>הוסף</span>
                                        </button>
                                    </div>
                                </form>

                                {/* Automations list for this lead */}
                                <div>
                                    {leadAutos.length === 0 ? (
                                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>טרם הוגדרו אוטומציות לפרויקט זה.</p>
                                    ) : (
                                        <div className="table-container" style={{ border: 'none', margin: '0' }}>
                                            <table className="leads-table" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                                                        <th style={{ padding: '8px 12px' }}>שם האוטומציה</th>
                                                        <th style={{ padding: '8px 12px' }}>קטגוריה</th>
                                                        <th style={{ padding: '8px 12px' }}>סכום הקמה</th>
                                                        <th style={{ padding: '8px 12px' }}>תחזוקה חודשית</th>
                                                        <th style={{ padding: '8px 12px' }}>באגים</th>
                                                        <th style={{ padding: '8px 12px' }}>סטטוס פיתוח</th>
                                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>פעולות</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leadAutos.map(auto => {
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
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    {wf.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>{auto.type}</td>
                                                                    <td style={{ padding: '8px 12px' }}>₪{auto.setup_price}</td>
                                                                    <td style={{ padding: '8px 12px' }}>₪{auto.monthly_maintenance}</td>
                                                                    <td style={{ padding: '8px 12px', color: openBugsCount > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: openBugsCount > 0 ? '600' : 'normal' }}>
                                                                        {openBugsCount > 0 ? `🐛 ${openBugsCount} פתוחים` : 'אין תקלות'}
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }} onClick={(e) => e.stopPropagation()}>
                                                                        <select
                                                                            value={auto.status || 'design'}
                                                                            onChange={(e) => handleUpdateAutoStatus(auto.id, e.target.value)}
                                                                            className="form-control"
                                                                            style={{ padding: '2px 6px', fontSize: '11px', height: '24px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-light)', width: '90px' }}
                                                                        >
                                                                            <option value="design">אפיון</option>
                                                                            <option value="development">פיתוח</option>
                                                                            <option value="testing">בדיקות</option>
                                                                            <option value="live">פעיל</option>
                                                                            <option value="paused">מוקפא</option>
                                                                        </select>
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
                                                                        <button 
                                                                            className="btn btn-secondary btn-icon"
                                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                                            onClick={() => handleDeleteAutomation(auto.id)}
                                                                        >
                                                                            <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr style={{ background: 'rgba(0,0,0,0.12)' }}>
                                                                        <td colSpan="7" style={{ padding: '12px 20px', borderTop: 'none' }}>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                                
                                                                                {/* Tabs Row */}
                                                                                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '10px' }} onClick={(e) => e.stopPropagation()}>
                                                                                    {['ops', 'stats', 'runs', 'docs'].map(tab => {
                                                                                        const runsCount = (autoRuns[auto.id] || []).length;
                                                                                        const labels = { 
                                                                                            ops: 'תפעול ואפיון', 
                                                                                            stats: 'מדדים וסטטיסטיקות', 
                                                                                            runs: `לוג ריצות (${runsCount})`,
                                                                                            docs: 'מסמכים'
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
                                                                                            const getWeeksOfMonth = (year, month) => {
                                                                                                const firstDayIndex = new Date(year, month, 1).getDay();
                                                                                                const firstSaturdayDate = 1 + (6 - firstDayIndex);
                                                                                                const lastDay = new Date(year, month + 1, 0).getDate();
                                                                                                const weeks = [];
                                                                                                weeks.push({ weekNum: 1, startDay: 1, endDay: Math.min(firstSaturdayDate, lastDay) });
                                                                                                let currentStart = firstSaturdayDate + 1;
                                                                                                let wNum = 2;
                                                                                                while (currentStart <= lastDay) {
                                                                                                    const currentEnd = Math.min(currentStart + 6, lastDay);
                                                                                                    weeks.push({ weekNum: wNum, startDay: currentStart, endDay: currentEnd });
                                                                                                    currentStart = currentEnd + 1;
                                                                                                    wNum++;
                                                                                                }
                                                                                                return weeks;
                                                                                            };

                                                                                            const runs = autoRuns[auto.id] || [];
                                                                                            const total = runs.length;
                                                                                            const success = runs.filter(r => r.status === 'success').length;
                                                                                            const warning = runs.filter(r => r.status === 'warning').length;
                                                                                            const error = runs.filter(r => r.status === 'error').length;
                                                                                            const blocked = runs.filter(r => r.error_type && r.error_type.includes('נחסמה')).length;
                                                                                            const realErrors = error - blocked;
                                                                                            
                                                                                            const activeTotal = total - blocked;
                                                                                            const successRate = activeTotal > 0 ? Math.round((success / activeTotal) * 100) : 100;
                                                                                            const runsWithDuration = runs.filter(r => r.duration_ms > 0);
                                                                                            const avgDuration = runsWithDuration.length > 0 ? Math.round(runsWithDuration.reduce((acc, r) => acc + r.duration_ms, 0) / runsWithDuration.length) : 0;

                                                                                            // Calculate consecutive failures (from most recent, excluding blocked runs)
                                                                                            const sortedRuns = [...runs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                                                                                            let consecutiveFailures = 0;
                                                                                            for (const r of sortedRuns) {
                                                                                                if (r.status === 'error') {
                                                                                                    if (r.error_type && r.error_type.includes('נחסמה')) {
                                                                                                        continue; // Ignore blocked runs for consecutive failures
                                                                                                    }
                                                                                                    consecutiveFailures++;
                                                                                                } else {
                                                                                                    break;
                                                                                                }
                                                                                              }

                                                                                            // Calculate open bugs count (mapped to this auto)
                                                                                            const openBugsCount = bugs.filter(b => b.automation_id === auto.id && b.status !== 'resolved').length;

                                                                                            // Calculate Health Score (excluding blocked runs)
                                                                                            const runs30 = runs.filter(r => new Date(r.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                                                                                            const total30 = runs30.length;
                                                                                            const blocked30 = runs30.filter(r => r.error_type && r.error_type.includes('נחסמה')).length;
                                                                                            const activeTotal30 = total30 - blocked30;
                                                                                            const errors30 = runs30.filter(r => r.status === 'error' && !(r.error_type && r.error_type.includes('נחסמה'))).length;
                                                                                            const failRate = activeTotal30 > 0 ? (errors30 / activeTotal30) : 0;
                                                                                            const healthDeductions = (failRate * 40) + Math.min(30, consecutiveFailures * 15) + Math.min(30, openBugsCount * 10);
                                                                                            const healthScore = Math.max(0, Math.min(100, Math.round(100 - healthDeductions)));

                                                                                            // Calculate MTTR (Mean Time to Repair)
                                                                                            const bugResolutions = JSON.parse(localStorage.getItem('bug_resolution_times') || '{}');
                                                                                            const resolvedBugs = bugs.filter(b => b.automation_id === auto.id && b.status === 'resolved');
                                                                                            let totalMTTRMs = 0;
                                                                                            let resolvedCountWithTime = 0;
                                                                                            resolvedBugs.forEach(bug => {
                                                                                                const resTimeStr = bugResolutions[bug.id];
                                                                                                const resTime = resTimeStr ? new Date(resTimeStr).getTime() : new Date(bug.created_at).getTime() + 12 * 60 * 60 * 1000; // default 12 hours
                                                                                                const createdTime = new Date(bug.created_at).getTime();
                                                                                                if (resTime > createdTime) {
                                                                                                    totalMTTRMs += (resTime - createdTime);
                                                                                                    resolvedCountWithTime++;
                                                                                                }
                                                                                            });
                                                                                            const avgMTTR = resolvedCountWithTime > 0 ? Math.round(totalMTTRMs / resolvedCountWithTime) : 0;

                                                                                            // Calculate ROI & Savings
                                                                                            const storedRoi = JSON.parse(localStorage.getItem('auto_roi_settings') || '{}');
                                                                                            const autoRoi = storedRoi[auto.id] || { manualMins: 5, hourlyWage: 50 };
                                                                                            const hoursSaved = Math.round(((success * autoRoi.manualMins) / 60) * 10) / 10;
                                                                                            const moneySaved = Math.round(hoursSaved * autoRoi.hourlyWage);

                                                                                            // Calculate Monthly Goal & Forecast
                                                                                            const startOfMonth = new Date();
                                                                                            startOfMonth.setDate(1);
                                                                                            startOfMonth.setHours(0,0,0,0);
                                                                                            const currentMonthRuns = runs.filter(r => new Date(r.created_at) >= startOfMonth && !(r.error_type && r.error_type.includes('נחסמה')));
                                                                                            const currentMonthTotal = currentMonthRuns.length;
                                                                                            
                                                                                            const totalAllowed = (auto.runs_goal || 0) + (auto.extra_runs_allowance || 0);
                                                                                            const goalPercent = totalAllowed > 0 ? Math.round((currentMonthTotal / totalAllowed) * 100) : 0;

                                                                                            // Forecast based on elapsed days in month
                                                                                            const today = new Date();
                                                                                            const elapsedDays = today.getDate();
                                                                                            const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                                                                                            const runsPerDay = currentMonthTotal / elapsedDays;
                                                                                            const forecastRuns = Math.round(runsPerDay * totalDaysInMonth);
                                                                                            const forecastPercent = totalAllowed > 0 ? Math.round((forecastRuns / totalAllowed) * 100) : 0;
                                                                                            
                                                                                            const overageRuns = Math.max(0, currentMonthTotal - totalAllowed);
                                                                                            const overageRate = auto.custom_overage_rate === undefined ? 0.05 : auto.custom_overage_rate;
                                                                                            const overageCost = overageRuns * overageRate;

                                                                                            // Calculate peak hour
                                                                                            const hourlyRunCounts = Array(24).fill(0);
                                                                                            runs.forEach(r => {
                                                                                                const d = new Date(r.created_at);
                                                                                                hourlyRunCounts[d.getHours()]++;
                                                                                            });
                                                                                            let peakHour = -1;
                                                                                            let peakCount = 0;
                                                                                            hourlyRunCounts.forEach((count, hr) => {
                                                                                                if (count > peakCount) {
                                                                                                    peakCount = count;
                                                                                                    peakHour = hr;
                                                                                                }
                                                                                            });

                                                                                            // Calculate average success vs failed duration
                                                                                            const successRunsWithDuration = runs.filter(r => r.status === 'success' && r.duration_ms > 0);
                                                                                            const avgSuccessDur = successRunsWithDuration.length > 0 ? Math.round(successRunsWithDuration.reduce((acc, r) => acc + r.duration_ms, 0) / successRunsWithDuration.length) : 0;

                                                                                            const failedRunsWithDuration = runs.filter(r => r.status === 'error' && r.duration_ms > 0);
                                                                                            const avgFailedDur = failedRunsWithDuration.length > 0 ? Math.round(failedRunsWithDuration.reduce((acc, r) => acc + r.duration_ms, 0) / failedRunsWithDuration.length) : 0;

                                                                                            // Calculate weekly performance trend (last 7 days vs preceding 7 days)
                                                                                            const now = new Date();
                                                                                            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                                                                            const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

                                                                                            const recentRuns = runs.filter(r => {
                                                                                                const date = new Date(r.created_at);
                                                                                                return date >= sevenDaysAgo && r.duration_ms > 0;
                                                                                            });
                                                                                            const priorRuns = runs.filter(r => {
                                                                                                const date = new Date(r.created_at);
                                                                                                return date >= fourteenDaysAgo && date < sevenDaysAgo && r.duration_ms > 0;
                                                                                            });

                                                                                            const avgRecent = recentRuns.length > 0 ? recentRuns.reduce((acc, r) => acc + r.duration_ms, 0) / recentRuns.length : 0;
                                                                                            const avgPrior = priorRuns.length > 0 ? priorRuns.reduce((acc, r) => acc + r.duration_ms, 0) / priorRuns.length : 0;

                                                                                            let trendText = 'אין מספיק נתונים להשוואת מגמה';
                                                                                            let trendColor = 'var(--text-muted)';

                                                                                            if (avgRecent > 0 && avgPrior > 0) {
                                                                                                const diffPercent = Math.round(((avgRecent - avgPrior) / avgPrior) * 100);
                                                                                                if (diffPercent > 5) {
                                                                                                    trendText = `📈 האטה של ${diffPercent}% בזמני הריצה בהשוואה לשבוע שעבר`;
                                                                                                    trendColor = '#ef4444';
                                                                                                } else if (diffPercent < -5) {
                                                                                                    trendText = `📉 שיפור של ${Math.abs(diffPercent)}% בזמני הריצה בהשוואה לשבוע שעבר`;
                                                                                                    trendColor = '#10b981';
                                                                                                } else {
                                                                                                    trendText = `📊 זמני הריצה יציבים בהשוואה לשבוע שעבר`;
                                                                                                    trendColor = 'var(--accent-cyan)';
                                                                                                }
                                                                                            }

                                                                                            const errorTypes = {};;
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

                                                                                            // Calculate interactive chart volume data based on resolution toggle and drill-down filters
                                                                                            const state = chartStates[auto.id] || {
                                                                                                resolution: 'yearly',
                                                                                                year: null,
                                                                                                month: null,
                                                                                                week: null,
                                                                                                day: null
                                                                                            };
                                                                                            const resolution = state.resolution;
                                                                                            let chartData = [];
                                                                                            
                                                                                            if (resolution === 'yearly') {
                                                                                                const years = {};
                                                                                                runs.forEach(r => {
                                                                                                    const year = new Date(r.created_at).getFullYear();
                                                                                                    years[year] = (years[year] || 0) + 1;
                                                                                                });
                                                                                                const sortedYears = Object.keys(years).sort();
                                                                                                if (sortedYears.length === 0) {
                                                                                                    chartData = [{ label: String(new Date().getFullYear()), count: 0, year: new Date().getFullYear() }];
                                                                                                } else {
                                                                                                    chartData = sortedYears.map(y => ({ label: String(y), count: years[y], year: Number(y) }));
                                                                                                }
                                                                                            } else if (resolution === 'monthly') {
                                                                                                const yearFilter = state.year || new Date().getFullYear();
                                                                                                chartData = monthNames.map((name, idx) => ({ label: name, count: 0, year: yearFilter, month: idx }));
                                                                                                runs.forEach(r => {
                                                                                                    const d = new Date(r.created_at);
                                                                                                    if (d.getFullYear() === yearFilter) {
                                                                                                        const month = d.getMonth();
                                                                                                        chartData[month].count++;
                                                                                                    }
                                                                                                });
                                                                                            } else if (resolution === 'weekly') {
                                                                                                const yearFilter = state.year || new Date().getFullYear();
                                                                                                const monthFilter = state.month !== null ? state.month : new Date().getMonth();
                                                                                                
                                                                                                // Get correct Sunday-Saturday weeks
                                                                                                const weeks = getWeeksOfMonth(yearFilter, monthFilter);
                                                                                                chartData = weeks.map(w => ({
                                                                                                    label: `שבוע ${w.weekNum} (${w.startDay}/${monthFilter + 1}-${w.endDay}/${monthFilter + 1})`,
                                                                                                    count: 0,
                                                                                                    year: yearFilter,
                                                                                                    month: monthFilter,
                                                                                                    week: w.weekNum,
                                                                                                    startDay: w.startDay,
                                                                                                    endDay: w.endDay
                                                                                                }));
                                                                                                
                                                                                                runs.forEach(r => {
                                                                                                    const d = new Date(r.created_at);
                                                                                                    if (d.getFullYear() === yearFilter && d.getMonth() === monthFilter) {
                                                                                                        const dayOfMonth = d.getDate();
                                                                                                        // Find which week this day belongs to
                                                                                                        const matchedWeekIdx = weeks.findIndex(w => dayOfMonth >= w.startDay && dayOfMonth <= w.endDay);
                                                                                                        if (matchedWeekIdx !== -1) {
                                                                                                            chartData[matchedWeekIdx].count++;
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                            } else if (resolution === 'daily') {
                                                                                                const yearFilter = state.year || new Date().getFullYear();
                                                                                                const monthFilter = state.month !== null ? state.month : new Date().getMonth();
                                                                                                const weekFilter = state.week || 1;
                                                                                                
                                                                                                // Get correct Sunday-Saturday weeks
                                                                                                const weeks = getWeeksOfMonth(yearFilter, monthFilter);
                                                                                                const selectedWeekObj = weeks.find(w => w.weekNum === weekFilter) || weeks[0];
                                                                                                
                                                                                                const startDay = selectedWeekObj.startDay;
                                                                                                const endDay = selectedWeekObj.endDay;
                                                                                                
                                                                                                const days = [];
                                                                                                for (let day = startDay; day <= endDay; day++) {
                                                                                                    const dateObj = new Date(yearFilter, monthFilter, day);
                                                                                                    if (dateObj.getMonth() === monthFilter) {
                                                                                                        const dayNameHeb = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][dateObj.getDay()];
                                                                                                        days.push({
                                                                                                            label: `${dayNameHeb}' - ${day}/${monthFilter + 1}`,
                                                                                                            count: 0,
                                                                                                            year: yearFilter,
                                                                                                            month: monthFilter,
                                                                                                            week: weekFilter,
                                                                                                            day: day
                                                                                                        });
                                                                                                    }
                                                                                                }
                                                                                                
                                                                                                runs.forEach(r => {
                                                                                                    const d = new Date(r.created_at);
                                                                                                    if (d.getFullYear() === yearFilter && d.getMonth() === monthFilter) {
                                                                                                        const dayOfMonth = d.getDate();
                                                                                                        if (dayOfMonth >= startDay && dayOfMonth <= endDay) {
                                                                                                            const dayIdx = dayOfMonth - startDay;
                                                                                                            if (days[dayIdx]) {
                                                                                                                days[dayIdx].count++;
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                                chartData = days;
                                                                                            } else if (resolution === 'hourly') {
                                                                                                const yearFilter = state.year || new Date().getFullYear();
                                                                                                const monthFilter = state.month !== null ? state.month : new Date().getMonth();
                                                                                                const dayFilter = state.day || new Date().getDate();
                                                                                                
                                                                                                chartData = Array(12).fill(0).map((_, i) => {
                                                                                                    const start = i * 2;
                                                                                                    const end = start + 2;
                                                                                                    const label = `${String(start).padStart(2, '0')}-${String(end).padStart(2, '0')}`;
                                                                                                    return {
                                                                                                        label,
                                                                                                        count: 0,
                                                                                                        year: yearFilter,
                                                                                                        month: monthFilter,
                                                                                                        day: dayFilter,
                                                                                                        hourBlock: i
                                                                                                    };
                                                                                                });
                                                                                                
                                                                                                runs.forEach(r => {
                                                                                                    const d = new Date(r.created_at);
                                                                                                    if (d.getFullYear() === yearFilter && d.getMonth() === monthFilter && d.getDate() === dayFilter) {
                                                                                                        const hour = d.getHours();
                                                                                                        const blockIdx = Math.floor(hour / 2);
                                                                                                        if (blockIdx >= 0 && blockIdx < 12) {
                                                                                                            chartData[blockIdx].count++;
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                            }

                                                                                            return (
                                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                                                    {consecutiveFailures >= 2 && (
                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', color: '#f87171', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                                                                                                            <span>⚠️</span>
                                                                                                            <span>שים לב: האוטומציה נכשלה ב-{consecutiveFailures} הריצות האחרונות ברצף! מומלץ לבדוק את לשונית "לוג ריצות".</span>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    <div className="premium-stats-grid">
                                                                                                        {/* Health Score Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': healthScore > 80 ? 'rgba(16, 185, 129, 0.15)' : healthScore > 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                                                                                                            <span className="card-title">ציון בריאות</span>
                                                                                                            {(() => {
                                                                                                                const radius = 18;
                                                                                                                const stroke = 3;
                                                                                                                const normalizedRadius = radius - stroke;
                                                                                                                const circumference = normalizedRadius * 2 * Math.PI;
                                                                                                                const strokeDashoffset = circumference - (healthScore / 100) * circumference;
                                                                                                                const gaugeColor = healthScore > 80 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444';
                                                                                                                return (
                                                                                                                    <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                                        <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                                                                                                                            <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx="20" cy="20" />
                                                                                                                            <circle stroke={gaugeColor} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} r={normalizedRadius} cx="20" cy="20" strokeLinecap="round" />
                                                                                                                        </svg>
                                                                                                                        <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>{healthScore}%</span>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            })()}
                                                                                                        </div>
                                                                                                        {/* Total Runs Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': 'rgba(255, 255, 255, 0.08)' }}>
                                                                                                            <span className="card-title">סה"ך הרצות</span>
                                                                                                            <strong className="card-value">{total}</strong>
                                                                                                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                                                                                {success} הצלחות | {blocked} חסומות | {realErrors} שגיאות
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        {/* Success Rate Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': successRate > 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
                                                                                                            <span className="card-title">שיעור הצלחה</span>
                                                                                                            <strong className="card-value" style={{ color: successRate > 80 ? '#10b981' : '#f59e0b' }}>{successRate}%</strong>
                                                                                                        </div>
                                                                                                        {/* Avg Duration Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': 'rgba(6, 182, 212, 0.15)' }}>
                                                                                                            <span className="card-title">זמן תגובה ממוצע</span>
                                                                                                            <strong className="card-value" style={{ color: 'var(--accent-cyan)' }}>{formatDuration(avgDuration)}</strong>
                                                                                                        </div>
                                                                                                        {/* Open Bugs Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': openBugsCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)' }}>
                                                                                                            <span className="card-title">באגים פתוחים</span>
                                                                                                            <strong className="card-value" style={{ color: openBugsCount > 0 ? '#ef4444' : 'var(--text-secondary)' }}>{openBugsCount}</strong>
                                                                                                        </div>
                                                                                                        {/* Peak Hour Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': 'rgba(245, 158, 11, 0.15)' }}>
                                                                                                            <span className="card-title">שעת עומס שיא</span>
                                                                                                            <strong className="card-value" style={{ color: '#f59e0b' }}>{peakHour !== -1 ? `${String(peakHour).padStart(2, '0')}:00` : '—'}</strong>
                                                                                                            <span className="card-subtext">{peakCount > 0 ? `(${peakCount} הרצות)` : 'אין הרצות'}</span>
                                                                                                        </div>
                                                                                                        {/* MTTR Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': 'rgba(6, 182, 212, 0.15)' }}>
                                                                                                            <span className="card-title">זמן פתרון באג</span>
                                                                                                            <strong className="card-value" style={{ color: 'var(--accent-cyan)', fontSize: '15px' }}>{formatMTTR(avgMTTR)}</strong>
                                                                                                            <span className="card-subtext">MTTR ממוצע</span>
                                                                                                        </div>
                                                                                                        {/* ROI Card */}
                                                                                                        <div className="premium-stats-card" style={{ '--hover-glow-color': 'rgba(16, 185, 129, 0.15)' }}>
                                                                                                            <button 
                                                                                                                type="button"
                                                                                                                onClick={() => setRoiSettingsOpen(prev => ({ ...prev, [auto.id]: !prev[auto.id] }))}
                                                                                                                style={{ position: 'absolute', top: '4px', left: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '9px', padding: '2px' }}
                                                                                                                title="הגדרות ROI"
                                                                                                            >
                                                                                                                ⚙️
                                                                                                            </button>
                                                                                                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>חיסכון ו-ROI</span>
                                                                                                            <strong style={{ fontSize: '16px', color: '#10b981', display: 'block', marginTop: '2px' }}>₪{moneySaved}</strong>
                                                                                                            <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>{hoursSaved > 0 ? `(${hoursSaved} ש' נחסכו)` : 'אין נתונים'}</span>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* ROI inline configuration panel */}
                                                                                                    {roiSettingsOpen[auto.id] && (
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                                                                                                            <span style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-light)', display: 'block' }}>⚙️ הגדרות חיסכון ו-ROI עבור {auto.name}:</span>
                                                                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: '1 1 120px' }}>
                                                                                                                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>זמן טיפול ידני משוער להרצה (דקות):</label>
                                                                                                                    <input 
                                                                                                                        type="number" 
                                                                                                                        min="1"
                                                                                                                        value={tempRoiMins[auto.id] !== undefined ? tempRoiMins[auto.id] : autoRoi.manualMins} 
                                                                                                                        onChange={(e) => setTempRoiMins({ ...tempRoiMins, [auto.id]: parseInt(e.target.value) || 0 })}
                                                                                                                        style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-light)' }}
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: '1 1 120px' }}>
                                                                                                                    <label style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>עלות שעת עבודה ממוצעת לעובד (₪):</label>
                                                                                                                    <input 
                                                                                                                        type="number" 
                                                                                                                        min="1"
                                                                                                                        value={tempRoiWage[auto.id] !== undefined ? tempRoiWage[auto.id] : autoRoi.hourlyWage} 
                                                                                                                        onChange={(e) => setTempRoiWage({ ...tempRoiWage, [auto.id]: parseInt(e.target.value) || 0 })}
                                                                                                                        style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-light)' }}
                                                                                                                    />
                                                                                                                </div>
                                                                                                                <button 
                                                                                                                    type="button"
                                                                                                                    onClick={() => {
                                                                                                                        const mins = tempRoiMins[auto.id] !== undefined ? tempRoiMins[auto.id] : autoRoi.manualMins;
                                                                                                                        const wage = tempRoiWage[auto.id] !== undefined ? tempRoiWage[auto.id] : autoRoi.hourlyWage;
                                                                                                                        const current = JSON.parse(localStorage.getItem('auto_roi_settings') || '{}');
                                                                                                                        current[auto.id] = { manualMins: mins, hourlyWage: wage };
                                                                                                                        localStorage.setItem('auto_roi_settings', JSON.stringify(current));
                                                                                                                        setRoiSettingsOpen({ ...roiSettingsOpen, [auto.id]: false });
                                                                                                                    }}
                                                                                                                    className="btn btn-secondary"
                                                                                                                    style={{ padding: '4px 12px', fontSize: '11px', height: '26px' }}
                                                                                                                >
                                                                                                                    שמור הגדרות
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Monthly Goal & Forecast Progress bar */}
                                                                                                    {auto.runs_goal > 0 && (
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', marginTop: '2px' }}>
                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                                                                                                                <span style={{ color: 'var(--text-light)', fontWeight: '600' }}>🎯 התקדמות מול יעד הרצות חודשי:</span>
                                                                                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                                                                                    {currentMonthTotal} מתוך {totalAllowed} הרצות 
                                                                                                                    {auto.extra_runs_allowance > 0 && ` (כולל ${auto.extra_runs_allowance} בונוס)`} ({goalPercent}%)
                                                                                                                </span>
                                                                                                            </div>
                                                                                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                                                                                                                <div style={{ width: `${Math.min(100, goalPercent)}%`, height: '100%', background: overageRuns > 0 ? '#ef4444' : 'var(--accent-cyan)' }} />
                                                                                                            </div>
                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '4px' }}>
                                                                                                                <span>
                                                                                                                    🔮 תחזית לסוף החודש הנוכחי: כ-<strong>{forecastRuns}</strong> הרצות ({totalAllowed > 0 ? Math.round((forecastRuns / totalAllowed) * 100) : 0}% מהיעד)
                                                                                                                </span>
                                                                                                                {overageRuns > 0 && (
                                                                                                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                                                                                                        ⚠️ חיוב חריגה: {overageRuns} הרצות ({overageCost.toFixed(2)} ₪)
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {total > 0 && (
                                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '10px', marginTop: '2px' }}>
                                                                                                            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}>
                                                                                                                <span>זמן הצלחה ממוצע: <strong style={{ color: '#10b981' }}>{avgSuccessDur > 0 ? formatDuration(avgSuccessDur) : '—'}</strong></span>
                                                                                                                <span style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>זמן שגיאה ממוצע: <strong style={{ color: '#ef4444' }}>{avgFailedDur > 0 ? formatDuration(avgFailedDur) : '—'}</strong></span>
                                                                                                            </div>
                                                                                                            <div style={{ color: trendColor, fontWeight: '600' }}>
                                                                                                                {trendText}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}


                                                                                                    {total > 0 && (
                                                                                                        <div style={{ marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>התפלגות הרצות:</span>
                                                                                                            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                                                                                                <div style={{ width: `${(success / total) * 100}%`, background: '#10b981' }} title={`הצלחה: ${success}`} />
                                                                                                                <div style={{ width: `${(warning / total) * 100}%`, background: '#f59e0b' }} title={`אזהרה: ${warning}`} />
                                                                                                                <div style={{ width: `${(realErrors / total) * 100}%`, background: '#ef4444' }} title={`שגיאה: ${realErrors}`} />
                                                                                                                <div style={{ width: `${(blocked / total) * 100}%`, background: '#8b5cf6' }} title={`נחסמו: ${blocked}`} />
                                                                                                            </div>
                                                                                                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '9.5px', color: 'var(--text-muted)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />תקין ({success})</span>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />אזהרה ({warning})</span>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />שגיאה ({realErrors})</span>
                                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }} />נחסם ({blocked})</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Interactive Volume Chart Widget */}
                                                                                                    {total > 0 && (
                                                                                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', marginTop: '4px' }}>
                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                                                                                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)' }}>
                                                                                                                    נפח שימוש באוטומציה לפי זמן:
                                                                                                                </span>
                                                                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                                                                    {[
                                                                                                                        { id: 'yearly', label: 'שנתי' },
                                                                                                                        { id: 'monthly', label: 'חודשי' },
                                                                                                                        { id: 'weekly', label: 'שבועי' },
                                                                                                                        { id: 'daily', label: 'יומי' },
                                                                                                                        { id: 'hourly', label: 'שעתי' }
                                                                                                                    ].map(res => (
                                                                                                                        <button
                                                                                                                            key={res.id}
                                                                                                                            onClick={() => {
                                                                                                                                let nextYear = state.year;
                                                                                                                                let nextMonth = state.month;
                                                                                                                                let nextWeek = state.week;
                                                                                                                                let nextDay = state.day;
                                                                                                                                
                                                                                                                                if (res.id === 'yearly') {
                                                                                                                                    nextYear = null; nextMonth = null; nextWeek = null; nextDay = null;
                                                                                                                                } else if (res.id === 'monthly') {
                                                                                                                                    nextYear = nextYear || new Date().getFullYear();
                                                                                                                                    nextMonth = null; nextWeek = null; nextDay = null;
                                                                                                                                } else if (res.id === 'weekly') {
                                                                                                                                    nextYear = nextYear || new Date().getFullYear();
                                                                                                                                    nextMonth = nextMonth !== null ? nextMonth : new Date().getMonth();
                                                                                                                                    nextWeek = null; nextDay = null;
                                                                                                                                } else if (res.id === 'daily') {
                                                                                                                                    nextYear = nextYear || new Date().getFullYear();
                                                                                                                                    nextMonth = nextMonth !== null ? nextMonth : new Date().getMonth();
                                                                                                                                    nextWeek = nextWeek || 1;
                                                                                                                                    nextDay = null;
                                                                                                                                } else if (res.id === 'hourly') {
                                                                                                                                    nextYear = nextYear || new Date().getFullYear();
                                                                                                                                    nextMonth = nextMonth !== null ? nextMonth : new Date().getMonth();
                                                                                                                                    nextWeek = nextWeek || 1;
                                                                                                                                    nextDay = nextDay || new Date().getDate();
                                                                                                                                }
                                                                                                                                
                                                                                                                                setChartStates({
                                                                                                                                    ...chartStates,
                                                                                                                                    [auto.id]: {
                                                                                                                                        resolution: res.id,
                                                                                                                                        year: nextYear,
                                                                                                                                        month: nextMonth,
                                                                                                                                        week: nextWeek,
                                                                                                                                        day: nextDay
                                                                                                                                    }
                                                                                                                                });
                                                                                                                            }}
                                                                                                                            style={{
                                                                                                                                padding: '2px 6px',
                                                                                                                                fontSize: '9px',
                                                                                                                                borderRadius: '4px',
                                                                                                                                border: '1px solid',
                                                                                                                                borderColor: resolution === res.id ? 'var(--accent-violet)' : 'rgba(255,255,255,0.1)',
                                                                                                                                background: resolution === res.id ? 'rgba(139, 92, 246, 0.15)' : 'none',
                                                                                                                                color: resolution === res.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                                                                                                                cursor: 'pointer',
                                                                                                                                fontWeight: resolution === res.id ? '600' : 'normal',
                                                                                                                                transition: 'all 0.2s'
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            {res.label}
                                                                                                                        </button>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            </div>

                                                                                                            {/* Navigation Breadcrumbs */}
                                                                                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                                                                                <span style={{ color: 'var(--text-muted)' }}>ניווט:</span>
                                                                                                                <span
                                                                                                                    style={{ cursor: 'pointer', color: resolution === 'yearly' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textDecoration: resolution !== 'yearly' ? 'underline' : 'none' }}
                                                                                                                    onClick={() => setChartStates({ ...chartStates, [auto.id]: { resolution: 'yearly', year: null, month: null, week: null, day: null } })}
                                                                                                                >
                                                                                                                    שנתי
                                                                                                                </span>
                                                                                                                {state.year && (
                                                                                                                    <>
                                                                                                                        <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                                                                                                                        <span
                                                                                                                            style={{ cursor: 'pointer', color: resolution === 'monthly' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textDecoration: resolution !== 'monthly' ? 'underline' : 'none' }}
                                                                                                                            onClick={() => setChartStates({ ...chartStates, [auto.id]: { resolution: 'monthly', year: state.year, month: null, week: null, day: null } })}
                                                                                                                        >
                                                                                                                            {state.year}
                                                                                                                        </span>
                                                                                                                    </>
                                                                                                                )}
                                                                                                                {state.month !== null && (
                                                                                                                    <>
                                                                                                                        <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                                                                                                                        <span
                                                                                                                            style={{ cursor: 'pointer', color: resolution === 'weekly' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textDecoration: resolution !== 'weekly' ? 'underline' : 'none' }}
                                                                                                                            onClick={() => setChartStates({ ...chartStates, [auto.id]: { resolution: 'weekly', year: state.year, month: state.month, week: null, day: null } })}
                                                                                                                        >
                                                                                                                            {monthNames[state.month]}
                                                                                                                        </span>
                                                                                                                    </>
                                                                                                                )}
                                                                                                                {state.week && (
                                                                                                                    <>
                                                                                                                        <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                                                                                                                        <span
                                                                                                                            style={{ cursor: 'pointer', color: resolution === 'daily' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textDecoration: resolution !== 'daily' ? 'underline' : 'none' }}
                                                                                                                            onClick={() => setChartStates({ ...chartStates, [auto.id]: { resolution: 'daily', year: state.year, month: state.month, week: state.week, day: null } })}
                                                                                                                        >
                                                                                                                            שבוע {state.week}
                                                                                                                        </span>
                                                                                                                    </>
                                                                                                                )}
                                                                                                                {state.day && (
                                                                                                                    <>
                                                                                                                        <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                                                                                                                        <span
                                                                                                                            style={{ cursor: 'pointer', color: resolution === 'hourly' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
                                                                                                                            onClick={() => setChartStates({ ...chartStates, [auto.id]: { resolution: 'hourly', year: state.year, month: state.month, week: state.week, day: state.day } })}
                                                                                                                        >
                                                                                                                            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][new Date(state.year, state.month, state.day).getDay()]}' - {state.day}/{state.month + 1}
                                                                                                                        </span>
                                                                                                                    </>
                                                                                                                )}
                                                                                                            </div>

                                                                                                            <div style={{ position: 'relative', width: '100%' }}>
                                                                                                                {(() => {
                                                                                                                    const maxVal = Math.max(...chartData.map(d => d.count), 1);
                                                                                                                    const h = 110;
                                                                                                                    const padBottom = 26;
                                                                                                                    const padTop = 10;
                                                                                                                    const innerH = h - padBottom - padTop;
                                                                                                                    return (
                                                                                                                        <svg viewBox={`0 0 500 ${h}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                                                                                                                            <defs>
                                                                                                                                <linearGradient id={`chartGrad-${auto.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                                                                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
                                                                                                                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                                                                                                                                </linearGradient>
                                                                                                                            </defs>

                                                                                                                            {/* Grid Lines */}
                                                                                                                            {[0, 0.5, 1].map((ratio, idx) => {
                                                                                                                                const y = padTop + innerH * (1 - ratio);
                                                                                                                                return (
                                                                                                                                    <g key={idx}>
                                                                                                                                        <line x1="0" y1={y} x2="500" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
                                                                                                                                        <text x="5" y={y - 3} fill="var(--text-muted)" fontSize="8px">{Math.round(maxVal * ratio)}</text>
                                                                                                                                    </g>
                                                                                                                                );
                                                                                                                            })}

                                                                                                                            {/* Bars */}
                                                                                                                            {chartData.map((d, idx) => {
                                                                                                                                const barWidth = 400 / chartData.length;
                                                                                                                                const gap = 100 / chartData.length;
                                                                                                                                const x = idx * (barWidth + gap) + gap / 2;
                                                                                                                                const barHeight = (d.count / maxVal) * innerH;
                                                                                                                                const y = padTop + innerH - barHeight;

                                                                                                                                return (
                                                                                                                                    <g
                                                                                                                                        key={idx}
                                                                                                                                        style={{ cursor: 'pointer' }}
                                                                                                                                        className="svg-chart-bar"
                                                                                                                                        onClick={() => {
                                                                                                                                            if (resolution === 'yearly') {
                                                                                                                                                setChartStates({
                                                                                                                                                    ...chartStates,
                                                                                                                                                    [auto.id]: { resolution: 'monthly', year: d.year, month: null, week: null, day: null }
                                                                                                                                                });
                                                                                                                                            } else if (resolution === 'monthly') {
                                                                                                                                                setChartStates({
                                                                                                                                                    ...chartStates,
                                                                                                                                                    [auto.id]: { resolution: 'weekly', year: d.year, month: d.month, week: null, day: null }
                                                                                                                                                });
                                                                                                                                            } else if (resolution === 'weekly') {
                                                                                                                                                setChartStates({
                                                                                                                                                    ...chartStates,
                                                                                                                                                    [auto.id]: { resolution: 'daily', year: d.year, month: d.month, week: d.week, day: null }
                                                                                                                                                });
                                                                                                                                            } else if (resolution === 'daily') {
                                                                                                                                                setChartStates({
                                                                                                                                                    ...chartStates,
                                                                                                                                                    [auto.id]: { resolution: 'hourly', year: d.year, month: d.month, week: d.week, day: d.day }
                                                                                                                                                });
                                                                                                                                            }
                                                                                                                                        }}
                                                                                                                                    >
                                                                                                                                        <title>{`${d.label}: ${d.count} שימושים`}</title>
                                                                                                                                        <rect x={x} y={y} width={barWidth} height={barHeight} rx="2" ry="2" fill={`url(#chartGrad-${auto.id})`} />
                                                                                                                                        
                                                                                                                                        {/* Hover overlay */}
                                                                                                                                        <rect x={x} y={y} width={barWidth} height={barHeight} rx="2" ry="2" fill="#06b6d4" opacity="0" style={{ transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.setAttribute('opacity', '0.2')} onMouseLeave={(e) => e.target.setAttribute('opacity', '0')} />
                                                                                                                                        
                                                                                                                                        {/* Value label */}
                                                                                                                                        {d.count > 0 && (
                                                                                                                                            <text x={x + barWidth / 2} y={y - 3} textAnchor="middle" fill="var(--text-light)" fontSize="7px" fontWeight="600">{d.count}</text>
                                                                                                                                        )}
                                                                                                                                        
                                                                                                                                        {/* X Axis Label */}
                                                                                                                                        <text
                                                                                                                                            x={x + barWidth / 2}
                                                                                                                                            y={h - 8}
                                                                                                                                            textAnchor="middle"
                                                                                                                                            fill="var(--text-muted)"
                                                                                                                                            fontSize="7.5px"
                                                                                                                                            transform={resolution === 'hourly' ? `rotate(-25, ${x + barWidth / 2}, ${h - 8})` : undefined}
                                                                                                                                        >
                                                                                                                                            {d.label}
                                                                                                                                        </text>
                                                                                                                                    </g>
                                                                                                                                );
                                                                                                                            })}
                                                                                                                        </svg>
                                                                                                                    );
                                                                                                                })()}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {warning > 0 && (
                                                                                                        <div style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b', display: 'block', marginBottom: '6px' }}>אזהרות לפי קטגוריה:</span>
                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                                                {Object.entries(warningTypes).map(([type, count]) => {
                                                                                                                    const pct = Math.round((count / warning) * 100);
                                                                                                                    return (
                                                                                                                        <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px' }}>
                                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                                                                                                                <span>{type}</span>
                                                                                                                                <strong style={{ color: '#f59e0b' }}>{count} מקרים ({pct}%)</strong>
                                                                                                                            </div>
                                                                                                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                                                                                <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b' }} />
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    );
                                                                                                                })}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {error > 0 && (
                                                                                                        <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '6px', padding: '10px', marginTop: '4px' }}>
                                                                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#f87171', display: 'block', marginBottom: '6px' }}>שגיאות לפי קטגוריה:</span>
                                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                                                {Object.entries(errorTypes).map(([type, count]) => {
                                                                                                                    const pct = Math.round((count / error) * 100);
                                                                                                                    return (
                                                                                                                        <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px' }}>
                                                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                                                                                                                <span>{type}</span>
                                                                                                                                <strong style={{ color: '#f87171' }}>{count} מקרים ({pct}%)</strong>
                                                                                                                            </div>
                                                                                                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                                                                                <div style={{ width: `${pct}%`, height: '100%', background: '#ef4444' }} />
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    );
                                                                                                                })}
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
                                                                                                        warning: { bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', label: 'אזהרה' },
                                                                                                        fallback: { bg: 'rgba(245, 158, 11, 0.03)', border: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', label: 'אזהרה (גיבוי)' }
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
                                                                                                                                <div style={{ marginTop: '8px', background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '4px', padding: '8px', fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                                                                                                    <strong style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
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

                                                                                {/* Tab Content: Documents (per automation) */}
                                                                                {(activeAutoTabs[auto.id] || 'ops') === 'docs' && (
                                                                                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                                                                                        <div style={{ display: 'flex', gap: '8px', background: 'rgba(139,92,246,0.03)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: '6px', padding: '10px 12px', alignItems: 'flex-start' }}>
                                                                                            <Info size={14} style={{ color: '#c084fc', marginTop: '2px', flexShrink: 0 }} />
                                                                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                                                                <strong>מצב Live (באוויר):</strong> האוטומציה פועלת באופן רציף בסביבת הייצור (ייצור/פרודקשן) ומבצעת משימות אמיתיות עבור הלקוח. העברה ל-Live חסומה עד להעלאת שלושת מסמכי החובה הטכניים (אפיון טכני, כרטיס גישות מאובטח ופרוטוקול מסירה חתום).
                                                                                            </span>
                                                                                        </div>
                                                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                                                                            {renderAutoDocumentSlot(auto, 'spec', 'מסמך אפיון טכני', 'Live')}
                                                                                            {renderAutoDocumentSlot(auto, 'credentials', 'כרטיס גישות מאובטח', 'Live')}
                                                                                            {renderAutoDocumentSlot(auto, 'handover', 'פרוטוקול מסירה', 'Live')}
                                                                                            {renderAutoDocumentSlot(auto, 'sla', 'תנאי תחזוקה SLA', null)}
                                                                                            {renderAutoDocumentSlot(auto, 'invoice', 'חשבונית מס', null)}
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
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>סגור</button>
                </div>
            </div>
        </div>
    );
}
