/* ==========================================================================
   autoRI-studio CRM - Sidebar Component
   ========================================================================== */
import React from 'react';
import { 
    LayoutDashboard, 
    Columns, 
    Users, 
    Settings as SettingsIcon,
    Database, 
    Cpu
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/db';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
        { id: 'kanban', label: 'לוח קנבן', icon: Columns },
        { id: 'leads', label: 'רשימת לידים', icon: Users },
        { id: 'settings', label: 'הגדרות חיבור', icon: SettingsIcon }
    ];

    return (
        <aside className="sidebar">
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
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Connection Status Indicator */}
            <div className="sidebar-footer">
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
            </div>
        </aside>
    );
}
