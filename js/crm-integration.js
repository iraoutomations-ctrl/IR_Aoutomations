/* ==========================================================================
   autoRI-studio - js/crm-integration.js
   ========================================================================== */
import { INTEGRATION_SETTINGS } from './config.js';

/**
 * Saves a captured lead to the CRM database.
 * Supports both local offline storage (localStorage) and cloud database (Supabase REST API).
 * 
 * @param {Object} leadData - The lead details to save
 * @param {string} leadData.name - Full name (Required)
 * @param {string} leadData.email - Email address
 * @param {string} leadData.phone - Phone number
 * @param {string} leadData.company - Company name
 * @param {string} leadData.source - Source of the lead ('contact_form' | 'survey' | 'chatbot')
 * @param {Object} leadData.survey_data - Custom survey results if source is 'survey'
 * @param {Object} leadData.chatbot_session - Chatbot session summary if source is 'chatbot'
 * @param {string} leadData.notes - General notes or contact message
 */
export async function saveLeadToCRM(leadData) {
    const timestamp = new Date().toISOString();
    
    // 1. ALWAYS SAVE LOCALLY (Supports Local Mock CRM)
    try {
        const localLeadsStr = localStorage.getItem('autoRI_leads') || '[]';
        const leads = JSON.parse(localLeadsStr);
        
        const newLeadId = 'lead-' + Math.random().toString(36).substr(2, 9);
        const newLead = {
            id: newLeadId,
            created_at: timestamp,
            status: 'new',
            priority: 'medium',
            ...leadData
        };
        
        leads.unshift(newLead);
        localStorage.setItem('autoRI_leads', JSON.stringify(leads));
        
        // Initialize local activity notes
        const localNotesStr = localStorage.getItem('autoRI_notes') || '[]';
        const notes = JSON.parse(localNotesStr);
        notes.unshift({
            id: 'note-' + Math.random().toString(36).substr(2, 9),
            lead_id: newLeadId,
            content: `ליד חדש נוצר ממקור ${leadData.source === 'survey' ? 'שאלון' : leadData.source === 'chatbot' ? 'צ׳אטבוט' : 'צור קשר'}`,
            created_at: timestamp
        });
        localStorage.setItem('autoRI_notes', JSON.stringify(notes));

        // Initialize default task for new leads
        const localTasksStr = localStorage.getItem('autoRI_tasks') || '[]';
        const tasks = JSON.parse(localTasksStr);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tasks.push({
            id: 'task-' + Math.random().toString(36).substr(2, 9),
            lead_id: newLeadId,
            title: `יצירת קשר ראשוני פולו-אפ (${leadData.name})`,
            due_date: tomorrow.toISOString(),
            completed: false,
            created_at: timestamp
        });
        localStorage.setItem('autoRI_tasks', JSON.stringify(tasks));
        
        console.log('Lead saved to local mock storage successfully.', newLead);
    } catch (err) {
        console.error('Error saving lead to local storage:', err);
    }

    // 2. IF SUPABASE IS CONFIGURED, POST TO SUPABASE REST API
    const { supabaseUrl, supabaseAnonKey } = INTEGRATION_SETTINGS;
    if (supabaseUrl && supabaseAnonKey) {
        try {
            const payload = {
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                company: leadData.company || null,
                source: leadData.source,
                status: 'new',
                priority: 'medium',
                survey_data: leadData.survey_data || null,
                chatbot_session: leadData.chatbot_session || null,
                notes: leadData.notes || null,
                created_at: timestamp
            };

            const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Supabase API responded with status ${response.status}: ${errText}`);
            }

            const insertedLeads = await response.json();
            const insertedLead = insertedLeads[0];
            console.log('Lead successfully synced to Supabase Cloud.', insertedLead);

            // Add default activity log and task in Supabase
            if (insertedLead?.id) {
                // Insert activity log
                await fetch(`${supabaseUrl}/rest/v1/notes`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        lead_id: insertedLead.id,
                        content: `ליד חדש נוצר ממקור ${leadData.source === 'survey' ? 'שאלון' : leadData.source === 'chatbot' ? 'צ׳אטבוט' : 'צור קשר'}`,
                        created_at: timestamp
                    })
                });

                // Insert default task
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                await fetch(`${supabaseUrl}/rest/v1/tasks`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        lead_id: insertedLead.id,
                        title: `יצירת קשר ראשוני פולו-אפ (${leadData.name})`,
                        due_date: tomorrow.toISOString(),
                        completed: false,
                        created_at: timestamp
                    })
                });
            }
        } catch (err) {
            console.error('Error syncing lead to Supabase:', err);
        }
    }
}
