import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import LeadsList from './components/LeadsList';
import Projects from './components/Projects';
import Settings from './components/Settings';
import LeadDetailsModal from './components/LeadDetailsModal';
import AddLeadModal from './components/AddLeadModal';
import { db } from './services/db';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [showAddLeadModal, setShowAddLeadModal] = useState(false);
    // Key used to force re-render components on data updates
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [alerts, setAlerts] = useState([]);

    const handleSelectLead = (id) => {
        setSelectedLeadId(id);
    };

    const handleLeadUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Load alerts on mount and when refreshTrigger changes
    useEffect(() => {
        async function loadAlerts() {
            try {
                const data = await db.getSystemAlerts();
                setAlerts(data);
            } catch (err) {
                console.error("Error loading alerts:", err);
            }
        }
        loadAlerts();
    }, [refreshTrigger]);

    // Listen for real-time changes on database/local tables to sync UI instantly
    useEffect(() => {
        const tables = ['leads', 'tasks', 'notes', 'automations', 'bugs', 'system_alerts', 'automation_runs'];
        const cleanups = tables.map(table => 
            db.subscribeChanges(table, () => {
                handleLeadUpdated();
            })
        );
        
        return () => {
            cleanups.forEach(cleanup => {
                try {
                    cleanup();
                } catch (e) {
                    console.error("Error during real-time cleanup:", e);
                }
            });
        };
    }, []);

    const handleMarkAlertRead = async (id) => {
        try {
            await db.markAlertAsRead(id);
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
        } catch (err) {
            console.error("Error marking alert as read:", err);
        }
    };

    const handleMarkAllAlertsRead = async () => {
        try {
            await db.markAllAlertsAsRead();
            setAlerts(prev => prev.map(a => ({ ...a, read: true })));
        } catch (err) {
            console.error("Error marking all alerts as read:", err);
        }
    };

    const handleDeleteAlert = async (id) => {
        try {
            await db.deleteSystemAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Error deleting alert:", err);
        }
    };

    const handleDeleteAllAlerts = async () => {
        try {
            await db.deleteAllSystemAlerts();
            setAlerts([]);
        } catch (err) {
            console.error("Error deleting all alerts:", err);
        }
    };

    const unreadCount = alerts.filter(a => !a.read).length;

    // Render active tab view
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <Dashboard 
                        key={`dashboard-${refreshTrigger}`} 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                        alerts={alerts}
                    />
                );
            case 'kanban':
                return (
                    <KanbanBoard 
                        key={`kanban-${refreshTrigger}`} 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                        onAddLead={() => setShowAddLeadModal(true)}
                    />
                );
            case 'leads':
                return (
                    <LeadsList 
                        key={`leads-${refreshTrigger}`} 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                        onAddLead={() => setShowAddLeadModal(true)}
                    />
                );
            case 'projects':
                return (
                    <Projects 
                        key="projects" 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                    />
                );
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard onSelectLead={handleSelectLead} activeTab={activeTab} alerts={alerts} />;
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                alerts={alerts}
                unreadCount={unreadCount}
                onMarkAlertRead={handleMarkAlertRead}
                onMarkAllAlertsRead={handleMarkAllAlertsRead}
                onDeleteAlert={handleDeleteAlert}
                onDeleteAllAlerts={handleDeleteAllAlerts}
            />

            {/* Main Section */}
            <main className="main-content">
                {renderContent()}
            </main>

            {/* Expanded Lead Card Modal */}
            {selectedLeadId && (
                <LeadDetailsModal
                    leadId={selectedLeadId}
                    onClose={() => setSelectedLeadId(null)}
                    onLeadUpdated={handleLeadUpdated}
                />
            )}

            {/* Add Lead Manually Modal */}
            {showAddLeadModal && (
                <AddLeadModal
                    onClose={() => setShowAddLeadModal(false)}
                    onLeadAdded={handleLeadUpdated}
                />
            )}
        </div>
    );
}
