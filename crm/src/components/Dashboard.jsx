/* ==========================================================================
   autoRI-studio CRM - Dashboard Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Award, 
    Calendar,
    CheckSquare,
    Square,
    AlertCircle,
    TrendingUp,
    Lock
} from 'lucide-react';
import { db } from '../services/db';

export default function Dashboard({ onSelectLead, activeTab, alerts = [], refreshTrigger }) {
    const [leads, setLeads] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                if (leads.length === 0) {
                    setLoading(true);
                }
                const fetchedLeads = await db.getLeads();
                const fetchedTasks = await db.getTasks();
                setLeads(fetchedLeads);
                setTasks(fetchedTasks);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, [activeTab, refreshTrigger]);

    const handleToggleTask = async (taskId) => {
        try {
            const updatedTask = await db.toggleTaskCompleted(taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        } catch (err) {
            console.error("Error toggling task:", err);
            alert(err.message || err);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#8b5cf6' }}></i>
            </div>
        );
    }

    // Calculations
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const wonLeads = leads.filter(l => l.status === 'won').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
    
    // Incomplete tasks
    const openTasks = tasks.filter(t => !t.completed).length;
    
    // Local (not UTC) calendar date as YYYY-MM-DD. toISOString()/string-slicing
    // a timestamp gives the UTC date, which is a day behind the real local date
    // for part of every evening/early-morning in Israel (UTC+2/+3) - that made
    // "today"/"overdue" task checks flip a day early or late around midnight.
    const toLocalDateStr = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Today's / Overdue tasks
    const todayStr = toLocalDateStr(new Date());
    const todayTasks = tasks.filter(t => {
        if (t.completed) return false;
        if (!t.due_date) return false;
        const taskDateStr = toLocalDateStr(new Date(t.due_date));
        return taskDateStr <= todayStr; // due today or overdue
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    // Chart Data: Industry distribution
    const industryCounts = leads.reduce((acc, lead) => {
        const ind = lead.survey_data?.industry || lead.chatbot_session?.industry || 'general';
        acc[ind] = (acc[ind] || 0) + 1;
        return acc;
    }, { clinics: 0, lawyers: 0, realtors: 0, general: 0 });

    const industryLabels = {
        clinics: 'מרפאות',
        lawyers: 'עורכי דין',
        realtors: 'נדל״ן',
        general: 'כללי/אחר'
    };
    
    const industryColors = {
        clinics: '#10b981', // emerald
        lawyers: '#3b82f6', // blue
        realtors: '#f59e0b', // amber
        general: '#ec4899' // pink
    };

    // Calculate maximum industry count for chart scaling
    const maxIndCount = Math.max(...Object.values(industryCounts), 1);

    // Chart Data: Lead acquisition over past 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return toLocalDateStr(d);
    }).reverse();

    const leadsByDay = last7Days.map(dateStr => {
        const count = leads.filter(l => toLocalDateStr(new Date(l.created_at)) === dateStr).length;
        const label = new Date(dateStr).toLocaleDateString('he-IL', { weekday: 'short' });
        return { dateStr, label, count };
    });

    const maxDayCount = Math.max(...leadsByDay.map(d => d.count), 1);
    const leadsByDaySummary = `קצב גידול לידים ב-7 הימים האחרונים: ${leadsByDay.map(d => `${d.label} ${d.count}`).join(', ')}.`;

    // Helper to find lead name for task display
    const getLeadName = (leadId) => {
        const lead = leads.find(l => l.id === leadId);
        return lead ? lead.name : 'ליד כללי';
    };

    return (
        <div>
            {/* Header */}
            <header style={{ marginBottom: '24px' }}>
                <h1>שלום, ברוך הבא ל-autoRI CRM!</h1>
                <p>כאן תוכל לראות סיכום ביצועים של העסק והתקדמות הלידים בזמן אמת.</p>
            </header>

            {/* Metrics Row */}
            <div className="dashboard-grid">
                {/* Metric 1 */}
                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>{totalLeads}</h3>
                        <p>סך הכל לידים</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                        <Users size={24} />
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>{newLeads}</h3>
                        <p>לידים חדשים בטיפול</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        <UserPlus size={24} />
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>{conversionRate}%</h3>
                        <p>אחוז המרה (סגירות)</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <Award size={24} />
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="glass-card stat-card">
                    <div className="stat-card-info">
                        <h3>{openTasks}</h3>
                        <p>משימות פתוחות</p>
                    </div>
                    <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            {/* Charts & Tasks Layout */}
            <div className="dashboard-charts-grid">
                {/* Visual Analytics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* SVG Chart 1: Leads by Industry */}
                    <div className="glass-card" style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} className="text-violet" style={{ color: '#8b5cf6' }} />
                            פילוח לידים לפי ענף פעילות
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {Object.entries(industryCounts).map(([key, count]) => {
                                const percentage = maxIndCount > 0 ? (count / maxIndCount) * 100 : 0;
                                return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '90px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {industryLabels[key] || key}
                                        </div>
                                        <div style={{ flex: 1, height: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                            <div 
                                                style={{ 
                                                    width: `${percentage}%`, 
                                                    height: '100%', 
                                                    background: industryColors[key], 
                                                    boxShadow: `0 0 10px ${industryColors[key]}33`,
                                                    transition: 'width 0.8s ease-in-out',
                                                    borderRadius: '8px'
                                                }}
                                            ></div>
                                        </div>
                                        <div style={{ width: '40px', fontSize: '13px', fontWeight: '600', color: 'var(--text-light)', textAlign: 'left' }}>
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SVG Chart 2: Lead Acquisition History */}
                    <div className="glass-card" style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>קצב גידול לידים (7 ימים אחרונים)</h3>
                        
                        {/* Custom SVG Line/Area Chart */}
                        <div style={{ position: 'relative', height: '180px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <svg viewBox="0 0 500 120" style={{ width: '100%', height: '120px' }} role="img" aria-label={leadsByDaySummary}>
                                <defs>
                                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines */}
                                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                {/* Area path */}
                                <path 
                                    d={`
                                        M 10,120
                                        L 10,${110 - (leadsByDay[0].count / maxDayCount) * 80}
                                        L 90,${110 - (leadsByDay[1].count / maxDayCount) * 80}
                                        L 170,${110 - (leadsByDay[2].count / maxDayCount) * 80}
                                        L 250,${110 - (leadsByDay[3].count / maxDayCount) * 80}
                                        L 330,${110 - (leadsByDay[4].count / maxDayCount) * 80}
                                        L 410,${110 - (leadsByDay[5].count / maxDayCount) * 80}
                                        L 490,${110 - (leadsByDay[6].count / maxDayCount) * 80}
                                        L 490,120 Z
                                    `}
                                    fill="url(#chartGlow)"
                                />

                                {/* Line path */}
                                <path 
                                    d={`
                                        M 10,${110 - (leadsByDay[0].count / maxDayCount) * 80}
                                        L 90,${110 - (leadsByDay[1].count / maxDayCount) * 80}
                                        L 170,${110 - (leadsByDay[2].count / maxDayCount) * 80}
                                        L 250,${110 - (leadsByDay[3].count / maxDayCount) * 80}
                                        L 330,${110 - (leadsByDay[4].count / maxDayCount) * 80}
                                        L 410,${110 - (leadsByDay[5].count / maxDayCount) * 80}
                                        L 490,${110 - (leadsByDay[6].count / maxDayCount) * 80}
                                    `}
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />

                                {/* Points */}
                                {[
                                    { x: 10, val: leadsByDay[0] },
                                    { x: 90, val: leadsByDay[1] },
                                    { x: 170, val: leadsByDay[2] },
                                    { x: 250, val: leadsByDay[3] },
                                    { x: 330, val: leadsByDay[4] },
                                    { x: 410, val: leadsByDay[5] },
                                    { x: 490, val: leadsByDay[6] }
                                ].map((pt, i) => (
                                    <g key={i}>
                                        <circle 
                                            cx={pt.x} 
                                            cy={110 - (pt.val.count / maxDayCount) * 80} 
                                            r="4.5" 
                                            fill="#0a0b10" 
                                            stroke="#06b6d4" 
                                            strokeWidth="2.5" 
                                        />
                                        <text 
                                            x={pt.x} 
                                            y={110 - (pt.val.count / maxDayCount) * 80 - 10} 
                                            fill="#f3f4f6" 
                                            fontSize="9" 
                                            textAnchor="middle"
                                            fontWeight="600"
                                        >
                                            {pt.val.count > 0 ? pt.val.count : ''}
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            {/* X Axis Labels */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                {leadsByDay.map((d, i) => (
                                    <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', width: '60px' }}>
                                        {d.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Tasks Sidebar panel */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquare size={18} className="text-violet" style={{ color: '#8b5cf6' }} />
                        משימות המשך להיום / באיחור
                        <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', marginRight: 'auto' }}>
                            {todayTasks.length} פתוחות
                        </span>
                    </h3>

                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
                        {todayTasks.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: '36px', color: '#10b981', marginBottom: '12px', opacity: 0.6 }}></i>
                                <p style={{ fontSize: '13px' }}>אין משימות פתוחות להיום!</p>
                                <p style={{ fontSize: '11px', marginTop: '4px' }}>כל המשימות להיום הושלמו בהצלחה.</p>
                            </div>
                        ) : (
                            todayTasks.map(task => {
                                const isOverdue = toLocalDateStr(new Date(task.due_date)) < todayStr;
                                const depTask = task.depends_on_task_id ? tasks.find(t => t.id === task.depends_on_task_id) : null;
                                const isBlocked = depTask ? !depTask.completed : false;
                                return (
                                    <div key={task.id} className="task-item" style={{ borderRight: isOverdue ? '3px solid #ef4444' : '1px solid var(--border-color)', opacity: isBlocked ? 0.75 : 1 }}>
                                        <div className="task-item-right">
                                            {isBlocked ? (
                                                <div 
                                                    className="task-checkbox locked"
                                                    style={{ 
                                                        borderColor: 'rgba(239, 68, 68, 0.4)', 
                                                        background: 'rgba(239, 68, 68, 0.05)', 
                                                        cursor: 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(239, 68, 68, 0.4)'
                                                    }}
                                                    onClick={() => alert(`משימה זו נעולה. עליך להשלים קודם את המשימה: "${depTask.title}"`)}
                                                >
                                                    <Lock size={10} style={{ color: '#ef4444' }} />
                                                </div>
                                            ) : (
                                                <div 
                                                    className="task-checkbox"
                                                    onClick={() => handleToggleTask(task.id)}
                                                >
                                                    {task.completed && <i className="fa-solid fa-check" style={{ fontSize: '10px' }}></i>}
                                                </div>
                                            )}
                                            <div>
                                                <div className="task-title" style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--text-light)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                                                    {task.title}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                    <span 
                                                        onClick={() => onSelectLead(task.lead_id)}
                                                        style={{ color: '#06b6d4', cursor: 'pointer', textDecoration: 'underline' }}
                                                    >
                                                        {getLeadName(task.lead_id)}
                                                    </span>
                                                    <span>•</span>
                                                    <span style={{ color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
                                                        {isOverdue ? 'באיחור: ' : ''}
                                                        {new Date(task.due_date).toLocaleDateString('he-IL')}
                                                    </span>
                                                    <span>•</span>
                                                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '3px', fontSize: '10px' }}>
                                                        מבצע: {task.assigned_to || 'כללי'}
                                                    </span>
                                                    {depTask && (
                                                        <>
                                                            <span>•</span>
                                                            <span style={{ color: isBlocked ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                                {isBlocked ? <Lock size={10} /> : <i className="fa-solid fa-check" style={{ fontSize: '8px' }}></i>}
                                                                תלוי ב: {depTask.title.substring(0, 12)}...
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Alerts Section */}
            <div className="glass-card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} style={{ color: '#ef4444' }} />
                    התראות מערכת אחרונות (מ-N8N)
                </h3>
                
                {alerts.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0', margin: 0 }}>
                        אין התראות מערכת פעילות.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {alerts.slice(0, 5).map(alert => {
                            const typeBadge = {
                                error: <span className="badge badge-lost" style={{ fontSize: '10px', padding: '1px 6px' }}>שגיאה</span>,
                                success: <span className="badge badge-won" style={{ fontSize: '10px', padding: '1px 6px' }}>הצלחה</span>,
                                warning: <span className="badge badge-proposal" style={{ fontSize: '10px', padding: '1px 6px' }}>אזהרה</span>,
                                info: <span className="badge badge-new" style={{ fontSize: '10px', padding: '1px 6px' }}>מידע</span>
                            };

                            const typeStyles = {
                                error: { borderRight: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.03)' },
                                success: { borderRight: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.03)' },
                                warning: { borderRight: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.03)' },
                                info: { borderRight: '4px solid #06b6d4', background: 'rgba(6, 182, 212, 0.03)' }
                            };

                            return (
                                <div 
                                    key={alert.id} 
                                    style={{ 
                                        padding: '12px 16px', 
                                        borderRadius: '6px', 
                                        border: '1px solid var(--border-color)', 
                                        ...typeStyles[alert.type || 'info'],
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        {typeBadge[alert.type || 'info']}
                                        <div>
                                            <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-light)' }}>
                                                {alert.title}
                                            </div>
                                            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                {alert.message}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        {alert.lead_id && (
                                            <span 
                                                onClick={() => onSelectLead(alert.lead_id)}
                                                style={{ color: '#06b6d4', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
                                            >
                                                לקוח: {getLeadName(alert.lead_id)}
                                            </span>
                                        )}
                                        <span>
                                            {new Date(alert.created_at).toLocaleTimeString('he-IL')} | {new Date(alert.created_at).toLocaleDateString('he-IL')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
