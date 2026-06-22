/* ==========================================================================
   autoRI-studio CRM - Sidebar Component
   ========================================================================== */
import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Columns, 
    Users, 
    Settings as SettingsIcon,
    Database, 
    Cpu,
    Briefcase,
    Bell,
    Trash2,
    CheckCheck,
    X,
    Calculator,
    BookOpen,
    Map,
    LogOut,
    Activity
} from 'lucide-react';
import { isSupabaseConfigured, db } from '../services/db';

export default function Sidebar({ 
    activeTab, 
    setActiveTab,
    alerts = [],
    unreadCount = 0,
    onMarkAlertRead,
    onMarkAllAlertsRead,
    onDeleteAlert,
    onDeleteAllAlerts
}) {
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = async () => {
        if (confirm("האם אתה בטוח שברצונך להתנתק מהמערכת?")) {
            try {
                await db.signOut();
            } catch (err) {
                console.error("Error signing out:", err);
            }
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
        { id: 'kanban', label: 'לוח קנבן', icon: Columns },
        { id: 'leads', label: 'רשימת לידים', icon: Users },
        { id: 'projects', label: 'פרויקטים ואוטומציות', icon: Briefcase },
        { id: 'calculator', label: 'מחשבון תמחור ו-ROI', icon: Calculator },
        { id: 'docs', label: 'מדריך ודוקומנטציה', icon: BookOpen },
        { id: 'roadmap', label: 'מפת דרכים לאוטומציה', icon: Map },
        { id: 'server_monitor', label: 'ניטור שרתים', icon: Activity },
        { id: 'database_monitor', label: 'ניטור בסיס נתונים', icon: Database },
        { id: 'settings', label: 'הגדרות חיבור', icon: SettingsIcon }
    ];

    return (
        <>
            <aside className="sidebar">
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                        {/* Branding Logo */}
                        <div className="sidebar-logo">
                            <Cpu className="text-violet" style={{ color: '#8b5cf6' }} size={28} />
                            <span className="sidebar-logo-text">autoRI CRM</span>
                        </div>

                        {/* Navigation Menu */}
                        <ul className="sidebar-menu">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.id}>
                                        <div 
                                            className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setShowNotifications(false);
                                            }}
                                        >
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div>
                        {/* Notification Bell Button */}
                        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                            <button 
                                className={`sidebar-link ${showNotifications ? 'active' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'right',
                                    padding: '10px 14px',
                                    borderRadius: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Bell size={18} className={unreadCount > 0 ? 'pulse-bell' : ''} style={{ color: unreadCount > 0 ? '#ef4444' : 'inherit' }} />
                                    <span style={{ fontSize: '13.5px', fontWeight: '500' }}>התראות מערכת</span>
                                </div>
                                {unreadCount > 0 && (
                                    <span style={{ 
                                        background: '#ef4444', 
                                        color: '#fff', 
                                        borderRadius: '10px', 
                                        padding: '2px 8px', 
                                        fontSize: '10px', 
                                        fontWeight: '600' 
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Connection Status Indicator */}
                        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="connection-status">
                                <Database size={16} />
                                <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '500', fontSize: '11px' }}>
                                        בסיס נתונים:
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', marginTop: '2px' }}>
                                        <span className={`status-dot ${isSupabaseConfigured ? 'online' : 'offline'}`}></span>
                                        {isSupabaseConfigured ? 'ענן Supabase מחובר' : 'מצב אופליין (Mock)'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Logout Action */}
                            <button 
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                    borderRadius: '6px',
                                    color: '#fca5a5',
                                    cursor: 'pointer',
                                    fontSize: '12.5px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'right'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                                }}
                            >
                                <LogOut size={14} />
                                <span>התנתק מהמערכת</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Slide-out Notifications Drawer Overlay */}
            {showNotifications && (
                <div className="notifications-drawer-overlay" onClick={() => setShowNotifications(false)}>
                    <div className="notifications-drawer glass-card" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={18} style={{ color: '#8b5cf6' }} />
                                <h3 style={{ fontSize: '15px', margin: '0', color: 'var(--text-light)' }}>התראות מערכת (N8N)</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {unreadCount > 0 && (
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={onMarkAllAlertsRead}
                                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <CheckCheck size={12} />
                                        סמן הכל
                                    </button>
                                )}
                                {alerts.length > 0 && (
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={onDeleteAllAlerts}
                                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                    >
                                        <Trash2 size={12} style={{ color: '#ef4444' }} />
                                        נקה הכל
                                    </button>
                                )}
                                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)', paddingLeft: '4px' }}>
                            {alerts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                    <Bell size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                    <p style={{ fontSize: '13px' }}>אין התראות חדשות במערכת</p>
                                </div>
                            ) : (
                                alerts.map(alert => {
                                    const typeColors = {
                                        error: { border: 'rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.08)', iconColor: '#ef4444' },
                                        success: { border: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.08)', iconColor: '#10b981' },
                                        warning: { border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.08)', iconColor: '#f59e0b' },
                                        info: { border: 'rgba(6, 182, 212, 0.4)', bg: 'rgba(6, 182, 212, 0.08)', iconColor: '#06b6d4' }
                                    };
                                    const colors = typeColors[alert.type] || typeColors.info;

                                    return (
                                        <div 
                                            key={alert.id} 
                                            className={`alert-item ${!alert.read ? 'unread' : ''}`}
                                            onClick={() => !alert.read && onMarkAlertRead(alert.id)}
                                            style={{ 
                                                borderRight: `4px solid ${colors.iconColor}`,
                                                background: colors.bg,
                                                padding: '12px',
                                                borderRadius: '6px',
                                                border: `1px solid ${colors.border}`,
                                                borderRightWidth: '4px',
                                                position: 'relative',
                                                cursor: !alert.read ? 'pointer' : 'default'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                <h4 style={{ fontSize: '13px', margin: 0, fontWeight: '600', color: 'var(--text-light)' }}>
                                                    {alert.title}
                                                </h4>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {!alert.read && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onMarkAlertRead(alert.id);
                                                            }}
                                                            title="סמן כנקרא"
                                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                                                        >
                                                            <CheckCheck size={14} style={{ color: '#10b981' }} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteAlert(alert.id);
                                                        }}
                                                        title="מחק התראה"
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                                                {alert.message}
                                            </p>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                {new Date(alert.created_at).toLocaleTimeString('he-IL')} | {new Date(alert.created_at).toLocaleDateString('he-IL')}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
