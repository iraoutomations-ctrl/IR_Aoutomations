/* ==========================================================================
   autoRI-studio CRM - Kanban Board Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    MessageSquare, 
    FileText, 
    PhoneCall, 
    CheckCircle,
    XCircle,
    Calendar,
    Briefcase
} from 'lucide-react';
import { db } from '../services/db';

const COLUMNS = [
    { id: 'new', title: 'חדש', color: '#3b82f6', icon: MessageSquare },
    { id: 'contacted', title: 'בטיפול / יצירת קשר', color: '#f59e0b', icon: PhoneCall },
    { id: 'proposal', title: 'הצעת מחיר', color: '#8b5cf6', icon: FileText },
    { id: 'won', title: 'נסגר בהצלחה (Won)', color: '#10b981', icon: CheckCircle },
    { id: 'lost', title: 'אבוד (Lost)', color: '#ef4444', icon: XCircle }
];

export default function KanbanBoard({ onSelectLead, activeTab, onAddLead, refreshTrigger }) {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Validation for Lead Status Transitions (Hard Gating)
    const validateStatusTransition = (targetStatus, currentDocs) => {
        if (targetStatus === 'lost' || targetStatus === 'new' || targetStatus === 'contacted') return { valid: true };

        // 1. To move to 'proposal' or higher: requires 'proposal' doc
        if (targetStatus === 'proposal' || targetStatus === 'won') {
            const hasProposal = currentDocs.some(d => d.type === 'proposal');
            if (!hasProposal) {
                return {
                    valid: false,
                    error: "חסימת שלב: חסר מסמך 'הצעת מחיר'. אנא העלה אותו בלשונית 'מסמכים וקבצים' לפני העברת הסטטוס."
                };
            }
        }

        // 2. To move to 'won' (development): requires 'contract' and 'nda'
        if (targetStatus === 'won') {
            const hasContract = currentDocs.some(d => d.type === 'contract');
            const hasNDA = currentDocs.some(d => d.type === 'nda');
            if (!hasContract || !hasNDA) {
                let missing = [];
                if (!hasContract) missing.push("'חוזה חתום'");
                if (!hasNDA) missing.push("'הסכם סודיות NDA'");
                return {
                    valid: false,
                    error: `חסימת שלב: חסרים מסמכי חובה לחתימה: ${missing.join(" וכן ") || ''}. אנא העלה אותם בלשונית 'מסמכים' לפני סגירת הליד.`
                };
            }
        }

        return { valid: true };
    };

    useEffect(() => {
        async function loadLeads() {
            try {
                if (leads.length === 0) {
                    setLoading(true);
                }
                const fetchedLeads = await db.getLeads();
                setLeads(fetchedLeads);
            } catch (err) {
                console.error("Error fetching leads for kanban:", err);
            } finally {
                setLoading(false);
            }
        }
        loadLeads();
    }, [activeTab, refreshTrigger]);

    // HTML5 Drag and Drop handlers
    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('text/plain', leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('text/plain');
        if (!leadId) return;

        // Find the lead in local state
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== targetStatus) {
            try {
                // Fetch documents for gating validation
                const currentDocs = await db.getDocuments(leadId);
                const validation = validateStatusTransition(targetStatus, currentDocs);
                if (!validation.valid) {
                    alert(validation.error);
                    return;
                }

                // Optimistic UI update
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: targetStatus } : l));
                
                // Update in database
                await db.updateLeadStatus(leadId, targetStatus);
            } catch (err) {
                console.error("Error updating lead status via drag & drop:", err);
                // Revert state on error
                const reFetched = await db.getLeads();
                setLeads(reFetched);
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#8b5cf6' }}></i>
            </div>
        );
    }

    const industryLabels = {
        clinics: 'מרפאות',
        lawyers: 'עורכי דין',
        realtors: 'נדל״ן',
        general: 'כללי/אחר'
    };

    const industryColors = {
        clinics: 'var(--color-clinics)',
        lawyers: 'var(--color-lawyers)',
        realtors: 'var(--color-realtors)',
        general: 'var(--color-general)'
    };

    const priorityLabels = {
        high: 'דחוף',
        medium: 'רגיל',
        low: 'נמוך'
    };

    const priorityColors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#6b7280'
    };

    return (
        <div>
            {/* Header */}
            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>לוח קנבן</h1>
                    <p>גרור ושחרר לידים כדי לעדכן את שלב הטיפול בהם במהירות.</p>
                </div>
                <button className="btn btn-primary" onClick={onAddLead} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} />
                    <span>הוסף ליד ידנית</span>
                </button>
            </header>

            {/* Kanban columns grid */}
            <div className="kanban-container">
                {COLUMNS.map(col => {
                    const colLeads = leads.filter(l => l.status === col.id);
                    const ColIcon = col.icon;
                    
                    return (
                        <div 
                            key={col.id} 
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className="kanban-column-header" style={{ borderTop: `3px solid ${col.color}` }}>
                                <div className="kanban-column-title">
                                    <ColIcon size={16} style={{ color: col.color }} />
                                    <span>{col.title}</span>
                                </div>
                                <span className="kanban-column-count">{colLeads.length}</span>
                            </div>

                            {/* Column Body / Drop area */}
                            <div className="kanban-column-body">
                                {colLeads.length === 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '11px' }}>
                                        גרור ליד לכאן
                                    </div>
                                ) : (
                                    colLeads.map(lead => {
                                        const ind = lead.survey_data?.industry || lead.chatbot_session?.industry || 'general';
                                        
                                        return (
                                            <div 
                                                key={lead.id}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                                onClick={() => onSelectLead(lead.id)}
                                                style={{ borderRight: `3px solid ${industryColors[ind] || 'var(--border-color)'}` }}
                                            >
                                                {/* Card Title */}
                                                <div className="kanban-card-title">{lead.name}</div>
                                                
                                                {/* Company / Source */}
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                                                    <Briefcase size={10} />
                                                    <span>{lead.company || 'ללא עסק'}</span>
                                                </div>

                                                {/* Badges */}
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                                    {/* Industry Badge */}
                                                    <span 
                                                        className="badge" 
                                                        style={{ 
                                                            fontSize: '9px',
                                                            padding: '2px 6px',
                                                            background: `${industryColors[ind]}12`, 
                                                            color: industryColors[ind],
                                                            border: `1px solid ${industryColors[ind]}25` 
                                                        }}
                                                    >
                                                        {industryLabels[ind]}
                                                    </span>

                                                    {/* Priority Badge */}
                                                    <span 
                                                        className="badge" 
                                                        style={{ 
                                                            fontSize: '9px',
                                                            padding: '2px 6px',
                                                            background: `${priorityColors[lead.priority || 'medium']}12`, 
                                                            color: priorityColors[lead.priority || 'medium'],
                                                            border: `1px solid ${priorityColors[lead.priority || 'medium']}25` 
                                                        }}
                                                    >
                                                        {priorityLabels[lead.priority || 'medium']}
                                                    </span>
                                                </div>

                                                {/* Date & Action */}
                                                <div className="kanban-card-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '10px' }}>
                                                        <Calendar size={10} />
                                                        <span>{new Date(lead.created_at).toLocaleDateString('he-IL')}</span>
                                                    </div>
                                                    
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                        {lead.source === 'survey' ? 'שאלון' : lead.source === 'chatbot' ? 'צ׳אטבוט' : 'צור קשר'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
