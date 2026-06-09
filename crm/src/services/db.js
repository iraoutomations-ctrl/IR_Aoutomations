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
    NOTES: 'autoRI_notes'
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
    }
};
