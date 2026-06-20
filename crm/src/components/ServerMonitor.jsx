/* ==========================================================================
   autoRI-studio CRM - Server & Container Monitor Component
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    Cpu, 
    HardDrive, 
    RefreshCw, 
    Play, 
    Square, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    Trash2,
    Database
} from 'lucide-react';
import { db } from '../services/db';

export default function ServerMonitor() {
    const [metrics, setMetrics] = useState([]);
    const [containers, setContainers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    // Fetch data from DB
    const fetchData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const metricsData = await db.getServerMetrics();
            const containersData = await db.getContainers();
            const allAlerts = await db.getSystemAlerts();
            
            // Filter only server-related warnings and errors for the server log
            const serverAlerts = allAlerts.filter(a => {
                const isErrorOrWarning = a.type === 'error' || a.type === 'warning';
                if (!isErrorOrWarning) return false;
                
                const text = ((a.title || '') + ' ' + (a.message || '')).toLowerCase();
                return text.includes('שרת') || 
                       text.includes('קונטיינר') || 
                       text.includes('מעבד') || 
                       text.includes('זיכרון') || 
                       text.includes('דיסק') || 
                       text.includes('coolify') ||
                       text.includes('server') ||
                       text.includes('container') ||
                       text.includes('cpu') ||
                       text.includes('ram');
            });

            setMetrics(metricsData);
            setContainers(containersData);
            setAlerts(serverAlerts);
        } catch (err) {
            console.error("Error loading server metrics:", err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);

        // Auto poll metrics every 5 seconds
        const pollInterval = setInterval(() => {
            fetchData(false);
        }, 5000);

        // Listen for internal state updates
        const handleLocalRefresh = () => {
            fetchData(false);
        };
        window.addEventListener('server-monitor-refresh', handleLocalRefresh);

        return () => {
            clearInterval(pollInterval);
            window.removeEventListener('server-monitor-refresh', handleLocalRefresh);
        };
    }, []);

    // Handle container action (Start / Stop / Restart)
    const handleAction = async (containerId, action) => {
        setActioningId(`${containerId}-${action}`);
        try {
            await db.triggerContainerAction(containerId, action);
            // Instantly refresh list
            const containersData = await db.getContainers();
            setContainers(containersData);
        } catch (err) {
            console.error(`Error performing ${action} on container ${containerId}:`, err);
        } finally {
            setActioningId(null);
        }
    };

    // Handle clearing alerts
    const handleClearAlerts = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את כל התראות השרת?')) {
            try {
                await db.deleteAllSystemAlerts();
                setAlerts([]);
            } catch (err) {
                console.error("Error clearing alerts:", err);
            }
        }
    };

    // Calculate current metrics (latest data point)
    const currentMetrics = metrics[metrics.length - 1] || { cpu_usage: 0, ram_usage: 0, disk_usage: 0 };
    
    // Format RAM bytes to human readable format (MB/GB)
    const formatRam = (bytes) => {
        if (bytes < 1024 * 1024 * 1024) {
            return `${Math.round(bytes / (1024 * 1024))} MB`;
        }
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    // Determine status color configurations
    const getStatusConfig = (status) => {
        switch (status) {
            case 'running':
                return { color: '#10b981', label: 'פועל', pulse: true };
            case 'restarting':
                return { color: '#f59e0b', label: 'מפעיל מחדש...', pulse: true };
            case 'stopped':
            default:
                return { color: '#ef4444', label: 'כבוי', pulse: false };
        }
    };

    // SVG Circular Gauge renderer
    const CircularGauge = ({ value, label, subLabel, icon: Icon, colorClass }) => {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (value / 100) * circumference;
        
        let strokeColor = '#10b981'; // green
        if (value > 80) strokeColor = '#f59e0b'; // orange
        if (value > 90) strokeColor = '#ef4444'; // red

        return (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '220px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '14px' }}>
                    <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                        {/* Background track circle */}
                        <circle 
                            cx="60" cy="60" r={radius} 
                            fill="transparent" 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeWidth="8" 
                        />
                        {/* Main indicator circle */}
                        <circle 
                            cx="60" cy="60" r={radius} 
                            fill="transparent" 
                            stroke={strokeColor} 
                            strokeWidth="8" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                        />
                    </svg>
                    {/* Centered value overlay */}
                    <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} style={{ color: strokeColor, marginBottom: '2px' }} />
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-light)' }}>{value}%</span>
                    </div>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 4px 0' }}>{label}</h4>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{subLabel}</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
                <RefreshCw size={36} className="spin text-violet" style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>טוען נתוני שרת מ-Coolify...</span>
            </div>
        );
    }

    return (
        <div className="roadmap-container fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity size={32} className="text-violet" style={{ color: '#8b5cf6' }} />
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-light)', margin: 0 }}>ניטור שרתים וקונטיינרים</h1>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            מעקב בזמן אמת אחרי שרת ה-Hetzner של autoRI-studio המנוהל תחת Coolify.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => fetchData(true)}
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <RefreshCw size={14} /> רענן נתונים
                </button>
            </div>

            {/* Overall Resource Gauges */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <CircularGauge 
                    value={currentMetrics.cpu_usage} 
                    label="עומס מעבד (CPU)" 
                    subLabel="מעבד AMD EPYC (4 Cores)" 
                    icon={Cpu} 
                />
                <CircularGauge 
                    value={currentMetrics.ram_usage} 
                    label="ניצול זיכרון (RAM)" 
                    subLabel={`${((currentMetrics.ram_usage / 100) * 8).toFixed(1)} GB מתוך 8 GB בשימוש`} 
                    icon={Activity} 
                />
                <CircularGauge 
                    value={currentMetrics.disk_usage} 
                    label="שטח דיסק פנוי" 
                    subLabel={`${(100 - currentMetrics.disk_usage).toFixed(1)}% פנוי (38.4 GB בשימוש)`} 
                    icon={HardDrive} 
                />
            </div>

            {/* Main Content Split: Containers Grid & Alerts Log */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
                
                {/* Containers Management List */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Database size={18} className="text-violet" style={{ color: '#8b5cf6' }} />
                        <h2 style={{ fontSize: '16.5px', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>קונטיינרים מנוהלים (Coolify Stack)</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {containers.map(container => {
                            const config = getStatusConfig(container.status);
                            return (
                                <div key={container.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '10px' }}>
                                    
                                    {/* Left: Container Metadata */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {/* Status pulsing indicator */}
                                        <div style={{ position: 'relative', width: '10px', height: '10px' }}>
                                            <div style={{ 
                                                width: '10px', 
                                                height: '10px', 
                                                borderRadius: '50%', 
                                                backgroundColor: config.color,
                                                boxShadow: `0 0 10px ${config.color}`
                                            }} />
                                            {config.pulse && (
                                                <div className="ping" style={{ 
                                                    position: 'absolute', 
                                                    top: 0, left: 0, 
                                                    width: '10px', height: '10px', 
                                                    borderRadius: '50%', 
                                                    border: `2px solid ${config.color}`,
                                                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                                                }} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>{container.name}</h3>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>מזהה: <code>{container.id}</code></span>
                                        </div>
                                    </div>

                                    {/* Middle: Resource Usage */}
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '12.5px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)' }}>מעבד</span>
                                            <span style={{ fontWeight: '600', color: container.cpu_percent > 5 ? '#f59e0b' : 'var(--text-secondary)' }}>{container.cpu_percent.toFixed(1)}%</span>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)' }}>זיכרון</span>
                                            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{formatRam(container.ram_bytes)}</span>
                                        </div>
                                        <div style={{ borderRight: '1px solid var(--border-color)', height: '24px', paddingLeft: '12px' }} />
                                    </div>

                                    {/* Right: Quick Action Controls */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {container.status === 'running' ? (
                                            <>
                                                <button 
                                                    onClick={() => handleAction(container.id, 'restart')}
                                                    disabled={actioningId !== null}
                                                    title="הפעלה מחדש"
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '6px 10px', background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                                                >
                                                    {actioningId === `${container.id}-restart` ? <RefreshCw size={13} className="spin" /> : <RefreshCw size={13} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(container.id, 'stop')}
                                                    disabled={actioningId !== null}
                                                    title="כיבוי"
                                                    className="btn btn-secondary" 
                                                    style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
                                                >
                                                    {actioningId === `${container.id}-stop` ? <RefreshCw size={13} className="spin" /> : <Square size={13} />}
                                                </button>
                                            </>
                                        ) : container.status === 'stopped' ? (
                                            <button 
                                                onClick={() => handleAction(container.id, 'start')}
                                                disabled={actioningId !== null}
                                                title="הפעלה"
                                                className="btn btn-secondary" 
                                                style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                                            >
                                                {actioningId === `${container.id}-start` ? <RefreshCw size={12} className="spin" /> : <Play size={12} />} הפעל קונטיינר
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>מעבד פעולה...</span>
                                        )}
                                    </div>
                                    
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent System Alerts & Errors Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                            <h2 style={{ fontSize: '16.5px', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>יומן התראות שרת</h2>
                        </div>
                        {alerts.length > 0 && (
                            <button 
                                onClick={handleClearAlerts}
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Trash2 size={11} /> נקה הכל
                            </button>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', maxHeight: '420px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                        {alerts.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 10px', textAlign: 'center', gap: '8px' }}>
                                <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>אין התראות פעילות</h3>
                                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>כל המערכות ומשאבי השרת פועלים כשורה ללא חריגות.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {alerts.map(alert => (
                                    <div 
                                        key={alert.id} 
                                        style={{ 
                                            padding: '10px 12px', 
                                            borderRadius: '6px', 
                                            background: alert.type === 'error' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                                            borderRight: `3px solid ${alert.type === 'error' ? '#ef4444' : '#f59e0b'}`,
                                            fontSize: '12px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong style={{ color: 'var(--text-light)', fontWeight: '600' }}>{alert.title}</strong>
                                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <Clock size={10} />
                                                {new Date(alert.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>{alert.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
