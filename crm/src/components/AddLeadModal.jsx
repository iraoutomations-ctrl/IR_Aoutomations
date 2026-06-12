/* ==========================================================================
   autoRI-studio CRM - Add Lead Manually Component
   ========================================================================== */
import React, { useState } from 'react';
import { X, Plus, User } from 'lucide-react';
import { db } from '../services/db';

export default function AddLeadModal({ onClose, onLeadAdded }) {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [industry, setIndustry] = useState('general');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('new');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            const newLead = {
                name: name.trim(),
                company: company.trim() || null,
                phone: phone.trim() || null,
                email: email.trim() || null,
                source: 'manual',
                priority,
                status,
                notes: notes.trim() || null,
                survey_data: {
                    industry
                }
            };
            await db.addLead(newLead);
            onLeadAdded();
            onClose();
        } catch (err) {
            console.error("Error creating manual lead:", err);
            alert("שגיאה ביצירת הליד: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
                {/* Header */}
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} style={{ color: '#8b5cf6' }} />
                        <h2 style={{ fontSize: '18px', margin: '0', color: 'var(--text-light)' }}>הוספת ליד ידני חדש</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {/* Name & Company */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>שם מלא *</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="ישראל ישראלי"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px' }}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>שם העסק / חברה</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="לדוגמה: אוטו-ריי"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px' }}
                            />
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>טלפון</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="050-1234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px' }}
                            />
                        </div>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>אימייל</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px' }}
                            />
                        </div>
                    </div>

                    {/* Industry & Priority & Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>ענף פעילות</label>
                            <select 
                                className="form-control"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px', height: '36px' }}
                            >
                                <option value="general">כללי/אחר</option>
                                <option value="clinics">מרפאות ומטפלים</option>
                                <option value="lawyers">עורכי דין</option>
                                <option value="realtors">נדל״ן</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>עדיפות</label>
                            <select 
                                className="form-control"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px', height: '36px' }}
                            >
                                <option value="low">נמוכה</option>
                                <option value="medium">רגילה</option>
                                <option value="high">גבוהה / דחוף</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ marginBottom: '6px' }}>סטטוס ראשוני</label>
                            <select 
                                className="form-control"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '12.5px', height: '36px' }}
                            >
                                <option value="new">חדש</option>
                                <option value="contacted">בטיפול / קשר</option>
                                <option value="proposal">הצעת מחיר</option>
                                <option value="won">Won - סגירה</option>
                                <option value="lost">Lost - אבוד</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="form-label" style={{ marginBottom: '6px' }}>הערות ראשוניות</label>
                        <textarea 
                            className="form-control" 
                            placeholder="פרטים נוספים על הלקוח או הצורך שלו..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ height: '80px', resize: 'vertical', padding: '8px 12px', fontSize: '12.5px' }}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12.5px' }} disabled={loading}>
                            <Plus size={16} />
                            <span>{loading ? 'שומר ליד...' : 'שמור ליד'}</span>
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12.5px' }} onClick={onClose} disabled={loading}>
                            <span>ביטול</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
