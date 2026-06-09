/* ==========================================================================
   autoRI-studio CRM - Main Application Entry
   ========================================================================== */
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import LeadsList from './components/LeadsList';
import Settings from './components/Settings';
import LeadDetailsModal from './components/LeadDetailsModal';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    // Key used to force re-render components on data updates
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSelectLead = (id) => {
        setSelectedLeadId(id);
    };

    const handleLeadUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Render active tab view
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <Dashboard 
                        key={`dashboard-${refreshTrigger}`} 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                    />
                );
            case 'kanban':
                return (
                    <KanbanBoard 
                        key={`kanban-${refreshTrigger}`} 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                    />
                );
            case 'leads':
                return (
                    <LeadsList 
                        key={`leads-${refreshTrigger}`} 
                        onSelectLead={handleSelectLead} 
                        activeTab={activeTab}
                    />
                );
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard onSelectLead={handleSelectLead} activeTab={activeTab} />;
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
        </div>
    );
}
