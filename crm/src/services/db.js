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
    AUTOMATION_RUNS: 'autoRI_automation_runs'
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
        n8n_workflows: [{ id: 'mock-workflow-1', name: 'משיכת נכסים מ-יד2' }]
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
        ]
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
        n8n_workflows: [{ id: 'mock-workflow-3', name: 'מחולל חשבוניות' }]
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

            // Fetch runs matching either the automation_id OR any of the workflow IDs
            let query = supabase.from('automation_runs').select('*');
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

            // Fetch system_alerts matching any of the workflow IDs OR having null workflow ID
            let alerts = [];
            if (workflowIds.length > 0) {
                const { data: alertData, error: alertErr } = await supabase
                    .from('system_alerts')
                    .select('*')
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

            const merged = [...formattedRuns, ...alertRuns];
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

            const filteredRuns = runs.filter(r => 
                r.automation_id === automationId || 
                (r.n8n_workflow_id && workflowIds.includes(r.n8n_workflow_id.trim()))
            ).map(run => ({
                ...run,
                title: run.title || run.error_type || 'ריצת אוטומציה',
                message: run.message || (run.details ? (run.details.error_message || run.details.warning_message || '') : '') || ''
            }));

            // Fetch local alerts to merge
            const alerts = getLocalData(STORAGE_KEYS.SYSTEM_ALERTS, INITIAL_MOCK_SYSTEM_ALERTS);
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

            const merged = [...filteredRuns, ...alertRuns];
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
    }
};
