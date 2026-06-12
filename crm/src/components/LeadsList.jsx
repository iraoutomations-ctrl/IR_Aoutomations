/* ==========================================================================
   autoRI-studio CRM - Leads List (Table View) Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Calendar, 
    Eye, 
    Trash2,
    Download,
    Plus
} from 'lucide-react';
import { db } from '../services/db';

export default function LeadsList({ onSelectLead, activeTab, onAddLead }) {
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLeads() {
            try {
                setLoading(true);
                const fetchedLeads = await db.getLeads();
                setLeads(fetchedLeads);
            } catch (err) {
                console.error("Error loading leads:", err);
            } finally {
                setLoading(false);
            }
        }
        loadLeads();
    }, [activeTab]);

    const handleDeleteLead = async (id, name, e) => {
        e.stopPropagation(); // Prevent opening modal
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את הליד "${name}"? פעולה זו תמחוק גם את כל המשימות וההערות הקשורות אליו.`)) {
            try {
                await db.deleteLead(id);
                setLeads(prev => prev.filter(l => l.id !== id));
            } catch (err) {
                console.error("Error deleting lead:", err);
            }
        }
    };

    // CSV Export helper
    const handleExportCSV = () => {
        if (leads.length === 0) return;
        
        // CSV headers
        const headers = ['תאריך יצירה', 'שם', 'טלפון', 'אימייל', 'חברה', 'סטטוס', 'מקור', 'ענף'];
        
        const rows = leads.map(l => {
            const ind = l.survey_data?.industry || l.chatbot_session?.industry || 'general';
            return [
                new Date(l.created_at).toLocaleDateString('he-IL'),
                l.name,
                l.phone,
                l.email,
                l.company || '',
                l.status,
                l.source,
                ind
            ];
        });
        
        // Add BOM for Excel Hebrew support
        let csvContent = '\uFEFF';
        csvContent += [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter and Search logic
    const filteredLeads = leads.filter(lead => {
        // Search filter
        const matchesSearch = 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        // Industry filter
        const ind = lead.survey_data?.industry || lead.chatbot_session?.industry || 'general';
        const matchesIndustry = industryFilter === 'all' || ind === industryFilter;

        return matchesSearch && matchesStatus && matchesIndustry;
    });

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

    const sourceLabels = {
        survey: 'שאלון',
        chatbot: 'צ׳אטבוט',
        contact_form: 'צור קשר',
        manual: 'ידני'
    };

    const statusBadges = {
        new: <span className="badge badge-new">חדש</span>,
        contacted: <span className="badge badge-contacted">יצירת קשר</span>,
        proposal: <span className="badge badge-proposal">הצעת מחיר</span>,
        won: <span className="badge badge-won">סגירה (Won)</span>,
        lost: <span className="badge badge-lost">אבוד (Lost)</span>
    };

    return (
        <div>
            {/* Header */}
            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>רשימת לידים מקיפה</h1>
                    <p>צפה בכל הלידים שהתקבלו באתר, סנן לפי ענף, סטטוס או בצע חיפוש מהיר.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={onAddLead} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} />
                        <span>הוסף ליד ידנית</span>
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        <Download size={16} />
                        <span>ייצוא ל-CSV</span>
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="חפש לפי שם, מייל, טלפון או עסק..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingRight: '40px' }}
                    />
                    <Search size={16} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-muted)' }} />
                </div>

                {/* Status Filter */}
                <div style={{ minWidth: '150px' }}>
                    <select 
                        className="form-control"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">כל הסטטוסים</option>
                        <option value="new">חדש</option>
                        <option value="contacted">יצירת קשר</option>
                        <option value="proposal">הצעת מחיר</option>
                        <option value="won">Won - סגירה</option>
                        <option value="lost">Lost - אבוד</option>
                    </select>
                </div>

                {/* Industry Filter */}
                <div style={{ minWidth: '150px' }}>
                    <select 
                        className="form-control"
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                    >
                        <option value="all">כל הענפים</option>
                        <option value="clinics">מרפאות</option>
                        <option value="lawyers">עורכי דין</option>
                        <option value="realtors">נדל״ן</option>
                        <option value="general">כללי/אחר</option>
                    </select>
                </div>
            </div>

            {/* Leads Table */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {filteredLeads.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Filter size={36} style={{ color: '#8b5cf6', marginBottom: '12px', opacity: 0.6 }} />
                        <p style={{ fontWeight: '500' }}>לא נמצאו לידים העונים לסינון שבחרת.</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>נסה לשנות את מונח החיפוש או פילטר הסטטוס.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ border: 'none', margin: '0' }}>
                        <table className="leads-table">
                            <thead>
                                <tr>
                                    <th>שם</th>
                                    <th>טלפון</th>
                                    <th>אימייל</th>
                                    <th>שם העסק</th>
                                    <th>ענף</th>
                                    <th>מקור</th>
                                    <th>סטטוס</th>
                                    <th>תאריך הגעה</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map(lead => {
                                    const ind = lead.survey_data?.industry || lead.chatbot_session?.industry || 'general';
                                    return (
                                        <tr 
                                            key={lead.id} 
                                            onClick={() => onSelectLead(lead.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td style={{ fontWeight: '600', color: 'var(--text-light)' }}>
                                                {lead.name}
                                            </td>
                                            <td style={{ direction: 'ltr', textAlign: 'right' }}>
                                                {lead.phone}
                                            </td>
                                            <td>
                                                {lead.email}
                                            </td>
                                            <td>
                                                {lead.company || '—'}
                                            </td>
                                            <td>
                                                {industryLabels[ind]}
                                            </td>
                                            <td>
                                                {sourceLabels[lead.source] || lead.source}
                                            </td>
                                            <td>
                                                {statusBadges[lead.status] || lead.status}
                                            </td>
                                            <td>
                                                {new Date(lead.created_at).toLocaleDateString('he-IL')}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button 
                                                        className="btn btn-secondary btn-icon"
                                                        style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                        onClick={() => onSelectLead(lead.id)}
                                                        title="צפה בפרטים"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-icon"
                                                        style={{ width: '28px', height: '28px', fontSize: '12px' }}
                                                        onClick={(e) => handleDeleteLead(lead.id, lead.name, e)}
                                                        title="מחק ליד"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
