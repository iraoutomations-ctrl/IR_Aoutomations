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
    AlertTriangle
} from 'lucide-react';
import { db } from '../services/db';

export default function LeadDetailsModal({ leadId, onClose, onLeadUpdated }) {
    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [loading, setLoading] = useState(true);

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
        try {
            const updated = await db.updateLeadStatus(leadId, status);
            setLead(updated);
            // Refresh activity notes
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error updating status:", err);
        }
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
                due_date: new Date(newTaskDueDate).toISOString()
            });
            setTasks(prev => [...prev, added]);
            setNewTaskTitle('');
            
            // Refresh activity notes (adding task triggers note creation)
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            const updated = await db.toggleTaskCompleted(taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
            
            // Refresh activity notes
            const notesData = await db.getNotes(leadId);
            setNotes(notesData);
            onLeadUpdated();
        } catch (err) {
            console.error("Error toggling task:", err);
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

    if (!leadId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2 style={{ margin: '0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} className="text-violet" style={{ color: '#8b5cf6' }} />
                        פרטי ליד מורחבים: {loading ? 'טוען...' : lead?.name}
                    </h2>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#8b5cf6' }}></i>
                    </div>
                ) : (
                    <div className="modal-body">
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

                                        {/* Fallback - Simple Notes (From general contact form message) */}
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
                                    
                                    {/* Add Task Form */}
                                    <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="מה צריך לעשות?" 
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            style={{ flex: 1, minWidth: '150px', padding: '8px 12px' }}
                                        />
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={newTaskDueDate}
                                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                                            style={{ width: '130px', padding: '8px' }}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                            <Plus size={16} />
                                        </button>
                                    </form>

                                    {/* Tasks Checklist */}
                                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {tasks.length === 0 ? (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>אין משימות פתוחות לליד זה.</p>
                                        ) : (
                                            tasks.map(task => {
                                                const isOverdue = !task.completed && task.due_date && task.due_date.split('T')[0] < new Date().toISOString().split('T')[0];
                                                return (
                                                    <div 
                                                        key={task.id} 
                                                        className={`task-item ${task.completed ? 'completed' : ''}`}
                                                        style={{ 
                                                            padding: '8px 12px', 
                                                            marginBottom: '0', 
                                                            borderRight: isOverdue ? '3px solid #ef4444' : '1px solid var(--border-color)',
                                                            borderColor: task.completed ? 'transparent' : ''
                                                        }}
                                                    >
                                                        <div className="task-item-right">
                                                            <div 
                                                                className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                                                onClick={() => handleToggleTask(task.id)}
                                                            >
                                                                {task.completed && <Check size={10} />}
                                                            </div>
                                                            <div>
                                                                <span className="task-title" style={{ fontSize: '12.5px' }}>{task.title}</span>
                                                                <div style={{ fontSize: '9px', color: isOverdue ? '#ef4444' : 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Calendar size={8} />
                                                                    <span>
                                                                        {isOverdue ? 'פג תוקף: ' : ''}
                                                                        {new Date(task.due_date).toLocaleDateString('he-IL')}
                                                                    </span>
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
