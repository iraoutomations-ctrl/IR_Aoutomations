/* ==========================================================================
   autoRI-studio CRM - Password-Only Security Screen (Auth)
   ========================================================================== */
import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, Cpu, Loader2 } from 'lucide-react';
import { db, isSupabaseConfigured } from '../services/db';

export default function Auth({ onAuthSuccess }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Bruteforce protection states
    const [attempts, setAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(0);

    // Countdown for lockout
    useEffect(() => {
        if (lockoutTime > 0) {
            const timer = setTimeout(() => {
                setLockoutTime(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [lockoutTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (lockoutTime > 0) {
            setError(`המערכת נעולה. אנא נסה שוב בעוד ${lockoutTime} שניות.`);
            return;
        }

        if (!password.trim()) {
            setError('נא להזין סיסמה.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await db.signInWithPasswordOnly(password);
            // Auth success event will be handled by App.jsx subscription
            if (onAuthSuccess) onAuthSuccess();
        } catch (err) {
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);
            
            if (nextAttempts >= 3) {
                setLockoutTime(15); // Lock for 15 seconds
                setAttempts(0);
                setError('יותר מדי ניסיונות כושלים. המערכת נחסמה ל-15 שניות.');
            } else {
                setError(err.message || 'סיסמה שגויה. אנא נסה שוב.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-glow-bg">
                <div className="glow-sphere violet"></div>
                <div className="glow-sphere cyan"></div>
            </div>
            
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <div className="auth-logo-badge">
                        <Cpu className="logo-icon animate-pulse-violet" size={32} />
                    </div>
                    <h1 className="auth-title">autoRI CRM</h1>
                    <p className="auth-subtitle">מערכת ניהול לקוחות ואוטומציות</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group-wrapper">
                        <label className="input-label">סיסמת גישה למערכת</label>
                        <div className="password-input-container">
                            <span className="input-icon-left">
                                <Lock size={18} />
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="הזן סיסמה..."
                                disabled={loading || lockoutTime > 0}
                                className={`password-input ${error ? 'input-error' : ''}`}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-btn"
                                disabled={loading || lockoutTime > 0}
                                title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error-alert animate-shake">
                            <ShieldAlert size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || lockoutTime > 0}
                        className="btn btn-primary auth-submit-btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>מתחבר...</span>
                            </>
                        ) : lockoutTime > 0 ? (
                            <span>נעול ({lockoutTime} ש׳)</span>
                        ) : (
                            <span>התחבר למערכת</span>
                        )}
                    </button>
                </form>

                {/* Connection Status & Mock Help Badge */}
                <div className="auth-footer-badge">
                    {isSupabaseConfigured ? (
                        <div className="status-indicator online">
                            <span className="dot"></span>
                            <span className="status-text">חיבור מאובטח ל-Supabase פעיל</span>
                        </div>
                    ) : (
                        <div className="status-indicator offline">
                            <span className="dot"></span>
                            <span className="status-text">מצב פיתוח (אופליין) - סיסמה: admin123</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom styles for Auth component to ensure beautiful visuals */}
            <style>{`
                .auth-overlay {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #050508;
                    z-index: 9999;
                    overflow: hidden;
                    font-family: var(--font-family);
                    padding: 20px;
                }

                .auth-glow-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                }

                .glow-sphere {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.15;
                }

                .glow-sphere.violet {
                    top: 25%;
                    left: 20%;
                    width: 400px;
                    height: 400px;
                    background: var(--accent-violet);
                    animation: float-glow 8s ease-in-out infinite alternate;
                }

                .glow-sphere.cyan {
                    bottom: 20%;
                    right: 20%;
                    width: 350px;
                    height: 350px;
                    background: var(--accent-cyan);
                    animation: float-glow 10s ease-in-out infinite alternate-reverse;
                }

                @keyframes float-glow {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(30px, 20px) scale(1.1); }
                }

                .auth-card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 420px;
                    padding: 40px 32px;
                    background: rgba(17, 19, 28, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 
                                0 0 40px rgba(139, 92, 246, 0.05);
                    border-radius: 16px;
                    transition: border-color 0.4s ease, box-shadow 0.4s ease;
                }

                .auth-card:hover {
                    border-color: rgba(139, 92, 246, 0.3);
                    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6), 
                                0 0 50px rgba(139, 92, 246, 0.12);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .auth-logo-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 14px;
                    margin-bottom: 16px;
                    color: var(--accent-violet);
                }

                .animate-pulse-violet {
                    animation: pulse-violet 2s infinite;
                }

                @keyframes pulse-violet {
                    0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 2px var(--accent-violet)); }
                    50% { transform: scale(1.05); opacity: 0.8; filter: drop-shadow(0 0 8px var(--accent-violet)); }
                }

                .auth-title {
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    background: linear-gradient(135deg, var(--text-light) 30%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 6px;
                }

                .auth-subtitle {
                    font-size: 13.5px;
                    color: var(--text-secondary);
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    text-align: right;
                }

                .input-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    margin-right: 4px;
                }

                .password-input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-input {
                    width: 100%;
                    padding: 12px 40px 12px 42px;
                    background: rgba(10, 11, 16, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: var(--text-light);
                    font-family: inherit;
                    font-size: 14.5px;
                    transition: all 0.25s ease;
                    direction: ltr; /* LTR input for password security character dots */
                    text-align: left;
                }

                .password-input::placeholder {
                    text-align: right;
                    direction: rtl;
                    color: var(--text-muted);
                }

                .password-input:focus {
                    outline: none;
                    border-color: var(--accent-violet);
                    box-shadow: 0 0 12px var(--accent-violet-glow);
                    background: rgba(10, 11, 16, 0.8);
                }

                .password-input.input-error {
                    border-color: #ef4444;
                    box-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
                }

                .input-icon-left {
                    position: absolute;
                    right: 14px;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                    z-index: 2;
                }

                .password-toggle-btn {
                    position: absolute;
                    left: 14px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    padding: 0;
                    transition: color 0.2s;
                }

                .password-toggle-btn:hover {
                    color: var(--text-light);
                }

                .auth-error-alert {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    padding: 10px 12px;
                    border-radius: 8px;
                    color: #fca5a5;
                    font-size: 13px;
                    line-height: 1.4;
                    animation: shake 0.4s ease;
                    text-align: right;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }

                .auth-submit-btn {
                    width: 100%;
                    padding: 13px;
                    font-size: 14.5px;
                    font-weight: 600;
                    background: linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-violet-hover) 100%);
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                    transition: all 0.25s ease;
                    color: var(--text-light);
                    cursor: pointer;
                }

                .auth-submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
                }

                .auth-submit-btn:active:not(:disabled) {
                    transform: translateY(1px);
                }

                .auth-submit-btn:disabled {
                    background: rgba(25, 28, 41, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: var(--text-muted);
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .auth-footer-badge {
                    margin-top: 28px;
                    display: flex;
                    justify-content: center;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }

                .status-indicator .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }

                .status-indicator.online .dot {
                    background: #10b981;
                    box-shadow: 0 0 8px #10b981;
                }

                .status-indicator.offline .dot {
                    background: #f59e0b;
                    box-shadow: 0 0 8px #f59e0b;
                }

                .status-text {
                    font-size: 11.5px;
                    color: var(--text-secondary);
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
