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

// --------------------------------------------------
// Sub-Component: Resource History Chart (Line/Area SVG)
// --------------------------------------------------
const ResourceHistoryChart = ({ data, hoveredData, setHoveredData, timeframe, setTimeframe }) => {
    if (!data || data.length === 0) return null;

    const width = 800;
    const height = 220;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const pointsCount = data.length;
    const getX = (index) => paddingLeft + (index / (pointsCount - 1)) * chartWidth;
    const getY = (val) => paddingTop + chartHeight - (val / 100) * chartHeight;

    const cpuPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.cpu_usage) }));
    const ramPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.ram_usage) }));

    const cpuLinePath = cpuPoints.reduce((path, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, '');
    const ramLinePath = ramPoints.reduce((path, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, '');

    const cpuAreaPath = cpuPoints.length > 0 
        ? `${cpuLinePath} L ${cpuPoints[cpuPoints.length - 1].x} ${paddingTop + chartHeight} L ${cpuPoints[0].x} ${paddingTop + chartHeight} Z`
        : '';
    const ramAreaPath = ramPoints.length > 0
        ? `${ramLinePath} L ${ramPoints[ramPoints.length - 1].x} ${paddingTop + chartHeight} L ${ramPoints[0].x} ${paddingTop + chartHeight} Z`
        : '';

    const yGridValues = [0, 25, 50, 75, 100];
    const labelStep = Math.max(1, Math.floor(pointsCount / 6));

    const handleMouseMove = (e) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        let closestIndex = 0;
        let minDiff = Infinity;
        for (let i = 0; i < pointsCount; i++) {
            const ptX = (getX(i) / width) * rect.width;
            const diff = Math.abs(mouseX - ptX);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        setHoveredData({
            ...data[closestIndex],
            x: getX(closestIndex),
            cpuY: getY(data[closestIndex].cpu_usage),
            ramY: getY(data[closestIndex].ram_usage),
            index: closestIndex
        });
    };

    const handleMouseLeave = () => {
        setHoveredData(null);
    };

    return (
        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>מגמות משאבים</h3>
                    {/* Timeframe Selector Tabs */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { id: '24h', label: '24 שעות' },
                            { id: '7d', label: '7 ימים' },
                            { id: '30d', label: '30 יום' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTimeframe(t.id)}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: timeframe === t.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                    color: timeframe === t.id ? '#a78bfa' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '4px', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', borderRadius: '2px', display: 'inline-block' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>CPU (מעבד)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '4px', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '2px', display: 'inline-block' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>RAM (זיכרון)</span>
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
                <svg 
                    viewBox={`0 0 ${width} ${height}`} 
                    width="100%" 
                    height={height}
                    style={{ overflow: 'visible', cursor: 'crosshair' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        <linearGradient id="cpuAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="cpuLineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        
                        <linearGradient id="ramAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="ramLineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>

                    {/* Y Grid lines */}
                    {yGridValues.map(val => (
                        <g key={val}>
                            <line 
                                x1={paddingLeft} 
                                y1={getY(val)} 
                                x2={width - paddingRight} 
                                y2={getY(val)} 
                                stroke="rgba(255,255,255,0.04)" 
                                strokeWidth="1" 
                            />
                            <text 
                                x={paddingLeft - 8} 
                                y={getY(val) + 4} 
                                fill="var(--text-muted)" 
                                fontSize="10.5px" 
                                textAnchor="end"
                            >
                                {val}%
                            </text>
                        </g>
                    ))}

                    {/* Area Paths */}
                    <path d={cpuAreaPath} fill="url(#cpuAreaGrad)" />
                    <path d={ramAreaPath} fill="url(#ramAreaGrad)" />

                    {/* Line Paths */}
                    <path d={cpuLinePath} fill="none" stroke="url(#cpuLineGrad)" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={ramLinePath} fill="none" stroke="url(#ramLineGrad)" strokeWidth="2.5" strokeLinecap="round" />

                    {/* X Axis Labels */}
                    {data.map((d, i) => {
                        if (i % labelStep === 0 || i === pointsCount - 1) {
                            const timeStr = timeframe === '24h'
                                ? new Date(d.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                                : new Date(d.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
                            return (
                                <text 
                                    key={i} 
                                    x={getX(i)} 
                                    y={height - 8} 
                                    fill="var(--text-muted)" 
                                    fontSize="10px" 
                                    textAnchor="middle"
                                >
                                    {timeStr}
                                </text>
                            );
                        }
                        return null;
                    })}

                    {/* Hover Guide Line */}
                    {hoveredData && (
                        <g>
                            <line 
                                x1={hoveredData.x} 
                                y1={paddingTop} 
                                x2={hoveredData.x} 
                                y2={height - paddingBottom} 
                                stroke="rgba(255,255,255,0.15)" 
                                strokeDasharray="3 3" 
                                strokeWidth="1.5" 
                            />
                            <circle 
                                cx={hoveredData.x} 
                                cy={hoveredData.cpuY} 
                                r="5.5" 
                                fill="#8b5cf6" 
                                stroke="#fff" 
                                strokeWidth="1.5" 
                            />
                            <circle 
                                cx={hoveredData.x} 
                                cy={hoveredData.ramY} 
                                r="5.5" 
                                fill="#10b981" 
                                stroke="#fff" 
                                strokeWidth="1.5" 
                            />
                        </g>
                    )}
                </svg>

                {/* Custom Tooltip */}
                {hoveredData && (
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: hoveredData.x > width / 2 ? `${hoveredData.x * 0.9}px` : `${hoveredData.x * 1.1 + 40}px`,
                        transform: 'translateX(-50%)',
                        background: 'rgba(15, 15, 25, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        pointerEvents: 'none',
                        zIndex: 10,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        direction: 'rtl',
                        textAlign: 'right'
                    }}>
                        <div style={{ color: 'var(--text-light)', fontWeight: '700', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
                            {timeframe === '24h'
                                ? new Date(hoveredData.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : new Date(hoveredData.created_at).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', color: '#a78bfa', marginBottom: '2px' }}>
                            <span>עומס מעבד (CPU):</span>
                            <strong>{hoveredData.cpu_usage}%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', color: '#34d399' }}>
                            <span>זיכרון בשימוש (RAM):</span>
                            <strong>{hoveredData.ram_usage}%</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --------------------------------------------------
// Main Component
// --------------------------------------------------
export default function ServerMonitor() {
    const [metrics, setMetrics] = useState([]);
    const [containers, setContainers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);
    const [expandedAlertId, setExpandedAlertId] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 960);
    const [timeframe, setTimeframe] = useState('24h');

    // Fetch data from DB
    const fetchData = async (showLoading = false, activeTimeframe = timeframe) => {
        if (showLoading) setLoading(true);
        try {
            const metricsData = await db.getServerMetrics(activeTimeframe);
            const containersData = await db.getContainers();
            const serverAlerts = await db.getServerAlerts();

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
        fetchData(true, timeframe);

        const pollInterval = setInterval(() => {
            fetchData(false, timeframe);
        }, 5000);

        const handleLocalRefresh = () => {
            fetchData(false, timeframe);
        };
        window.addEventListener('server-monitor-refresh', handleLocalRefresh);

        const handleResize = () => {
            setIsDesktop(window.innerWidth > 960);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(pollInterval);
            window.removeEventListener('server-monitor-refresh', handleLocalRefresh);
            window.removeEventListener('resize', handleResize);
        };
    }, [timeframe]);

    // Handle container action (Start / Stop / Restart)
    const handleAction = async (containerId, action) => {
        setActioningId(`${containerId}-${action}`);
        try {
            await db.triggerContainerAction(containerId, action);
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
                await db.deleteAllServerAlerts();
                setAlerts([]);
            } catch (err) {
                console.error("Error clearing alerts:", err);
            }
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await db.markServerAlertAsRead(id);
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
        } catch (err) {
            console.error("Error marking alert as read:", err);
        }
    };

    const handleDeleteAlert = async (id, e) => {
        e.stopPropagation();
        try {
            await db.deleteServerAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Error deleting alert:", err);
        }
    };

    // Calculate current metrics (latest data point)
    const currentMetrics = metrics[metrics.length - 1] || { cpu_usage: 0, ram_usage: 0, disk_usage: 0 };
    
    const cpuCores = currentMetrics.cpu_cores || 2;
    const cpuModel = currentMetrics.cpu_model || "AMD EPYC";
    const ramTotalGB = currentMetrics.ram_total ? (currentMetrics.ram_total / (1024 * 1024 * 1024)) : 4.0;
    const ramUsedGB = ((currentMetrics.ram_usage / 100) * ramTotalGB);
    const diskTotalGB = currentMetrics.disk_total ? (currentMetrics.disk_total / (1024 * 1024 * 1024)) : 80.0;
    const diskUsedGB = ((currentMetrics.disk_usage / 100) * diskTotalGB);
    const diskFreePct = (100 - currentMetrics.disk_usage);
    
    // Format RAM bytes to human readable format (MB/GB)
    const formatRam = (bytes) => {
        if (bytes < 1024 * 1024 * 1024) {
            return `${Math.round(bytes / (1024 * 1024))} MB`;
        }
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    // Determine status color configurations
    const getStatusConfig = (status) => {
        const normStatus = (status || '').toLowerCase();
        if (normStatus.startsWith('running')) {
            return { color: '#10b981', label: 'פועל', pulse: true };
        }
        if (normStatus.startsWith('restarting')) {
            return { color: '#f59e0b', label: 'מפעיל מחדש...', pulse: true };
        }
        if (normStatus.startsWith('stopped') || normStatus.startsWith('exited')) {
            return { color: '#6b7280', label: 'כבוי', pulse: false };
        }
        return { color: '#ef4444', label: 'כבוי', pulse: false };
    };

    // SVG Circular Gauge renderer
    const CircularGauge = ({ value, label, subLabel, icon: Icon }) => {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (value / 100) * circumference;
        
        let strokeColor = '#10b981';
        if (value > 80) strokeColor = '#f59e0b';
        if (value > 90) strokeColor = '#ef4444';

        return (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '220px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '14px' }}>
                    <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                        <circle 
                            cx="60" cy="60" r={radius} 
                            fill="transparent" 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeWidth="8" 
                        />
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
                    subLabel={`מעבד ${cpuModel} (${cpuCores} Cores)`} 
                    icon={Cpu} 
                />
                <CircularGauge 
                    value={currentMetrics.ram_usage} 
                    label="ניצול זיכרון (RAM)" 
                    subLabel={`${ramUsedGB.toFixed(1)} GB מתוך ${ramTotalGB.toFixed(1)} GB בשימוש`} 
                    icon={Activity} 
                />
                <CircularGauge 
                    value={currentMetrics.disk_usage} 
                    label="שטח דיסק פנוי" 
                    subLabel={`${diskFreePct.toFixed(1)}% פנוי (${diskUsedGB.toFixed(1)} GB בשימוש)`} 
                    icon={HardDrive} 
                />
            </div>

            {/* Integrated Trend Graph */}
            <ResourceHistoryChart 
                data={metrics} 
                hoveredData={hoveredData} 
                setHoveredData={setHoveredData} 
                timeframe={timeframe}
                setTimeframe={setTimeframe}
            />

            {/* Main Content Split: Containers Grid & Alerts Log */}
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1.2fr' : '1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Containers Management List */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Database size={18} className="text-violet" style={{ color: '#8b5cf6' }} />
                        <h2 style={{ fontSize: '16.5px', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>קונטיינרים מנוהלים (Coolify Stack)</h2>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {containers.map(container => {
                            const config = getStatusConfig(container.status);
                            return (
                                <div key={container.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '10px' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

                                    {container.cpu_percent > 0 || container.ram_bytes > 0 ? (
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
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '600',
                                                color: config.color, 
                                                background: `${config.color}15`, 
                                                padding: '4px 10px', 
                                                borderRadius: '5px', 
                                                border: `1px solid ${config.color}30` 
                                            }}>
                                                {config.label}
                                            </div>
                                            <div style={{ borderRight: '1px solid var(--border-color)', height: '24px', paddingLeft: '12px' }} />
                                        </div>
                                    )}


                                    
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline Alert List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                            <h2 style={{ fontSize: '16.5px', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>יומן התראות שרת</h2>
                        </div>
                        {alerts.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={async () => {
                                        try {
                                            await db.markAllServerAlertsAsRead();
                                            setAlerts(prev => prev.map(a => ({ ...a, read: true })));
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    סמן הכל כנקרא
                                </button>
                                <button 
                                    onClick={handleClearAlerts}
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Trash2 size={11} /> נקה הכל
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '12px', maxHeight: '550px', overflowY: 'auto', background: 'rgba(0,0,0,0.15)', position: 'relative' }}>
                        {alerts.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 10px', textAlign: 'center', gap: '12px' }}>
                                <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                                <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>אין התראות פעילות</h3>
                                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, maxWidth: '280px' }}>כל המערכות ומשאבי השרת פועלים כשורה ללא חריגות.</p>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', paddingRight: '20px' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '8px', 
                                    bottom: '8px', 
                                    right: '3px', 
                                    width: '2px', 
                                    background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)',
                                    borderRadius: '1px'
                                }} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {alerts.map(alert => {
                                        const isRead = alert.read;
                                        const isError = alert.type === 'error';
                                        const isWarning = alert.type === 'warning';
                                        const isSuccess = alert.type === 'success';

                                        let badgeBg = 'rgba(59, 130, 246, 0.1)';
                                        let badgeBorder = 'rgba(59, 130, 246, 0.2)';
                                        let badgeText = '#3b82f6';
                                        let badgeLabel = 'מידע 🔵';
                                        let dotColor = '#3b82f6';

                                        if (isError) {
                                            badgeBg = 'rgba(239, 68, 68, 0.1)';
                                            badgeBorder = 'rgba(239, 68, 68, 0.2)';
                                            badgeText = '#ef4444';
                                            badgeLabel = 'שגיאה קריטית 🔴';
                                            dotColor = '#ef4444';
                                        } else if (isWarning) {
                                            badgeBg = 'rgba(245, 158, 11, 0.1)';
                                            badgeBorder = 'rgba(245, 158, 11, 0.2)';
                                            badgeText = '#f59e0b';
                                            badgeLabel = 'אזהרת מערכת 🟡';
                                            dotColor = '#f59e0b';
                                        } else if (isSuccess) {
                                            badgeBg = 'rgba(16, 185, 129, 0.1)';
                                            badgeBorder = 'rgba(16, 185, 129, 0.2)';
                                            badgeText = '#10b981';
                                            badgeLabel = 'תקין ✅';
                                            dotColor = '#10b981';
                                        }

                                        const isExpanded = expandedAlertId === alert.id;

                                        return (
                                            <div 
                                                key={alert.id} 
                                                onClick={() => {
                                                    setExpandedAlertId(isExpanded ? null : alert.id);
                                                    if (!isRead) handleMarkAsRead(alert.id);
                                                }}
                                                className="glass-card"
                                                style={{ 
                                                    position: 'relative',
                                                    padding: '14px 16px', 
                                                    borderRadius: '10px', 
                                                    background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                                    border: isRead ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(255,255,255,0.08)',
                                                    boxShadow: isRead ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease-in-out',
                                                    transform: isRead ? 'none' : 'translateY(-1px)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                                    if (!isRead) e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,255,255,0.03)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = isRead ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)';
                                                    e.currentTarget.style.background = isRead ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.boxShadow = isRead ? 'none' : '0 4px 20px rgba(0,0,0,0.15)';
                                                }}
                                            >
                                                <div style={{ 
                                                    position: 'absolute',
                                                    right: '-21px',
                                                    top: '22px',
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor: dotColor,
                                                    boxShadow: `0 0 8px ${dotColor}`,
                                                    border: '2px solid #0b0f19',
                                                    zIndex: 5
                                                }} />

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ 
                                                            padding: '2px 8px', 
                                                            borderRadius: '12px', 
                                                            fontSize: '10.5px', 
                                                            fontWeight: '700', 
                                                            backgroundColor: badgeBg, 
                                                            border: `1px solid ${badgeBorder}`, 
                                                            color: badgeText 
                                                        }}>
                                                            {badgeLabel}
                                                        </span>
                                                        <strong style={{ 
                                                            color: isRead ? 'var(--text-secondary)' : 'var(--text-light)', 
                                                            fontWeight: isRead ? '500' : '700',
                                                            fontSize: '13px'
                                                        }}>
                                                            {alert.title}
                                                        </strong>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={11} />
                                                            {new Date(alert.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => handleDeleteAlert(alert.id, e)}
                                                            style={{ 
                                                                background: 'none', 
                                                                border: 'none', 
                                                                color: 'var(--text-muted)', 
                                                                cursor: 'pointer', 
                                                                padding: '4px',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                transition: 'color 0.15s'
                                                            }}
                                                            title="מחק התראה"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p style={{ 
                                                    margin: 0, 
                                                    fontSize: '12px', 
                                                    color: isRead ? 'var(--text-muted)' : 'var(--text-secondary)',
                                                    lineHeight: '1.4',
                                                    whiteSpace: isExpanded ? 'normal' : 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%'
                                                }}>
                                                    {alert.message}
                                                </p>

                                                {isExpanded && (
                                                    <div style={{ 
                                                        marginTop: '12px', 
                                                        paddingTop: '10px', 
                                                        borderTop: '1px solid rgba(255,255,255,0.06)',
                                                        fontSize: '11px',
                                                        color: 'var(--text-muted)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '6px'
                                                    }}>
                                                        {alert.container_id && (
                                                            <div>
                                                                <strong>קונטיינר קשור:</strong> <code style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '2px 4px', borderRadius: '4px' }}>{alert.container_id}</code>
                                                            </div>
                                                        )}
                                                        {alert.metric_value && (
                                                            <div>
                                                                <strong>ערך חריגה מדוד:</strong> <code style={{ color: '#ef4444' }}>{alert.metric_value}%</code>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <strong>זמן מדויק:</strong> {new Date(alert.created_at).toLocaleString('he-IL')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
